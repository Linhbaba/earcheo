import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ViewState } from 'react-map-gl';
import { RotateCcw, RotateCw, RefreshCw, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface CompassControlProps {
  viewState: ViewState;
  setViewState: Dispatch<SetStateAction<ViewState>>;
  className?: string;
}

const DIRECTIONS = [
  { label: 'S', bearing: 0 }, // Sever
  { label: 'V', bearing: 90 },
  { label: 'J', bearing: 180 },
  { label: 'Z', bearing: -90 },
];

const TICK_ANGLES = Array.from({ length: 12 }, (_, idx) => idx * 30);

export function CompassControl({ viewState, setViewState, className }: CompassControlProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const normalizedBearing = ((viewState.bearing ?? 0) % 360 + 360) % 360;

  const setBearing = useCallback(
    (bearing: number) => {
      setViewState((prev) => ({
        ...prev,
        bearing,
      }));
    },
    [setViewState]
  );

  const rotateBy = useCallback(
    (delta: number) => {
      setViewState((prev) => ({
        ...prev,
        bearing: (prev.bearing ?? 0) + delta,
      }));
    },
    [setViewState]
  );

  const updateBearingFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const bounds = dialRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;

      const angleRad = Math.atan2(dx, -dy); // 0° = sever, roste ve směru hodin
      const bearingDeg = ((angleRad * 180) / Math.PI + 360) % 360;
      setBearing(bearingDeg);
    },
    [setBearing]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      updateBearingFromPointer(event.clientX, event.clientY);
      setIsDragging(true);
    },
    [updateBearingFromPointer]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      updateBearingFromPointer(event.clientX, event.clientY);
    };

    const handlePointerUp = () => setIsDragging(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, updateBearingFromPointer]);

  const headingLabel = (() => {
    const target = DIRECTIONS.reduce(
      (closest, dir) => {
        const dirAngle = ((dir.bearing % 360) + 360) % 360;
        const diff = Math.min(
          Math.abs(normalizedBearing - dirAngle),
          360 - Math.abs(normalizedBearing - dirAngle)
        );
        return diff < closest.diff ? { diff, label: dir.label } : closest;
      },
      { diff: 360, label: 'S' }
    );
    return target.label;
  })();

  const containerClasses =
    'pointer-events-auto w-48 bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50 flex flex-col gap-3';

  return (
    <div className={className ? `${containerClasses} ${className}` : containerClasses}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer w-full"
      >
        <span>NAV</span>
        <ChevronDown className={clsx(
          "w-3.5 h-3.5 text-primary transition-transform",
          isExpanded ? "" : "-rotate-90"
        )} />
      </button>

      {isExpanded && (<>
      <div
        ref={dialRef}
        onPointerDown={handlePointerDown}
        className="relative w-full aspect-square rounded-full bg-gradient-to-b from-white/10 via-black/60 to-black/90 shadow-inner overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute inset-7 rounded-full border border-white/5" />

        {TICK_ANGLES.map((angle) => (
          <div
            key={angle}
            className="absolute left-1/2 top-1/2 w-[1px] h-3 bg-white/20 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-34px)`,
            }}
          />
        ))}

        <div
          className="absolute left-1/2 top-1/2 w-[2px] h-[75px] bg-primary origin-bottom shadow-[0_0_25px_rgba(0,243,255,0.45)] transition-transform duration-75"
          style={{
            transform: `translate(-50%, -90%) rotate(${normalizedBearing}deg)`,
          }}
        />

        <div className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(0,243,255,0.6)] transform -translate-x-1/2 -translate-y-1/2" />

        {DIRECTIONS.map((dir) => {
          const angle = ((dir.bearing % 360) + 360) % 360;
          return (
            <button
              key={dir.label}
              className="absolute text-[13px] font-mono font-semibold text-white hover:text-primary transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-78px) rotate(${-angle}deg)`,
              }}
              onClick={() => setBearing(dir.bearing)}
            >
              {dir.label}
            </button>
          );
        })}
      </div>

      <div className="text-center font-mono">
        <div className="text-white/60 text-[10px] uppercase tracking-[0.3em]">
          Heading · {headingLabel}
        </div>
        <div className="text-3xl text-primary font-semibold drop-shadow-[0_0_12px_rgba(0,243,255,0.5)]">
          {Math.round(normalizedBearing)}°
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <button
          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => rotateBy(-15)}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          -15°
        </button>
        <button
          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => rotateBy(15)}
        >
          +15°
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-primary/30 transition-colors"
        onClick={() => setBearing(0)}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset
      </button>
      </>)}
    </div>
  );
}


import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { X } from 'lucide-react';

export interface ProfileSample {
  distance: number;
  elevation: number;
  lat: number;
  lng: number;
}

interface ProfileChartProps {
  data: ProfileSample[];
  length: number;
  onHover: (point: ProfileSample | null) => void;
  onClose: () => void;
  activeIndex: number | null;
}

export function ProfileChart({ data, length, onHover, onClose, activeIndex }: ProfileChartProps) {
  if (!data || data.length === 0) return null;

  const minElev = Math.min(...data.map(d => d.elevation));
  const maxElev = Math.max(...data.map(d => d.elevation));
  const padding = (maxElev - minElev) * 0.1 || 5; // Fallback padding

  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 bg-black/90 backdrop-blur-md border-t border-primary/50 transition-transform duration-300 z-40 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
            <h3 className="text-primary font-mono font-bold flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"/>
                MĚŘENÍ PROFILU TERÉNU
            </h3>
            <div className="text-xs text-white/50 font-mono flex gap-3">
                <span>DÉLKA: <span className="text-white">{length >= 1000 ? `${(length/1000).toFixed(2)} km` : `${Math.round(length)} m`}</span></span>
                <span>MIN: <span className="text-white">{Math.round(minElev)} m</span></span>
                <span>MAX: <span className="text-white">{Math.round(maxElev)} m</span></span>
                <span>PŘEVÝŠENÍ: <span className="text-white">{Math.round(maxElev - minElev)} m</span></span>
            </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full p-2 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            onMouseMove={(e) => {
              if (e && 'activePayload' in e && e.activePayload && Array.isArray(e.activePayload) && e.activePayload[0]) {
                onHover(e.activePayload[0].payload as ProfileSample);
              }
            }}
            onMouseLeave={() => onHover(null)}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
                dataKey="distance" 
                stroke="#666" 
                tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}}
                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)} km` : `${Math.round(val)} m`}
            />
            <YAxis 
                domain={[Math.floor(minElev - padding), Math.ceil(maxElev + padding)]} 
                stroke="#666"
                tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}}
                width={40}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #333', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                itemStyle={{ color: '#00f3ff' }}
                formatter={(value: number) => [`${value.toFixed(1)} m`, 'Nadm. výška']}
                labelFormatter={(label) => {
                  const dist = label as number;
                  return dist >= 1000 ? `Vzdálenost: ${(dist/1000).toFixed(2)} km` : `Vzdálenost: ${Math.round(dist)} m`;
                }}
            />
            <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="#00f3ff" 
                fillOpacity={1} 
                fill="url(#colorElev)" 
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={500}
            />
            {activeIndex !== null && data[activeIndex] && (
                <ReferenceDot 
                    x={data[activeIndex].distance} 
                    y={data[activeIndex].elevation} 
                    r={4} 
                    fill="#fff" 
                    stroke="#00f3ff"
                />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



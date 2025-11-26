export const LoadingSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface/50 rounded-xl p-6 border border-white/5">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-white/5 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};


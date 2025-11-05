/**
 * ProgressBar - Unified progress indicator
 * Smooth gradient fill with percentage and ETA display
 */

export function ProgressBar({ 
  percent, 
  eta 
}: { 
  percent: number; 
  eta?: string; 
}) {
  const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${normalizedPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-white/60">
        <span className="font-medium">{normalizedPercent}%</span>
        {eta && <span>ETA: {eta}</span>}
      </div>
    </div>
  );
}

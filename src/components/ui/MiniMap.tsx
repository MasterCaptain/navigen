import { MapPin } from 'lucide-react';

interface MiniMapProps {
  zone: string;
}

export function MiniMap({ zone }: MiniMapProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm text-white font-semibold">Map / Zone overlay</h4>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">Zone: {zone}</span>
        </div>
      </div>
      
      {/* Antarctica Outline Placeholder */}
      <div className="h-32 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full opacity-40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          {/* Simplified Antarctica outline */}
          <path
            d="M 100 30 Q 140 40 160 70 Q 180 100 170 130 Q 150 160 120 170 Q 100 175 80 170 Q 50 160 30 130 Q 20 100 40 70 Q 60 40 100 30 Z"
            className="stroke-amber-500/30 fill-amber-500/5"
          />
          {/* Ice shelf detail */}
          <path
            d="M 90 60 L 110 60 L 105 80 L 95 80 Z"
            className="stroke-amber-500/50 fill-amber-500/10"
          />
          <path
            d="M 140 90 L 150 95 L 145 110 L 135 105 Z"
            className="stroke-amber-500/50 fill-amber-500/10"
          />
        </svg>
        
        {/* Position marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-slate-500 text-center">
        Current position: Antarctic Peninsula
      </div>
    </div>
  );
}
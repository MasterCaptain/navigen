import { useEffect, useState } from 'react';

interface ScaleWidgetProps {
  zoom: number;
  displayMode?: 'day' | 'dusk' | 'night';
}

// Standard nautical mile distances for scale bar
const SCALE_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

// Calculate optimal scale for current zoom level
function calculateScale(zoom: number): { distance: number; pixelWidth: number } {
  // Web Mercator: meters per pixel at equator = 156543.03 * cos(lat) / (2^zoom)
  // Use Svalbard latitude (~78°N) for accurate Arctic calculations
  const latitude = 78 * Math.PI / 180;
  const metersPerPixel = (156543.03 * Math.cos(latitude)) / Math.pow(2, zoom);
  
  // 1 nautical mile = 1852 meters
  const NM_TO_METERS = 1852;
  
  // Find best matching scale step for 80-150px width
  let bestDistance = SCALE_STEPS[0];
  let bestWidth = 0;
  let bestDiff = Infinity;
  
  for (const distance of SCALE_STEPS) {
    const meters = distance * NM_TO_METERS;
    const pixels = meters / metersPerPixel;
    
    // Find the scale that gives us closest to 100px within 80-150px range
    if (pixels >= 80 && pixels <= 150) {
      const diff = Math.abs(pixels - 100);
      if (diff < bestDiff) {
        bestDistance = distance;
        bestWidth = Math.round(pixels);
        bestDiff = diff;
      }
    }
  }
  
  // Fallback: if no scale matched, find the closest one
  if (bestWidth === 0) {
    for (const distance of SCALE_STEPS) {
      const meters = distance * NM_TO_METERS;
      const pixels = meters / metersPerPixel;
      
      if (pixels >= 50 && pixels <= 200) {
        bestDistance = distance;
        bestWidth = Math.round(pixels);
        break;
      }
    }
  }
  
  // Last resort fallback
  if (bestWidth === 0) {
    bestDistance = SCALE_STEPS[0];
    const meters = bestDistance * NM_TO_METERS;
    bestWidth = Math.max(50, Math.min(150, Math.round(meters / metersPerPixel)));
  }
  
  return { distance: bestDistance, pixelWidth: bestWidth };
}

// Format scale denominator (Web Mercator standard)
function formatScaleDenominator(zoom: number): string {
  // At zoom level, scale denominator ≈ 591657550 / (2^zoom) at equator
  // Adjust for Svalbard latitude (78°N)
  const latitude = 78 * Math.PI / 180;
  const scaleDenom = (591657550 * Math.cos(latitude)) / Math.pow(2, zoom);
  
  if (!isFinite(scaleDenom) || scaleDenom <= 0) return '1:—';
  
  if (scaleDenom >= 1_000_000) {
    return `1:${Math.round(scaleDenom / 1_000_000)}M`;
  }
  if (scaleDenom >= 1_000) {
    return `1:${Math.round(scaleDenom / 1_000)}k`;
  }
  return `1:${Math.round(scaleDenom)}`;
}

export function ScaleWidget({ zoom, displayMode = 'day' }: ScaleWidgetProps) {
  const [scale, setScale] = useState<{ distance: number; pixelWidth: number }>({ 
    distance: 10, 
    pixelWidth: 100 
  });
  
  useEffect(() => {
    if (zoom > 0) {
      const newScale = calculateScale(zoom);
      setScale(newScale);
      console.log(`📏 Scale updated: zoom=${zoom}, distance=${newScale.distance}NM, width=${newScale.pixelWidth}px`);
    }
  }, [zoom]);
  
  const scaleText = formatScaleDenominator(zoom);
  const distanceText = scale.distance < 1 
    ? `${scale.distance.toFixed(1)} NM` 
    : `${Math.round(scale.distance)} NM`;
  
  // Display mode styles (Day/Night variants)
  const isDayMode = displayMode === 'day';
  
  const containerStyle = isDayMode 
    ? 'bg-black/40' 
    : 'bg-black/40';
  
  const borderStyle = isDayMode
    ? 'border-slate-600/40'
    : 'border-slate-600/40';
  
  const scaleTextColor = isDayMode
    ? 'text-slate-200/90'
    : 'text-slate-200/90';
  
  const distanceTextColor = isDayMode
    ? 'text-slate-300/75'
    : 'text-slate-300/75';
  
  const lineColor = isDayMode
    ? 'border-slate-300/80'
    : 'border-slate-300/80';
  
  return (
    <div 
      className={`
        absolute bottom-5 left-6 z-[100]
        ${containerStyle} ${borderStyle}
        backdrop-blur-md border rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.35)]
        px-3 py-2
        flex flex-col gap-1.5
        pointer-events-none
        min-w-[140px]
      `}
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Scale denominator */}
      <div 
        className={`${scaleTextColor} font-semibold text-[13px] tracking-wider`}
      >
        {scaleText}
      </div>
      
      {/* Scale bar with endcaps */}
      <div className="flex flex-col gap-0.5">
        <div className="relative" style={{ width: `${scale.pixelWidth}px` }}>
          {/* Horizontal line */}
          <div 
            className={`h-0 border-t-2 ${lineColor}`}
            style={{ width: '100%' }}
          />
          
          {/* Left endcap */}
          <div 
            className={`absolute left-0 top-0 w-0 border-l-2 ${lineColor}`}
            style={{ 
              height: '6px',
              transform: 'translateY(-3px)'
            }}
          />
          
          {/* Right endcap */}
          <div 
            className={`absolute right-0 top-0 w-0 border-l-2 ${lineColor}`}
            style={{ 
              height: '6px',
              transform: 'translateY(-3px)'
            }}
          />
        </div>
        
        {/* Distance label */}
        <div 
          className={`${distanceTextColor} font-medium text-[11px]`}
        >
          {distanceText}
        </div>
      </div>
    </div>
  );
}

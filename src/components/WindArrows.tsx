import { useEffect, useRef, useState } from 'react';

interface WindData {
  lat: number;
  lng: number;
  speed: number; // m/s
  direction: number; // degrees (meteorological - direction FROM which wind is coming)
}

interface WindArrowsProps {
  map: any; // Leaflet map instance
  visible: boolean;
  apiKey: string;
}

export function WindArrows({ map, visible, apiKey }: WindArrowsProps) {
  const [windData, setWindData] = useState<WindData[]>([]);
  const [loading, setLoading] = useState(false);
  const markersRef = useRef<any[]>([]);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch wind data for visible map bounds
  const fetchWindData = async () => {
    if (!map || !visible) return;

    const bounds = map.getBounds();
    const center = map.getCenter();
    const zoom = map.getZoom();

    // Determine grid density based on zoom level
    const gridSize = zoom >= 8 ? 3 : zoom >= 6 ? 2 : 1;
    
    // Calculate grid points
    const latStep = (bounds.getNorth() - bounds.getSouth()) / gridSize;
    const lngStep = (bounds.getEast() - bounds.getWest()) / gridSize;

    const gridPoints: { lat: number; lng: number }[] = [];
    
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const lat = bounds.getSouth() + (latStep * i);
        const lng = bounds.getWest() + (lngStep * j);
        gridPoints.push({ lat, lng });
      }
    }

    setLoading(true);

    try {
      // Fetch wind data for each grid point (OpenWeatherMap current weather API)
      const promises = gridPoints.map(async (point) => {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${point.lat}&lon=${point.lng}&appid=${apiKey}&units=metric`
          );
          
          if (!response.ok) {
            console.warn(`Wind data fetch failed for ${point.lat},${point.lng}:`, response.status);
            return null;
          }
          
          const data = await response.json();
          
          if (data.wind) {
            return {
              lat: point.lat,
              lng: point.lng,
              speed: data.wind.speed || 0,
              direction: data.wind.deg || 0,
            };
          }
          
          return null;
        } catch (error) {
          console.warn(`Error fetching wind data for ${point.lat},${point.lng}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validData = results.filter((d): d is WindData => d !== null);
      
      setWindData(validData);
      console.log(`🌬️ Fetched wind data for ${validData.length} points`);
    } catch (error) {
      console.error('Error fetching wind data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch on map move/zoom
  useEffect(() => {
    if (!map || !visible) return;

    const handleMapChange = () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(() => {
        fetchWindData();
      }, 1000); // Debounce 1 second
    };

    map.on('moveend', handleMapChange);
    map.on('zoomend', handleMapChange);

    // Initial fetch
    fetchWindData();

    return () => {
      map.off('moveend', handleMapChange);
      map.off('zoomend', handleMapChange);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [map, visible, apiKey]);

  // Render wind arrows on map
  useEffect(() => {
    if (!map || !visible) {
      // Remove all markers when not visible
      markersRef.current.forEach(marker => {
        try {
          map?.removeLayer(marker);
        } catch (e) {
          // Ignore errors if map is destroyed
        }
      });
      markersRef.current = [];
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker);
      } catch (e) {
        // Ignore errors
      }
    });
    markersRef.current = [];

    // Add new markers for each wind data point
    windData.forEach((wind) => {
      const { lat, lng, speed, direction } = wind;

      // Convert wind speed (m/s) to knots for maritime display
      const speedKnots = speed * 1.94384;

      // Determine arrow size based on wind speed (Beaufort scale inspired)
      let arrowLength = 20;
      let arrowWidth = 3;
      let color = '#00ffff'; // Cyan default
      
      if (speedKnots < 1) {
        arrowLength = 15;
        arrowWidth = 2;
        color = '#00ffff40'; // Very light wind
      } else if (speedKnots < 7) {
        arrowLength = 20;
        arrowWidth = 3;
        color = '#00ffff80'; // Light breeze
      } else if (speedKnots < 16) {
        arrowLength = 25;
        arrowWidth = 3;
        color = '#00ffff'; // Moderate wind
      } else if (speedKnots < 28) {
        arrowLength = 30;
        arrowWidth = 4;
        color = '#ffaa00'; // Strong wind - orange
      } else {
        arrowLength = 35;
        arrowWidth = 5;
        color = '#ff4400'; // Gale/storm - red
      }

      // Create SVG arrow pointing in wind direction
      // Meteorological convention: direction is where wind comes FROM
      // Nautical/arrow convention: arrow points TO where wind is going
      // So we add 180° to show where wind is blowing TO
      const arrowDirection = (direction + 180) % 360;

      const svgIcon = `
        <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
          <g transform="translate(25, 25) rotate(${arrowDirection})">
            <line x1="0" y1="0" x2="0" y2="-${arrowLength}" 
                  stroke="${color}" stroke-width="${arrowWidth}" 
                  stroke-linecap="round"/>
            <polygon points="0,-${arrowLength} -${arrowWidth * 1.5},-${arrowLength - 6} ${arrowWidth * 1.5},-${arrowLength - 6}"
                     fill="${color}"/>
          </g>
        </svg>
      `;

      // Create Leaflet divIcon
      const icon = (window as any).L.divIcon({
        html: svgIcon,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        className: 'wind-arrow-icon',
      });

      // Create marker
      const marker = (window as any).L.marker([lat, lng], {
        icon,
        interactive: true,
      });

      // Add tooltip with wind info
      const beaufortScale = Math.min(Math.floor(speedKnots / 5), 12);
      marker.bindTooltip(
        `<div style="font-size: 11px; font-family: monospace; background: rgba(0,0,0,0.9); padding: 4px 8px; border: 1px solid ${color};">
          <strong style="color: ${color};">WIND</strong><br/>
          Speed: <strong>${speedKnots.toFixed(1)} kts</strong><br/>
          Direction: <strong>${direction.toFixed(0)}°</strong><br/>
          Beaufort: <strong>F${beaufortScale}</strong>
        </div>`,
        {
          permanent: false,
          direction: 'top',
          className: 'wind-tooltip',
          opacity: 1,
        }
      );

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup markers on unmount
      markersRef.current.forEach(marker => {
        try {
          map?.removeLayer(marker);
        } catch (e) {
          // Ignore errors if map is destroyed
        }
      });
      markersRef.current = [];
    };
  }, [map, visible, windData]);

  return null; // This component doesn't render anything in React DOM
}

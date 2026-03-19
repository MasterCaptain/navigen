import React, { useRef, useEffect, useState } from 'react';

interface RiskArea {
  id: string;
  name: string;
  type: 'piracy' | 'conflict' | 'environmental';
  coordinates: [number, number][]; // [lng, lat] polygon
  level: 'critical' | 'high' | 'moderate';
  description: string;
}

const RISK_AREAS: RiskArea[] = [
  {
    id: 'somalia',
    name: 'Gulf of Aden / Somali Basin',
    type: 'piracy',
    coordinates: [
      [42, 4], [54, 4], [60, 12], [54, 18], [42, 14]
    ],
    level: 'high',
    description: 'Piracy threat - BMP5 measures required'
  },
  {
    id: 'guinea',
    name: 'Gulf of Guinea',
    type: 'piracy',
    coordinates: [
      [-5, -2], [10, -2], [10, 8], [-5, 8]
    ],
    level: 'critical',
    description: 'Armed robbery and kidnapping risk'
  },
  {
    id: 'malacca',
    name: 'Malacca Strait',
    type: 'piracy',
    coordinates: [
      [98, 0], [105, 0], [105, 6], [98, 6]
    ],
    level: 'moderate',
    description: 'Petty theft and occasional armed robbery'
  },
  {
    id: 'southchinasea',
    name: 'South China Sea',
    type: 'conflict',
    coordinates: [
      [105, 5], [120, 5], [120, 22], [105, 22]
    ],
    level: 'moderate',
    description: 'Geopolitical tensions - monitor NOTAMs'
  },
  {
    id: 'arctic',
    name: 'Arctic High-Risk Navigation',
    type: 'environmental',
    coordinates: [
      [-45, 70], [90, 70], [90, 85], [-45, 85]
    ],
    level: 'high',
    description: 'Ice navigation - Polar Code applies'
  }
];

// Simplified continent outlines [lng, lat]
const CONTINENTS = [
  // Africa
  [
    [10, 37], [20, 31], [30, 31], [40, 15], [50, 12], [40, -10], 
    [30, -25], [20, -34], [15, -34], [10, -15], [-10, 5], [-15, 20], [0, 35]
  ],
  // Europe
  [
    [-10, 36], [0, 43], [10, 45], [20, 50], [30, 60], [40, 70], 
    [30, 70], [20, 60], [10, 55], [0, 50], [-10, 45]
  ],
  // Asia
  [
    [40, 70], [60, 70], [80, 70], [100, 70], [120, 60], [140, 50], 
    [145, 40], [140, 30], [120, 25], [100, 10], [90, 5], [80, 10],
    [70, 20], [60, 30], [50, 40], [40, 50]
  ],
  // North America
  [
    [-170, 65], [-140, 70], [-100, 70], [-80, 60], [-75, 45], 
    [-80, 30], [-95, 25], [-110, 25], [-115, 30], [-120, 40],
    [-125, 50], [-140, 60], [-160, 65]
  ],
  // South America
  [
    [-80, 10], [-75, 5], [-70, -10], [-65, -20], [-60, -30],
    [-65, -40], [-70, -50], [-75, -55], [-70, -50], [-60, -40],
    [-55, -20], [-50, 0], [-60, 5], [-70, 10]
  ],
  // Australia
  [
    [115, -10], [125, -12], [135, -15], [145, -20], [150, -30],
    [145, -38], [135, -35], [125, -30], [115, -22]
  ],
  // Antarctica
  [
    [-180, -65], [-120, -70], [-60, -75], [0, -80], [60, -75], 
    [120, -70], [180, -65], [120, -60], [60, -60], [0, -60], 
    [-60, -60], [-120, -60]
  ],
  // Greenland
  [
    [-50, 60], [-40, 65], [-35, 70], [-40, 75], [-50, 80], 
    [-60, 80], [-70, 75], [-65, 70], [-60, 65], [-55, 60]
  ],
  // Scandinavia (important for Svalbard context)
  [
    [5, 55], [10, 58], [15, 60], [20, 65], [25, 68], [30, 70],
    [25, 69], [20, 67], [15, 65], [10, 62], [5, 58]
  ],
  // Svalbard
  [
    [10, 77], [15, 78], [20, 79], [25, 79], [30, 78], 
    [28, 77], [20, 76], [15, 76]
  ]
];

interface InteractiveGlobeProps {
  highlightVesselPosition?: { lat: number; lng: number };
  onAreaClick?: (area: RiskArea) => void;
}

export function InteractiveGlobe({ highlightVesselPosition, onAreaClick }: InteractiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 }); // x = longitude, y = latitude
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredArea, setHoveredArea] = useState<RiskArea | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0); // Zoom level
  const [scanAngle, setScanAngle] = useState(0); // For radar sweep animation

  // Animate radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle(prev => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Convert lat/lng to 3D coordinates on sphere
  const latLngToXYZ = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return {
      x: -(radius * Math.sin(phi) * Math.cos(theta)),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    };
  };

  // Rotate point around Y axis (longitude rotation)
  const rotateY = (x: number, y: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - z * sin,
      y: y,
      z: x * sin + z * cos
    };
  };

  // Rotate point around X axis (latitude tilt)
  const rotateX = (x: number, y: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x,
      y: y * cos - z * sin,
      z: y * sin + z * cos
    };
  };

  // Project 3D to 2D (orthographic)
  const project = (x: number, y: number, z: number, centerX: number, centerY: number, scale: number) => {
    return {
      x: centerX + x * scale,
      y: centerY - y * scale,
      visible: z > 0 // Only show front-facing points
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.43 * zoom;

    // Clear canvas
    ctx.fillStyle = '#0A1628';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid background
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw globe sphere outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.02)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw graticule (latitude/longitude lines)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;

    // Longitude lines
    for (let lng = -180; lng <= 180; lng += 30) {
      ctx.beginPath();
      let firstPoint = true;
      for (let lat = -90; lat <= 90; lat += 5) {
        let pos = latLngToXYZ(lat, lng, radius);
        pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
        pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY, 1);
        
        if (proj.visible) {
          if (firstPoint) {
            ctx.moveTo(proj.x, proj.y);
            firstPoint = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        } else {
          firstPoint = true;
        }
      }
      ctx.stroke();
    }

    // Latitude lines
    for (let lat = -90; lat <= 90; lat += 30) {
      ctx.beginPath();
      let firstPoint = true;
      for (let lng = -180; lng <= 180; lng += 5) {
        let pos = latLngToXYZ(lat, lng, radius);
        pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
        pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY, 1);
        
        if (proj.visible) {
          if (firstPoint) {
            ctx.moveTo(proj.x, proj.y);
            firstPoint = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        } else {
          firstPoint = true;
        }
      }
      ctx.stroke();
    }

    // Draw continents/land masses
    CONTINENTS.forEach(continent => {
      ctx.fillStyle = 'rgba(100, 116, 139, 0.15)'; // Subtle slate gray
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'; // Lighter slate outline
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      let firstPoint = true;
      
      // Smooth the continent edges
      const smoothCoords: [number, number][] = [];
      for (let i = 0; i < continent.length; i++) {
        const curr = continent[i];
        const next = continent[(i + 1) % continent.length];
        
        for (let t = 0; t <= 1; t += 0.15) {
          const lng = curr[0] + (next[0] - curr[0]) * t;
          const lat = curr[1] + (next[1] - curr[1]) * t;
          smoothCoords.push([lng, lat]);
        }
      }

      smoothCoords.forEach(([lng, lat]) => {
        let pos = latLngToXYZ(lat, lng, radius);
        pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
        pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY, 1);
        
        if (proj.visible) {
          if (firstPoint) {
            ctx.moveTo(proj.x, proj.y);
            firstPoint = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
      });

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Draw risk areas
    RISK_AREAS.forEach(area => {
      const color = area.level === 'critical' ? 'rgba(239, 68, 68, 0.4)' :
                    area.level === 'high' ? 'rgba(245, 158, 11, 0.4)' :
                    'rgba(234, 179, 8, 0.3)';
      
      ctx.fillStyle = color;
      ctx.strokeStyle = area.level === 'critical' ? 'rgba(239, 68, 68, 0.8)' :
                         area.level === 'high' ? 'rgba(245, 158, 11, 0.8)' :
                         'rgba(234, 179, 8, 0.6)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      let firstPoint = true;
      
      // Create dense polygon for smooth curves
      const smoothCoords: [number, number][] = [];
      for (let i = 0; i < area.coordinates.length; i++) {
        const curr = area.coordinates[i];
        const next = area.coordinates[(i + 1) % area.coordinates.length];
        
        for (let t = 0; t <= 1; t += 0.1) {
          const lng = curr[0] + (next[0] - curr[0]) * t;
          const lat = curr[1] + (next[1] - curr[1]) * t;
          smoothCoords.push([lng, lat]);
        }
      }

      smoothCoords.forEach(([lng, lat]) => {
        let pos = latLngToXYZ(lat, lng, radius);
        pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
        pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY, 1);
        
        if (proj.visible) {
          if (firstPoint) {
            ctx.moveTo(proj.x, proj.y);
            firstPoint = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
      });

      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw area label (if visible)
      const centerLat = area.coordinates.reduce((sum, c) => sum + c[1], 0) / area.coordinates.length;
      const centerLng = area.coordinates.reduce((sum, c) => sum + c[0], 0) / area.coordinates.length;
      let labelPos = latLngToXYZ(centerLat, centerLng, radius);
      labelPos = rotateY(labelPos.x, labelPos.y, labelPos.z, rotation.x);
      labelPos = rotateX(labelPos.x, labelPos.y, labelPos.z, rotation.y);
      const labelProj = project(labelPos.x, labelPos.y, labelPos.z, centerX, centerY, 1);
      
      if (labelProj.visible) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(area.name.split(' / ')[0], labelProj.x, labelProj.y - 8);
        
        const levelText = area.level.toUpperCase();
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = area.level === 'critical' ? '#EF4444' :
                        area.level === 'high' ? '#F59E0B' : '#EAB308';
        ctx.fillText(levelText, labelProj.x, labelProj.y + 5);
      }
    });

    // Draw vessel position if provided
    if (highlightVesselPosition) {
      let vesselPos = latLngToXYZ(highlightVesselPosition.lat, highlightVesselPosition.lng, radius);
      vesselPos = rotateY(vesselPos.x, vesselPos.y, vesselPos.z, rotation.x);
      vesselPos = rotateX(vesselPos.x, vesselPos.y, vesselPos.z, rotation.y);
      const vesselProj = project(vesselPos.x, vesselPos.y, vesselPos.z, centerX, centerY, 1);
      
      if (vesselProj.visible) {
        // Pulsing circle
        ctx.beginPath();
        ctx.arc(vesselProj.x, vesselProj.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(vesselProj.x, vesselProj.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#06B6D4';
        ctx.fill();
        ctx.strokeStyle = '#0A1628';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#06B6D4';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VESSEL', vesselProj.x, vesselProj.y - 15);
      }
    }

    // Draw equator highlight
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    let firstEqPoint = true;
    for (let lng = -180; lng <= 180; lng += 2) {
      let pos = latLngToXYZ(0, lng, radius);
      pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
      pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
      const proj = project(pos.x, pos.y, pos.z, centerX, centerY, 1);
      
      if (proj.visible) {
        if (firstEqPoint) {
          ctx.moveTo(proj.x, proj.y);
          firstEqPoint = false;
        } else {
          ctx.lineTo(proj.x, proj.y);
        }
      } else {
        firstEqPoint = true;
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

  }, [rotation, highlightVesselPosition, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotation(prev => ({
      x: prev.x + deltaX * 0.005,
      y: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.y + deltaY * 0.005))
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.43 * zoom;

    const mouseX = e.clientX - canvas.offsetLeft;
    const mouseY = e.clientY - canvas.offsetTop;
    setMousePos({ x: mouseX, y: mouseY });

    // Check if mouse is over any risk area
    RISK_AREAS.forEach(area => {
      const color = area.level === 'critical' ? 'rgba(239, 68, 68, 0.4)' :
                    area.level === 'high' ? 'rgba(245, 158, 11, 0.4)' :
                    'rgba(234, 179, 8, 0.3)';
      
      ctx.fillStyle = color;
      ctx.strokeStyle = area.level === 'critical' ? 'rgba(239, 68, 68, 0.8)' :
                         area.level === 'high' ? 'rgba(245, 158, 11, 0.8)' :
                         'rgba(234, 179, 8, 0.6)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      let firstPoint = true;
      
      // Create dense polygon for smooth curves
      const smoothCoords: [number, number][] = [];
      for (let i = 0; i < area.coordinates.length; i++) {
        const curr = area.coordinates[i];
        const next = area.coordinates[(i + 1) % area.coordinates.length];
        
        for (let t = 0; t <= 1; t += 0.1) {
          const lng = curr[0] + (next[0] - curr[0]) * t;
          const lat = curr[1] + (next[1] - curr[1]) * t;
          smoothCoords.push([lng, lat]);
        }
      }

      smoothCoords.forEach(([lng, lat]) => {
        let pos = latLngToXYZ(lat, lng, radius);
        pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
        pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY, 1);
        
        if (proj.visible) {
          if (firstPoint) {
            ctx.moveTo(proj.x, proj.y);
            firstPoint = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
      });

      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Check if mouse is inside the polygon
      const isInside = ctx.isPointInPath(mouseX, mouseY);
      if (isInside) {
        setHoveredArea(area);
      }
    });
  };

  const handleMouseOut = () => {
    setHoveredArea(null);
  };

  const handleMouseClick = () => {
    if (hoveredArea && onAreaClick) {
      onAreaClick(hoveredArea);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.8, Math.min(2.0, prev + delta)));
  };

  return (
    <div className="relative w-full h-full"
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={1400}
        height={900}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={handleMouseClick}
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Hollywood-style tactical overlays */}
      {/* Corner reticles - Top Left */}
      <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none">
        <svg width="100%" height="100%" className="text-cyan-500/60">
          <line x1="0" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="0" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Corner reticles - Top Right */}
      <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
        <svg width="100%" height="100%" className="text-cyan-500/60">
          <line x1="80" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="80" y1="0" x2="80" y2="20" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Corner reticles - Bottom Left */}
      <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none">
        <svg width="100%" height="100%" className="text-cyan-500/60">
          <line x1="0" y1="80" x2="20" y2="80" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="80" x2="20" y2="100" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Corner reticles - Bottom Right */}
      <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none">
        <svg width="100%" height="100%" className="text-cyan-500/60">
          <line x1="80" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="2" />
          <line x1="80" y1="80" x2="80" y2="100" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Scanning sweep line animation */}
      <div 
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ 
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center'
        }}
      >
        <div 
          className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-cyan-500/0 via-cyan-400/40 to-cyan-500/0"
          style={{
            transform: `rotate(${scanAngle}deg)`,
            transformOrigin: 'center'
          }}
        />
      </div>

      {/* Crosshair center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="40" height="40" className="text-cyan-500/40">
          <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="20" cy="20" r="2" fill="currentColor" />
          <line x1="20" y1="5" x2="20" y2="12" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="28" x2="20" y2="35" stroke="currentColor" strokeWidth="1" />
          <line x1="5" y1="20" x2="12" y2="20" stroke="currentColor" strokeWidth="1" />
          <line x1="28" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* HUD Instructions */}
      <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded px-4 py-2">
        <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold mb-1">
          Globe Controls
        </div>
        <div className="text-[9px] text-slate-400">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Tactical Display indicator */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 bg-slate-900/70 backdrop-blur-sm border-l-2 border-amber-500 px-3 py-2">
        <div className="text-[8px] text-amber-400 uppercase tracking-widest font-bold mb-0.5 flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
          TACTICAL
        </div>
        <div className="text-[10px] text-slate-300 font-semibold">DISPLAY</div>
        <div className="text-[7px] text-slate-500 mt-1">MARSEC MODE</div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded px-3 py-2">
        <div className="text-[9px] text-cyan-400 uppercase tracking-wider font-semibold mb-1">
          Zoom Level
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500"
              style={{ width: `${((zoom - 0.8) / 1.2) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-300 font-mono">{zoom.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
}
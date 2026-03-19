import React, { useRef, useEffect, useState } from 'react';

interface MaritimeIncident {
  lat: number;
  lng: number;
  type: 'piracy' | 'smuggling' | 'illegal_fishing' | 'pollution';
  severity: 'low' | 'medium' | 'high';
}

interface ChokePoint {
  name: string;
  lat: number;
  lng: number;
  importance: 'critical' | 'high';
}

// Maritime security incidents (global distribution)
const INCIDENTS: MaritimeIncident[] = [
  // Gulf of Aden / Somalia
  { lat: 12, lng: 48, type: 'piracy', severity: 'high' },
  { lat: 9, lng: 51, type: 'piracy', severity: 'high' },
  { lat: 14, lng: 52, type: 'piracy', severity: 'medium' },
  // Gulf of Guinea
  { lat: 4, lng: 5, type: 'piracy', severity: 'high' },
  { lat: 2, lng: 8, type: 'piracy', severity: 'high' },
  { lat: 6, lng: 3, type: 'piracy', severity: 'medium' },
  // Southeast Asia
  { lat: 3, lng: 101, type: 'piracy', severity: 'medium' },
  { lat: 1, lng: 104, type: 'smuggling', severity: 'low' },
  { lat: 7, lng: 100, type: 'illegal_fishing', severity: 'medium' },
  // South China Sea
  { lat: 15, lng: 112, type: 'illegal_fishing', severity: 'medium' },
  { lat: 10, lng: 115, type: 'smuggling', severity: 'low' },
  // Caribbean
  { lat: 18, lng: -75, type: 'smuggling', severity: 'medium' },
  { lat: 12, lng: -68, type: 'smuggling', severity: 'low' },
  // Mediterranean
  { lat: 36, lng: 15, type: 'smuggling', severity: 'medium' },
  { lat: 33, lng: 25, type: 'pollution', severity: 'low' },
  // Indian Ocean
  { lat: -10, lng: 65, type: 'illegal_fishing', severity: 'medium' },
  { lat: -5, lng: 55, type: 'piracy', severity: 'low' },
];

const CHOKE_POINTS: ChokePoint[] = [
  { name: 'Strait of Hormuz', lat: 26.5, lng: 56.5, importance: 'critical' },
  { name: 'Malacca Strait', lat: 2.5, lng: 101, importance: 'critical' },
  { name: 'Suez Canal', lat: 30, lng: 32.5, importance: 'critical' },
  { name: 'Bab el-Mandeb', lat: 12.5, lng: 43.5, importance: 'critical' },
  { name: 'Panama Canal', lat: 9, lng: -79.5, importance: 'high' },
  { name: 'Bosphorus', lat: 41, lng: 29, importance: 'high' },
];

// Enhanced continents with more detail
const CONTINENTS = [
  // Africa - more detailed
  [
    [-17, 35], [-10, 37], [0, 37], [10, 37], [20, 31], [25, 31], [30, 31], 
    [35, 25], [40, 15], [45, 12], [50, 12], [45, 5], [40, -5], [38, -10],
    [35, -18], [30, -25], [25, -30], [20, -34], [15, -34], [12, -30],
    [10, -20], [5, -15], [0, -10], [-5, 0], [-10, 5], [-12, 10], 
    [-15, 20], [-10, 28], [0, 35]
  ],
  // Europe - enhanced
  [
    [-10, 36], [-8, 40], [-5, 43], [0, 43], [5, 45], [10, 45], [15, 48],
    [20, 50], [25, 55], [30, 60], [35, 65], [40, 70], [35, 70], [30, 68],
    [25, 65], [20, 60], [15, 58], [10, 55], [5, 52], [0, 50], [-5, 47], [-10, 45]
  ],
  // Asia - more detailed
  [
    [40, 70], [50, 72], [60, 75], [70, 75], [80, 70], [90, 68], [100, 70],
    [110, 68], [120, 60], [130, 55], [140, 50], [145, 45], [145, 40],
    [143, 35], [140, 30], [135, 28], [130, 26], [120, 25], [110, 20],
    [100, 10], [95, 5], [90, 5], [85, 8], [80, 10], [75, 15], [70, 20],
    [65, 25], [60, 30], [55, 35], [50, 40], [45, 45], [40, 50], [40, 60]
  ],
  // North America - enhanced
  [
    [-170, 65], [-160, 68], [-150, 70], [-140, 70], [-130, 68], [-120, 65],
    [-110, 68], [-100, 70], [-90, 68], [-80, 60], [-78, 55], [-75, 45],
    [-78, 40], [-80, 30], [-85, 27], [-95, 25], [-100, 23], [-110, 25],
    [-115, 30], [-120, 35], [-125, 40], [-130, 48], [-140, 55], [-150, 60],
    [-160, 65]
  ],
  // South America - more detail
  [
    [-80, 10], [-78, 8], [-75, 5], [-72, 0], [-70, -5], [-68, -10],
    [-65, -15], [-62, -20], [-60, -25], [-58, -30], [-60, -35],
    [-62, -40], [-65, -45], [-68, -50], [-70, -53], [-75, -55],
    [-72, -52], [-68, -48], [-65, -42], [-62, -38], [-60, -35],
    [-58, -28], [-56, -22], [-54, -15], [-52, -8], [-50, 0],
    [-55, 3], [-60, 5], [-65, 8], [-70, 10], [-75, 10]
  ],
  // Australia
  [
    [113, -10], [118, -12], [125, -12], [130, -13], [135, -15], 
    [140, -17], [145, -20], [148, -25], [150, -30], [150, -35],
    [148, -38], [145, -40], [140, -38], [135, -35], [130, -33],
    [125, -30], [120, -28], [115, -22], [113, -15]
  ],
  // Antarctica
  [
    [-180, -65], [-150, -68], [-120, -70], [-90, -72], [-60, -75],
    [-30, -78], [0, -80], [30, -78], [60, -75], [90, -72],
    [120, -70], [150, -68], [180, -65]
  ],
  // Greenland
  [
    [-73, 60], [-70, 62], [-65, 65], [-60, 67], [-55, 70], [-50, 72],
    [-45, 75], [-42, 78], [-40, 80], [-42, 82], [-48, 83], [-55, 82],
    [-60, 80], [-65, 78], [-70, 75], [-73, 70], [-75, 65]
  ],
  // Scandinavia & Iceland
  [
    [5, 55], [8, 58], [10, 60], [12, 62], [15, 65], [18, 67], [20, 68],
    [22, 69], [25, 70], [28, 70], [30, 69], [28, 67], [25, 65],
    [22, 63], [18, 61], [15, 60], [12, 58], [8, 56], [5, 55]
  ],
  // Svalbard (highlighted for NAVIGEN)
  [
    [10, 77], [12, 77.5], [15, 78], [18, 78.5], [20, 79], [23, 79.2],
    [26, 79], [28, 78.5], [30, 78], [28, 77.5], [25, 77], [22, 76.8],
    [18, 76.5], [15, 76.5], [12, 76.8]
  ],
  // New Zealand
  [
    [166, -34], [170, -35], [174, -37], [178, -38], [178, -41],
    [175, -43], [172, -45], [168, -46], [166, -45], [165, -42],
    [164, -39], [165, -36]
  ],
  // Japan
  [
    [130, 31], [132, 33], [135, 35], [138, 37], [140, 39], [142, 41],
    [145, 43], [145, 45], [143, 43], [141, 41], [138, 39], [136, 37],
    [133, 35], [130, 33]
  ],
  // UK & Ireland
  [
    [-10, 50], [-8, 51], [-6, 52], [-5, 54], [-4, 56], [-3, 58],
    [-2, 58.5], [0, 58], [1, 57], [2, 56], [1, 54], [0, 53],
    [-2, 52], [-4, 51], [-6, 50], [-8, 50]
  ]
];

// Arc connections between major maritime regions
const ARC_CONNECTIONS = [
  { from: { lat: 1, lng: 103 }, to: { lat: 51, lng: 0 } }, // Singapore to Europe
  { from: { lat: 25, lng: 55 }, to: { lat: 40, lng: -74 } }, // Middle East to US East Coast
  { from: { lat: -34, lng: 18 }, to: { lat: 35, lng: 139 } }, // Cape Town to Tokyo
  { from: { lat: 1, lng: 103 }, to: { lat: 22, lng: 114 } }, // Singapore to Hong Kong
  { from: { lat: 30, lng: 32 }, to: { lat: 51, lng: 3 } }, // Suez to Rotterdam
];

interface CinematicGlobeProps {
  vesselPosition?: { lat: number; lng: number };
}

export function CinematicGlobe({ vesselPosition }: CinematicGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.2 }); // Start with slight tilt
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [scanAngle, setScanAngle] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotation(prev => ({ ...prev, x: prev.x + 0.002 }));
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle(prev => (prev + 1.5) % 360);
      setPulsePhase(prev => (prev + 0.05) % (Math.PI * 2));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const latLngToXYZ = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return {
      x: -(radius * Math.sin(phi) * Math.cos(theta)),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    };
  };

  const rotateY = (x: number, y: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x * cos - z * sin, y: y, z: x * sin + z * cos };
  };

  const rotateX = (x: number, y: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x, y: y * cos - z * sin, z: y * sin + z * cos };
  };

  const project = (x: number, y: number, z: number, centerX: number, centerY: number) => {
    return {
      x: centerX + x,
      y: centerY - y,
      visible: z > 0,
      depth: z
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
    const radius = Math.min(width, height) * 0.38 * zoom;

    // Clear with dark background
    ctx.fillStyle = '#0A1628';
    ctx.fillRect(0, 0, width, height);

    // Subtle radial gradient background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2);
    bgGradient.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
    bgGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.02)');
    bgGradient.addColorStop(1, 'rgba(10, 22, 40, 0)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw globe atmosphere/glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.85, centerX, centerY, radius * 1.15);
    glowGradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
    glowGradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.15)');
    glowGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Draw globe base sphere
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    const sphereGradient = ctx.createRadialGradient(
      centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
      centerX, centerY, radius * 1.2
    );
    sphereGradient.addColorStop(0, 'rgba(15, 30, 50, 0.8)');
    sphereGradient.addColorStop(0.5, 'rgba(10, 20, 35, 0.9)');
    sphereGradient.addColorStop(1, 'rgba(5, 10, 20, 1)');
    ctx.fillStyle = sphereGradient;
    ctx.fill();

    // Outer rim
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw subtle graticule
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.lineWidth = 0.5;

    // Longitude lines
    for (let lng = -180; lng <= 180; lng += 30) {
      ctx.beginPath();
      let firstPoint = true;
      for (let lat = -90; lat <= 90; lat += 3) {
        let pos = latLngToXYZ(lat, lng, radius);
        pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
        pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY);
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
    for (let lat = -75; lat <= 75; lat += 30) {
      ctx.beginPath();
      let firstPoint = true;
      for (let lng = -180; lng <= 180; lng += 3) {
        let pos = latLngToXYZ(lat, lng, radius);
        pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
        pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY);
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

    // Draw continents with subtle relief shading
    CONTINENTS.forEach(continent => {
      ctx.beginPath();
      let firstPoint = true;
      const smoothCoords: [number, number][] = [];
      
      for (let i = 0; i < continent.length; i++) {
        const curr = continent[i];
        const next = continent[(i + 1) % continent.length];
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
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY);
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
      
      // Subtle land color with depth
      ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw arc connections between regions
    ARC_CONNECTIONS.forEach(arc => {
      const steps = 50;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      
      let firstVisible = true;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = arc.from.lat + (arc.to.lat - arc.from.lat) * t;
        const lng = arc.from.lng + (arc.to.lng - arc.from.lng) * t;
        
        // Add arc height
        const arcHeight = Math.sin(t * Math.PI) * 15;
        
        let pos = latLngToXYZ(lat, lng, radius + arcHeight);
        pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
        pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
        const proj = project(pos.x, pos.y, pos.z, centerX, centerY);
        
        if (proj.visible) {
          if (firstVisible) {
            ctx.moveTo(proj.x, proj.y);
            firstVisible = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw maritime choke points
    CHOKE_POINTS.forEach(point => {
      let pos = latLngToXYZ(point.lat, point.lng, radius);
      pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
      pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
      const proj = project(pos.x, pos.y, pos.z, centerX, centerY);
      
      if (proj.visible) {
        const size = point.importance === 'critical' ? 6 : 4;
        const pulse = Math.sin(pulsePhase) * 0.5 + 0.5;
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = point.importance === 'critical' 
          ? 'rgba(245, 158, 11, 0.2)' 
          : 'rgba(234, 179, 8, 0.15)';
        ctx.fill();
        
        // Inner marker
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
        ctx.fillStyle = point.importance === 'critical' ? '#F59E0B' : '#EAB308';
        ctx.fill();
        ctx.strokeStyle = '#0A1628';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Label for critical points
        if (point.importance === 'critical' && proj.depth > radius * 0.3) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(point.name, proj.x, proj.y - 12);
        }
      }
    });

    // Draw incident markers
    INCIDENTS.forEach(incident => {
      let pos = latLngToXYZ(incident.lat, incident.lng, radius);
      pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
      pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
      const proj = project(pos.x, pos.y, pos.z, centerX, centerY);
      
      if (proj.visible) {
        const size = incident.severity === 'high' ? 4 : incident.severity === 'medium' ? 3 : 2;
        const pulse = Math.sin(pulsePhase * (incident.severity === 'high' ? 2 : 1)) * 0.3 + 0.7;
        
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size * pulse, 0, Math.PI * 2);
        
        const color = incident.severity === 'high' ? 'rgba(239, 68, 68, 0.8)' :
                      incident.severity === 'medium' ? 'rgba(245, 158, 11, 0.7)' :
                      'rgba(234, 179, 8, 0.6)';
        ctx.fillStyle = color;
        ctx.fill();
        
        // Subtle glow
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size * pulse + 2, 0, Math.PI * 2);
        ctx.strokeStyle = color.replace('0.8', '0.3').replace('0.7', '0.2').replace('0.6', '0.15');
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw vessel position
    if (vesselPosition) {
      let pos = latLngToXYZ(vesselPosition.lat, vesselPosition.lng, radius);
      pos = rotateY(pos.x, pos.y, pos.z, rotation.x);
      pos = rotateX(pos.x, pos.y, pos.z, rotation.y);
      const proj = project(pos.x, pos.y, pos.z, centerX, centerY);
      
      if (proj.visible) {
        const pulse = Math.sin(pulsePhase * 2) * 0.3 + 1;
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 12 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner dot
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#06B6D4';
        ctx.fill();
        ctx.strokeStyle = '#0A1628';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#06B6D4';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OWN VESSEL', proj.x, proj.y - 20);
      }
    }

    // Radar sweep effect
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((scanAngle * Math.PI) / 180);
    
    const sweepGradient = ctx.createLinearGradient(0, -radius, 0, radius);
    sweepGradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
    sweepGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
    sweepGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
    
    ctx.fillStyle = sweepGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, -Math.PI / 24, Math.PI / 24);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();

  }, [rotation, zoom, scanAngle, pulsePhase, vesselPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
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
    setTimeout(() => setAutoRotate(true), 2000);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom(prev => Math.max(0.7, Math.min(1.8, prev + delta)));
  };

  return (
    <div className="relative w-full h-full" onWheel={handleWheel}>
      <canvas
        ref={canvasRef}
        width={1400}
        height={900}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Corner brackets - cinematic framing */}
      <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none border-l-2 border-t-2 border-cyan-500/40" />
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none border-r-2 border-t-2 border-cyan-500/40" />
      <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none border-l-2 border-b-2 border-cyan-500/40" />
      <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none border-r-2 border-b-2 border-cyan-500/40" />

      {/* Crosshair center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="50" height="50" className="text-cyan-500/30">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="25" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="25" y1="0" x2="25" y2="10" stroke="currentColor" strokeWidth="1" />
          <line x1="25" y1="40" x2="25" y2="50" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="25" x2="10" y2="25" stroke="currentColor" strokeWidth="1" />
          <line x1="40" y1="25" x2="50" y2="25" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Legend - Top Left */}
      <div className="absolute top-6 left-6 bg-slate-900/70 backdrop-blur-md border border-amber-500/30 rounded-lg px-4 py-3 min-w-[200px]">
        <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          SECURITY OVERLAY
        </div>
        <div className="space-y-2 text-[9px]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Critical Choke Points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-300">High Severity Incidents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-300">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <span className="text-slate-300">Low Severity</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-300">Own Vessel Position</span>
          </div>
        </div>
      </div>

      {/* Status - Top Right */}
      <div className="absolute top-6 right-6 bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-lg px-4 py-3">
        <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-2">
          GLOBAL COVERAGE
        </div>
        <div className="text-[11px] text-slate-300 font-mono space-y-1">
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">Incidents:</span>
            <span className="text-amber-400 font-bold">{INCIDENTS.length}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">Choke Points:</span>
            <span className="text-amber-400 font-bold">{CHOKE_POINTS.length}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-500">Tracking:</span>
            <span className="text-cyan-400 font-bold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Controls - Bottom Left */}
      <div className="absolute bottom-6 left-6 bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded px-4 py-2">
        <div className="text-[9px] text-cyan-400 uppercase tracking-wider font-semibold mb-1">
          Globe Controls
        </div>
        <div className="text-[8px] text-slate-400 space-y-0.5">
          <div>Drag to rotate • Scroll to zoom</div>
          <div className="flex items-center gap-2">
            <span>Auto-rotate:</span>
            <span className={autoRotate ? 'text-green-400' : 'text-slate-500'}>
              {autoRotate ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* System Status - Bottom Right */}
      <div className="absolute bottom-6 right-6 bg-slate-900/70 backdrop-blur-md border-l-2 border-cyan-500 px-3 py-2">
        <div className="text-[8px] text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          MARSEC TACTICAL
        </div>
        <div className="text-[10px] text-slate-300 font-semibold mt-0.5">LIVE VIEW</div>
        <div className="text-[7px] text-slate-500 mt-1">Zoom: {zoom.toFixed(1)}x</div>
      </div>
    </div>
  );
}

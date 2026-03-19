import { X, Radio, Phone, AlertTriangle, FileText, Cloud, Anchor, Ship, MapPin, Clock, Navigation } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ModuleSwitcher } from './ModuleSwitcher';

interface CommsModuleProps {
  onClose: () => void;
  vesselPosition: { lat: number; lng: number };
  activeModule: string;
  onSwitchModule: (module: string | null) => void;
  vesselSpeed?: number;  // NEW: vessel speed in knots
  vesselCourse?: number; // NEW: vessel course in degrees
}

type TabType = 'vhf' | 'ports' | 'emergency' | 'reports' | 'weather';

interface VHFChannel {
  channel: string;
  frequency: string;
  purpose: string;
  area?: string;
  geofence?: {
    lat: number;
    lng: number;
    radiusNm: number;
  };
}

interface PortAuthority {
  name: string;
  location: string;
  lat: number;
  lng: number;
  vhf: string;
  phone: string;
  email: string;
  callsign: string;
}

interface EmergencyContact {
  name: string;
  type: 'SAR' | 'Coast Guard' | 'Governor' | 'Other';
  vhf: string;
  phone: string;
  coverage: string;
  coverageArea: {
    lat: number;
    lng: number;
    radiusNm: number;
  };
  priority: 'critical' | 'high' | 'normal';
}

interface WeatherService {
  name: string;
  type: string;
  coverage: string;
  lat: number;
  lng: number;
  radiusNm: number;
  navtex?: string;
  phone?: string;
  email?: string;
  website?: string;
}

// Haversine distance calculation in nautical miles
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const VHF_CHANNELS: VHFChannel[] = [
  { channel: '16', frequency: '156.800', purpose: 'DISTRESS, SAFETY & CALLING', area: 'International' },
  { channel: '13', frequency: '156.650', purpose: 'BRIDGE-TO-BRIDGE NAVIGATION', area: 'International' },
  { channel: '06', frequency: '156.300', purpose: 'INTERSHIP SAFETY', area: 'International' },
  { 
    channel: '12', 
    frequency: '156.600', 
    purpose: 'PORT OPERATIONS Longyearbyen', 
    area: 'Svalbard',
    geofence: { lat: 78.2232, lng: 15.6267, radiusNm: 100 }
  },
  { 
    channel: '14', 
    frequency: '156.700', 
    purpose: 'PORT OPERATIONS Ny-Ålesund', 
    area: 'Svalbard',
    geofence: { lat: 78.9249, lng: 11.9294, radiusNm: 80 }
  },
  { 
    channel: '09', 
    frequency: '156.450', 
    purpose: 'PILOT', 
    area: 'Norway',
    geofence: { lat: 69.6492, lng: 18.9553, radiusNm: 150 }
  },
  { 
    channel: '11', 
    frequency: '156.550', 
    purpose: 'PORT OPERATIONS', 
    area: 'Norway',
    geofence: { lat: 69.6492, lng: 18.9553, radiusNm: 150 }
  },
  { channel: '70', frequency: '156.525', purpose: 'DIGITAL SELECTIVE CALLING (DSC)', area: 'International' },
];

const PORT_AUTHORITIES: PortAuthority[] = [
  {
    name: 'Longyearbyen Port Authority',
    location: 'Longyearbyen, Svalbard',
    lat: 78.2232,
    lng: 15.6267,
    vhf: 'CH 12',
    phone: '+47 79 02 12 00',
    email: 'port@longyearbyen.no',
    callsign: 'LONGYEARBYEN PORT',
  },
  {
    name: 'Ny-Ålesund Port',
    location: 'Ny-Ålesund, Svalbard',
    lat: 78.9249,
    lng: 11.9294,
    vhf: 'CH 14',
    phone: '+47 79 02 72 00',
    email: 'port@nyalesund.no',
    callsign: 'NY-ÅLESUND PORT',
  },
  {
    name: 'Sysselmannen (Governor of Svalbard)',
    location: 'Longyearbyen, Svalbard',
    lat: 78.2232,
    lng: 15.6267,
    vhf: 'CH 16',
    phone: '+47 79 02 43 00',
    email: 'sysselmannen@sysselmannen.no',
    callsign: 'SYSSELMANNEN',
  },
  {
    name: 'Tromsø VTS',
    location: 'Tromsø, Norway',
    lat: 69.6492,
    lng: 18.9553,
    vhf: 'CH 12, 14',
    phone: '+47 77 60 72 00',
    email: 'tromso.vts@kystverket.no',
    callsign: 'TROMSØ TRAFFIC',
  },
  {
    name: 'Hammerfest Port',
    location: 'Hammerfest, Norway',
    lat: 70.6634,
    lng: 23.6821,
    vhf: 'CH 12',
    phone: '+47 78 42 96 00',
    email: 'port@hammerfest.kommune.no',
    callsign: 'HAMMERFEST PORT',
  },
  {
    name: 'Honningsvåg Port',
    location: 'Honningsvåg, Norway',
    lat: 70.9822,
    lng: 25.9707,
    vhf: 'CH 12',
    phone: '+47 78 47 33 00',
    email: 'port@nordkapp.kommune.no',
    callsign: 'HONNINGSVÅG PORT',
  },
];

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'Joint Rescue Coordination Centre (JRCC) North Norway',
    type: 'SAR',
    vhf: 'CH 16',
    phone: '+47 51 51 70 00',
    coverage: 'Norwegian Arctic, Svalbard, Jan Mayen',
    coverageArea: { lat: 78.0, lng: 15.0, radiusNm: 1200 },
    priority: 'critical',
  },
  {
    name: 'Norwegian Coast Guard Svalbard',
    type: 'Coast Guard',
    vhf: 'CH 16',
    phone: '+47 78 95 02 00',
    coverage: 'Svalbard waters',
    coverageArea: { lat: 78.2232, lng: 15.6267, radiusNm: 400 },
    priority: 'critical',
  },
  {
    name: 'Sysselmannen Emergency',
    type: 'Governor',
    vhf: 'CH 16',
    phone: '+47 79 02 43 00',
    coverage: 'Svalbard territory',
    coverageArea: { lat: 78.2232, lng: 15.6267, radiusNm: 350 },
    priority: 'high',
  },
  {
    name: 'Longyearbyen Hospital',
    type: 'Other',
    vhf: 'CH 12',
    phone: '+47 79 02 42 00',
    coverage: 'Medical emergencies - Svalbard',
    coverageArea: { lat: 78.2232, lng: 15.6267, radiusNm: 300 },
    priority: 'high',
  },
  {
    name: 'JRCC Southern Norway',
    type: 'SAR',
    vhf: 'CH 16',
    phone: '+47 51 51 70 01',
    coverage: 'Southern Norway, North Sea',
    coverageArea: { lat: 60.0, lng: 5.0, radiusNm: 1000 },
    priority: 'critical',
  },
  {
    name: 'Norwegian Coastal Administration',
    type: 'Coast Guard',
    vhf: 'CH 16',
    phone: '+47 33 03 49 00',
    coverage: 'Pollution response, navigation safety',
    coverageArea: { lat: 69.0, lng: 15.0, radiusNm: 800 },
    priority: 'normal',
  },
];

const WEATHER_SERVICES: WeatherService[] = [
  {
    name: 'Norwegian Meteorological Institute',
    type: 'Regional Met Office',
    coverage: 'Norwegian Arctic, Svalbard, Barents Sea',
    lat: 78.2232,
    lng: 15.6267,
    radiusNm: 1000,
    navtex: '518 kHz',
    phone: '+47 22 96 30 00',
    email: 'met@met.no',
    website: 'yr.no',
  },
  {
    name: 'Ice Service - Norwegian Met',
    type: 'Sea Ice Forecasting',
    coverage: 'Arctic sea ice charts and forecasts',
    lat: 80.0,
    lng: 15.0,
    radiusNm: 1200,
    email: 'ice@met.no',
    website: 'cryo.met.no',
  },
  {
    name: 'Danish Meteorological Institute (DMI)',
    type: 'Regional Met Office',
    coverage: 'Greenland, Davis Strait, Denmark Strait',
    lat: 70.0,
    lng: -40.0,
    radiusNm: 1200,
    phone: '+45 39 15 74 78',
    website: 'dmi.dk',
  },
];

export function CommsModule({ onClose, vesselPosition, activeModule, onSwitchModule, vesselSpeed, vesselCourse }: CommsModuleProps) {
  const [activeTab, setActiveTab] = useState<TabType>('vhf');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'position' | 'arrival' | 'departure' | 'sailing'>('position');
  const [nearbyMode, setNearbyMode] = useState(true); // Toggle for geofencing

  const formatLatLon = (lat: number, lng: number) => {
    const latDeg = Math.abs(lat);
    const latMin = (latDeg % 1) * 60;
    const latDir = lat >= 0 ? 'N' : 'S';
    
    const lngDeg = Math.abs(lng);
    const lngMin = (lngDeg % 1) * 60;
    const lngDir = lng >= 0 ? 'E' : 'W';
    
    return `${Math.floor(latDeg)}°${latMin.toFixed(3)}'${latDir} ${Math.floor(lngDeg)}°${lngMin.toFixed(3)}'${lngDir}`;
  };

  const handleDial = (number: string, name: string) => {
    alert(`📞 DIALING: ${name}\n${number}\n\nIn production, this would initiate a satellite phone or radio call.`);
  };

  const handleVHFCall = (channel: string, callsign: string) => {
    alert(`📻 VHF CALL INITIATED\n\nChannel: ${channel}\nCallsign: ${callsign}\n\nIn production, this would connect to VHF radio system.`);
  };

  const generatePositionReport = () => {
    const timestamp = new Date().toISOString();
    const position = formatLatLon(vesselPosition.lat, vesselPosition.lng);
    
    // Determine reporting authority based on position
    let reportedTo = 'JRCC Regional / Local Authorities';
    
    // Check if in Norwegian waters (including Svalbard)
    const inSvalbard = calculateDistance(vesselPosition.lat, vesselPosition.lng, 78.2232, 15.6267) <= 400;
    const inNorwayCoastal = vesselPosition.lat > 58 && vesselPosition.lat < 72 && vesselPosition.lng > 4 && vesselPosition.lng < 32;
    
    if (inSvalbard) {
      reportedTo = 'JRCC North Norway / Sysselmannen';
    } else if (inNorwayCoastal) {
      reportedTo = 'JRCC North Norway';
    } else if (vesselPosition.lat > 60 || vesselPosition.lat < -60) {
      reportedTo = 'Polar SAR Coordination Center';
    } else {
      reportedTo = 'Regional MRCC / Flag State Authority';
    }
    
    return `POSITION REPORT
Time: ${new Date().toUTCString()}
Position: ${position}
Vessel: MV NAVIGEN
IMO: 1234567
Status: UNDERWAY
Course: ${vesselCourse ? `${vesselCourse}°` : 'N/A'}
Speed: ${vesselSpeed ? `${vesselSpeed} kts` : 'N/A'}
Destination: LONGYEARBYEN
ETA: ${new Date(Date.now() + 6 * 3600000).toUTCString()}

Reported to: ${reportedTo}`;
  };

  // Calculate distances and filter/sort
  const portsWithDistance = useMemo(() => {
    return PORT_AUTHORITIES.map(port => ({
      ...port,
      distance: calculateDistance(vesselPosition.lat, vesselPosition.lng, port.lat, port.lng)
    }))
    .filter(port => port.distance <= 1000) // Only show ports within 1000 NM
    .sort((a, b) => a.distance - b.distance);
  }, [vesselPosition]);

  const emergencyWithDistance = useMemo(() => {
    return EMERGENCY_CONTACTS.map(contact => ({
      ...contact,
      distance: calculateDistance(vesselPosition.lat, vesselPosition.lng, contact.coverageArea.lat, contact.coverageArea.lng),
      inCoverage: calculateDistance(vesselPosition.lat, vesselPosition.lng, contact.coverageArea.lat, contact.coverageArea.lng) <= contact.coverageArea.radiusNm
    }))
    .filter(contact => contact.inCoverage || contact.distance <= 500) // Only show if in coverage or within 500 NM
    .sort((a, b) => {
      // Sort by: in coverage first, then by priority, then by distance
      if (a.inCoverage !== b.inCoverage) return a.inCoverage ? -1 : 1;
      if (a.priority !== b.priority) {
        const priorityOrder = { critical: 0, high: 1, normal: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.distance - b.distance;
    });
  }, [vesselPosition]);

  const weatherWithDistance = useMemo(() => {
    return WEATHER_SERVICES.map(service => ({
      ...service,
      distance: calculateDistance(vesselPosition.lat, vesselPosition.lng, service.lat, service.lng),
      inCoverage: calculateDistance(vesselPosition.lat, vesselPosition.lng, service.lat, service.lng) <= service.radiusNm
    })).sort((a, b) => {
      if (a.inCoverage !== b.inCoverage) return a.inCoverage ? -1 : 1;
      return a.distance - b.distance;
    });
  }, [vesselPosition]);

  const vhfChannelsFiltered = useMemo(() => {
    if (!nearbyMode) return VHF_CHANNELS;
    
    const nearby = VHF_CHANNELS.filter(ch => {
      if (!ch.geofence) return true; // Always show international channels
      return calculateDistance(vesselPosition.lat, vesselPosition.lng, ch.geofence.lat, ch.geofence.lng) <= ch.geofence.radiusNm;
    });
    
    return nearby.length > 0 ? nearby : VHF_CHANNELS; // Fallback to all if none nearby
  }, [vesselPosition, nearbyMode]);

  const portsFiltered = useMemo(() => {
    if (!nearbyMode) return portsWithDistance;
    return portsWithDistance.filter(port => port.distance <= 200);
  }, [portsWithDistance, nearbyMode]);

  const emergencyFiltered = useMemo(() => {
    if (!nearbyMode) return emergencyWithDistance;
    return emergencyWithDistance.filter(contact => contact.distance <= 500);
  }, [emergencyWithDistance, nearbyMode]);

  const weatherFiltered = useMemo(() => {
    if (!nearbyMode) return weatherWithDistance;
    return weatherWithDistance.filter(service => service.inCoverage);
  }, [weatherWithDistance, nearbyMode]);

  const formatDistance = (nm: number) => {
    if (nm < 1) return `${(nm * 1852).toFixed(0)}m`;
    return `${nm.toFixed(1)}nm`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Module Window */}
      <div 
        className="relative bg-slate-900/98 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">COMMUNICATIONS</h2>
              <p className="text-xs text-slate-400">Integrated VHF, SAT, Emergency & Weather Comms</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Geofence Toggle */}
            <button
              onClick={() => setNearbyMode(!nearbyMode)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                nearbyMode
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500/50'
              }`}
            >
              <Navigation className="w-3 h-3 inline-block mr-1.5" />
              {nearbyMode ? 'NEARBY MODE' : 'ALL CONTACTS'}
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/50 bg-slate-800/50">
          <button
            onClick={() => setActiveTab('vhf')}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
              activeTab === 'vhf'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <Radio className="w-4 h-4 inline-block mr-2" />
            VHF Channels
          </button>
          <button
            onClick={() => setActiveTab('ports')}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
              activeTab === 'ports'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <Anchor className="w-4 h-4 inline-block mr-2" />
            Port Authorities
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
              activeTab === 'emergency'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline-block mr-2" />
            Emergency
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
              activeTab === 'reports'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
              activeTab === 'weather'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/80'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <Cloud className="w-4 h-4 inline-block mr-2" />
            Weather
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* VHF CHANNELS TAB */}
          {activeTab === 'vhf' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">QUICK REFERENCE</h3>
                <p className="text-xs text-slate-400">VHF Marine Radio Channels - Norwegian Arctic & Svalbard Region</p>
              </div>

              <div className="grid gap-3">
                {vhfChannelsFiltered.map((ch) => (
                  <div
                    key={ch.channel}
                    className={`bg-slate-800/80 border rounded-lg p-4 transition-all cursor-pointer ${
                      selectedChannel === ch.channel
                        ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-700/50 hover:border-slate-600/50'
                    }`}
                    onClick={() => setSelectedChannel(selectedChannel === ch.channel ? null : ch.channel)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2 min-w-[60px] text-center">
                          <div className="text-xs text-slate-400">CH</div>
                          <div className="text-lg font-bold text-cyan-400">{ch.channel}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white mb-1">{ch.purpose}</div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>📻 {ch.frequency} MHz</span>
                            <span>📍 {ch.area}</span>
                          </div>
                        </div>
                      </div>
                      {ch.channel === '16' && (
                        <div className="bg-red-500/20 border border-red-500/50 px-2 py-1 rounded text-xs font-bold text-red-400">
                          EMERGENCY
                        </div>
                      )}
                      {ch.channel === '70' && (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 px-2 py-1 rounded text-xs font-bold text-yellow-400">
                          DSC ONLY
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-cyan-400 mb-2">💡 RADIO PROCEDURE REMINDER</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>1. Monitor CH 16 for distress, safety, and calling</p>
                  <p>2. Use proper callsigns and phonetic alphabet</p>
                  <p>3. Keep transmissions brief and clear</p>
                  <p>4. Switch to working channel after initial contact on CH 16</p>
                  <p>5. In Svalbard: Report to Sysselmannen on CH 16 when entering/leaving waters</p>
                </div>
              </div>
            </div>
          )}

          {/* PORT AUTHORITIES TAB */}
          {activeTab === 'ports' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">PORT AUTHORITY DATABASE</h3>
                <p className="text-xs text-slate-400">Quick dial contacts for Norwegian Arctic ports and VTS</p>
              </div>

              <div className="grid gap-4">
                {portsFiltered.map((port, idx) => (
                  <div
                    key={idx}
                    className={`bg-slate-800/80 border rounded-lg p-4 hover:border-cyan-500/30 transition-all ${
                      idx === 0 && nearbyMode ? 'border-cyan-500/50' : 'border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">{port.name}</h4>
                          {idx === 0 && nearbyMode && (
                            <div className="bg-green-500/20 border border-green-500/50 px-2 py-0.5 rounded text-[10px] font-bold text-green-400">
                              NEAREST
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {port.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded text-xs font-mono text-cyan-400">
                          {port.callsign}
                        </div>
                        <div className="bg-slate-700/50 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-300">
                          📍 {formatDistance(port.distance)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-900/50 rounded p-2">
                        <div className="text-[10px] text-slate-500 mb-1">VHF CHANNEL</div>
                        <div className="text-sm font-semibold text-cyan-400">{port.vhf}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2">
                        <div className="text-[10px] text-slate-500 mb-1">PHONE</div>
                        <div className="text-sm font-semibold text-white">{port.phone}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded p-2 mb-3">
                      <div className="text-[10px] text-slate-500 mb-1">EMAIL</div>
                      <div className="text-xs text-slate-300">{port.email}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVHFCall(port.vhf, port.callsign)}
                        className="flex-1 px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
                      >
                        📻 VHF CALL
                      </button>
                      <button
                        onClick={() => handleDial(port.phone, port.name)}
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
                      >
                        📞 PHONE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMERGENCY CONTACTS TAB */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-400 mb-2">⚠️ EMERGENCY CONTACT TREE</h3>
                <p className="text-xs text-slate-400">Search & Rescue, Coast Guard, Authorities</p>
              </div>

              <div className="grid gap-4">
                {emergencyFiltered.map((contact, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 ${
                      contact.priority === 'critical'
                        ? 'bg-red-500/10 border-red-500/30'
                        : contact.priority === 'high'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-slate-800/80 border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                          {contact.priority === 'critical' && (
                            <div className="bg-red-500/30 border border-red-500/50 px-2 py-0.5 rounded text-[10px] font-bold text-red-400">
                              CRITICAL
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mb-2">{contact.coverage}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        contact.type === 'SAR' ? 'bg-red-500/20 text-red-400' :
                        contact.type === 'Coast Guard' ? 'bg-blue-500/20 text-blue-400' :
                        contact.type === 'Governor' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-700/50 text-slate-400'
                      }`}>
                        {contact.type}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-900/50 rounded p-2">
                        <div className="text-[10px] text-slate-500 mb-1">VHF CHANNEL</div>
                        <div className="text-sm font-semibold text-cyan-400">{contact.vhf}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2">
                        <div className="text-[10px] text-slate-500 mb-1">SAT PHONE</div>
                        <div className="text-sm font-semibold text-white">{contact.phone}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVHFCall(contact.vhf, contact.name)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          contact.priority === 'critical'
                            ? 'bg-red-500/30 border border-red-500/50 text-red-400 hover:bg-red-500/40'
                            : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30'
                        }`}
                      >
                        📻 VHF CH 16
                      </button>
                      <button
                        onClick={() => handleDial(contact.phone, contact.name)}
                        className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
                      >
                        📞 SAT CALL
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-cyan-400 mb-2">📋 EMERGENCY PROCEDURE</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong className="text-red-400">MAYDAY:</strong> Life-threatening emergency (fire, sinking, man overboard)</p>
                  <p><strong className="text-yellow-400">PAN-PAN:</strong> Urgent but not life-threatening (engine failure, medical)</p>
                  <p><strong className="text-cyan-400">SECURITÉ:</strong> Safety notice (navigation hazard, weather warning)</p>
                  <p className="pt-2">🔴 Always broadcast on <strong>VHF CH 16</strong> first, then contact JRCC</p>
                </div>
              </div>
            </div>
          )}

          {/* POSITION REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">AUTOMATED POSITION REPORTS</h3>
                <p className="text-xs text-slate-400">Generate and transmit standardized position reports</p>
              </div>

              {/* Report Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setReportType('position')}
                  className={`p-4 rounded-lg border transition-all ${
                    reportType === 'position'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
                  }`}
                >
                  <MapPin className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-xs font-semibold">POSITION REPORT</div>
                </button>
                <button
                  onClick={() => setReportType('arrival')}
                  className={`p-4 rounded-lg border transition-all ${
                    reportType === 'arrival'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
                  }`}
                >
                  <Anchor className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-xs font-semibold">ARRIVAL REPORT</div>
                </button>
                <button
                  onClick={() => setReportType('departure')}
                  className={`p-4 rounded-lg border transition-all ${
                    reportType === 'departure'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
                  }`}
                >
                  <Ship className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-xs font-semibold">DEPARTURE REPORT</div>
                </button>
                <button
                  onClick={() => setReportType('sailing')}
                  className={`p-4 rounded-lg border transition-all ${
                    reportType === 'sailing'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-xs font-semibold">SAILING PLAN</div>
                </button>
              </div>

              {/* Generated Report Preview */}
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-cyan-400">REPORT PREVIEW</h4>
                  <div className="text-[10px] text-slate-500">Auto-generated from vessel data</div>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-3 font-mono text-xs text-slate-300 whitespace-pre-line">
                  {generatePositionReport()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button className="px-4 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/30 transition-colors">
                  📧 EMAIL TO JRCC
                </button>
                <button className="px-4 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/30 transition-colors">
                  📻 VHF TRANSMIT
                </button>
                <button className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                  💾 SAVE TO LOG
                </button>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-cyan-400 mb-2">📝 SVALBARD REPORTING REQUIREMENTS</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>• Report to Sysselmannen when entering Svalbard territorial waters (12nm)</p>
                  <p>• Daily position reports required when operating in protected areas</p>
                  <p>• Mandatory arrival/departure reports for all ports</p>
                  <p>• Wildlife observation reports (IAATO requirement)</p>
                </div>
              </div>
            </div>
          )}

          {/* WEATHER TAB */}
          {activeTab === 'weather' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">WEATHER ROUTING SERVICE</h3>
                <p className="text-xs text-slate-400">Meteorological services and weather routing for Arctic navigation</p>
              </div>

              {/* Weather Services */}
              <div className="grid gap-4">
                {weatherFiltered.map((service, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{service.name}</h4>
                        <div className="text-xs text-slate-400">{service.type}</div>
                      </div>
                      {service.type === 'Regional Met Office' && (
                        <div className="bg-cyan-500/10 px-2 py-1 rounded text-xs font-semibold text-cyan-400">
                          PRIMARY
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {service.navtex && (
                        <div className="bg-slate-900/50 rounded p-2">
                          <div className="text-[10px] text-slate-500 mb-1">NAVTEX</div>
                          <div className="text-sm font-semibold text-cyan-400">{service.navtex}</div>
                        </div>
                      )}
                      {service.phone && (
                        <div className="bg-slate-900/50 rounded p-2">
                          <div className="text-[10px] text-slate-500 mb-1">PHONE</div>
                          <div className="text-sm font-semibold text-white">{service.phone}</div>
                        </div>
                      )}
                      {service.email && (
                        <div className="bg-slate-900/50 rounded p-2">
                          <div className="text-[10px] text-slate-500 mb-1">EMAIL</div>
                          <div className="text-xs text-slate-300">{service.email}</div>
                        </div>
                      )}
                      {service.website && (
                        <div className="bg-slate-900/50 rounded p-2">
                          <div className="text-[10px] text-slate-500 mb-1">WEBSITE</div>
                          <div className="text-sm font-semibold text-cyan-400">{service.website}</div>
                        </div>
                      )}
                    </div>
                    <button className="w-full px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/30 transition-colors">
                      🌐 OPEN WEATHER FORECAST
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-cyan-400 mb-2">🌊 WEATHER ROUTING TIPS</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>• Check ice charts daily when operating above 75°N</p>
                  <p>• Monitor NAVTEX on 518 kHz and 490 kHz for warnings</p>
                  <p>• SafetyNET provides automated MSI via INMARSAT-C</p>
                  <p>• Contact Norwegian Met for routing advice in severe conditions</p>
                  <p>• Polar Low warnings critical in winter - rapid development possible</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Module Switcher Bar */}
        <ModuleSwitcher 
          currentModule={activeModule} 
          onSwitchModule={(moduleId) => {
            if (moduleId === 'NAVIGEN') {
              onClose();
            } else {
              onSwitchModule(moduleId);
            }
          }}
        />
      </div>
    </div>
  );
}
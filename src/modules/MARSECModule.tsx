import React, { useState } from 'react';
import { Shield, AlertTriangle, Lock, Radio, Eye, FileText, Users, X, CheckCircle2 } from 'lucide-react';
import { ModuleSwitcher } from '../components/ModuleSwitcher';
import { CinematicGlobe } from '../components/CinematicGlobe';

interface MARSECModuleProps {
  onClose: () => void;
  activeModule?: string;
  onSwitchModule?: (module: string | null) => void;
}

type SecurityLevel = 1 | 2 | 3;

export default function MARSECModule({ onClose, activeModule, onSwitchModule }: MARSECModuleProps) {
  const [currentLevel, setCurrentLevel] = useState<SecurityLevel>(1);
  const [lastChangeDate, setLastChangeDate] = useState('2026-01-15 08:00 UTC');
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<SecurityLevel | null>(null);
  
  // Vessel position (Longyearbyen)
  const vesselPosition = { lat: 78.2232, lng: 15.6267 };

  // Dynamic Security Readiness Matrix based on MARSEC level
  const getSecurityMatrix = (level: SecurityLevel) => {
    const matrices = {
      1: [
        { label: 'Gangway control', status: 'OK' as const },
        { label: 'ID verification', status: 'OK' as const },
        { label: 'CCTV operational', status: 'OK' as const },
        { label: 'Access control', status: 'OK' as const },
        { label: 'Restricted areas', status: 'OK' as const },
      ],
      2: [
        { label: 'Enhanced gangway control', status: 'OK' as const },
        { label: 'Restricted areas secured', status: 'OK' as const },
        { label: 'Increased patrols', status: 'Attention' as const },
        { label: 'Cargo screening', status: 'OK' as const },
        { label: 'Enhanced surveillance', status: 'OK' as const },
        { label: 'Deck lighting (night)', status: 'OK' as const },
      ],
      3: [
        { label: 'Maximum access restrictions', status: 'OK' as const },
        { label: 'Armed security deployed', status: 'OK' as const },
        { label: 'Waterside patrols', status: 'Attention' as const },
        { label: '100% cargo/baggage scan', status: 'OK' as const },
        { label: 'Hull inspection ready', status: 'OK' as const },
        { label: 'Limited ship access', status: 'OK' as const },
        { label: 'Underwater surveillance', status: 'OK' as const },
      ],
    };
    return matrices[level];
  };

  const handleLevelChange = (newLevel: SecurityLevel) => {
    setPendingLevel(newLevel);
    setShowLevelSelector(false);
  };

  const confirmLevelChange = () => {
    if (pendingLevel !== null) {
      setCurrentLevel(pendingLevel);
      // Update timestamp
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
      setLastChangeDate(dateStr);
      setPendingLevel(null);
    }
  };

  const cancelLevelChange = () => {
    setPendingLevel(null);
  };

  const getLevelDescription = (level: SecurityLevel) => {
    switch(level) {
      case 1: return 'Normal security operations';
      case 2: return 'Heightened security measures';
      case 3: return 'Exceptional security measures';
    }
  };

  const getLevelColor = (level: SecurityLevel) => {
    switch(level) {
      case 1: return 'text-green-400';
      case 2: return 'text-amber-400';
      case 3: return 'text-red-400';
    }
  };

  const getLevelBgColor = (level: SecurityLevel) => {
    switch(level) {
      case 1: return 'bg-green-500/20 border-green-500/40';
      case 2: return 'bg-amber-500/20 border-amber-500/40';
      case 3: return 'bg-red-500/20 border-red-500/40';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A1628]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-amber-900/30 bg-[#0D1B2E]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-600/20 border border-amber-500/40 rounded flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide">MARSEC / ISPS</h1>
            <p className="text-gray-400 text-xs">Maritime Security & International Ship and Port Facility Security</p>
          </div>
        </div>
        
        {/* Vessel Position - Moved to top line */}
        <div className="bg-[#0D1B2E]/90 backdrop-blur-sm border border-amber-900/30 rounded px-4 py-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Vessel Position</div>
          <div className="text-sm text-white font-mono">78°13.4'N, 15°37.2'E</div>
          <div className="text-xs text-amber-400">Longyearbyen, Svalbard</div>
        </div>
        
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Cinematic Globe (70%) */}
        <div className="w-[70%] relative bg-[#0A1628] border-r border-amber-900/20">
          <CinematicGlobe vesselPosition={vesselPosition} />
        </div>

        {/* RIGHT: Security Status (30%) */}
        <div className="w-[30%] flex flex-col bg-[#0D1B2E]/40 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Section 1: Current Ship Security Level */}
            <div className="bg-[#0D1B2E]/60 border border-amber-900/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm tracking-wide uppercase">Current Ship Security Level</h3>
                <button
                  onClick={() => setShowLevelSelector(!showLevelSelector)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded transition-colors uppercase tracking-wide font-semibold"
                >
                  {showLevelSelector ? 'Cancel' : 'Change Level'}
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Level Selector (when open) */}
                {showLevelSelector && (
                  <div className="bg-slate-900/70 border border-cyan-500/30 rounded p-4 space-y-3">
                    <div className="text-xs text-cyan-400 uppercase tracking-wide font-semibold mb-3">
                      Select Security Level:
                    </div>
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleLevelChange(level as SecurityLevel)}
                        disabled={level === currentLevel}
                        className={`w-full text-left p-3 rounded border transition-all ${
                          level === currentLevel
                            ? 'bg-slate-800/50 border-slate-600/50 opacity-50 cursor-not-allowed'
                            : 'bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-sm font-bold mb-1 ${getLevelColor(level as SecurityLevel)}`}>
                              MARSEC Level {level}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getLevelDescription(level as SecurityLevel)}
                            </div>
                          </div>
                          {level === currentLevel && (
                            <div className="text-xs text-gray-500 px-2 py-1 bg-slate-700/50 rounded">
                              CURRENT
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Level Display */}
                <div className={`border rounded p-4 ${getLevelBgColor(currentLevel)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Active Level</span>
                    <span className={`text-3xl font-bold ${getLevelColor(currentLevel)}`}>
                      {currentLevel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-200 font-medium">
                    {getLevelDescription(currentLevel)}
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-gray-500">Last change:</span>
                    <span className="text-gray-300 font-mono">{lastChangeDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-gray-500">Approved by:</span>
                    <span className="text-gray-300">Master</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Security Readiness Matrix */}
            <div className="bg-[#0D1B2E]/60 border border-amber-900/30 rounded-lg p-5">
              <h3 className="text-white font-semibold text-sm tracking-wide mb-4 uppercase">Security Readiness Matrix</h3>
              
              <div className="space-y-3">
                {getSecurityMatrix(currentLevel).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                    <span className="text-xs text-gray-300">{item.label}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      item.status === 'OK' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : item.status === 'Attention'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Route Advisory */}
            <div className="bg-[#0D1B2E]/60 border border-amber-900/30 rounded-lg p-5">
              <h3 className="text-white font-semibold text-sm tracking-wide mb-4 uppercase">Route Advisory</h3>
              
              <div className="bg-slate-900/40 border border-slate-700/30 rounded p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400 mb-2">No active route advisories.</div>
                    <div className="text-xs text-gray-500 leading-relaxed">
                      Current route does not pass through areas with active security concerns or restrictions.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Module Switcher Bar */}
      {activeModule && onSwitchModule && (
        <ModuleSwitcher 
          currentModule="MARSEC" 
          onSwitchModule={(moduleId) => {
            if (moduleId === 'NAVIGEN') {
              onClose();
            } else {
              onSwitchModule(moduleId);
            }
          }}
        />
      )}

      {/* Confirmation Dialog */}
      {pendingLevel !== null && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0D1B2E] border-2 border-amber-500/50 rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <h3 className="text-white font-bold text-lg uppercase tracking-wide">
                  Confirm Security Level Change
                </h3>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Current Level:</span>
                  <span className={`text-2xl font-bold ${getLevelColor(currentLevel)}`}>
                    {currentLevel}
                  </span>
                </div>
                <div className="flex items-center justify-center my-3">
                  <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">New Level:</span>
                  <span className={`text-2xl font-bold ${getLevelColor(pendingLevel)}`}>
                    {pendingLevel}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-300 bg-slate-900/30 border border-slate-700/30 rounded p-3">
                <div className="font-semibold text-amber-400 mb-2">
                  MARSEC Level {pendingLevel}:
                </div>
                <div className="text-xs text-gray-400">
                  {getLevelDescription(pendingLevel)}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <div className="text-xs text-amber-300 font-semibold mb-1">
                  ⚠️ MASTER APPROVAL REQUIRED
                </div>
                <div className="text-xs text-gray-400">
                  This action will be logged in the ship's security records and requires Master's authorization.
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={cancelLevelChange}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white rounded border border-slate-600/50 transition-colors font-semibold text-sm uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                onClick={confirmLevelChange}
                className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded border border-amber-500 transition-colors font-bold text-sm uppercase tracking-wide shadow-lg"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
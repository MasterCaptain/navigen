import { X, Shield, Layers, ChevronRight, ChevronDown } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

type RegLayers = {
  enabled: boolean;
  bordersEnabled: boolean;
  regulatoryZonesEnabled: boolean;
  baseline: boolean;
  territorialWaters12nm: boolean;
  contiguousZone24nm: boolean;
  eez200nm: boolean;
  imoN60: boolean;
  imoS60: boolean;
  svalbard12nm: boolean;
  svalbardProtectedAreas: boolean;
  greenlandExpanded: boolean;
  greenlandSermersooq: boolean;
  greenlandProtectedAreas: boolean;
  greenlandLocalRestrictions: boolean;
  canadaExpanded: boolean;
  canadaNordreg: boolean;
  canadaLancasterSound: boolean;
  canadaNwpCorridor: boolean;
  marpolAreas: boolean;
  solasZones: boolean;
  debugBorders: boolean;
};

interface RegulatorySelectorDropdownProps {
  value: RegLayers;
  onChange: (next: RegLayers) => void;
}

export function RegulatorySelectorDropdown({
  value,
  onChange,
}: RegulatorySelectorDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [svalbardExpanded, setSvalbardExpanded] = React.useState(false);

  // Count active layers
  const borderCount = [
    value.territorialWaters12nm,
    value.contiguousZone24nm,
    value.eez200nm,
  ].filter(Boolean).length;

    const zoneCount = [
    value.imoN60,
    value.imoS60,
    value.svalbard12nm,
    value.svalbardProtectedAreas,
    value.greenlandSermersooq,
    value.greenlandProtectedAreas,
    value.greenlandLocalRestrictions,
    value.canadaNordreg,
    value.canadaLancasterSound,
    value.canadaNwpCorridor,
    value.marpolAreas,
    value.solasZones,
  ].filter(Boolean).length;

  const totalActive = borderCount + zoneCount;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`w-40 px-3 py-1.5 backdrop-blur-md border rounded-lg text-left transition-all shadow-lg ${
          value.enabled
            ? 'bg-cyan-900/30 border-cyan-600/40 hover:bg-cyan-900/40 hover:border-cyan-500/60'
            : 'bg-slate-900/95 border-slate-700/50 hover:bg-slate-800/95 hover:border-slate-600/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${value.enabled ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className="text-sm text-white font-medium">Regulatory</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {value.enabled ? `${totalActive} layer${totalActive !== 1 ? 's' : ''} active` : 'Disabled'}
        </div>
      </button>
    );
  }

  const dropdownContent = (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[12px] z-[100]"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl w-[420px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-cyan-500 rounded-full" />
            <div>
              <h3 className="text-sm text-white font-semibold uppercase tracking-wide">Regulatory & Borders</h3>
              <p className="text-[10px] text-slate-400">
                {value.enabled ? `${totalActive} layer${totalActive !== 1 ? 's' : ''} active` : 'All layers disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        <div className="p-3 space-y-3 overflow-y-auto flex-1">
          {/* Master Toggle */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Master Control</h4>
            </div>
            <button
              onClick={() => onChange({ ...value, enabled: !value.enabled })}
              className={`w-full p-3 rounded-lg border transition-all text-left group ${
                value.enabled
                  ? 'bg-cyan-600/20 border-cyan-500/50'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    value.enabled
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        value.enabled ? 'text-cyan-400' : 'text-white'
                      }`}
                    >
                      All Regulatory Layers
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {value.enabled ? 'Show regulatory zones and maritime boundaries' : 'Hide all regulatory overlays'}
                  </p>
                </div>

                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    value.enabled
                      ? 'bg-cyan-500 border-cyan-500'
                      : 'border-slate-600 group-hover:border-slate-500'
                  }`}
                >
                  {value.enabled && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Borders Section */}
          {value.enabled && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Maritime Borders</h4>
                </div>
                <div className="space-y-2">
                  {/* Borders Master Toggle */}
                  <button
                    onClick={() => onChange({ ...value, bordersEnabled: !value.bordersEnabled })}
                    className={`w-full p-2.5 rounded-lg border transition-all text-left group ${
                      value.bordersEnabled
                        ? 'bg-blue-600/15 border-blue-500/40'
                        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          value.bordersEnabled
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-600 group-hover:border-slate-500'
                        }`}
                      >
                        {value.bordersEnabled && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${value.bordersEnabled ? 'text-blue-400' : 'text-slate-300'}`}>
                        Show All Borders
                      </span>
                    </div>
                  </button>

                  {/* Individual Borders */}
                  {value.bordersEnabled && (
                    <div className="space-y-1.5 ml-4">
                      <button
                        onClick={() => onChange({ ...value, baseline: !value.baseline })}
                        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              value.baseline
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {value.baseline && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-[11px] text-slate-300">Baseline (Grunnlinje)</span>
                            <div className="text-[8px] text-slate-500 mt-0.5">Foundation for territorial waters</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => onChange({ ...value, territorialWaters12nm: !value.territorialWaters12nm })}
                        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              value.territorialWaters12nm
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {value.territorialWaters12nm && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300">Territorial Waters (12 NM)</span>
                        </div>
                      </button>

                      <button
                        onClick={() => onChange({ ...value, contiguousZone24nm: !value.contiguousZone24nm })}
                        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              value.contiguousZone24nm
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {value.contiguousZone24nm && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300">Contiguous Zone (24 NM)</span>
                        </div>
                      </button>

                      <button
                        onClick={() => onChange({ ...value, eez200nm: !value.eez200nm })}
                        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              value.eez200nm
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {value.eez200nm && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300">Exclusive Economic Zone (200 NM)</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Regulatory Zones Section */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Regulatory Zones</h4>
                </div>
                <div className="space-y-2">
                  {/* Zones Master Toggle */}
                  <button
                    onClick={() => onChange({ ...value, regulatoryZonesEnabled: !value.regulatoryZonesEnabled })}
                    className={`w-full p-2.5 rounded-lg border transition-all text-left group ${
                      value.regulatoryZonesEnabled
                        ? 'bg-purple-600/15 border-purple-500/40'
                        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          value.regulatoryZonesEnabled
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-slate-600 group-hover:border-slate-500'
                        }`}
                      >
                        {value.regulatoryZonesEnabled && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${value.regulatoryZonesEnabled ? 'text-purple-400' : 'text-slate-300'}`}>
                        Show All Zones
                      </span>
                    </div>
                  </button>

                  {/* Individual Zones */}
                  {value.regulatoryZonesEnabled && (
                    <div className="space-y-1.5 ml-4">
                      <button
                        onClick={() => onChange({ ...value, imoN60: !value.imoN60 })}
                        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              value.imoN60
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {value.imoN60 && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300">IMO N60 Zone (Arctic)</span>
                        </div>
                      </button>

                      <button
                        onClick={() => onChange({ ...value, imoS60: !value.imoS60 })}
                        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              value.imoS60
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {value.imoS60 && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300">IMO S60 Zone (Antarctic)</span>
                        </div>
                      </button>

                      {/* SVALBARD COLLAPSIBLE CATEGORY */}
                      <div className="space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSvalbardExpanded(!svalbardExpanded);
                          }}
                          className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                        >
                          <div className="flex items-center gap-2.5">
                            {svalbardExpanded ? (
                              <ChevronDown className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
                            )}
                            <span className="text-[11px] text-slate-300 font-semibold">SVALBARD</span>
                            <span className="text-[9px] text-slate-500 ml-auto">
                              {[value.svalbard12nm, value.svalbardProtectedAreas].filter(Boolean).length}/2 active
                            </span>
                          </div>
                        </button>

                        {svalbardExpanded && (
                          <div className="ml-4 space-y-1">
                            <button
                              onClick={() => onChange({ ...value, svalbard12nm: !value.svalbard12nm })}
                              className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                    value.svalbard12nm
                                      ? 'bg-cyan-500 border-cyan-500'
                                      : 'border-slate-600 group-hover:border-slate-500'
                                  }`}
                                >
                                  {value.svalbard12nm && (
                                    <svg
                                      className="w-1.5 h-1.5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      viewBox="0 0 24 24"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className="text-[10px] text-slate-300">Svalbard Environmental</span>
                                  <div className="text-[8px] text-slate-500 mt-0.5">12 NM (Svalbardmiljøloven)</div>
                                </div>
                              </div>
                            </button>

                            <button
                              onClick={() => onChange({ ...value, svalbardProtectedAreas: !value.svalbardProtectedAreas })}
                              className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                    value.svalbardProtectedAreas
                                      ? 'bg-cyan-500 border-cyan-500'
                                      : 'border-slate-600 group-hover:border-slate-500'
                                  }`}
                                >
                                  {value.svalbardProtectedAreas && (
                                    <svg
                                      className="w-1.5 h-1.5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      viewBox="0 0 24 24"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-300">Svalbard Protected Areas</span>
                              </div>
                            </button>
                          </div>
                        )}

{/* GREENLAND COLLAPSIBLE CATEGORY */}
<div className="space-y-1">
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange({ ...value, greenlandExpanded: !value.greenlandExpanded });
    }}
    className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
  >
    <div className="flex items-center gap-2.5">
      {value.greenlandExpanded ? (
        <ChevronDown className="w-3 h-3 text-cyan-400" />
      ) : (
        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
      )}
      <span className="text-[11px] text-slate-300 font-semibold">GREENLAND</span>
      <span className="text-[9px] text-slate-500 ml-auto">
        {[
          value.greenlandSermersooq,
          value.greenlandProtectedAreas,
          value.greenlandLocalRestrictions,
        ].filter(Boolean).length}
        /3 active
      </span>
    </div>
  </button>

  {value.greenlandExpanded && (
    <div className="ml-4 space-y-1">
      <button
        onClick={() =>
          onChange({ ...value, greenlandSermersooq: !value.greenlandSermersooq })
        }
        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              value.greenlandSermersooq
                ? 'bg-cyan-500 border-cyan-500'
                : 'border-slate-600 group-hover:border-slate-500'
            }`}
          >
            {value.greenlandSermersooq && (
              <svg
                className="w-1.5 h-1.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-300">Sermersooq Zoning Proposal</span>
            <div className="text-[8px] text-slate-500 mt-0.5">AECO / Municipal zoning</div>
          </div>
        </div>
      </button>

      <button
        onClick={() =>
          onChange({ ...value, greenlandProtectedAreas: !value.greenlandProtectedAreas })
        }
        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              value.greenlandProtectedAreas
                ? 'bg-cyan-500 border-cyan-500'
                : 'border-slate-600 group-hover:border-slate-500'
            }`}
          >
            {value.greenlandProtectedAreas && (
              <svg
                className="w-1.5 h-1.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-300">Protected Areas</span>
            <div className="text-[8px] text-slate-500 mt-0.5">Nature / wildlife restrictions</div>
          </div>
        </div>
      </button>

      <button
        onClick={() =>
          onChange({ ...value, greenlandLocalRestrictions: !value.greenlandLocalRestrictions })
        }
        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              value.greenlandLocalRestrictions
                ? 'bg-cyan-500 border-cyan-500'
                : 'border-slate-600 group-hover:border-slate-500'
            }`}
          >
            {value.greenlandLocalRestrictions && (
              <svg
                className="w-1.5 h-1.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-300">Local Restrictions</span>
            <div className="text-[8px] text-slate-500 mt-0.5">Landing / operational rules</div>
          </div>
        </div>
      </button>
    </div>
  )}
</div>

{/* CANADA COLLAPSIBLE CATEGORY */}
<div className="space-y-1">
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange({ ...value, canadaExpanded: !value.canadaExpanded });
    }}
    className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
  >
    <div className="flex items-center gap-2.5">
      {value.canadaExpanded ? (
        <ChevronDown className="w-3 h-3 text-cyan-400" />
      ) : (
        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
      )}
      <span className="text-[11px] text-slate-300 font-semibold">CANADA</span>
      <span className="text-[9px] text-slate-500 ml-auto">
        {[
          value.canadaNordreg,
          value.canadaLancasterSound,
          value.canadaNwpCorridor,
        ].filter(Boolean).length}
        /3 active
      </span>
    </div>
  </button>

  {value.canadaExpanded && (
    <div className="ml-4 space-y-1">
      <button
        onClick={() =>
          onChange({ ...value, canadaNordreg: !value.canadaNordreg })
        }
        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              value.canadaNordreg
                ? 'bg-cyan-500 border-cyan-500'
                : 'border-slate-600 group-hover:border-slate-500'
            }`}
          >
            {value.canadaNordreg && (
              <svg
                className="w-1.5 h-1.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-300">NORDREG Reporting Zone</span>
            <div className="text-[8px] text-slate-500 mt-0.5">Mandatory reporting / Arctic Canada</div>
          </div>
        </div>
      </button>

      <button
        onClick={() =>
          onChange({ ...value, canadaLancasterSound: !value.canadaLancasterSound })
        }
        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              value.canadaLancasterSound
                ? 'bg-cyan-500 border-cyan-500'
                : 'border-slate-600 group-hover:border-slate-500'
            }`}
          >
            {value.canadaLancasterSound && (
              <svg
                className="w-1.5 h-1.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-300">Lancaster Sound MPA</span>
            <div className="text-[8px] text-slate-500 mt-0.5">Protected area / environmental control</div>
          </div>
        </div>
      </button>

      <button
        onClick={() =>
          onChange({ ...value, canadaNwpCorridor: !value.canadaNwpCorridor })
        }
        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              value.canadaNwpCorridor
                ? 'bg-cyan-500 border-cyan-500'
                : 'border-slate-600 group-hover:border-slate-500'
            }`}
          >
            {value.canadaNwpCorridor && (
              <svg
                className="w-1.5 h-1.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-300">Northwest Passage Corridor</span>
            <div className="text-[8px] text-slate-500 mt-0.5">Transit context / test corridor</div>
          </div>
        </div>
      </button>
    </div>
  )}
</div>

                      </div>

                      <button
                        onClick={() => onChange({ ...value, marpolAreas: !value.marpolAreas })}
                        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              value.marpolAreas
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {value.marpolAreas && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300">MARPOL Special Areas</span>
                        </div>
                      </button>

                      <button
                        onClick={() => onChange({ ...value, solasZones: !value.solasZones })}
                        className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              value.solasZones
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600 group-hover:border-slate-500'
                            }`}
                          >
                            {value.solasZones && (
                              <svg
                                className="w-2 h-2 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300">SOLAS Zones</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Debug Section */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Debug Tools</h4>
                </div>
                <button
                  onClick={() => onChange({ ...value, debugBorders: !value.debugBorders })}
                  className={`w-full p-2.5 rounded-lg border transition-all text-left group ${
                    value.debugBorders
                      ? 'bg-orange-600/15 border-orange-500/40'
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        value.debugBorders
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {value.debugBorders && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-semibold block ${value.debugBorders ? 'text-orange-400' : 'text-slate-300'}`}>
                        Show Polygon Borders
                      </span>
                      <span className="text-[10px] text-slate-500">Display boundary outlines for debugging</span>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-slate-700/50 px-4 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">
              ECDIS-style regulatory boundaries and zones
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dropdownContent, document.body);
}
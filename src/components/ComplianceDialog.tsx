import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { type RouteComplianceResult } from '../utils/complianceRules';

interface ComplianceDialogProps {
  complianceData: RouteComplianceResult;
  onClose: () => void;
}

export function ComplianceDialog({ complianceData, onClose }: ComplianceDialogProps) {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[2000] p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-white text-xl">Rute Compliance Analyse</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white mb-4">Sammendrag</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-red-900/30 rounded p-3 border border-red-700">
                <div className="text-2xl text-red-400">{complianceData.must.length}</div>
                <div className="text-xs text-slate-300 mt-1">MUST</div>
              </div>
              <div className="bg-amber-900/30 rounded p-3 border border-amber-700">
                <div className="text-2xl text-amber-400">{complianceData.should.length}</div>
                <div className="text-xs text-slate-300 mt-1">SHOULD</div>
              </div>
              <div className="bg-blue-900/30 rounded p-3 border border-blue-700">
                <div className="text-2xl text-green-400">{complianceData.consider.length}</div>
                <div className="text-xs text-slate-300 mt-1">CONSIDER</div>
              </div>
            </div>
          </div>

          {/* MUST Requirements */}
          {complianceData.must.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-white">MUST - Obligatoriske Krav</h3>
              </div>
              
              {complianceData.must.map((rule) => (
                <div key={rule.id} className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1">{rule.title}</div>
                      <div className="text-sm text-slate-300 mb-2">{rule.description}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 bg-red-900/40 text-red-300 rounded">
                          {rule.regulation}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          {rule.category}
                        </span>
                      </div>
                      {rule.details && rule.details.length > 0 && (
                        <div className="mt-3 text-xs text-slate-400 bg-slate-900/50 p-3 rounded">
                          <strong className="text-slate-300">Krav:</strong>
                          <ul className="mt-1 space-y-1 ml-4 list-disc">
                            {rule.details.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHOULD Requirements */}
          {complianceData.should.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Info className="w-5 h-5" />
                <h3 className="text-white">SHOULD - Anbefalte Tiltak</h3>
              </div>
              
              {complianceData.should.map((rule) => (
                <div key={rule.id} className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1">{rule.title}</div>
                      <div className="text-sm text-slate-300 mb-2">{rule.description}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 bg-amber-900/40 text-amber-300 rounded">
                          {rule.regulation}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          {rule.category}
                        </span>
                      </div>
                      {rule.details && rule.details.length > 0 && (
                        <div className="mt-3 text-xs text-slate-400 bg-slate-900/50 p-3 rounded">
                          <strong className="text-slate-300">Anbefalinger:</strong>
                          <ul className="mt-1 space-y-1 ml-4 list-disc">
                            {rule.details.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONSIDER Requirements */}
          {complianceData.consider.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <h3 className="text-white">CONSIDER - Vurderinger</h3>
              </div>
              
              {complianceData.consider.map((rule) => (
                <div key={rule.id} className="bg-slate-700/50 border border-green-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1">{rule.title}</div>
                      <div className="text-sm text-slate-300 mb-2">{rule.description}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 bg-green-900/40 text-green-300 rounded">
                          {rule.regulation}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          {rule.category}
                        </span>
                      </div>
                      {rule.details && rule.details.length > 0 && (
                        <div className="mt-3 text-xs text-slate-400 bg-slate-900/50 p-3 rounded">
                          <strong className="text-slate-300">Best practice:</strong>
                          <ul className="mt-1 space-y-1 ml-4 list-disc">
                            {rule.details.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            Lukk
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            Last ned Rapport
          </button>
        </div>
      </div>
    </div>
  );
}
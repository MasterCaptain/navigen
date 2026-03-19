import React from 'react';
import { RuleCard as RuleCardType } from '../types/ruleCard';
import {
  X,
  FileText,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface RuleDetailsModalProps {
  rule: RuleCardType;
  show: boolean;
  onClose: () => void;
}

export function RuleDetailsModal({ rule, show, onClose }: RuleDetailsModalProps) {
  React.useEffect(() => {
    if (!show) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show, onClose]);

  if (!show) return null;

  const severityConfig = {
    MUST: {
      bg: 'bg-red-950/60',
      border: 'border-red-600/60',
      accent: 'bg-red-600',
      textColor: 'text-red-400',
      icon: AlertTriangle,
    },
    SHOULD: {
      bg: 'bg-amber-950/50',
      border: 'border-amber-500/50',
      accent: 'bg-amber-500',
      textColor: 'text-amber-400',
      icon: Info,
    },
    CONSIDER: {
      bg: 'bg-cyan-950/40',
      border: 'border-cyan-600/40',
      accent: 'bg-cyan-600',
      textColor: 'text-cyan-400',
      icon: CheckCircle2,
    },
  };

  const config = severityConfig[rule.severity];
  const SeverityIcon = config.icon;

  const hasFullText = !!rule.content.fullText?.trim();
  const hasProcedures = !!rule.content.procedures?.length;
  const hasChecklist = !!rule.content.complianceChecklist?.length;
  const hasDocumentation = !!rule.content.documentation?.length;
  const hasActions = !!rule.content.actions?.length;
  const hasExceptions = !!rule.content.exceptions?.length;
  const hasTags = !!rule.ops.tags?.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0a1628] border border-cyan-500/30 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="absolute top-2 right-2 bg-black/60 px-3 py-1 rounded-full text-xs text-gray-400 pointer-events-none">
          Click outside to close • ESC
        </div>

        <div className={`${config.bg} ${config.border} border-b p-4 flex items-start justify-between`}>
          <div className="flex items-start gap-3 flex-1">
            <SeverityIcon className={`${config.textColor} w-6 h-6 mt-1`} />
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h2 className="text-white font-bold text-lg">{rule.ui.title}</h2>
                <span
                  className={`${config.textColor} text-xs font-bold uppercase tracking-wider px-2 py-1 ${config.bg} ${config.border} border rounded`}
                >
                  {rule.severity}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{rule.statement}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
          <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-cyan-400 w-5 h-5" />
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                Legal Authority
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Regime</div>
                <div className="text-white font-medium">{rule.authority.regime}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Instrument</div>
                <div className="text-white font-medium">{rule.authority.instrument}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Reference</div>
                <div className="text-white font-medium break-words">{rule.authority.reference}</div>
              </div>
            </div>
          </div>

          {rule.content.rationale && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="text-cyan-400 w-5 h-5" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  Rationale
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{rule.content.rationale}</p>
            </div>
          )}

          {hasActions && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-cyan-400 w-5 h-5" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  Required Actions
                </h3>
              </div>
              <ul className="space-y-2">
                {rule.content.actions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span
                      className={`${config.textColor} font-bold shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center text-xs border ${config.border} rounded`}
                    >
                      {action.type === 'CHECK' && '✓'}
                      {action.type === 'PROCEDURE' && '→'}
                      {action.type === 'LIMIT' && '!'}
                      {action.type === 'NOTE' && 'i'}
                    </span>
                    <span className="text-gray-300 leading-relaxed">{action.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasProcedures && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="text-cyan-400 w-5 h-5" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  Detailed Procedures
                </h3>
              </div>
              <ol className="space-y-2">
                {rule.content.procedures!.map((proc, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                    <span className="text-gray-300 leading-relaxed">{proc}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {hasChecklist && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="text-cyan-400 w-5 h-5" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  Compliance Checklist
                </h3>
              </div>
              <ul className="space-y-2">
                {rule.content.complianceChecklist!.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-4 h-4 border-2 border-cyan-500/60 rounded shrink-0 mt-0.5" />
                    <span className="text-gray-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasDocumentation && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="text-cyan-400 w-5 h-5" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  Required Documentation
                </h3>
              </div>
              <ul className="space-y-2">
                {rule.content.documentation!.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0" />
                    <span className="text-gray-300">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasExceptions && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="text-cyan-400 w-5 h-5" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  Exceptions
                </h3>
              </div>
              <ul className="space-y-2">
                {rule.content.exceptions.map((exception, idx) => (
                  <li
                    key={idx}
                    className="text-gray-400 text-sm leading-relaxed pl-4 border-l-2 border-gray-700"
                  >
                    {exception}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-3">
              Applicability
            </h3>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Geographic Areas</div>
                <div className="flex flex-wrap gap-2">
                  {rule.applicability.areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-cyan-950/30 border border-cyan-600/40 rounded text-cyan-400 text-xs"
                    >
                      {area.areaId} ({area.condition})
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-xs mb-1">Audience</div>
                <div className="flex flex-wrap gap-2">
                  {rule.ops.audience.map((aud, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-800/60 border border-gray-700/50 rounded text-gray-300 text-xs"
                    >
                      {aud}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {hasFullText && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="text-cyan-400 w-5 h-5" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                  Regulatory Extract
                </h3>
              </div>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-black/20 p-4 rounded border border-gray-800/50">
                {rule.content.fullText}
              </div>
            </div>
          )}

          {hasTags && (
            <div className="flex flex-wrap gap-2">
              {rule.ops.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-900/50 border border-gray-700/40 rounded-full text-xs text-gray-500 uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-600 pt-4 border-t border-gray-800">
            <div className="flex justify-between gap-4 flex-wrap">
              <span>
                Rule ID: {rule.id} v{rule.version}
              </span>
              <span>
                Updated: {new Date(rule.metadata.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-cyan-900/30 p-4 bg-[#0D1B2E]/80 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 hover:border-cyan-500/60 rounded-lg text-cyan-400 hover:text-cyan-300 font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}
import { X, ExternalLink, BookOpen, Shield, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export interface RuleReference {
  id: string;
  category:
    | 'POLAR_CODE'
    | 'SVALBARD_ENV'
    | 'IAATO'
    | 'SOLAS'
    | 'MARPOL'
    | 'GREENLAND'
    | 'IMO_POLAR'
    | 'SVALBARD'
    | 'RULE'
    | string;
  title: string;
  description: string;
  reference: string;
  fullText?: string;
  procedures?: string[];
  complianceChecklist?: string[];
  relatedRules?: string[];
}

interface RuleDetailOverlayProps {
  rule: RuleReference | null;
  onClose: () => void;
}

type ColorTheme = {
  bg: string;
  border: string;
  text: string;
  accent: string;
};

const FALLBACK_COLORS: ColorTheme = {
  bg: 'bg-cyan-500/10',
  border: 'border-cyan-500/30',
  text: 'text-cyan-400',
  accent: 'bg-cyan-500/20',
};

const CATEGORY_COLORS: Record<string, ColorTheme> = {
  POLAR_CODE: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    accent: 'bg-red-500/20',
  },
  IMO_POLAR: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    accent: 'bg-red-500/20',
  },
  SVALBARD_ENV: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    accent: 'bg-blue-500/20',
  },
  SVALBARD: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    accent: 'bg-blue-500/20',
  },
  IAATO: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    accent: 'bg-purple-500/20',
  },
  SOLAS: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    accent: 'bg-cyan-500/20',
  },
  MARPOL: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    accent: 'bg-emerald-500/20',
  },
  GREENLAND: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    accent: 'bg-amber-500/20',
  },
  RULE: FALLBACK_COLORS,
};

function normalizeCategory(category?: string | null): string {
  if (!category) return 'RULE';

  const normalized = category
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  if (normalized === 'IMO_POLAR' || normalized === 'POLAR_CODE') return normalized;
  if (normalized === 'SVALBARD' || normalized === 'SVALBARD_ENV') return normalized;
  if (
    normalized === 'IAATO' ||
    normalized === 'SOLAS' ||
    normalized === 'MARPOL' ||
    normalized === 'GREENLAND'
  ) {
    return normalized;
  }

  return normalized;
}

function prettyCategory(category?: string | null): string {
  return normalizeCategory(category).replace(/_/g, ' ');
}

export function RuleDetailOverlay({ rule, onClose }: RuleDetailOverlayProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!rule) return null;

  const normalizedCategory = normalizeCategory(rule.category);
  const colors = CATEGORY_COLORS[normalizedCategory] ?? FALLBACK_COLORS;

  const hasFullText = !!rule.fullText?.trim();
  const hasProcedures = !!rule.procedures?.length;
  const hasChecklist = !!rule.complianceChecklist?.length;
  const hasRelatedRules = !!rule.relatedRules?.length;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
        style={{ zIndex: 40 }}
        onClick={onClose}
      />

      <div
        className="fixed top-16 right-0 w-[30vw] h-[calc(100vh-64px)] bg-slate-900/98 backdrop-blur-md border-l-2 border-cyan-400/50 shadow-2xl flex flex-col animate-slide-in-right"
        style={{ zIndex: 45 }}
      >
        <div
          className={`px-5 py-4 ${colors.accent} border-b border-slate-700/80 flex items-start justify-between gap-3`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-5 h-5 ${colors.text} flex-shrink-0`} />
              <div
                className={`text-[9px] font-bold ${colors.text} uppercase tracking-wider px-2 py-0.5 rounded ${colors.bg} border ${colors.border}`}
              >
                {prettyCategory(rule.category)}
              </div>
            </div>

            <h2 className="text-base font-bold text-white leading-tight mb-1">
              {rule.title}
            </h2>

            <div className="text-[10px] text-slate-400 font-mono">
              {rule.reference}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded transition-colors flex-shrink-0"
            title="Close (ESC)"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Summary
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {rule.description}
            </p>
          </div>

          {hasProcedures && (
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                Operational Procedures
              </div>
              <ul className="space-y-2">
                {rule.procedures!.map((proc, i) => (
                  <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                    <span className={`${colors.text} mt-0.5 flex-shrink-0`}>•</span>
                    <span className="flex-1">{proc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasChecklist && (
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                Compliance Checklist
              </div>
              <div className="space-y-1.5">
                {rule.complianceChecklist!.map((item, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded border ${colors.border} ${colors.bg} text-[11px] text-slate-300 flex items-start gap-2`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-cyan-500 cursor-pointer"
                    />
                    <span className="flex-1">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasRelatedRules && (
            <div className="pt-3 border-t border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                Related Regulations
              </div>
              <div className="space-y-1">
                {rule.relatedRules!.map((related, i) => (
                  <div
                    key={i}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {related}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasFullText && (
            <div className={`p-4 rounded border ${colors.border} ${colors.bg}`}>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Regulatory Extract
              </div>
              <div className="text-[11px] text-slate-200 leading-relaxed whitespace-pre-line font-mono">
                {rule.fullText}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-700/50 bg-slate-800/50 flex items-center justify-between">
          <button
            className="text-[10px] text-slate-400 hover:text-cyan-400 uppercase tracking-wider transition-colors flex items-center gap-1.5"
            onClick={onClose}
          >
            <ExternalLink className="w-3 h-3" />
            Open in RULES Module
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] uppercase tracking-wider rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
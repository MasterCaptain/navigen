import React, { useState } from 'react';
import { RuleCard as RuleCardType } from '../types/ruleCard';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
  ExternalLink,
  Maximize2,
} from 'lucide-react';
import { RuleDetailsModal } from './RuleDetailsModal';

interface RuleCardProps {
  rule: RuleCardType;
  defaultExpanded?: boolean;
}

export function RuleCard({ rule, defaultExpanded = false }: RuleCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const severityConfig = {
    MUST: {
      bg: 'bg-red-950/40',
      border: 'border-red-600/60',
      accent: 'bg-red-600',
      textColor: 'text-red-400',
      icon: AlertTriangle,
    },
    SHOULD: {
      bg: 'bg-amber-950/30',
      border: 'border-amber-500/50',
      accent: 'bg-amber-500',
      textColor: 'text-amber-400',
      icon: Info,
    },
    CONSIDER: {
      bg: 'bg-cyan-950/20',
      border: 'border-cyan-600/40',
      accent: 'bg-cyan-600',
      textColor: 'text-cyan-400',
      icon: CheckCircle2,
    },
  };

  const config = severityConfig[rule.severity];
  const SeverityIcon = config.icon;

  const actionIcons = {
    CHECK: '✓',
    PROCEDURE: '→',
    LIMIT: '!',
    NOTE: 'i',
  };

  const hasActions = !!rule.content.actions?.length;
  const hasExceptions = !!rule.content.exceptions?.length;
  const hasLinks = !!rule.content.links?.length;
  const hasTags = !!rule.ops.tags?.length;

  return (
    <>
      <div
        className={`relative ${config.bg} ${config.border} border rounded-lg overflow-hidden backdrop-blur-sm transition-all duration-200`}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Severity indicator bar */}
        <div className={`${config.accent} absolute left-0 top-0 bottom-0 w-1`} />

        {/* Header */}
        <div
          className="flex items-start gap-3 p-3 pl-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {/* Icon */}
          <div className="mt-0.5 shrink-0">
            <SeverityIcon className={`${config.textColor} w-5 h-5`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-white font-semibold text-sm leading-tight">
                {rule.ui.title}
              </h3>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`${config.textColor} text-xs font-bold uppercase tracking-wider`}>
                  {rule.severity}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(true);
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-cyan-600/20 rounded border border-cyan-500/30 hover:border-cyan-500/50 transition-all"
                  title="View full regulation details"
                >
                  <Maximize2 className="w-3 h-3 text-cyan-400" />
                </button>

                {expanded ? (
                  <ChevronUp className="text-gray-400 w-4 h-4" />
                ) : (
                  <ChevronDown className="text-gray-400 w-4 h-4" />
                )}
              </div>
            </div>

            <p className="text-gray-300 text-xs leading-snug">{rule.statement}</p>

            {!expanded && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800/60 border border-gray-700/50 rounded text-xs text-gray-400">
                  <FileText className="w-3 h-3" />
                  {rule.authority.instrument}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-3 pt-2 space-y-3 border-t border-white/10">
            {/* Authority */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Authority
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300 flex-wrap">
                <span className="px-2 py-1 bg-gray-800/60 border border-gray-700/50 rounded">
                  {rule.authority.regime}
                </span>
                <span className="text-gray-500">/</span>
                <span>{rule.authority.instrument}</span>
              </div>

              <div className="text-xs text-gray-500 break-words">
                {rule.authority.reference}
              </div>
            </div>

            {/* Rationale */}
            {rule.content.rationale && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Rationale
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {rule.content.rationale}
                </p>
              </div>
            )}

            {/* Actions */}
            {hasActions && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Actions Required
                </div>
                <ul className="space-y-1.5">
                  {rule.content.actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <span
                        className={`${config.textColor} font-bold shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center text-xs border ${config.border} rounded`}
                      >
                        {actionIcons[action.type]}
                      </span>
                      <span className="leading-relaxed">{action.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exceptions */}
            {hasExceptions && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Exceptions
                </div>
                <ul className="space-y-1">
                  {rule.content.exceptions.map((exception, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-gray-400 leading-relaxed pl-3 border-l-2 border-gray-700"
                    >
                      {exception}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Links */}
            {hasLinks && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  References
                </div>
                <div className="flex flex-wrap gap-2">
                  {rule.content.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 rounded text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Link
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {hasTags && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {rule.ops.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gray-900/50 border border-gray-700/40 rounded-full text-[10px] text-gray-500 uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* View Full Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailsModal(true);
              }}
              className="w-full mt-2 px-3 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded text-cyan-400 hover:text-cyan-300 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              View Full Regulation Details
            </button>
          </div>
        )}

        <RuleDetailsModal
          rule={rule}
          show={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      </div>
    </>
  );
}
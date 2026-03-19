import { Badge } from './Badge';
import { SourceTag } from './SourceTag';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface RuleCardProps {
  level: 'MUST' | 'SHOULD' | 'CONSIDER';
  source: string;
  title: string;
  text: string;
}

export function RuleCard({ level, source, title, text }: RuleCardProps) {
  const [copied, setCopied] = useState(false);

  // Define background colors based on level
  const bgColors = {
    MUST: 'bg-red-950/30 border-red-900/40 hover:bg-red-950/40 hover:border-red-900/50',
    SHOULD: 'bg-amber-950/30 border-amber-900/40 hover:bg-amber-950/40 hover:border-amber-900/50',
    CONSIDER: 'bg-emerald-950/30 border-emerald-900/40 hover:bg-emerald-950/40 hover:border-emerald-900/50'
  };

  const handleCopy = async () => {
    const copyText = `${level} • ${title}\n${text}\nSource: ${source}`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`border rounded-lg p-4 space-y-3 transition-all ${bgColors[level]} group relative`}>
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <SourceTag source={source} />
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-800/50 rounded border border-slate-700/50"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400" />
          )}
        </button>
      </div>

      {/* Title */}
      <h5 className="text-white font-semibold text-sm leading-tight">{title}</h5>

      {/* Rule Text */}
      <p className="text-slate-400 text-xs leading-relaxed">{text}</p>
    </div>
  );
}
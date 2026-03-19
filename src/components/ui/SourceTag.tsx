interface SourceTagProps {
  source: string;
}

export function SourceTag({ source }: SourceTagProps) {
  const getColor = () => {
    switch (source) {
      case 'IMO':
        return 'text-blue-400 bg-blue-500/5 border-blue-500/20';
      case 'IAATO':
        return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20';
      case 'COMPANY':
        return 'text-purple-400 bg-purple-500/5 border-purple-500/20';
      case 'PORT':
        return 'text-orange-400 bg-orange-500/5 border-orange-500/20';
      default:
        return 'text-slate-400 bg-slate-500/5 border-slate-500/20';
    }
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${getColor()}`}>
      {source}
    </span>
  );
}

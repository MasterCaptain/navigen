interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'must' | 'should' | 'consider';
}

export function FilterChip({ label, active, onClick, variant }: FilterChipProps) {
  const getColors = () => {
    if (!active) {
      return 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700';
    }
    
    switch (variant) {
      case 'must':
        return 'bg-red-500/10 text-red-400 border-red-500/30 shadow-lg shadow-red-500/10';
      case 'should':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/10';
      case 'consider':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/10';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${getColors()}`}
    >
      {label}
    </button>
  );
}
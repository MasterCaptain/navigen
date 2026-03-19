interface StatusChipProps {
  label: string;
  status: string;
}

export function StatusChip({ label, status }: StatusChipProps) {
  const isActive = status === 'OK' || status === 'ON';
  
  return (
    <div className={`
      px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2
      ${isActive 
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
        : 'bg-slate-800 text-slate-400 border border-slate-700'}
    `}>
      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
      <span>{label}: {status}</span>
    </div>
  );
}

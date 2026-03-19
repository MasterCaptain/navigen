interface SegmentedControlProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="bg-slate-800 p-0.5 rounded flex gap-0.5 border border-slate-700">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`
            flex-1 px-2 py-1 rounded text-[9px] font-medium transition-all whitespace-nowrap
            ${value === option
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-750'
            }
          `}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
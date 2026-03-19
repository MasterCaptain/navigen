interface NavigenLogoProps {
  size?: number;
  showWordmark?: boolean;
  variant?: 'default' | 'light' | 'monochrome';
}

export function NavigenLogo({ size = 40, showWordmark = false, variant = 'default' }: NavigenLogoProps) {
  const colors = {
    default: {
      outer: '#3b4f6b', // mørk blå/slate
      inner: '#06b6d4', // cyan
      accent: '#22d3ee', // bright cyan
    },
    light: {
      outer: '#cbd5e1',
      inner: '#06b6d4',
      accent: '#22d3ee',
    },
    monochrome: {
      outer: '#64748b',
      inner: '#94a3b8',
      accent: '#cbd5e1',
    }
  };

  const c = colors[variant];

  if (showWordmark) {
    return (
      <div className="flex items-center gap-3">
        {/* Symbol */}
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* North point - dark blue */}
          <path
            d="M50 10 L60 40 L50 35 L40 40 Z"
            fill={c.outer}
          />
          
          {/* East point - dark blue */}
          <path
            d="M90 50 L60 60 L65 50 L60 40 Z"
            fill={c.outer}
          />
          
          {/* South point - dark blue */}
          <path
            d="M50 90 L40 60 L50 65 L60 60 Z"
            fill={c.outer}
          />
          
          {/* West point - dark blue */}
          <path
            d="M10 50 L40 40 L35 50 L40 60 Z"
            fill={c.outer}
          />
          
          {/* Center diamond - cyan */}
          <path
            d="M50 35 L65 50 L50 65 L35 50 Z"
            fill={c.inner}
          />
        </svg>

        {/* Wordmark */}
        <div className="flex flex-col">
          <span 
            className="text-xl font-bold tracking-wider" 
            style={{ 
              color: c.inner, 
              fontFamily: 'system-ui, -apple-system, sans-serif', 
              letterSpacing: '0.12em',
              fontWeight: 600
            }}
          >
            NAVIGEN
          </span>
          <span 
            className="text-[9px] tracking-widest opacity-60 font-medium" 
            style={{ 
              color: c.accent, 
              fontFamily: 'system-ui, -apple-system, sans-serif', 
              letterSpacing: '0.18em'
            }}
          >
            NAV COMPLIANCE SYS
          </span>
        </div>
      </div>
    );
  }

  // Symbol only
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* North point - dark blue */}
      <path
        d="M50 10 L60 40 L50 35 L40 40 Z"
        fill={c.outer}
      />
      
      {/* East point - dark blue */}
      <path
        d="M90 50 L60 60 L65 50 L60 40 Z"
        fill={c.outer}
      />
      
      {/* South point - dark blue */}
      <path
        d="M50 90 L40 60 L50 65 L60 60 Z"
        fill={c.outer}
      />
      
      {/* West point - dark blue */}
      <path
        d="M10 50 L40 40 L35 50 L40 60 Z"
        fill={c.outer}
      />
      
      {/* Center diamond - cyan */}
      <path
        d="M50 35 L65 50 L50 65 L35 50 Z"
        fill={c.inner}
      />
    </svg>
  );
}
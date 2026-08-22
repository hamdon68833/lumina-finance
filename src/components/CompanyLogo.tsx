import React, { useState } from 'react';

interface CompanyLogoProps {
  ticker?: string;
  name?: string;
  logoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Curated official CDN logo fallback URLs for popular assets
const KNOWN_LOGOS: Record<string, string> = {
  // US Equities
  NVDA: 'https://logo.clearbit.com/nvidia.com',
  AAPL: 'https://logo.clearbit.com/apple.com',
  MSFT: 'https://logo.clearbit.com/microsoft.com',
  AMZN: 'https://logo.clearbit.com/amazon.com',
  GOOGL: 'https://logo.clearbit.com/google.com',
  META: 'https://logo.clearbit.com/meta.com',
  TSLA: 'https://logo.clearbit.com/tesla.com',
  
  // Indian Equities & Indices
  'RELIANCE.NS': 'https://logo.clearbit.com/ril.com',
  RELIANCE: 'https://logo.clearbit.com/ril.com',
  'TCS.NS': 'https://logo.clearbit.com/tcs.com',
  TCS: 'https://logo.clearbit.com/tcs.com',
  'INFY.NS': 'https://logo.clearbit.com/infosys.com',
  INFY: 'https://logo.clearbit.com/infosys.com',
  'HDFCBANK.NS': 'https://logo.clearbit.com/hdfcbank.com',
  HDFCBANK: 'https://logo.clearbit.com/hdfcbank.com',
  'ICICIBANK.NS': 'https://logo.clearbit.com/icicibank.com',
  ICICIBANK: 'https://logo.clearbit.com/icicibank.com',
  'NIFTY 50': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=80',
  'NIFTY': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=80',
  SENSEX: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=100&auto=format&fit=crop&q=80',
};

// Generates 1 to 3 character fallback initials
function getInitials(ticker?: string, name?: string): string {
  const cleanTicker = (ticker || '').replace(/\.NS$/i, '').trim();
  if (cleanTicker) {
    if (cleanTicker.length <= 3) return cleanTicker.toUpperCase();
    if (cleanTicker === 'NIFTY50' || cleanTicker === 'NIFTY 50') return 'N50';
    if (cleanTicker === 'RELIANCE') return 'R';
    if (cleanTicker === 'HDFCBANK') return 'HDFC';
    if (cleanTicker === 'ICICIBANK') return 'ICICI';
    return cleanTicker.slice(0, 3).toUpperCase();
  }

  const cleanName = (name || '').trim();
  if (cleanName) {
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  return 'L';
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs font-semibold',
  lg: 'w-12 h-12 text-sm font-bold',
  xl: 'w-16 h-16 text-base font-bold',
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  ticker,
  name,
  logoUrl,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const cleanKey = (ticker || '').toUpperCase();
  const resolvedUrl = logoUrl || KNOWN_LOGOS[cleanKey] || KNOWN_LOGOS[cleanKey.replace(/\.NS$/i, '')];
  const initials = getInitials(ticker, name);

  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  if (resolvedUrl && !imageError) {
    return (
      <div className={`relative flex items-center justify-center rounded-xl overflow-hidden bg-slate-800/80 border border-slate-700/60 shadow-sm shrink-0 ${sizeClasses} ${className}`}>
        <img
          src={resolvedUrl}
          alt={`${name || ticker || 'Company'} logo`}
          className="w-full h-full object-cover rounded-xl"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Color palette based on initials hash
  const colors = [
    'from-cyan-500 to-blue-600 text-white',
    'from-emerald-500 to-teal-600 text-white',
    'from-purple-500 to-indigo-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-rose-500 to-pink-600 text-white',
  ];
  const colorIndex = Math.abs((ticker || name || 'L').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  const gradient = colors[colorIndex];

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} border border-white/20 shadow-md shrink-0 font-bold tracking-wider ${sizeClasses} ${className}`}
      title={name || ticker}
    >
      <span>{initials}</span>
    </div>
  );
};

export default CompanyLogo;

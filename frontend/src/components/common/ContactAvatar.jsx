import React from 'react';
import { User } from 'lucide-react';

const AVATAR_PALETTES = [
  { bg: 'bg-[#F0F9FF]', text: 'text-[#0284C7]', border: 'border-[#BAE6FD]' },
  { bg: 'bg-[#EFF8FF]', text: 'text-[#0086C9]', border: 'border-[#B2DDFF]' },
  { bg: 'bg-[#ECFDF3]', text: 'text-[#027A48]', border: 'border-[#A6F4C5]' },
  { bg: 'bg-[#FEF6EE]', text: 'text-[#B93815]', border: 'border-[#F9DBAF]' },
  { bg: 'bg-[#FDF2FA]', text: 'text-[#C11574]', border: 'border-[#FCCEEE]' },
  { bg: 'bg-[#F8F9FC]', text: 'text-[#3E4784]', border: 'border-[#D5D9EB]' },
];

export const getContactInitials = (name) => {
  if (!name) return '';
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  if (!clean) return '';
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getContactColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name || '').charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

export const ContactAvatar = ({ name = '', size = 'md', className = '' }) => {
  const initials = getContactInitials(name);
  const palette = getContactColor(name);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center font-bold font-sans border ${palette.bg} ${palette.text} ${palette.border} shrink-0 select-none ${className}`}
      title={name}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <User className={iconSizes[size] || 'w-4 h-4'} />
      )}
    </div>
  );
};

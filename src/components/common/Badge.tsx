import React from 'react';
import { ListingStatus, TransactionStatus, DemandStatus, AgentAssignmentStatus } from '../../types';

type BadgeType = ListingStatus | TransactionStatus | DemandStatus | AgentAssignmentStatus | string;

interface BadgeProps {
  status: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md', className = '' }) => {
  const normalized = (status || '').toUpperCase();

  // Size styling
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-bold',
  };

  // Color mapping strictly matching specifications
  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';

  if (
    normalized === 'AVAILABLE' ||
    normalized === 'ACTIVE' ||
    normalized === 'COMPLETED' ||
    normalized === 'COMMERCIAL_CLOSED' ||
    normalized === 'VERIFIED' ||
    normalized === 'FULLY_SETTLED'
  ) {
    // Green
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-500/20';
  } else if (
    normalized === 'SOLD' ||
    normalized === 'CANCELLED' ||
    normalized === 'DEACTIVATED'
  ) {
    // Red / Dark Red
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-500/20';
  } else if (
    normalized === 'PENDING' ||
    normalized === 'PENDING_REVIEW' ||
    normalized === 'PENDING_APPROVAL' ||
    normalized === 'PAYMENT_PENDING' ||
    normalized === 'DRAFT'
  ) {
    // Orange
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-500/20';
  } else if (
    normalized === 'RESERVED' ||
    normalized === 'IN_PROGRESS' ||
    normalized === 'ASSIGNED' ||
    normalized === 'IN_NEGOTIATION' ||
    normalized === 'MATCHED' ||
    normalized === 'INTERESTED' ||
    normalized === 'SHIPPED'
  ) {
    // Blue / Cyan
    colorClasses = 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-500/20';
  } else if (
    normalized === 'EXPIRED' ||
    normalized === 'ARCHIVED' ||
    normalized === 'SUSPENDED'
  ) {
    // Gray
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  }

  // Label Formatter
  const formatLabel = (val: string) => {
    return val.replace(/_/g, ' ');
  };

  return (
    <span
      id={`badge-${normalized.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`inline-flex items-center rounded-full border tracking-wide whitespace-nowrap shadow-xs ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
        normalized === 'AVAILABLE' || normalized === 'ACTIVE' || normalized === 'COMPLETED' ? 'bg-emerald-500' :
        normalized === 'SOLD' || normalized === 'CANCELLED' ? 'bg-rose-500' :
        normalized.includes('PENDING') ? 'bg-amber-500' :
        normalized === 'RESERVED' || normalized.includes('PROGRESS') || normalized === 'ASSIGNED' ? 'bg-sky-500' : 'bg-slate-400'
      }`} />
      {formatLabel(normalized)}
    </span>
  );
};

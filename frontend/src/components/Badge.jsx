import React from 'react';

export default function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    gemini: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/10',
    mock: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
  };

  const currentVariant = variants[variant] || variants.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs ${currentVariant} ${className}`}
    >
      {children}
    </span>
  );
}


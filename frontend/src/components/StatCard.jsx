import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  accentColor = 'brand', // 'brand' | 'navy' | 'emerald' | 'amber'
  onClick,
}) {
  const accentStyles = {
    brand: {
      iconBg: 'bg-teal-50 text-teal-600',
      border: 'hover:border-teal-300',
      highlight: 'text-teal-600',
    },
    navy: {
      iconBg: 'bg-slate-100 text-slate-800',
      border: 'hover:border-slate-300',
      highlight: 'text-slate-900',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
      highlight: 'text-emerald-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300',
      highlight: 'text-amber-600',
    },
  };

  const style = accentStyles[accentColor] || accentStyles.brand;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs transition-all duration-200 ${
        onClick ? `cursor-pointer ${style.border} hover:shadow-md hover:-translate-y-0.5` : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value !== undefined ? value : '—'}
        </span>
        {badgeText && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}


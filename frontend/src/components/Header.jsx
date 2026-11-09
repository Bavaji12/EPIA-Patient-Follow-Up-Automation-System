import React from 'react';
import { Menu, UserPlus, Sparkles, Calendar, ShieldCheck } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  todayDate,
  aiStatus,
  onOpenRegisterModal,
  onOpenMobileMenu,
}) {
  // Format today's date nicely for header display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Mobile trigger & Page Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Date, AI status pill & Quick Action */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Today Date Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Today: {formatDateDisplay(todayDate)}</span>
          </div>

          {/* AI Engine Status Pill */}
          {aiStatus && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                aiStatus.geminiConfigured
                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}
              title={aiStatus.description}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiStatus.geminiConfigured ? 'Gemini 1.5 Active' : 'Mock AI Active'}</span>
            </div>
          )}

          {/* Register Patient Button */}
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>
    </header>
  );
}


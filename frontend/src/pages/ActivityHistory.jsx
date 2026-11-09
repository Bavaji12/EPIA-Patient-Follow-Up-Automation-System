import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Edit2,
  CheckCircle2,
  Sparkles,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ActivityHistory({ logs, isLoading, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const actionConfig = {
    PATIENT_REGISTERED: {
      label: 'Patient Registered',
      icon: UserPlus,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    PATIENT_UPDATED: {
      label: 'Patient Updated',
      icon: Edit2,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    FOLLOW_UP_COMPLETED: {
      label: 'Follow-Up Completed',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    DRAFT_GENERATED: {
      label: 'AI Draft Generated',
      icon: Sparkles,
      color: 'bg-brand-50 text-brand-700 border-brand-200',
    },
    DRAFT_EDITED: {
      label: 'Draft Edited',
      icon: Edit3,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    DRAFT_APPROVED: {
      label: 'Draft Approved',
      icon: ThumbsUp,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    DRAFT_REJECTED: {
      label: 'Draft Rejected',
      icon: ThumbsDown,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  const filteredLogs = logs.filter((log) => {
    const matchesAction =
      actionFilter === 'all' || log.action === actionFilter;

    const matchesSearch =
      searchTerm.trim() === '' ||
      (log.patient_name && log.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity records by patient name or action..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Actions</option>
            <option value="PATIENT_REGISTERED">Patient Registered</option>
            <option value="FOLLOW_UP_COMPLETED">Follow-Up Completed</option>
            <option value="DRAFT_GENERATED">AI Draft Generated</option>
            <option value="DRAFT_EDITED">Draft Edited</option>
            <option value="DRAFT_APPROVED">Draft Approved</option>
            <option value="DRAFT_REJECTED">Draft Rejected</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <History className="w-4 h-4 text-brand-600" />
              Chronological Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredLogs.length} events logged in SQLite
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading audit history..." />
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No activity logs match your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const config = actionConfig[log.action] || {
                label: log.action,
                icon: Clock,
                color: 'bg-slate-100 text-slate-700 border-slate-200',
              };
              const Icon = config.icon;

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex items-start gap-4"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${config.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                          {config.label}
                        </span>
                        {log.patient_name && (
                          <span className="text-xs font-semibold text-slate-900">
                            for {log.patient_name}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {log.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


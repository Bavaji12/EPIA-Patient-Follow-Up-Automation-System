import React, { useState } from 'react';
import {
  CalendarClock,
  Sparkles,
  CheckCircle2,
  Search,
  RefreshCw,
  Phone,
  Eye,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DueFollowUps({
  duePatients,
  todayDate,
  isLoading,
  onRefresh,
  onGenerateDraft,
  onBatchGenerateDrafts,
  onCompleteFollowUp,
  onViewPatient,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  const filteredPatients = duePatients.filter((p) => {
    return (
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
    );
  });

  const handleBatch = async () => {
    setIsGeneratingBatch(true);
    try {
      await onBatchGenerateDrafts();
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Today's Date and Batch Action */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <CalendarClock className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Today's Care Schedule ({todayDate})
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Patients Due For Follow-Up Today
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            These patients have their follow-up date matching today's local date and are awaiting care consultation check-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBatch}
            disabled={isGeneratingBatch || duePatients.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {isGeneratingBatch ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generate All Due Drafts ({duePatients.length})</span>
          </button>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search today's due patients..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh due list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            Due Today Follow-Up List ({filteredPatients.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Date: {todayDate}
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading patients due today..." />
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">No follow-ups due today!</p>
            <p>All scheduled patient follow-ups for today have either been completed or none were scheduled.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Patient Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Consultation Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Follow-Up Status</th>
                  <th className="py-3.5 px-4">AI Draft Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => {
                  const hasPendingDraft = p.pending_drafts_count > 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                        <div className="text-[11px] text-slate-400">ID: #{p.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{p.phone}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.consultation_date}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-700 bg-amber-50/40">
                        {p.next_follow_up_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="pending">pending</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {hasPendingDraft ? (
                          <Badge variant="gemini" className="font-medium">
                            <FileCheck className="w-3 h-3" />
                            Draft Ready ({p.pending_drafts_count})
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            No draft yet
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onGenerateDraft(p)}
                            title="Generate AI Follow-up draft"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold border border-brand-200 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{hasPendingDraft ? 'Regenerate' : 'Generate AI'}</span>
                          </button>
                          <button
                            onClick={() => onCompleteFollowUp(p)}
                            title="Mark follow-up completed"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                          <button
                            onClick={() => onViewPatient(p.id)}
                            title="View patient history"
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import DraftCard from '../components/DraftCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AIDrafts({
  drafts,
  isLoading,
  onRefresh,
  onEditDraft,
  onApproveDraft,
  onRejectDraft,
  onViewPatient,
  onBatchGenerate,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrafts = drafts.filter((draft) => {
    // Status Filter
    const matchesStatus =
      statusFilter === 'all' || draft.approval_status === statusFilter;

    // Provider Filter
    const matchesProvider =
      providerFilter === 'all' ||
      (providerFilter === 'gemini' && draft.ai_provider?.includes('gemini')) ||
      (providerFilter === 'mock' && draft.ai_provider?.includes('mock'));

    // Search filter
    const matchesSearch =
      searchTerm.trim() === '' ||
      draft.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.message?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesProvider && matchesSearch;
  });

  const pendingCount = drafts.filter((d) => d.approval_status === 'pending').length;
  const approvedCount = drafts.filter((d) => d.approval_status === 'approved').length;
  const rejectedCount = drafts.filter((d) => d.approval_status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Prominent Human Supervision Banner (Mandatory Requirement) */}
      <div className="bg-amber-50 border-2 border-amber-200/80 rounded-2xl p-4 sm:p-5 text-amber-950 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-amber-900">
              Staff Human-in-the-Loop Supervision Notice
            </h3>
            <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 leading-relaxed font-medium">
              "AI-generated messages require staff review and approval. No messages are sent automatically."
            </p>
            <p className="text-[11px] text-amber-700/80 mt-1">
              Approving or rejecting a message only records clinic staff sign-off in the database.
            </p>
          </div>
        </div>

        <button
          onClick={onBatchGenerate}
          className="self-start sm:self-center shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Today's Drafts</span>
        </button>
      </div>

      {/* Filter and Tab Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Drafts ({drafts.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected ({rejectedCount})</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh drafts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Provider Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search message text or patient name..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Provider:</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All AI Providers</option>
              <option value="gemini">Google Gemini Only</option>
              <option value="mock">Mock AI Engine Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drafts Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading AI message drafts..." size="lg" />
      ) : filteredDrafts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-xs text-slate-400 space-y-2">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No message drafts found</p>
          <p>Try switching status tabs or generate new drafts for patients due today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onEdit={onEditDraft}
              onApprove={onApproveDraft}
              onReject={onRejectDraft}
              onViewPatient={onViewPatient}
            />
          ))}
        </div>
      )}
    </div>
  );
}


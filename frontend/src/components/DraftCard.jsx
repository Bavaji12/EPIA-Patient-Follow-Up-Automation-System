import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Calendar,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import Badge from './Badge';

export default function DraftCard({
  draft,
  onEdit,
  onApprove,
  onReject,
  onViewPatient,
}) {
  const isPending = draft.approval_status === 'pending';
  const isApproved = draft.approval_status === 'approved';
  const isRejected = draft.approval_status === 'rejected';

  // Determine provider badge style
  const isGemini = draft.ai_provider && draft.ai_provider.toLowerCase().includes('gemini');

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Patient & Status Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {draft.patient_name || 'Patient'}
              </h3>
              <Badge variant={draft.approval_status}>
                {draft.approval_status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {draft.masked_phone || draft.patient_phone || '—'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                Follow-up: {draft.next_follow_up_date || 'Today'}
              </span>
            </div>
          </div>

          {/* AI Provider Pill */}
          <Badge variant={isGemini ? 'gemini' : 'mock'} className="shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>{draft.ai_provider || 'Mock AI'}</span>
          </Badge>
        </div>

        {/* WhatsApp Preview Message Box */}
        <div className="relative my-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-slate-800 text-sm leading-relaxed font-sans">
          <div className="absolute top-2.5 right-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> WhatsApp Draft
          </div>
          <p className="pr-12 pt-1">{draft.message}</p>
        </div>

        {/* Review Metadata */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 px-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Generated: {new Date(draft.created_at).toLocaleDateString()} at{' '}
            {new Date(draft.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>

          {draft.reviewed_at && (
            <span className="font-medium text-slate-500 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Reviewed
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onViewPatient && (
            <button
              onClick={() => onViewPatient(draft.patient_id)}
              className="text-xs font-medium text-slate-600 hover:text-brand-700 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              View Patient
            </button>
          )}

          {isPending && onEdit && (
            <button
              onClick={() => onEdit(draft)}
              className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Review Action Buttons */}
        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReject(draft)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100/70 text-xs font-semibold transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => onApprove(draft)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Decision Finalized</span>
          </div>
        )}
      </div>
    </div>
  );
}


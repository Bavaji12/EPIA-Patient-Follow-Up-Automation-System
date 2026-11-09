import React from 'react';
import { X, User, Phone, Calendar, Clock, CheckCircle2, AlertCircle, FileText, Sparkles } from 'lucide-react';
import Badge from './Badge';

export default function PatientDetailsModal({ isOpen, onClose, patient, onComplete, onGenerateDraft }) {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-base border border-brand-200">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">{patient.name}</h3>
                <Badge variant={patient.follow_up_status === 'completed' ? 'completed' : 'pending'}>
                  {patient.follow_up_status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Patient ID: #{patient.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Core Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </span>
              <p className="text-sm font-semibold text-slate-800">{patient.phone}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Registered Date
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Consultation Date
              </span>
              <p className="text-sm font-semibold text-slate-800">{patient.consultation_date}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" /> Next Follow-Up Date
              </span>
              <p className="text-sm font-bold text-brand-700">{patient.next_follow_up_date}</p>
            </div>
          </div>

          {/* Quick Actions in Detail Modal */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
            {patient.follow_up_status !== 'completed' && (
              <button
                onClick={() => onComplete(patient)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
              </button>
            )}
            <button
              onClick={() => onGenerateDraft(patient)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate AI Draft
            </button>
          </div>

          {/* Related Drafts */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-600" /> AI Message Drafts ({patient.drafts?.length || 0})
            </h4>
            {patient.drafts && patient.drafts.length > 0 ? (
              <div className="space-y-2.5">
                {patient.drafts.map((d) => (
                  <div key={d.id} className="p-3 rounded-xl border border-slate-200/80 bg-white text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={d.ai_provider?.includes('gemini') ? 'gemini' : 'mock'}>
                          {d.ai_provider}
                        </Badge>
                        <Badge variant={d.approval_status}>{d.approval_status}</Badge>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-sans">{d.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No AI message drafts generated yet.</p>
            )}
          </div>

          {/* Activity Logs for this Patient */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" /> Patient Activity History
            </h4>
            {patient.activity_logs && patient.activity_logs.length > 0 ? (
              <div className="space-y-2">
                {patient.activity_logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs text-slate-600 pb-2 border-b border-slate-100 last:border-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800">{log.action}: </span>
                      <span>{log.description}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No activity logs recorded yet.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


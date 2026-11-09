import React from 'react';
import {
  Users,
  CalendarClock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserPlus,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard({
  stats,
  isLoading,
  onRefresh,
  onNavigate,
  onOpenRegisterModal,
  onGenerateBatchDrafts,
  onCompletePatient,
  onApproveDraft,
  onRejectDraft,
  onEditDraft,
}) {
  if (isLoading && !stats) {
    return <LoadingSpinner message="Loading clinic dashboard..." size="lg" />;
  }

  const metrics = stats?.metrics || {
    totalPatients: 0,
    dueToday: 0,
    completedFollowUps: 0,
    pendingDrafts: 0,
    completionRate: 0,
  };

  const dueSchedule = stats?.dueSchedule || [];
  const pendingDrafts = stats?.pendingDrafts || [];
  const recentPatients = stats?.recentPatients || [];

  return (
    <div className="space-y-7">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Patients"
          value={metrics.totalPatients}
          subtitle="Registered clinic patients"
          icon={Users}
          accentColor="navy"
          onClick={() => onNavigate('patients')}
        />
        <StatCard
          title="Follow-Ups Due Today"
          value={metrics.dueToday}
          subtitle="Awaiting follow-up care"
          icon={CalendarClock}
          badgeText={metrics.dueToday > 0 ? 'Action Needed' : 'All Clear'}
          accentColor="amber"
          onClick={() => onNavigate('due-followups')}
        />
        <StatCard
          title="Completed Follow-Ups"
          value={metrics.completedFollowUps}
          subtitle={`${metrics.completionRate}% total completion rate`}
          icon={CheckCircle2}
          accentColor="emerald"
          onClick={() => onNavigate('patients')}
        />
        <StatCard
          title="Pending AI Approvals"
          value={metrics.pendingDrafts}
          subtitle="Staff review required"
          icon={Sparkles}
          badgeText={metrics.pendingDrafts > 0 ? 'Pending Staff' : 'Up to Date'}
          accentColor="brand"
          onClick={() => onNavigate('ai-drafts')}
        />
      </div>

      {/* Quick Action Bar & Human Supervision Notice */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Quick Actions & Follow-Up Automation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trigger automated draft generation or register new patient consultation records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Patient</span>
          </button>

          <button
            onClick={onGenerateBatchDrafts}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Today's AI Drafts</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Today's Follow-Up Schedule & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-Up Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-brand-600" />
                Today's Follow-Up Schedule
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Patients scheduled for contact today ({stats?.todayDate || 'Today'})
              </p>
            </div>
            <button
              onClick={() => onNavigate('due-followups')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {dueSchedule.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No patients are scheduled for follow-up today.
              </div>
            ) : (
              <div className="space-y-2.5">
                {dueSchedule.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <span>{patient.name}</span>
                        <Badge variant={patient.follow_up_status === 'completed' ? 'completed' : 'pending'}>
                          {patient.follow_up_status}
                        </Badge>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5 font-mono">
                        {patient.phone}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {patient.follow_up_status === 'pending' && (
                        <button
                          onClick={() => onCompletePatient(patient)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate('due-followups')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending AI Message Drafts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Pending AI Message Drafts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff review and human supervision queue
              </p>
            </div>
            <button
              onClick={() => onNavigate('ai-drafts')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
            >
              <span>View All ({metrics.pendingDrafts})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {pendingDrafts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                All AI drafts have been reviewed! Click "Generate Today's AI Drafts" to create drafts.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">
                        {draft.patient_name}
                      </span>
                      <Badge variant={draft.ai_provider?.includes('gemini') ? 'gemini' : 'mock'}>
                        {draft.ai_provider}
                      </Badge>
                    </div>

                    <p className="text-slate-600 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100 italic">
                      "{draft.message}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {draft.masked_phone}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEditDraft(draft)}
                          className="px-2 py-0.5 rounded-md text-slate-600 hover:bg-slate-200 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onRejectDraft(draft)}
                          className="px-2 py-0.5 rounded-md text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onApproveDraft(draft)}
                          className="px-2.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              Recent Patient Registrations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest patient admissions and consultation entries
            </p>
          </div>
          <button
            onClick={() => onNavigate('patients')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            <span>All Patients</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Patient Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Consultation Date</th>
                <th className="py-3 px-4">Next Follow-Up</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">{p.phone}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.consultation_date}</td>
                  <td className="py-3.5 px-4 font-medium text-brand-700">{p.next_follow_up_date}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.follow_up_status === 'completed' ? 'completed' : 'pending'}>
                      {p.follow_up_status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => onNavigate('patients')}
                      className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


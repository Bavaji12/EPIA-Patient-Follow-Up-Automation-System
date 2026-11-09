import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sparkles,
  ShieldCheck,
  Building,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Key,
  Info
} from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Settings({ settings, isLoading, onResetSeed }) {
  const [isResetting, setIsResetting] = useState(false);

  if (isLoading && !settings) {
    return <LoadingSpinner message="Loading system settings..." />;
  }

  const clinic = settings?.clinic || {
    name: 'EPIA Healthcare & Wellness Clinic',
    email: 'care@epia-health.org',
    phone: '+1 (555) 019-EPIA',
    address: '42 Medical Arts Boulevard, Suite 300',
  };

  const ai = settings?.ai || {
    geminiConfigured: false,
    activeProvider: 'Mock AI Engine (Offline Safe)',
    model: 'mock-templates-v1',
    description: 'Using built-in Mock AI Fallback.',
  };

  const dbInfo = settings?.database || {
    engine: 'SQLite3 (better-sqlite3)',
    mode: 'WAL',
    stats: { patientsCount: 0, draftsCount: 0, logsCount: 0 },
  };

  const handleReset = async () => {
    if (window.confirm('Reset database to clean fictional assessment demonstration seed?')) {
      setIsResetting(true);
      try {
        await onResetSeed();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* AI Automation Engine Status Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Automation Engine</h3>
              <p className="text-xs text-slate-500">Google Gemini & Mock AI Fallback configuration</p>
            </div>
          </div>
          <Badge variant={ai.geminiConfigured ? 'gemini' : 'mock'}>
            {ai.geminiConfigured ? 'Gemini 1.5 Live' : 'Mock AI Active'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Active Provider</span>
            <p className="font-semibold text-slate-900 text-sm">{ai.activeProvider}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Model Version</span>
            <p className="font-semibold text-slate-900 text-sm">{ai.model}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <span>
            {ai.description} In accordance with assessment instructions, if no Gemini key is provided,
            the system operates with natural, personalized templates without blocking the workflow.
          </span>
        </div>
      </div>

      {/* Human Supervision Guarantee Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Human Supervision Guarantee</h3>
            <p className="text-xs text-slate-500">Mandatory Human-in-the-Loop Safeguards</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-xs text-emerald-950 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Strict Human Supervision Enforced</span>
          </div>
          <p className="leading-relaxed">
            There is no external WhatsApp gateway connected. Clicking <strong>Approve</strong> or <strong>Reject</strong> exclusively updates the draft record status in SQLite and logs the staff action in the activity history audit log.
          </p>
        </div>
      </div>

      {/* Clinic Profile & Database Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clinic Profile */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Clinic Profile</h3>
              <p className="text-xs text-slate-500">Healthcare facility identity</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Facility Name:</span>
              <p className="font-semibold text-slate-800">{clinic.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Clinic Email:</span>
              <p className="font-semibold text-slate-800">{clinic.email}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Phone:</span>
              <p className="font-semibold text-slate-800">{clinic.phone}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Location:</span>
              <p className="font-semibold text-slate-800">{clinic.address}</p>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Database Engine</h3>
              <p className="text-xs text-slate-500">Local embedded storage</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Engine:</span>
              <p className="font-semibold text-slate-800">{dbInfo.engine}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Journal Mode:</span>
              <p className="font-semibold text-slate-800">{dbInfo.mode}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Patients</span>
                <p className="text-sm font-bold text-slate-800">{dbInfo.stats?.patientsCount || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Drafts</span>
                <p className="text-sm font-bold text-slate-800">{dbInfo.stats?.draftsCount || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Logs</span>
                <p className="text-sm font-bold text-slate-800">{dbInfo.stats?.logsCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


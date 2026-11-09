import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import PatientFormModal from './components/PatientFormModal';
import EditPatientModal from './components/EditPatientModal';
import PatientDetailsModal from './components/PatientDetailsModal';
import EditDraftModal from './components/EditDraftModal';

import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import DueFollowUps from './pages/DueFollowUps';
import AIDrafts from './pages/AIDrafts';
import ActivityHistory from './pages/ActivityHistory';
import Settings from './pages/Settings';

import api from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [duePatients, setDuePatients] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Dialogs State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'primary',
    requireReason: false,
    onConfirm: () => {},
  });
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
  };

  // Centralized data fetcher
  const refreshAllData = useCallback(async () => {
    try {
      const [statsRes, patientsRes, dueRes, draftsRes, logsRes, settingsRes] =
        await Promise.all([
          api.getDashboardStats().catch(() => ({ data: null })),
          api.getPatients().catch(() => ({ data: [] })),
          api.getDueTodayPatients().catch(() => ({ data: [] })),
          api.getDrafts().catch(() => ({ data: [] })),
          api.getActivityLogs().catch(() => ({ data: [] })),
          api.getSettings().catch(() => ({ data: null })),
        ]);

      if (statsRes.data) setStats(statsRes.data);
      if (patientsRes.data) setPatients(patientsRes.data);
      if (dueRes.data) setDuePatients(dueRes.data);
      if (draftsRes.data) setDrafts(draftsRes.data);
      if (logsRes.data) setActivityLogs(logsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (err) {
      console.error('Error refreshing data:', err);
      showToast('error', 'Fetch Error', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Actions
  const handleRegisterPatient = async (formData) => {
    const res = await api.createPatient(formData);
    showToast('success', 'Patient Registered', `Successfully added ${res.data.name}`);
    await refreshAllData();
  };

  const handleUpdatePatient = async (id, formData) => {
    const res = await api.updatePatient(id, formData);
    showToast('success', 'Patient Updated', `Updated details for ${res.data.name}`);
    await refreshAllData();
  };

  const handleCompleteFollowUp = (patient) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Complete Patient Follow-Up',
      message: `Mark scheduled follow-up as completed for ${patient.name}?`,
      confirmText: 'Mark Completed',
      confirmVariant: 'success',
      requireReason: false,
      onConfirm: async () => {
        try {
          await api.completeFollowUp(patient.id);
          showToast('success', 'Follow-Up Completed', `Marked ${patient.name} as completed.`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await refreshAllData();
        } catch (err) {
          showToast('error', 'Error', err.message);
        }
      },
    });
  };

  const handleGenerateDraft = async (patient) => {
    try {
      const res = await api.generateDrafts({ patient_id: patient.id, force: true });
      showToast(
        'success',
        'AI Draft Generated',
        `Follow-up draft ready for ${patient.name} (${res.data.ai_provider})`
      );
      await refreshAllData();
      setActiveTab('ai-drafts');
    } catch (err) {
      showToast('error', 'Generation Error', err.message);
    }
  };

  const handleBatchGenerateDrafts = async () => {
    try {
      const res = await api.generateDrafts({ force: false });
      showToast(
        'success',
        'Batch AI Automation Complete',
        res.message || 'Drafts generated for scheduled follow-ups.'
      );
      await refreshAllData();
      setActiveTab('ai-drafts');
    } catch (err) {
      showToast('error', 'Batch Generation Error', err.message);
    }
  };

  const handleEditDraftSubmit = async (draftId, message) => {
    await api.editDraft(draftId, message);
    showToast('success', 'Draft Updated', 'AI message draft updated successfully.');
    await refreshAllData();
  };

  const handleApproveDraft = (draft) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve AI Follow-Up Message',
      message: `Approve follow-up message draft for ${draft.patient_name}?`,
      confirmText: 'Approve Draft',
      confirmVariant: 'success',
      requireReason: false,
      onConfirm: async () => {
        try {
          const res = await api.approveDraft(draft.id);
          showToast(
            'success',
            'Draft Approved',
            res.humanVerificationNotice || 'Draft marked as approved in SQLite.'
          );
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await refreshAllData();
        } catch (err) {
          showToast('error', 'Approval Error', err.message);
        }
      },
    });
  };

  const handleRejectDraft = (draft) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject AI Follow-Up Message',
      message: `Reject follow-up message draft for ${draft.patient_name}?`,
      confirmText: 'Reject Draft',
      confirmVariant: 'danger',
      requireReason: true,
      reasonPlaceholder: 'Why is this draft being rejected (e.g., tone, clinical preference)?',
      onConfirm: async (reason) => {
        try {
          const res = await api.rejectDraft(draft.id, reason);
          showToast('info', 'Draft Rejected', res.message || 'Draft marked as rejected.');
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await refreshAllData();
        } catch (err) {
          showToast('error', 'Rejection Error', err.message);
        }
      },
    });
  };

  const handleViewPatientDetails = async (patientId) => {
    try {
      const res = await api.getPatientById(patientId);
      setViewingPatient(res.data);
    } catch (err) {
      showToast('error', 'Lookup Error', err.message);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Healthcare patient follow-up operations & AI supervision',
        };
      case 'patients':
        return {
          title: 'Patient Management',
          subtitle: 'Directory of registered clinic patients and follow-up schedules',
        };
      case 'due-followups':
        return {
          title: 'Due Follow-Ups',
          subtitle: `Patients requiring follow-up care today (${stats?.todayDate || 'Today'})`,
        };
      case 'ai-drafts':
        return {
          title: 'AI Message Drafts',
          subtitle: 'Human-in-the-Loop review and approval workflow for WhatsApp reminders',
        };
      case 'activity-history':
        return {
          title: 'Activity History',
          subtitle: 'Audit log of staff decisions, AI draft generations, and patient events',
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'AI configuration, supervision policy, and database engine parameters',
        };
      default:
        return { title: 'EPIA Healthcare', subtitle: '' };
    }
  };

  const pageInfo = getPageTitle();
  const dueCount = stats?.metrics?.dueToday ?? duePatients.length;
  const pendingDraftCount = stats?.metrics?.pendingDrafts ?? drafts.filter((d) => d.approval_status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dueCount={dueCount}
        pendingDraftCount={pendingDraftCount}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky App Header */}
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          todayDate={stats?.todayDate}
          aiStatus={stats?.aiStatus || settings?.ai}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              isLoading={isLoading}
              onRefresh={refreshAllData}
              onNavigate={setActiveTab}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onGenerateBatchDrafts={handleBatchGenerateDrafts}
              onCompletePatient={handleCompleteFollowUp}
              onApproveDraft={handleApproveDraft}
              onRejectDraft={handleRejectDraft}
              onEditDraft={setEditingDraft}
            />
          )}

          {activeTab === 'patients' && (
            <Patients
              patients={patients}
              isLoading={isLoading}
              onRefresh={refreshAllData}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onViewPatient={handleViewPatientDetails}
              onEditPatient={setEditingPatient}
              onCompleteFollowUp={handleCompleteFollowUp}
              onGenerateDraft={handleGenerateDraft}
            />
          )}

          {activeTab === 'due-followups' && (
            <DueFollowUps
              duePatients={duePatients}
              todayDate={stats?.todayDate || ''}
              isLoading={isLoading}
              onRefresh={refreshAllData}
              onGenerateDraft={handleGenerateDraft}
              onBatchGenerateDrafts={handleBatchGenerateDrafts}
              onCompleteFollowUp={handleCompleteFollowUp}
              onViewPatient={handleViewPatientDetails}
            />
          )}

          {activeTab === 'ai-drafts' && (
            <AIDrafts
              drafts={drafts}
              isLoading={isLoading}
              onRefresh={refreshAllData}
              onEditDraft={setEditingDraft}
              onApproveDraft={handleApproveDraft}
              onRejectDraft={handleRejectDraft}
              onViewPatient={handleViewPatientDetails}
              onBatchGenerate={handleBatchGenerateDrafts}
            />
          )}

          {activeTab === 'activity-history' && (
            <ActivityHistory
              logs={activityLogs}
              isLoading={isLoading}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              settings={settings}
              isLoading={isLoading}
              onResetSeed={refreshAllData}
            />
          )}
        </main>
      </div>

      {/* Patient Registration Modal */}
      <PatientFormModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterPatient}
        todayDate={stats?.todayDate}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={Boolean(editingPatient)}
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onSubmit={handleUpdatePatient}
      />

      {/* Patient Details View Modal */}
      <PatientDetailsModal
        isOpen={Boolean(viewingPatient)}
        patient={viewingPatient}
        onClose={() => setViewingPatient(null)}
        onComplete={(p) => {
          setViewingPatient(null);
          handleCompleteFollowUp(p);
        }}
        onGenerateDraft={(p) => {
          setViewingPatient(null);
          handleGenerateDraft(p);
        }}
      />

      {/* Edit AI Draft Modal */}
      <EditDraftModal
        isOpen={Boolean(editingDraft)}
        draft={editingDraft}
        onClose={() => setEditingDraft(null)}
        onSubmit={handleEditDraftSubmit}
      />

      {/* Human Supervision Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmVariant={confirmDialog.confirmVariant}
        requireReason={confirmDialog.requireReason}
        reasonPlaceholder={confirmDialog.reasonPlaceholder}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Global Notifications Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

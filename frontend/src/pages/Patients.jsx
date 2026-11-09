import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Eye,
  Edit2,
  UserPlus,
  RefreshCw,
  Phone
} from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Patients({
  patients,
  isLoading,
  onRefresh,
  onOpenRegisterModal,
  onViewPatient,
  onEditPatient,
  onCompleteFollowUp,
  onGenerateDraft,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Filter logic on the client side for instantaneous snappy search
  const filteredPatients = patients.filter((patient) => {
    // Search match: name or phone
    const matchesSearch =
      searchTerm.trim() === '' ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    // Status match
    const matchesStatus =
      statusFilter === 'all' || patient.follow_up_status === statusFilter;

    // Date match
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === 'today') {
        matchesDate = patient.next_follow_up_date === today;
      } else if (dateFilter === 'upcoming') {
        matchesDate = patient.next_follow_up_date > today;
      } else if (dateFilter === 'past') {
        matchesDate = patient.next_follow_up_date < today;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name or phone number..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Selectors and Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Follow-Up</option>
            <option value="completed">Completed Follow-Up</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Dates</option>
            <option value="today">Due Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past Due</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Register Patient Button */}
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Patient Registry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredPatients.length} of {patients.length} registered patients
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Fetching patient directory..." />
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No patients match your current search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Patient Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Consultation Date</th>
                  <th className="py-3.5 px-4">Next Follow-Up</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered On</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-400">ID: #{p.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{p.phone}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.consultation_date}</td>
                    <td className="py-3.5 px-4 font-semibold text-brand-700">
                      {p.next_follow_up_date}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.follow_up_status === 'completed' ? 'completed' : 'pending'}>
                        {p.follow_up_status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.follow_up_status === 'pending' && (
                          <button
                            onClick={() => onCompleteFollowUp(p)}
                            title="Mark follow-up completed"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onGenerateDraft(p)}
                          title="Generate AI WhatsApp draft"
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditPatient(p)}
                          title="Edit patient details"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewPatient(p.id)}
                          title="View patient history"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


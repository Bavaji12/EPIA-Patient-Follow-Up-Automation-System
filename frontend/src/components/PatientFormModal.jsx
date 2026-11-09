import React, { useState } from 'react';
import { X, User, Phone, Calendar, AlertCircle } from 'lucide-react';

export default function PatientFormModal({ isOpen, onClose, onSubmit, todayDate }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    consultation_date: todayDate || '',
    next_follow_up_date: todayDate || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};

    // Name validation
    if (!formData.name.trim()) {
      errs.name = 'Patient name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Patient name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s\.\-']+$/.test(formData.name.trim())) {
      errs.name = 'Name contains invalid characters (letters only).';
    }

    // Phone validation
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      errs.phone = 'Please enter a valid phone number (7-15 digits).';
    }

    // Consultation Date
    if (!formData.consultation_date) {
      errs.consultation_date = 'Consultation date is required.';
    }

    // Next Follow-Up Date
    if (!formData.next_follow_up_date) {
      errs.next_follow_up_date = 'Next follow-up date is required.';
    } else if (
      formData.consultation_date &&
      formData.next_follow_up_date < formData.consultation_date
    ) {
      errs.next_follow_up_date = 'Follow-up date cannot be earlier than consultation date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        phone: '',
        consultation_date: todayDate || '',
        next_follow_up_date: todayDate || '',
      });
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({ global: err.message || 'Failed to register patient.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Register New Patient</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter patient consultation and follow-up details
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.global && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.global}</span>
            </div>
          )}

          {/* Patient Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Maya Sharma"
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-xl border transition-all ${
                  errors.name
                    ? 'border-rose-300 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210 or 555-0199"
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-xl border transition-all ${
                  errors.phone
                    ? 'border-rose-300 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                }`}
              />
            </div>
            {errors.phone ? (
              <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.phone}</p>
            ) : (
              <p className="text-slate-400 text-[11px] mt-1">
                Used for personalized WhatsApp draft reminders (never automatically messaged).
              </p>
            )}
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Consultation Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Consultation Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="consultation_date"
                  value={formData.consultation_date}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 text-sm rounded-xl border transition-all ${
                    errors.consultation_date
                      ? 'border-rose-300 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                  }`}
                />
              </div>
              {errors.consultation_date && (
                <p className="text-rose-600 text-[11px] mt-1 font-medium">
                  {errors.consultation_date}
                </p>
              )}
            </div>

            {/* Next Follow-Up Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Next Follow-Up Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="next_follow_up_date"
                  value={formData.next_follow_up_date}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 text-sm rounded-xl border transition-all ${
                    errors.next_follow_up_date
                      ? 'border-rose-300 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                  }`}
                />
              </div>
              {errors.next_follow_up_date && (
                <p className="text-rose-600 text-[11px] mt-1 font-medium">
                  {errors.next_follow_up_date}
                </p>
              )}
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="pt-2 flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  consultation_date: todayDate,
                  next_follow_up_date: todayDate,
                }));
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              Due Today
            </button>
            <button
              type="button"
              onClick={() => {
                if (!todayDate) return;
                const [y, m, d] = todayDate.split('-').map(Number);
                const nextDate = new Date(y, m - 1, d + 3);
                const str = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
                setFormData((prev) => ({
                  ...prev,
                  consultation_date: todayDate,
                  next_follow_up_date: str,
                }));
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              In 3 Days
            </button>
            <button
              type="button"
              onClick={() => {
                if (!todayDate) return;
                const [y, m, d] = todayDate.split('-').map(Number);
                const nextDate = new Date(y, m - 1, d + 7);
                const str = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
                setFormData((prev) => ({
                  ...prev,
                  consultation_date: todayDate,
                  next_follow_up_date: str,
                }));
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              In 1 Week
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>Register Patient</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


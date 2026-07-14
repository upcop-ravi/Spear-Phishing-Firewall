import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function CreateUserModal({ isOpen, onClose, userRole }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    thana_name: '',
    cug_mobile: '',
    role: 'thana_user'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const allowedRoles = userRole === 'super_admin'
    ? [{ value: 'thana_user', label: 'Police Officer (Thana)' }, { value: 'admin', label: 'Administrator' }, { value: 'super_admin', label: 'Super Admin' }]
    : [{ value: 'thana_user', label: 'Police Officer (Thana)' }];

  const handleChange = (field, value) => {
    if (field === 'cug_mobile') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.email || !formData.password || !formData.thana_name) {
      setError('Email, password, and thana/unit name are required.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (formData.cug_mobile && formData.cug_mobile.length !== 10) {
      setError('CUG Mobile number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/admin/create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned HTML/Non-JSON response. Status: ${res.status}.`);
      }

      const data = await res.json();

      if (data.success) {
        // Save credentials locally for fallback login to bypass Supabase rate limits on localhost
        try {
          const localCreds = JSON.parse(localStorage.getItem('local_credentials') || '{}');
          localCreds[formData.email.toLowerCase()] = formData.password;
          localStorage.setItem('local_credentials', JSON.stringify(localCreds));
        } catch (e) {
          console.warn('Failed to store local credentials:', e);
        }

        setSuccess(`User "${formData.email}" created successfully as ${formData.role}!`);
        setFormData({ email: '', password: '', thana_name: '', cug_mobile: '', role: 'thana_user' });
      } else {
        throw new Error(data.error || 'Failed to create user.');
      }
    } catch (err) {
      console.error('Create user error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Create New User</h3>
                <p className="text-xs font-semibold text-indigo-200">Register a new officer in the system</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="sho-name@up.gov.in"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              required
              minLength={6}
            />
          </div>

          {/* Thana Name & Mobile — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thana / Unit Name *</label>
              <input
                type="text"
                value={formData.thana_name}
                onChange={(e) => handleChange('thana_name', e.target.value)}
                placeholder="e.g. Kotwali Nagar"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CUG Mobile</label>
              <input
                type="text"
                value={formData.cug_mobile}
                onChange={(e) => handleChange('cug_mobile', e.target.value)}
                placeholder="10 digits"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                maxLength={10}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assign Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer appearance-none"
            >
              {allowedRoles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-bold">{success}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating User...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create User Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

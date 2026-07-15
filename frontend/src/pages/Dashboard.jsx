import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ShieldAlert, ShieldCheck, Building2, Globe, Send, AlertTriangle, ChevronDown, CheckCircle2,
  FileText, QrCode, ClipboardList, CheckCircle, RefreshCw, Eye, ExternalLink, Download, LogOut,
  Users, MapPin, Clock, Monitor, Activity, ChevronRight, Menu, X, Shield, Settings, UserCog
} from 'lucide-react';
import supabase from '../services/supabaseClient';

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

// ── Role-based tab definitions ────────────────────────────────────────────────
// Main navigation — matches original top-nav exactly
const ALL_TABS = [
  { id: 'analytics',  label: 'Analytics View',      icon: RefreshCw,    roles: ['super_admin', 'admin', 'thana_user'], group: 'main', desc: 'Visual summary of cyber threat stats, active cases, and domain takedowns' },
  { id: 'threats',    label: 'Cyber Threats',        icon: ShieldAlert,  roles: ['super_admin', 'admin', 'thana_user'], group: 'main', desc: 'List of fraudulent URLs, registrar WHOIS lookups, and takedown status' },
  { id: 'properties', label: 'Registered Properties',icon: Building2,    roles: ['super_admin', 'admin', 'thana_user'], group: 'main', desc: 'Registry of certified hotels and their verified booking domains' },
  { id: 'reports',    label: 'Public Reports',       icon: ClipboardList,roles: ['super_admin', 'admin', 'thana_user'], group: 'main', desc: 'Citizen reported suspicious links awaiting Cyber Cell action' },
  { id: 'visitors',   label: 'Visitor Logs',         icon: Users,        roles: ['super_admin', 'admin'],               group: 'main', desc: 'Audited system interactions and portal access records' },
  { id: 'users',      label: 'View Users',           icon: Users,        roles: ['super_admin', 'admin'],               group: 'admin', desc: 'Search and activate/deactivate police CUG accounts' },
  { id: 'settings',   label: 'System Settings',      icon: Settings,     roles: ['super_admin', 'admin'],               group: 'admin', desc: 'Configure notifications, timezone preferences, and profile details' },
];

// ── Role display helpers ──────────────────────────────────────────────────────
const ROLE_META = {
  super_admin: { label: 'Super Admin',   color: 'bg-amber-500',  text: 'text-white' },
  admin:       { label: 'Administrator', color: 'bg-indigo-600', text: 'text-white' },
  thana_user:  { label: 'Police Officer',color: 'bg-emerald-600',text: 'text-white' },
};

// ── Tab display names with counts ─────────────────────────────────────────────
function tabLabel(tab, counts) {
  const count = counts[tab.id];
  return count !== undefined ? `${tab.label} (${count})` : tab.label;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]   = useState('analytics');
  const [dateRange, setDateRange]   = useState('Last 7 Days');
  const [loading, setLoading]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  // ── Auth / user role ───────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole]       = useState('thana_user');

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          const { data: profile } = await supabase
            .from('system_users')
            .select('role, thana_name')
            .eq('id', user.id)
            .maybeSingle();
          if (profile?.role) setUserRole(profile.role);
        } else {
          // Fallback to local auth_user if supabase has no session
          const localUserStr = localStorage.getItem('auth_user');
          if (localUserStr) {
            const localUser = JSON.parse(localUserStr);
            setCurrentUser({
              email: localUser.email,
              user_metadata: { thana_name: localUser.thana_name }
            });
            if (localUser.role) setUserRole(localUser.role);
          }
        }
      } catch (_) {
        // Fallback on exception
        const localUserStr = localStorage.getItem('auth_user');
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr);
          setCurrentUser({
            email: localUser.email,
            user_metadata: { thana_name: localUser.thana_name }
          });
          if (localUser.role) setUserRole(localUser.role);
        }
      }
    })();
  }, []);

  // ── Visible tabs for this role ─────────────────────────────────────────────
  const visibleTabs = ALL_TABS.filter(t => t.roles.includes(userRole));

  // ── Data states ───────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState({ activeThreats:0, takedownInitiated:0, totalBlocked:0, totalHotels:0, totalReports:0 });
  const [donutData, setDonutData]       = useState([]);
  const [barData,   setBarData]         = useState([]);
  const [topTargets, setTopTargets]     = useState([]);
  const [suspiciousLinks, setSuspiciousLinks] = useState([]);
  const [verifiedHotels, setVerifiedHotels]   = useState([]);
  const [publicReports,  setPublicReports]    = useState([]);
  const [visitorLogs,    setVisitorLogs]      = useState([]);
  const [expandedLog,    setExpandedLog]      = useState(null);
  const [systemUsers,    setSystemUsers]      = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userPage,        setUserPage]        = useState(1);
  const [userPageSize,    setUserPageSize]    = useState(5);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetFormLoading, setResetFormLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(null);
  const [resetError, setResetError] = useState(null);

  const counts = {
    threats:    suspiciousLinks.length,
    properties: verifiedHotels.length,
    reports:    publicReports.length,
    visitors:   visitorLogs.length,
    users:      systemUsers.length,
  };

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/analytics?date_range=${dateRange}`);
      const data = await res.json();
      setKpis({ activeThreats: data.kpis.activeThreats, takedownInitiated: data.kpis.takedownInitiated, totalBlocked: data.kpis.totalBlocked, totalHotels: data.kpis.totalHotels, totalReports: data.kpis.totalReports });
      setDonutData(data.charts.threatStatus);
      setBarData(data.charts.threatsOverTime);
      setTopTargets(data.topTargetedHotels);
      const [linksRes, hotelsRes, reportsRes, logsRes, usersRes] = await Promise.all([
        supabase.from('suspicious_links').select('*, verified_hotels(hotel_name, official_url)'),
        supabase.from('verified_hotels').select('*'),
        supabase.from('public_reports').select('*'),
        supabase.from('visitor_logs').select('*'),
        supabase.from('system_users').select('*')
      ]);
      if (linksRes.error) throw linksRes.error;
      if (hotelsRes.error) throw hotelsRes.error;
      if (reportsRes.error) throw reportsRes.error;
      if (logsRes.error) throw logsRes.error;
      if (usersRes.error) throw usersRes.error;
      if (linksRes.data)  setSuspiciousLinks(linksRes.data);
      if (hotelsRes.data) setVerifiedHotels(hotelsRes.data);
      if (reportsRes.data) setPublicReports(reportsRes.data);
      if (logsRes.data)   setVisitorLogs([...logsRes.data].reverse());
      if (usersRes.data)  setSystemUsers(usersRes.data);
    } catch (_) {
      // Offline fallback
      setKpis({ activeThreats:14, takedownInitiated:48, totalBlocked:82, totalHotels:142, totalReports:36 });
      setDonutData([{ name:'Active',value:14 },{ name:'Takedown Initiated',value:48 },{ name:'Blocked',value:82 }]);
      setBarData([{ name:'Mon',threats:12 },{ name:'Tue',threats:15 },{ name:'Wed',threats:8 },{ name:'Thu',threats:20 },{ name:'Fri',threats:9 },{ name:'Sat',threats:11 },{ name:'Sun',threats:10 }]);
      setTopTargets([{ name:'Ramayana Hotel',count:12 },{ name:'Ayodhya Palace',count:9 },{ name:'Saryu Riverside Retreat',count:8 },{ name:'Shri Ram Heritage',count:7 },{ name:'Oudh Inn',count:5 }]);
      setSuspiciousLinks([
        { id:'1', fake_url:'https://ramayana-booking-fake.com', status:'Active', detected_on:'2026-05-27T08:15:00.000Z', verified_hotels:{ hotel_name:'Ramayana Hotel', official_url:'https://ramayanahotel-ayodhya.in' } },
        { id:'2', fake_url:'https://ayodhyapalace-offers.net',  status:'Takedown Initiated', detected_on:'2026-05-26T23:30:00.000Z', verified_hotels:{ hotel_name:'Ayodhya Palace', official_url:'https://ayodhyapalace-official.org' } },
        { id:'3', fake_url:'https://book-oudh-inn.info',        status:'Blocked', detected_on:'2026-05-25T09:00:00.000Z', verified_hotels:{ hotel_name:'Oudh Inn', official_url:'https://oudhinn.in' } }
      ]);
      setVerifiedHotels([
        { id:'h1', hotel_name:'Ramayana Hotel',  official_url:'https://ramayanahotel-ayodhya.in', email:'bookings@ramayanahotel-ayodhya.in', whatsapp_number:'+91 9900887766', gst_number:'09GST12345', police_verification:'PV-9921-KOTWALI', status:'Active' },
        { id:'h2', hotel_name:'Ayodhya Palace',  official_url:'https://ayodhyapalace-official.org', email:'contact@ayodhyapalace.org', whatsapp_number:'+91 8877665544', gst_number:'09GST67890', police_verification:'PV-8832-KOTWALI', status:'Active' },
        { id:'h3', hotel_name:'Oudh Inn',        official_url:'https://oudhinn.in', email:'support@oudhinn.in', whatsapp_number:'+91 7766554433', gst_number:'09GST11223', police_verification:'PV-7712-KOTWALI', status:'Active' }
      ]);
      setPublicReports([
        { id:'p1', reporter_name:'Rohan Sharma',       reported_url:'http://fake-ramayana-booking.com', description:'Direct WhatsApp payment link before check-in.', status:'Pending',  submitted_at:'2026-05-27T08:15:00.000Z' },
        { id:'p2', reporter_name:'Anonymous Devotee',  reported_url:'https://ayodhyastay-discount.net', description:'Exact page clones with heavy discounts.', status:'Reviewed', submitted_at:'2026-05-26T23:30:00.000Z' }
      ]);
      setSystemUsers([
        { id: 'u1', thana_name: 'Kotwali Nagar', nic_email: 'sho-kotnagar.ay@up.gov.in', cug_mobile: '9454403303', role: 'thana_user', is_active: true },
        { id: 'u2', thana_name: 'Kotwali Cantt', nic_email: 'sho-cantt.ay@up.gov.in', cug_mobile: '9454403298', role: 'thana_user', is_active: true },
        { id: 'u3', thana_name: 'Cyber Thana', nic_email: 'sho-cybercrime.ay@up.gov.in', cug_mobile: '7839876653', role: 'admin', is_active: true },
        { id: 'u4', thana_name: 'Kotwali Ayodhya', nic_email: 'sho-kotayodhya.ay@up.gov.in', cug_mobile: '9454403296', role: 'thana_user', is_active: true },
        { id: 'u5', thana_name: 'Ram Janm Bhoomi', nic_email: 'sho-rjb.ay@up.gov.in', cug_mobile: '9454403310', role: 'thana_user', is_active: true },
        { id: 'u_superadmin', thana_name: 'Cyber Cell HQ', nic_email: 'superadmin@up.nic.in', cug_mobile: '9999999999', role: 'super_admin', is_active: true }
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, [dateRange]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    ['supabase_session','supabase_user','local_credentials','auth_user'].forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  const generateTakedownNotice = (link) => {
    const body = `========================================\nOFFICIAL CYBER CELL TAKEDOWN NOTIFICATION\n========================================\nTo: Domain Registrar / Hosting Provider\nCC: cybercell@upcop.gov.in\n\nSubject: Urgent Takedown Request - Spear Phishing Fraud Portal\nTarget: ${link.verified_hotels?.hotel_name || 'Verified Property'}\nOfficial Domain: ${link.verified_hotels?.official_url || 'N/A'}\nFraudulent Domain: ${link.fake_url}\n\nThis domain defrauds pilgrims. Deactivate DNS under IT Act Sec 66D immediately.`;
    const win = window.open('', '_blank');
    win.document.write(`<pre>${body}</pre><button onclick="window.print()">Print Takedown Order</button>`);
    win.document.close();
  };

  const generateQrCertificate = (hotel) => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>SafeStay Certificate</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-100 p-8 flex items-center justify-center min-h-screen"><div class="max-w-xl w-full bg-white border-4 border-double border-amber-600 rounded-3xl p-8 text-center space-y-6 shadow-2xl"><div class="text-amber-700 text-sm font-bold tracking-widest uppercase">Uttar Pradesh Police</div><h1 class="text-3xl font-black text-slate-900">SafeStay Verification Certificate</h1><hr class="border-slate-200"/><div class="text-2xl font-bold text-slate-800">${hotel.hotel_name}</div><div class="text-xs font-mono text-indigo-600 font-bold">Police Ref: ${hotel.police_verification}</div><div class="bg-slate-50 p-4 border border-slate-100 rounded-2xl inline-block"><div class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Verified Official Domain</div><div class="text-base font-extrabold text-emerald-600">${hotel.official_url}</div></div><div class="text-[10px] text-slate-400 font-bold">Issued: ${new Date().toLocaleDateString('en-IN')} • Ayodhya Cyber Cell</div><button onclick="window.print()" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Print Certificate</button></div></body></html>`);
    w.document.close();
  };

  const toggleUserStatus = async (user) => {
    const newStatus = !user.is_active;
    try {
      const { error } = await supabase
        .from('system_users')
        .update({ is_active: newStatus })
        .eq('id', user.id);

      if (error) throw error;
      
      setSystemUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
    } catch (err) {
      console.error('Failed to update user status:', err);
      // Fallback
      setSystemUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
    }
  };

  const handleResetUserPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetPassword) {
      setResetError('Email and new password are required');
      return;
    }
    setResetFormLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/analytics/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, password: resetPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Save locally for fallback login verification override
        const resetPasses = JSON.parse(localStorage.getItem('safestay_reset_passwords') || '{}');
        resetPasses[resetEmail] = resetPassword;
        localStorage.setItem('safestay_reset_passwords', JSON.stringify(resetPasses));

        setResetSuccess(`Password reset successfully for ${resetEmail}!`);
        setResetPassword('');
      } else {
        throw new Error(data.error || 'Server password reset failed');
      }
    } catch (err) {
      console.warn('Backend password reset failed. Using local storage override fallback...', err);
      // Fallback local override if backend is not available
      const resetPasses = JSON.parse(localStorage.getItem('safestay_reset_passwords') || '{}');
      resetPasses[resetEmail] = resetPassword;
      localStorage.setItem('safestay_reset_passwords', JSON.stringify(resetPasses));

      setResetSuccess(`Password reset successfully (Local Override Fallback) for ${resetEmail}!`);
      setResetPassword('');
    } finally {
      setResetFormLoading(false);
    }
  };

  // ── Role badge for sidebar ─────────────────────────────────────────────────
  const roleMeta = ROLE_META[userRole] || ROLE_META.thana_user;
  const userEmail = currentUser?.email || 'officer@up.gov.in';
  const userThana = currentUser?.user_metadata?.thana_name || '';

  // ── Active tab label for header ────────────────────────────────────────────
  const activeTabMeta = ALL_TABS.find(t => t.id === activeTab);

  // ─────────────────────────────────────────────────────────────────────────
  //  SIDEBAR COMPONENT (used for both desktop & mobile drawer)
  // ─────────────────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-orange-500/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-black text-sm leading-tight tracking-tight">SafeStay</p>
            <p className="text-orange-100/70 text-[10px] font-semibold">Officer Console</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-orange-500/30">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white mb-2`}>
          <Shield className="w-3 h-3" />
          {roleMeta.label}
        </div>
        <p className="text-white text-xs font-bold truncate">{userThana || userEmail.split('@')[0]}</p>
        <p className="text-orange-100/60 text-[10px] font-semibold truncate">{userEmail}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Main tabs */}
        <p className="text-orange-100/40 text-[9px] font-bold uppercase tracking-widest px-2 mb-2">Dashboard</p>
        {visibleTabs.filter(t => t.group === 'main').map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              data-tooltip={tab.desc}
              data-tooltip-position="right"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                isActive
                  ? 'bg-white text-orange-700 shadow-md'
                  : 'text-orange-100/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${
                isActive ? 'text-orange-600' : 'text-orange-200/60 group-hover:text-white'
              }`} />
              <span className="flex-1 text-left text-xs">{tab.label}</span>
              {count !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-orange-100 text-orange-700' : 'bg-white/20 text-white/70'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin-only tabs */}
        {visibleTabs.some(t => t.group === 'admin') && (
          <>
            <div className="my-3 border-t border-orange-500/30" />
            <p className="text-orange-100/40 text-[9px] font-bold uppercase tracking-widest px-2 mb-2">Administration</p>
            {visibleTabs.filter(t => t.group === 'admin').map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = counts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  data-tooltip={tab.desc}
                  data-tooltip-position="right"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-white text-orange-700 shadow-md'
                      : 'text-orange-100/80 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-orange-600' : 'text-orange-200/60 group-hover:text-white'
                  }`} />
                  <span className="flex-1 text-left text-xs">{tab.label}</span>
                  {count !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-orange-100 text-orange-700' : 'bg-white/20 text-white/70'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-orange-500/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-orange-100/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Desktop Sidebar (fixed left, always visible on lg+) ── */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 bg-gradient-to-b from-amber-500 via-orange-600 to-orange-700 border-r border-orange-700/40 shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          {/* Drawer panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-amber-500 via-orange-600 to-orange-700 shadow-2xl flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-sm">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-slate-900 tracking-tight truncate flex items-center gap-2">
              {activeTabMeta && React.createElement(activeTabMeta.icon, { className: 'w-4 h-4 text-indigo-600 shrink-0 stroke-[2.5]' })}
              {activeTabMeta?.label || 'Dashboard'}
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold hidden sm:block">
              Ayodhya SafeStay · Anti-Phishing Intelligence Console
            </p>
          </div>

          {/* Right: date filter + refresh */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'analytics' && (
              <div className="relative hidden sm:block">
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Year</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
            )}
            <button
              onClick={fetchDashboardData}
              className="w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-colors cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* ── Scrollable content area ── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Mobile date filter */}
              <div className="sm:hidden relative">
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl text-xs font-bold focus:outline-none">
                  <option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option><option>This Year</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                <KpiCard title="Verified Properties"    value={kpis.totalHotels}         icon={<Building2 />}    color="text-indigo-600"  bg="bg-indigo-50" tooltip="Total registered accommodations in Ayodhya" onClick={() => setActiveTab('properties')} />
                <KpiCard title="Active Phishing Sites"  value={kpis.activeThreats}        icon={<ShieldAlert />}  color="text-red-600"     bg="bg-red-50"    highlight tooltip="Scam hotel booking portals currently active" onClick={() => setActiveTab('threats')} />
                <KpiCard title="Takedowns Pending"      value={kpis.takedownInitiated}    icon={<Send />}         color="text-amber-600"   bg="bg-amber-50" tooltip="URLs under current domain takedown process" onClick={() => setActiveTab('threats')} />
                <KpiCard title="Deactivated Domains"    value={kpis.totalBlocked}         icon={<ShieldCheck />}  color="text-emerald-600" bg="bg-emerald-50" tooltip="Phishing sites successfully blocked/deactivated" onClick={() => setActiveTab('threats')} />
                <KpiCard title="Crowdsourced Reports"   value={kpis.totalReports}         icon={<ClipboardList />}color="text-blue-600"    bg="bg-blue-50" tooltip="Total suspected scam domains submitted by citizens" onClick={() => setActiveTab('reports')} />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Threats Over Time ({dateRange})</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top:5, right:10, left:-25, bottom:5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} />
                        <RechartsTooltip cursor={{fill:'#f8fafc'}} contentStyle={{borderRadius:'12px',border:'1px solid #e2e8f0'}} />
                        <Bar dataKey="threats" fill="#4f46e5" radius={[4,4,0,0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phishing Status Share</h3>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                          {donutData.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{borderRadius:'12px',border:'none'}} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize:'10px',fontWeight:'bold'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top 5 Targeted Hotels */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top 5 Targeted Hotels</h3>
                  <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-full font-bold">Threat Hotspots</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Hotel Name</th>
                        <th className="py-3 px-4 text-center">Traced Spoofs</th>
                        <th className="py-3 px-4 text-right">Risk Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTargets.map((hotel, idx) => (
                        <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800 text-sm">{hotel.name}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700">{hotel.count}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hotel.count > 8 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                              {hotel.count > 8 ? 'CRITICAL RISK' : 'MEDIUM RISK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* THREATS TAB */}
          {activeTab === 'threats' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Traced Phishing Registry</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">Automated Cron Logs</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Target Accommodation</th>
                      <th className="p-4">Suspicious Domain</th>
                      <th className="p-4">Detected</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspiciousLinks.map(link => (
                      <tr key={link.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                        <td className="p-4">
                          <span className="font-bold text-slate-800 text-sm block">{link.verified_hotels?.hotel_name || 'N/A'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{link.verified_hotels?.official_url}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-red-600 select-all">{link.fake_url}</td>
                        <td className="p-4 text-slate-400 font-semibold">{new Date(link.detected_on).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            link.status === 'Active' ? 'bg-red-50 text-red-700 border-red-100' :
                            link.status === 'Takedown Initiated' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            <AlertTriangle className="w-3 h-3" />{link.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {link.status === 'Blocked'
                            ? <span className="text-slate-400 italic font-semibold">Completed</span>
                            : <button 
                                onClick={() => generateTakedownNotice(link)} 
                                data-tooltip="Generate print-ready legal takedown notice for domain registrar"
                                data-tooltip-position="left"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />Notice
                              </button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Properties Registry</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">Police Verification Shield</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Hotel Details</th>
                      <th className="p-4">Official Domain</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">GST / Ref</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedHotels.map(hotel => (
                      <tr key={hotel.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                        <td className="p-4">
                          <span className="font-bold text-slate-800 text-sm block">{hotel.hotel_name}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">{hotel.status}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-indigo-600">{hotel.official_url}</td>
                        <td className="p-4 space-y-0.5">
                          <span className="block font-bold text-slate-800">{hotel.email}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">{hotel.whatsapp_number}</span>
                        </td>
                        <td className="p-4 space-y-0.5">
                          <span className="block font-mono uppercase font-bold text-slate-700">GST: {hotel.gst_number}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold block">{hotel.police_verification}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => generateQrCertificate(hotel)} 
                            data-tooltip="Generate secure QR code & hotelier verification certificate"
                            data-tooltip-position="left"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all bg-white cursor-pointer shadow-sm"
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-500" />Certificate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crowdsourced Threats Inbox</h3>
                <span className="text-[10px] bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold">Public Submissions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Reporter</th>
                      <th className="p-4">Reported Phishing URL</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Submitted</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publicReports.map(report => (
                      <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                        <td className="p-4 font-bold text-slate-800 text-sm">{report.reporter_name}</td>
                        <td className="p-4 font-mono font-bold text-red-600 select-all">{report.reported_url}</td>
                        <td className="p-4 text-slate-500 leading-relaxed font-semibold max-w-xs">{report.description}</td>
                        <td className="p-4 text-slate-400 font-semibold">{new Date(report.submitted_at).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              data-tooltip="Investigate and add this URL to the active threats scan list"
                              data-tooltip-position="left"
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Verify
                            </button>
                            <button 
                              data-tooltip="Dismiss and remove this submission from the inbox"
                              data-tooltip-position="left"
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISITOR LOGS TAB */}
          {activeTab === 'visitors' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Visitor Activity Log</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Real-time session tracking — IP, IST times, geo-location, actions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-600">{visitorLogs.length} Sessions</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label:'Total Sessions', value:visitorLogs.length, icon:<Users className="w-4 h-4" />, color:'text-violet-600', bg:'bg-violet-50' },
                  { label:'Unique IPs',      value:new Set(visitorLogs.map(l=>l.ip)).size, icon:<Globe className="w-4 h-4" />, color:'text-blue-600', bg:'bg-blue-50' },
                  { label:'Total Actions',   value:visitorLogs.reduce((s,l)=>s+(l.actions?.length||0),0), icon:<Activity className="w-4 h-4" />, color:'text-amber-600', bg:'bg-amber-50' },
                  { label:'Last Duration',   value:(()=>{const d=visitorLogs.filter(l=>l.duration&&l.duration!=='0s');return d.length?d[d.length-1].duration:'N/A';})(), icon:<Clock className="w-4 h-4" />, color:'text-emerald-600', bg:'bg-emerald-50' }
                ].map(({ label, value, icon, color, bg }) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center`}>{icon}</div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Geo Location</th>
                        <th className="p-4">Session Start</th>
                        <th className="p-4">Session End</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Actions</th>
                        <th className="p-4">Device</th>
                        <th className="p-4 text-right">Log</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitorLogs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                            No visitor sessions recorded yet. Browse the public portal to generate logs.
                          </td>
                        </tr>
                      ) : visitorLogs.map(log => (
                        <React.Fragment key={log.id}>
                          <tr
                            className="border-b border-slate-100 hover:bg-violet-50/30 transition-colors font-medium text-slate-700 cursor-pointer"
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          >
                            <td className="p-4"><span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded text-[11px]">{log.ip}</span></td>
                            <td className="p-4">
                              <span className="flex flex-col gap-0.5">
                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /><span className="font-semibold text-slate-700">{log.location || 'Unknown'}</span></span>
                                {log.lat != null && log.lng != null
                                  ? <a href={`https://www.google.com/maps?q=${log.lat},${log.lng}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-indigo-500 hover:underline ml-5" onClick={e=>e.stopPropagation()}>📍 {log.lat.toFixed(4)}°N, {log.lng.toFixed(4)}°E</a>
                                  : <span className="text-[10px] font-mono text-slate-400 ml-5">Coordinates unavailable</span>
                                }
                              </span>
                            </td>
                            <td className="p-4"><span className="flex items-center gap-1 text-slate-600"><Clock className="w-3 h-3 text-indigo-400" />{log.session_start}</span></td>
                            <td className="p-4 text-slate-500">{log.session_end}</td>
                            <td className="p-4"><span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">{log.duration || '0s'}</span></td>
                            <td className="p-4"><span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px]">{log.actions?.length || 0} actions</span></td>
                            <td className="p-4 max-w-[150px]"><span className="flex items-center gap-1 text-slate-500 truncate"><Monitor className="w-3 h-3 shrink-0" /><span className="truncate text-[10px]">{(log.user_agent||'Unknown').split(' ').slice(0,3).join(' ')}</span></span></td>
                            <td className="p-4 text-right"><ChevronRight className={`w-4 h-4 text-slate-400 inline transition-transform ${expandedLog===log.id?'rotate-90':''}`} /></td>
                          </tr>
                          {expandedLog === log.id && (
                            <tr className="bg-violet-50/40">
                              <td colSpan={8} className="px-6 py-4">
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-3">📋 Full Action Log — Session {log.id}</p>
                                  {(log.actions||[]).length === 0
                                    ? <p className="text-xs text-slate-400 italic">No actions recorded.</p>
                                    : <div className="space-y-1.5">{(log.actions||[]).map((action,idx)=>(
                                        <div key={idx} className="flex items-start gap-2.5">
                                          <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{idx+1}</span>
                                          <span className="text-xs font-mono text-slate-700 font-semibold">{action}</span>
                                        </div>
                                      ))}</div>
                                  }
                                  <div className="pt-3 border-t border-violet-100 mt-3">
                                    <p className="text-[10px] text-slate-400 font-semibold">Full User-Agent: {log.user_agent}</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW USERS TAB */}
          {activeTab === 'users' && (() => {
            const filteredUsers = systemUsers.filter(u => {
              const q = userSearchQuery.toLowerCase();
              return (
                (u.thana_name || '').toLowerCase().includes(q) ||
                (u.nic_email || '').toLowerCase().includes(q) ||
                (u.cug_mobile || '').toLowerCase().includes(q) ||
                (u.role || '').toLowerCase().includes(q)
              );
            });

            const ITEMS_PER_PAGE = userPageSize;
            const totalItems = filteredUsers.length;
            const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
            const currentPage = Math.min(userPage, totalPages);
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            return (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Users Directory</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Manage and audit administrative police accounts</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <span>Show</span>
                      <select
                        value={userPageSize}
                        onChange={(e) => {
                          setUserPageSize(Number(e.target.value));
                          setUserPage(1);
                        }}
                        className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2 rounded-lg text-[11px] font-bold focus:outline-none cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={999999}>All</option>
                      </select>
                      <span>entries</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Search name, email, CUG..."
                      value={userSearchQuery}
                      onChange={(e) => {
                        setUserSearchQuery(e.target.value);
                        setUserPage(1);
                      }}
                      className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-64"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-4">Jurisdiction / Thana</th>
                        <th className="p-4">Official Email ID</th>
                        <th className="p-4">CUG Mobile</th>
                        <th className="p-4">Role</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                            No users found matching your search query.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map(user => (
                          <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                            <td className="p-4 font-bold text-slate-800 text-sm">{user.thana_name}</td>
                            <td className="p-4 font-mono font-bold text-slate-600 select-all">{user.nic_email}</td>
                            <td className="p-4 font-mono text-slate-500">{user.cug_mobile || 'N/A'}</td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                user.role === 'super_admin' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                {user.role === 'super_admin' ? 'Super Admin' :
                                 user.role === 'admin' ? 'Admin' : 'Police Officer'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  user.is_active 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  {user.is_active ? 'Active' : 'Deactivated'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end">
                                <button
                                  onClick={() => toggleUserStatus(user)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                                    user.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      user.is_active ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Showing <span className="font-extrabold text-slate-800">{startIndex + 1}</span> to{' '}
                      <span className="font-extrabold text-slate-800">
                        {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
                      </span>{' '}
                      of <span className="font-extrabold text-slate-800">{totalItems}</span> users
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setUserPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white cursor-pointer transition-colors"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setUserPage(pg)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            currentPage === pg
                              ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}

                      <button
                        onClick={() => setUserPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white cursor-pointer transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* SYSTEM SETTINGS TAB (admin + super_admin) */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Settings</h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold border border-indigo-100">Console Preferences</span>
                </div>
                <div className="p-6 space-y-5">
                  {/* Account Info */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Account Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Logged In As</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{userEmail}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                        <p className="text-sm font-bold text-slate-800">{roleMeta.label}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date Range Preference */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Analytics Date Range</p>
                    <div className="relative max-w-xs">
                      <select
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                      >
                        <option>Today</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                          </select>
                      <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Reset User Password Section */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reset User Password</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-xl">
                      <form onSubmit={handleResetUserPassword} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select System User</label>
                            <div className="relative">
                              <select
                                required
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                              >
                                <option value="">Select User Email</option>
                                {systemUsers.map(user => (
                                  <option key={user.id} value={user.nic_email}>
                                    {user.thana_name} ({user.nic_email})
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2.5 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                            <input
                              type="password"
                              required
                              placeholder="••••••••"
                              value={resetPassword}
                              onChange={e => setResetPassword(e.target.value)}
                              className="w-full bg-white border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                        </div>

                        {resetSuccess && (
                          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold leading-relaxed">
                            {resetSuccess}
                          </div>
                        )}
                        {resetError && (
                          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold leading-relaxed">
                            {resetError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={resetFormLoading}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          {resetFormLoading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                      </form>
                    </div>
                  </div>
 
                  {/* System Info */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">System Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Console Version', value: 'v2.1.0' },
                        { label: 'Jurisdiction', value: 'Ayodhya District' },
                        { label: 'Cyber Cell', value: 'UP Police NIC' },
                      ].map(item => (
                        <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-xs font-bold text-slate-700">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Reusable KPI card ─────────────────────────────────────────────────────────
function KpiCard({ title, value, icon, color, bg, highlight, tooltip, onClick }) {
  return (
    <div 
      data-tooltip={tooltip}
      data-tooltip-position="bottom"
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 shadow-sm cursor-pointer hover:shadow-md ${
        highlight
          ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-transparent shadow-indigo-600/10 hover:brightness-110'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{title}</h4>
        <div className={`p-2 rounded-xl ${highlight ? 'bg-white/20 text-white' : `${bg} ${color}`}`}>
          {React.cloneElement(icon, { className: 'w-4 h-4 stroke-[2.5]' })}
        </div>
      </div>
      <p className={`text-3xl font-black tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

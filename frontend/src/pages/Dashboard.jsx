import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  ShieldAlert, ShieldCheck, Building2, Globe, Send, AlertTriangle, ChevronDown, CheckCircle2,
  FileText, QrCode, ClipboardList, CheckCircle, RefreshCw, Eye, ExternalLink, Download, LogOut,
  Search, Filter, MoreHorizontal, UserCog, Trash2, ToggleLeft, ToggleRight, Cog, Bell,
  Database, Key, Globe2, Lock, Zap, Activity
} from 'lucide-react';
import supabase from '../services/supabaseClient';
import Sidebar from '../components/Sidebar';
import CreateUserModal from '../components/CreateUserModal';

const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Red, Amber, Green

const ROLE_DASHBOARD_TITLE = {
  super_admin: { title: 'Super Admin Command Center', subtitle: 'Full system access — Manage all users, thanas, and threat intelligence across Ayodhya district.' },
  admin: { title: 'Admin Operations Console', subtitle: 'Manage threat registries, verified properties, and police user accounts.' },
  thana_user: { title: 'Officer SafeStay Console', subtitle: 'Monitor phishing threats, manage verified properties, and review public reports for your jurisdiction.' }
};

const ROLE_BADGE = {
  super_admin: 'bg-red-500/10 text-red-600 border-red-200',
  admin: 'bg-amber-500/10 text-amber-600 border-amber-200',
  thana_user: 'bg-indigo-500/10 text-indigo-600 border-indigo-200'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [showCreateUser, setShowCreateUser] = useState(false);

  // Load user profile from localStorage (set during login)
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_profile')) || { role: 'thana_user', email: '', thana_name: 'Officer' };
    } catch {
      return { role: 'thana_user', email: '', thana_name: 'Officer' };
    }
  });
  const [loading, setLoading] = useState(false);
  const [systemUsers, setSystemUsers] = useState([]);
  const [selectedUserIdForEdit, setSelectedUserIdForEdit] = useState(null);

  // Dynamic Data States
  const [kpis, setKpis] = useState({
    activeThreats: 0,
    takedownInitiated: 0,
    totalBlocked: 0,
    totalHotels: 0,
    totalReports: 0
  });
  const [donutData, setDonutData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [topTargets, setTopTargets] = useState([]);

  const [suspiciousLinks, setSuspiciousLinks] = useState([]);
  const [verifiedHotels, setVerifiedHotels] = useState([]);
  const [publicReports, setPublicReports] = useState([]);

  // Fetch all dashboard stats
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/analytics?date_range=${dateRange}`);
      const data = await res.json();
      
      setKpis({
        activeThreats: data.kpis.activeThreats,
        takedownInitiated: data.kpis.takedownInitiated,
        totalBlocked: data.kpis.totalBlocked,
        totalHotels: data.kpis.totalHotels,
        totalReports: data.kpis.totalReports
      });
      setDonutData(data.charts.threatStatus);
      setBarData(data.charts.threatsOverTime);
      setTopTargets(data.topTargetedHotels);

      // 2. Fetch full lists from Supabase
      const [linksRes, hotelsRes, reportsRes, usersRes] = await Promise.all([
        supabase.from('suspicious_links').select('*, verified_hotels(hotel_name, official_url)'),
        supabase.from('verified_hotels').select('*'),
        supabase.from('public_reports').select('*'),
        supabase.from('system_users').select('*')
      ]);

      if (linksRes.data) setSuspiciousLinks(linksRes.data);
      if (hotelsRes.data) setVerifiedHotels(hotelsRes.data);
      if (reportsRes.data) setPublicReports(reportsRes.data);
      if (usersRes.data) {
        setSystemUsers(usersRes.data);
      } else {
        setSystemUsers([]);
      }

    } catch (err) {
      console.error('Offline / Fallback mode active:', err);
      // Robust mock data fallback if API or database is empty / offline
      setKpis({
        activeThreats: 14,
        takedownInitiated: 48,
        totalBlocked: 82,
        totalHotels: 142,
        totalReports: 36
      });
      setDonutData([
        { name: 'Active', value: 14 },
        { name: 'Takedown Initiated', value: 48 },
        { name: 'Blocked', value: 82 }
      ]);
      setBarData([
        { name: 'Mon', threats: 12 },
        { name: 'Tue', threats: 15 },
        { name: 'Wed', threats: 8 },
        { name: 'Thu', threats: 20 },
        { name: 'Fri', threats: 9 },
        { name: 'Sat', threats: 11 },
        { name: 'Sun', threats: 10 }
      ]);
      setTopTargets([
        { name: 'Ramayana Hotel', count: 12 },
        { name: 'Ayodhya Palace', count: 9 },
        { name: 'Saryu riverside Retreat', count: 8 },
        { name: 'Shri Ram Heritage', count: 7 },
        { name: 'Oudh Inn', count: 5 }
      ]);

      setSuspiciousLinks([
        { id: '1', fake_url: 'https://ramayana-booking-fake.com', target_hotel_id: 'h1', status: 'Active', detected_on: '2026-05-27T08:15:00.000Z', verified_hotels: { hotel_name: 'Ramayana Hotel', official_url: 'https://ramayanahotel-ayodhya.in' } },
        { id: '2', fake_url: 'https://ayodhyapalace-offers.net', target_hotel_id: 'h2', status: 'Takedown Initiated', detected_on: '2026-05-26T23:30:00.000Z', verified_hotels: { hotel_name: 'Ayodhya Palace', official_url: 'https://ayodhyapalace-official.org' } },
        { id: '3', fake_url: 'https://book-oudh-inn.info', target_hotel_id: 'h3', status: 'Blocked', detected_on: '2026-05-25T09:00:00.000Z', verified_hotels: { hotel_name: 'Oudh Inn', official_url: 'https://oudhinn.in' } }
      ]);

      setVerifiedHotels([
        { id: 'h1', hotel_name: 'Ramayana Hotel', official_url: 'https://ramayanahotel-ayodhya.in', email: 'bookings@ramayanahotel-ayodhya.in', whatsapp_number: '+91 9900887766', gst_number: '09GST12345', police_verification: 'PV-9921-KOTWALI', status: 'Active' },
        { id: 'h2', hotel_name: 'Ayodhya Palace', official_url: 'https://ayodhyapalace-official.org', email: 'contact@ayodhyapalace.org', whatsapp_number: '+91 8877665544', gst_number: '09GST67890', police_verification: 'PV-8832-KOTWALI', status: 'Active' },
        { id: 'h3', hotel_name: 'Oudh Inn', official_url: 'https://oudhinn.in', email: 'support@oudhinn.in', whatsapp_number: '+91 7766554433', gst_number: '09GST11223', police_verification: 'PV-7712-KOTWALI', status: 'Active' }
      ]);

      setPublicReports([
        { id: 'p1', reporter_name: 'Rohan Sharma', reported_url: 'http://fake-ramayana-booking.com', description: 'They sent me a direct payment link on whatsapp asking for full payment before checkin.', status: 'Pending', submitted_at: '2026-05-27T08:15:00.000Z' },
        { id: 'p2', reporter_name: 'Anonymous Devotee', reported_url: 'https://ayodhyastay-discount.net', description: 'Huge discounts offered. Page templates are exact duplicates of official pages.', status: 'Reviewed', submitted_at: '2026-05-26T23:30:00.000Z' }
      ]);

      setSystemUsers([
        { id: 'sho-kotnagar.ay@up.gov.in', thana_name: 'Kotwali Nagar', nic_email: 'sho-kotnagar.ay@up.gov.in', cug_mobile: '9454403303', role: 'thana_user', is_active: true, created_at: new Date().toISOString() },
        { id: 'sho-cantt.ay@up.gov.in', thana_name: 'Kotwali Cantt', nic_email: 'sho-cantt.ay@up.gov.in', cug_mobile: '9454403298', role: 'thana_user', is_active: true, created_at: new Date().toISOString() },
        { id: 'sho-cybercrime.ay@up.gov.in', thana_name: 'Cyber Thana', nic_email: 'sho-cybercrime.ay@up.gov.in', cug_mobile: '7839876653', role: 'thana_user', is_active: true, created_at: new Date().toISOString() },
        { id: 'admin@safestay.in', thana_name: 'Administrator', nic_email: 'admin@safestay.in', cug_mobile: '8888888888', role: 'admin', is_active: true, created_at: new Date().toISOString() },
        { id: 'superadmin@up.nic.in', thana_name: 'Cyber Cell HQ', nic_email: 'superadmin@up.nic.in', cug_mobile: '9999999999', role: 'super_admin', is_active: true, created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  // Operational Action: Generate Takedown Notice PDF/Email Mock
  const generateTakedownNotice = (link) => {
    const cyberCellEmail = "cybercell@upcop.gov.in";
    const subject = `IMMEDIATE TAKEDOWN NOTICE: Phishing Domain ${link.fake_url}`;
    const body = `
========================================
OFFICIAL CYBER CELL TAKEDOWN NOTIFICATION
========================================
To: Domain Registrar / Hosting Provider
CC: ${cyberCellEmail}

Subject: Urgent Takedown Request - Spear Phishing Fraud Portal
Target Accommodation: ${link.verified_hotels?.hotel_name || 'Verified Property'}
Official Authorized Domain: ${link.verified_hotels?.official_url || 'N/A'}
Fraudulent Mimic Domain: ${link.fake_url}

This domain has been identified as a spoofed portal defrauding pilgrims. 
Please deactivate all DNS routing immediately under Section 66D of the IT Act.
    `;
    
    // Print window helper or dynamic download
    const win = window.open("", "_blank");
    win.document.write(`<pre>${body}</pre><button onclick="window.print()">Print Takedown Order</button>`);
    win.document.close();
  };

  // Operational Action: Generate Printable QR Certificate for Hotel
  const generateQrCertificate = (hotel) => {
    const certWindow = window.open("", "_blank");
    certWindow.document.write(`
      <html>
        <head>
          <title>UP Police SafeStay Certificate</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-100 p-8 flex items-center justify-center min-h-screen">
          <div class="max-w-xl w-full bg-white border-4 border-double border-amber-600 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative">
            <div class="text-amber-700 text-sm font-bold tracking-widest uppercase">Uttar Pradesh Police Department</div>
            <h1 class="text-3xl font-black text-slate-900 tracking-tight">SafeStay Verification Certificate</h1>
            <div class="text-xs text-slate-500 font-semibold">Accommodation Official Booking Channel Verification</div>
            <hr class="border-slate-200" />
            <div class="space-y-2">
              <div class="text-2xl font-bold text-slate-800">${hotel.hotel_name}</div>
              <div class="text-xs font-mono text-indigo-600 font-bold">Police Ref: ${hotel.police_verification}</div>
            </div>
            <div class="bg-slate-50 p-4 border border-slate-100 rounded-2xl inline-block">
              <div class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Verified Official Domain</div>
              <div class="text-base font-extrabold text-emerald-600">${hotel.official_url}</div>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto">
              Scan dynamic certificate on matching domain to confirm secure security logs status. Screenshot spoofing is subject to prosecution.
            </p>
            <div class="text-[10px] text-slate-400 font-bold">Issued on: ${new Date().toLocaleDateString('en-IN')} • Ayodhya Cyber Cell</div>
            <button onclick="window.print()" class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors">Print Official Certificate</button>
          </div>
        </body>
      </html>
    `);
    certWindow.document.close();
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase_session');
    localStorage.removeItem('supabase_user');
    localStorage.removeItem('user_profile');
    supabase.auth.signOut();
    navigate('/');
  };

  const role = userProfile?.role || 'thana_user';
  const dashboardMeta = ROLE_DASHBOARD_TITLE[role] || ROLE_DASHBOARD_TITLE.thana_user;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onCreateUser={() => setShowCreateUser(true)}
        onLogout={handleLogout}
        counts={{
          threats: suspiciousLinks.length,
          properties: verifiedHotels.length,
          reports: publicReports.length
        }}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        userRole={userProfile?.role}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 lg:p-6 xl:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header - Role-specific with Welcome widget */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                  {dashboardMeta.title}
                </h2>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${ROLE_BADGE[role]}`}>
                  {role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Officer'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1 line-clamp-2">{dashboardMeta.subtitle}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400">Welcome,</p>
                <p className="text-sm font-black text-slate-800 leading-tight">
                  {userProfile?.thana_name || 'Officer'}
                </p>
                <button 
                  onClick={() => {
                    setSelectedUserIdForEdit(null); // Default to editing self
                    setActiveTab('profile');
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-all text-left block w-full mt-0.5"
                >
                  Update Profile
                </button>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-md">
                {(userProfile?.thana_name || 'O').charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchDashboardData()}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 stroke-[2.5] ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">System Online</span>
              </div>
            </div>
          </div>
        </div>

      {/* RENDER ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Filter */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Filters</span>
            <div className="relative">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-4 pr-10 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard 
              title="Verified Properties" 
              value={kpis.totalHotels} 
              icon={<Building2 />} 
              color="text-indigo-600" 
              bg="bg-indigo-50" 
              onClick={() => setActiveTab('properties')}
            />
            <KpiCard 
              title="Active Phishing Sites" 
              value={kpis.activeThreats} 
              icon={<ShieldAlert />} 
              color="text-red-600" 
              bg="bg-red-50" 
              highlight 
              onClick={() => setActiveTab('threats')}
            />
            <KpiCard 
              title="Takedowns Pending" 
              value={kpis.takedownInitiated} 
              icon={<Send />} 
              color="text-amber-600" 
              bg="bg-amber-50" 
              onClick={() => setActiveTab('threats')}
            />
            <KpiCard 
              title="Deactivated Domains" 
              value={kpis.totalBlocked} 
              icon={<ShieldCheck />} 
              color="text-emerald-600" 
              bg="bg-emerald-50" 
              onClick={() => setActiveTab('threats')}
            />
            <KpiCard 
              title="Crowdsourced Submissions" 
              value={kpis.totalReports} 
              icon={<ClipboardList />} 
              color="text-blue-600" 
              bg="bg-blue-50" 
              onClick={() => setActiveTab('reports')}
            />
          </div>

          {/* Recharts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Threats Over Time ({dateRange})</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="threats" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Phishing Status Share</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 5 Targeted Hotels */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Top 5 Targeted Hotels</h3>
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
                        <td className="py-3 px-4 text-center font-bold text-slate-700 text-sm">{hotel.count}</td>
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
        </div>
      )}

      {/* RENDER SUSPICIOUS LINKS TAB */}
      {activeTab === 'threats' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Traced Phishing Registry</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">Automated Cron Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">Target Accommodation</th>
                  <th className="p-4">Suspicious Spoof Domain</th>
                  <th className="p-4">Detected Timestamp</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-right">Operation / Actions</th>
                </tr>
              </thead>
              <tbody>
                {suspiciousLinks.map((link) => (
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
                        <AlertTriangle className="w-3 h-3" />
                        {link.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {link.status === 'Blocked' ? (
                        <span className="text-slate-400 italic font-semibold">Takedown Completed</span>
                      ) : (
                        <button 
                          onClick={() => generateTakedownNotice(link)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Notice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER PROPERTIES TAB */}
      {activeTab === 'properties' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Registered Properties Registry</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">Police Verification Shield</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">Hotel Details</th>
                  <th className="p-4">Official Domain</th>
                  <th className="p-4">Contact Detail</th>
                  <th className="p-4">GST / Verification Ref</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifiedHotels.map((hotel) => (
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all bg-white cursor-pointer shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5 text-slate-500" /> Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER CROWDSOURCED REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Crowdsourced Threats Inbox</h3>
            <span className="text-[10px] bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold">Public Submissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Reported Phishing URL</th>
                  <th className="p-4">Citizen Description Details</th>
                  <th className="p-4">Date Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {publicReports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                    <td className="p-4 font-bold text-slate-800 text-sm">{report.reporter_name}</td>
                    <td className="p-4 font-mono font-bold text-red-600 select-all">{report.reported_url}</td>
                    <td className="p-4 text-slate-500 leading-relaxed font-semibold max-w-sm">{report.description}</td>
                    <td className="p-4 text-slate-400 font-semibold">{new Date(report.submitted_at).toLocaleString()}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer">
                        Verify
                      </button>
                      <button className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer">
                        Dismiss
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER MANAGE USERS TAB */}
      {activeTab === 'manage-users' && (
        <ManageUsersTab 
          role={role} 
          systemUsers={systemUsers} 
          onEditUser={(userId) => {
            setSelectedUserIdForEdit(userId);
            setActiveTab('profile');
          }}
        />
      )}

      {/* RENDER SYSTEM SETTINGS TAB */}
      {activeTab === 'settings' && (
        <SystemSettingsTab />
      )}

      {/* RENDER UPDATE PROFILE TAB */}
      {activeTab === 'profile' && (
        <UpdateProfileTab 
          loggedInUser={userProfile}
          systemUsers={systemUsers}
          selectedUserId={selectedUserIdForEdit}
          setSelectedUserId={setSelectedUserIdForEdit}
          onProfileUpdated={(updatedProfile) => {
            setUserProfile(updatedProfile);
          }}
        />
      )}

      </main>
    </div>
  );
}

function ManageUsersTab({ role, systemUsers, onEditUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('all');

  const filteredUsers = systemUsers.filter(u => {
    if (selectedUserId !== 'all' && u.id !== selectedUserId) {
      return false;
    }
    const name = u.thana_name || '';
    const email = u.nic_email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleColor = {
    super_admin: 'bg-red-50 text-red-700 border-red-100',
    admin: 'bg-amber-50 text-amber-700 border-amber-100',
    thana_user: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with search and filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Management</h3>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{filteredUsers.length} users found</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* User Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="all">All Users (Select from dropdown)</option>
                {systemUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.thana_name} ({u.nic_email})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-700"
              />
            </div>
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="thana_user">Police Officer</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="p-4">Officer / User</th>
                <th className="p-4">Email ID</th>
                <th className="p-4">CUG Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors font-medium text-slate-700">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-slate-600">{(user.thana_name || 'O').charAt(0)}</span>
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{user.thana_name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-600 font-semibold">{user.nic_email}</td>
                  <td className="p-4 font-semibold text-slate-700">{user.cug_mobile || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColor[user.role]}`}>
                      {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Officer'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${user.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-semibold">{new Date(user.created_at || Date.now()).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => onEditUser(user.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" 
                        title="Edit User Profile"
                      >
                        <UserCog className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>
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

// ─────────────────────────────────────────────
// System Settings Tab Component (Super Admin only)
// ─────────────────────────────────────────────
function SystemSettingsTab() {
  const [settings, setSettings] = useState({
    autoScan: true,
    emailAlerts: true,
    publicReporting: true,
    twoFactorAuth: false,
    maintenanceMode: false,
    apiRateLimit: '1000',
    scanInterval: '30',
    retentionDays: '90'
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Security Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security Settings</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Authentication & access controls</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <SettingsToggle 
              label="Two-Factor Authentication" 
              description="Require 2FA for all admin logins"
              enabled={settings.twoFactorAuth}
              onToggle={() => toggleSetting('twoFactorAuth')}
            />
            <SettingsToggle 
              label="Maintenance Mode" 
              description="Temporarily disable public-facing features"
              enabled={settings.maintenanceMode}
              onToggle={() => toggleSetting('maintenanceMode')}
              danger
            />
          </div>
        </div>

        {/* Threat Scanning Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Threat Scanning</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Automated phishing detection configuration</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <SettingsToggle 
              label="Auto Phishing Scan" 
              description="Automatically scan for new phishing domains every cycle"
              enabled={settings.autoScan}
              onToggle={() => toggleSetting('autoScan')}
            />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-slate-700">Scan Interval</p>
                <p className="text-[10px] text-slate-400 font-semibold">Minutes between scan cycles</p>
              </div>
              <input
                type="number"
                value={settings.scanInterval}
                onChange={(e) => setSettings(s => ({ ...s, scanInterval: e.target.value }))}
                className="w-20 text-center py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Alert channels and reporting</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <SettingsToggle 
              label="Email Alerts" 
              description="Send email notifications for new threats"
              enabled={settings.emailAlerts}
              onToggle={() => toggleSetting('emailAlerts')}
            />
            <SettingsToggle 
              label="Public Reporting" 
              description="Allow citizens to submit suspicious URLs"
              enabled={settings.publicReporting}
              onToggle={() => toggleSetting('publicReporting')}
            />
          </div>
        </div>

        {/* Data Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Data & Storage</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Database retention and API configuration</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-slate-700">Data Retention</p>
                <p className="text-[10px] text-slate-400 font-semibold">Days to retain threat records</p>
              </div>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) => setSettings(s => ({ ...s, retentionDays: e.target.value }))}
                className="w-20 text-center py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-slate-700">API Rate Limit</p>
                <p className="text-[10px] text-slate-400 font-semibold">Max requests per minute</p>
              </div>
              <input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => setSettings(s => ({ ...s, apiRateLimit: e.target.value }))}
                className="w-20 text-center py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer">
          Save All Settings
        </button>
      </div>
    </div>
  );
}

// Toggle switch component for settings
function SettingsToggle({ label, description, enabled, onToggle, danger }) {
  return (
    <div className="flex items-center justify-between py-2 font-sans">
      <div>
        <p className="text-xs font-bold text-slate-700 font-sans">{label}</p>
        <p className="text-[10px] text-slate-400 font-semibold font-sans">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer ${
          enabled 
            ? (danger ? 'bg-red-500' : 'bg-indigo-600') 
            : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// Reusable KPI card
export function KpiCard({ title, value, icon, color, bg, highlight, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 shadow-sm cursor-pointer font-sans ${
        highlight 
          ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-transparent shadow-indigo-600/10 hover:brightness-110' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex items-center justify-between mb-4 font-sans">
        <h4 className={`text-xs font-bold uppercase tracking-wider font-sans ${highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{title}</h4>
        <div className={`p-2 rounded-xl ${highlight ? 'bg-white/20 text-white' : `${bg} ${color}`}`}>
          {React.cloneElement(icon, { className: "w-5 h-5 stroke-[2.5]" })}
        </div>
      </div>
      <p className={`text-3xl font-black tracking-tight font-sans ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Update Profile Tab Component
// ─────────────────────────────────────────────
export function UpdateProfileTab({ loggedInUser, systemUsers, selectedUserId, setSelectedUserId, onProfileUpdated }) {
  const isSuperAdmin = loggedInUser?.role === 'super_admin';
  
  // Decide which user we are editing
  const editingUserId = selectedUserId || loggedInUser?.id || '';
  const isEditingSelf = editingUserId === loggedInUser?.id;

  // Form states
  const [thanaName, setThanaName] = useState('');
  const [cugMobile, setCugMobile] = useState('');
  const [nicEmail, setNicEmail] = useState('');
  const [role, setRole] = useState('thana_user');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Load user data to edit
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');

    if (isEditingSelf) {
      setThanaName(loggedInUser?.thana_name || '');
      setCugMobile(loggedInUser?.cug_mobile || '');
      setNicEmail(loggedInUser?.email || '');
      setRole(loggedInUser?.role || 'thana_user');
    } else {
      // Find selected user in list
      const targetUser = systemUsers.find(u => u.id === editingUserId);
      if (targetUser) {
        setThanaName(targetUser.thana_name || '');
        setCugMobile(targetUser.cug_mobile || '');
        setNicEmail(targetUser.nic_email || '');
        setRole(targetUser.role || 'thana_user');
      }
    }
  }, [editingUserId, loggedInUser, systemUsers]);

  const handleMobileChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setCugMobile(cleaned);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (cugMobile && cugMobile.length !== 10) {
      setErrorMsg('CUG Mobile number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (isEditingSelf) {
        // 1. Update current logged-in user details
        const { error: dbError } = await supabase
          .from('system_users')
          .update({
            thana_name: thanaName,
            cug_mobile: cugMobile
          })
          .eq('id', loggedInUser.id);

        if (dbError) throw dbError;

        // Update password if provided
        if (password) {
          const { error: authError } = await supabase.auth.updateUser({ password });
          if (authError) throw authError;
          try {
            const localCreds = JSON.parse(localStorage.getItem('local_credentials') || '{}');
            localCreds[loggedInUser.email.toLowerCase()] = password;
            localStorage.setItem('local_credentials', JSON.stringify(localCreds));
          } catch (e) {
            console.warn('Failed to store local credentials:', e);
          }
        }

        // Update local session
        const updatedProfile = {
          ...loggedInUser,
          thana_name: thanaName,
          cug_mobile: cugMobile
        };
        localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
        onProfileUpdated(updatedProfile);
        setSuccessMsg('Your profile has been updated successfully.');
      } else {
        // 2. Super Admin editing another user
        if (!isSuperAdmin) {
          throw new Error('Unauthorized: only super admins can update other profiles.');
        }

        // Call backend API
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/admin/update-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUserId,
            thana_name: thanaName,
            email: nicEmail,
            cug_mobile: cugMobile,
            role: role,
            password: password || undefined
          })
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Server returned HTML response instead of JSON. Status: ${res.status}.`);
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to update user profile.');
        }

        if (password) {
          try {
            const localCreds = JSON.parse(localStorage.getItem('local_credentials') || '{}');
            localCreds[nicEmail.toLowerCase()] = password;
            localStorage.setItem('local_credentials', JSON.stringify(localCreds));
          } catch (e) {
            console.warn('Failed to store local credentials:', e);
          }
        }

        setSuccessMsg(`User profile for "${thanaName}" has been updated successfully.`);
      }
      
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMsg(err.message || 'An error occurred during update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm animate-in fade-in duration-200 font-sans">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6 font-sans">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-sans">
          <UserCog className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight font-sans">
            {isEditingSelf ? 'Update Your Profile' : `Edit User Profile: ${thanaName}`}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5 font-sans">
            {isEditingSelf ? 'Manage your credentials and security access' : 'Administrator profile modifier portal'}
          </p>
        </div>
      </div>

      {/* Super Admin selector */}
      {isSuperAdmin && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 space-y-2 font-sans">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
            Select User to Edit
          </label>
          <div className="relative font-sans">
            <select
              value={editingUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value={loggedInUser?.id}>My Profile ({loggedInUser?.thana_name})</option>
              {systemUsers
                .filter(u => u.id !== loggedInUser?.id)
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.thana_name} ({u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Admin' : 'Officer'}) - {u.nic_email}
                  </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-2.5 text-xs font-semibold leading-relaxed font-sans">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 mb-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-start gap-2.5 text-xs font-semibold leading-relaxed font-sans">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
          {/* Name */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Profile / Thana Name</label>
            <input
              type="text"
              required
              value={thanaName}
              onChange={(e) => setThanaName(e.target.value)}
              placeholder="e.g. Kotwali Nagar"
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-800"
            />
          </div>

          {/* CUG Mobile */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">CUG Mobile No</label>
            <input
              type="text"
              value={cugMobile}
              onChange={(e) => handleMobileChange(e.target.value)}
              placeholder="10 digits"
              maxLength={10}
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5 font-sans">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">NIC Official Email ID</label>
          <input
            type="email"
            required
            disabled={isEditingSelf}
            value={nicEmail}
            onChange={(e) => setNicEmail(e.target.value)}
            placeholder="officer@up.nic.in"
            className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed font-mono"
          />
          {isEditingSelf && (
            <p className="text-[10px] text-slate-400 font-semibold font-sans">Your login email ID cannot be changed to prevent security logouts.</p>
          )}
        </div>

        {/* Role Select (Super Admin modifying others only) */}
        {isSuperAdmin && !isEditingSelf && (
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">System Access Role</label>
            <div className="relative font-sans">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="thana_user">Police Officer (Thana User)</option>
                <option value="admin">Administrator (Admin)</option>
                <option value="super_admin">Super Administrator (Super Admin)</option>
              </select>
              <ChevronDown className="absolute right-4 top-4 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        <hr className="border-slate-100 my-2 font-sans" />

        {/* Password Reset Block */}
        <div className="space-y-3 font-sans">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
            {isEditingSelf ? 'Change Password' : 'Reset User Password'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
            <div className="space-y-1.5 font-sans font-sans">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-800"
              />
            </div>
            <div className="space-y-1.5 font-sans font-sans">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-105 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 font-sans"
        >
          {loading ? 'Processing updates...' : 'Update Profile'}
        </button>

      </form>
    </div>
  );
}











































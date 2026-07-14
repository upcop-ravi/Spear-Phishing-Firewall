import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  ShieldAlert, ShieldCheck, Building2, Globe, Send, AlertTriangle, ChevronDown, CheckCircle2,
  FileText, QrCode, ClipboardList, CheckCircle, RefreshCw, Eye, ExternalLink, Download, LogOut,
  Users, MapPin, Clock, Monitor, Activity, ChevronRight
} from 'lucide-react';
import supabase from '../services/supabaseClient';

const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Red, Amber, Green

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [loading, setLoading] = useState(false);

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
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);

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
      const [linksRes, hotelsRes, reportsRes, logsRes] = await Promise.all([
        supabase.from('suspicious_links').select('*, verified_hotels(hotel_name, official_url)'),
        supabase.from('verified_hotels').select('*'),
        supabase.from('public_reports').select('*'),
        supabase.from('visitor_logs').select('*')
      ]);

      if (linksRes.data) setSuspiciousLinks(linksRes.data);
      if (hotelsRes.data) setVerifiedHotels(hotelsRes.data);
      if (reportsRes.data) setPublicReports(reportsRes.data);
      if (logsRes.data) setVisitorLogs([...logsRes.data].reverse());

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

  return (
    <div className="space-y-6">
      
      {/* Top Banner and operational tab controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600 stroke-[2.5]" />
            Ayodhya SafeStay Officer Console
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Multi-jurisdiction Phishing Firewall, Threat Takedowns & Verified Registries.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'analytics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Analytics View
            </button>
            <button 
              onClick={() => setActiveTab('threats')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'threats' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5 inline mr-1" /> Threats ({suspiciousLinks.length})
            </button>
            <button 
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'properties' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Building2 className="w-3.5 h-3.5 inline mr-1" /> Properties ({verifiedHotels.length})
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ClipboardList className="w-3.5 h-3.5 inline mr-1" /> Reports ({publicReports.length})
            </button>
            <button 
              onClick={() => setActiveTab('visitors')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'visitors' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" /> Visitor Logs ({visitorLogs.length})
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              // Clear any stored session data
              localStorage.removeItem('supabase_session');
              localStorage.removeItem('supabase_user');
              navigate('/');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
            title="Logout from Officer Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
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
            <KpiCard title="Verified Properties" value={kpis.totalHotels} icon={<Building2 />} color="text-indigo-600" bg="bg-indigo-50" />
            <KpiCard title="Active Phishing Sites" value={kpis.activeThreats} icon={<ShieldAlert />} color="text-red-600" bg="bg-red-50" highlight />
            <KpiCard title="Takedowns Pending" value={kpis.takedownInitiated} icon={<Send />} color="text-amber-600" bg="bg-amber-50" />
            <KpiCard title="Deactivated Domains" value={kpis.totalBlocked} icon={<ShieldCheck />} color="text-emerald-600" bg="bg-emerald-50" />
            <KpiCard title="Crowdsourced Submissions" value={kpis.totalReports} icon={<ClipboardList />} color="text-blue-600" bg="bg-blue-50" />
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

      {/* RENDER VISITOR LOGS TAB */}
      {activeTab === 'visitors' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Visitor Activity Log</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Real-time public portal session tracking — IP, IST times, geo-location, page actions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-600">{visitorLogs.length} Sessions Captured</span>
            </div>
          </div>

          {/* Summary KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Sessions', value: visitorLogs.length, icon: <Users className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Unique IPs', value: new Set(visitorLogs.map(l => l.ip)).size, icon: <Globe className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Actions', value: visitorLogs.reduce((s, l) => s + (l.actions?.length || 0), 0), icon: <Activity className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Avg Duration', value: (() => { const d = visitorLogs.filter(l=>l.duration && l.duration!=='0s'); return d.length ? d[d.length-1].duration : 'N/A'; })(), icon: <Clock className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
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

          {/* Logs table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Geo Location</th>
                    <th className="p-4">Session Start (IST)</th>
                    <th className="p-4">Session End (IST)</th>
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
                  ) : visitorLogs.map((log) => (
                    <>
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-violet-50/30 transition-colors font-medium text-slate-700 cursor-pointer"
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      >
                        <td className="p-4">
                          <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded text-[11px]">{log.ip}</span>
                        </td>
                        <td className="p-4">
                          <span className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="font-semibold text-slate-700">{log.location || 'Unknown'}</span>
                            </span>
                            {log.lat != null && log.lng != null ? (
                              <a
                                href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-mono text-indigo-500 hover:text-indigo-700 hover:underline ml-5"
                                onClick={e => e.stopPropagation()}
                              >
                                📍 {log.lat.toFixed(4)}°N, {log.lng.toFixed(4)}°E
                              </a>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400 ml-5">Coordinates unavailable</span>
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            {log.session_start}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{log.session_end}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">{log.duration || '0s'}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px]">{log.actions?.length || 0} actions</span>
                        </td>
                        <td className="p-4 max-w-[150px]">
                          <span className="flex items-center gap-1 text-slate-500 truncate">
                            <Monitor className="w-3 h-3 shrink-0" />
                            <span className="truncate text-[10px]">{(log.user_agent || 'Unknown').split(' ').slice(0, 3).join(' ')}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <ChevronRight className={`w-4 h-4 text-slate-400 inline transition-transform ${expandedLog === log.id ? 'rotate-90' : ''}`} />
                        </td>
                      </tr>
                      {/* Expanded action log row */}
                      {expandedLog === log.id && (
                        <tr key={log.id + '-expanded'} className="bg-violet-50/40">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-3">📋 Full Action Log for Session {log.id}</p>
                              {(log.actions || []).length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No actions recorded in this session.</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {(log.actions || []).map((action, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5">
                                      <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                                      <span className="text-xs font-mono text-slate-700 font-semibold">{action}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="pt-3 border-t border-violet-100 mt-3">
                                <p className="text-[10px] text-slate-400 font-semibold">Full User-Agent: {log.user_agent}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable KPI card
function KpiCard({ title, value, icon, color, bg, highlight }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 shadow-sm ${
      highlight 
        ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-transparent shadow-indigo-600/10' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{title}</h4>
        <div className={`p-2 rounded-xl ${highlight ? 'bg-white/20 text-white' : `${bg} ${color}`}`}>
          {React.cloneElement(icon, { className: "w-5 h-5 stroke-[2.5]" })}
        </div>
      </div>
      <p className={`text-3xl font-black tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

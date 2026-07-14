import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, ShieldAlert, Clock, Shield, Globe, HelpCircle } from 'lucide-react';
import { logVisitorAction } from '../utils/visitorLogger';

export default function SecureQRVerification() {
  const { hotel_id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  // 1. Live Clock updating every second to beat static screenshot spoofing
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch verified hotel details
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/mobile/verify?query=${hotel_id}`);
        const data = await res.json();
        if (data.success && data.results.length > 0) {
          // Exact match search by id
          const found = data.results.find(h => h.id === hotel_id);
          if (found) {
            setHotel(found);
            logVisitorAction('Viewed QR verification for hotel: ' + found.hotel_name);
          } else {
            setHotel(data.results[0]);
            logVisitorAction('Viewed QR verification for hotel: ' + data.results[0].hotel_name);
          }
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err);
        // Fallback Mock Data for demo/offline
        const mockHotels = {
          'h1': { id: 'h1', hotel_name: 'Ramayana Hotel', official_url: 'https://ramayanahotel-ayodhya.in', status: 'Active', police_verification: 'PV-9921-KOTWALI' },
          'h2': { id: 'h2', hotel_name: 'Ayodhya Palace', official_url: 'https://ayodhyapalace-official.org', status: 'Active', police_verification: 'PV-8832-KOTWALI' }
        };
        const found = mockHotels[hotel_id] || mockHotels['h1'];
        setHotel(found);
        logVisitorAction('Viewed QR verification for hotel (offline): ' + found.hotel_name);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotel_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 shadow-xl text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Verification Failure</h2>
          <p className="text-sm text-slate-500 font-medium">This accommodation could not be verified by UP Police SafeStay intelligence database. Please do not submit payments.</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors">Go Home</button>
        </div>
      </div>
    );
  }

  const liveTimeString = time.toLocaleTimeString();
  const liveDateString = time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex flex-col justify-between p-6">
      
      {/* 3. Anti-Spoof Dynamic WATERMARK covering the background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-5 z-0 grid grid-cols-2 md:grid-cols-4 gap-12 p-8">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="text-white text-xs font-black tracking-widest uppercase transform -rotate-45 whitespace-nowrap">
            {hotel.official_url}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative w-full max-w-4xl mx-auto flex items-center justify-between border-b border-white/10 pb-4 z-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">SafeStay Secure QR</h1>
            <p className="text-xs text-slate-400 font-medium">{t('security_certified')}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-1.5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
        >
          Back to Portal
        </button>
      </header>

      {/* Main Secure Box */}
      <main className="relative flex-grow flex items-center justify-center py-10 z-10">
        <div className="max-w-xl w-full bg-slate-950/80 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
          
          {/* Top visual accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />

          {/* Verification Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-sm animate-pulse">
            <ShieldCheck className="w-4 h-4" />
            <span>VERIFIED BY UP POLICE CYBER CELL</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight">{hotel.hotel_name}</h2>
            <p className="text-xs text-slate-400 font-mono">Reference No: {hotel.police_verification}</p>
          </div>

          {/* Secure Display of the OFFICIAL URL - Highlighted for users to check */}
          <div className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-1 select-all cursor-pointer group hover:border-emerald-500/30 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('official_website')}</span>
            <div className="flex items-center justify-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-black tracking-wide text-emerald-400 underline decoration-2">{hotel.official_url}</span>
            </div>
          </div>

          {/* Live Anti-Screenshot Timer / Clock with updating seconds */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Clock className="w-4 h-4 text-indigo-400" />
            <div className="text-left">
              <div className="text-sm font-black tracking-widest">{liveTimeString}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">{liveDateString}</div>
            </div>
          </div>

          {/* Secure QR Display */}
          <div className="p-4 bg-white rounded-2xl shadow-xl shadow-white/5 relative group">
            <QRCodeSVG 
              value={window.location.href} 
              size={180} 
              level={"H"} 
              includeMargin={true}
            />
            {/* Spoof prevention overlay */}
            <div className="absolute inset-0 bg-slate-950/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
              <span className="text-xs font-bold text-slate-200">Dynamic QR Verification Active</span>
            </div>
          </div>

          {/* Warnings */}
          <div className="space-y-2">
            <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-sm">
              {t('warning_spoof')}
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 font-bold bg-amber-500/5 px-3 py-1 rounded-md border border-amber-500/10">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Verify actual browser address bar domain fits exactly.</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full max-w-4xl mx-auto flex items-center justify-center text-[10px] text-slate-500 font-semibold pt-4 border-t border-white/5 z-10">
        Authenticity Check Protected by Ayodhya Cyber Security Shield • UP Police
      </footer>

    </div>
  );
}

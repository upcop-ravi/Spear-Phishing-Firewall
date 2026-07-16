import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import supabase from '../services/supabaseClient';
import { logVisitorAction } from '../utils/visitorLogger';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    logVisitorAction('Opened Property Registration form');
  }, []);

  // Form states
  const [hotelName, setHotelName] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [policeVerification, setPoliceVerification] = useState('');
  const [thanaId, setThanaId] = useState(''); // Thana id foreign key
  const [thanas, setThanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeRegTab, setActiveRegTab] = useState('apply');
  const [searchGst, setSearchGst] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  const parseVerification = (val) => {
    if (!val) return { pvr: 'N/A', ticket: 'N/A' };
    const match = val.match(/^(.*?)\s+\[TICKET:(.*?)\]$/);
    if (match) {
      return { pvr: match[1], ticket: match[2] };
    }
    return { pvr: val, ticket: 'N/A' };
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    const queryStr = searchGst.trim();
    if (!queryStr) return;
    setStatusLoading(true);
    setStatusResult(null);
    setStatusError(null);
    try {
      const { data, error } = await supabase
        .from('verified_hotels')
        .select('id, hotel_name, official_url, email, whatsapp_number, gst_number, police_verification, status, thana_id')
        .or(`gst_number.ilike.%${queryStr}%,email.ilike.%${queryStr}%,police_verification.ilike.%${queryStr}%`);

      if (error) throw error;
      if (data && data.length > 0) {
        setStatusResult(data);
      } else {
        setStatusError('No property matches the provided GST Number, Email, or Verification ID.');
      }
    } catch (err) {
      console.warn('Failed querying status via Supabase, trying fallback...', err);
      setStatusError('Unable to retrieve status. Please check your network connection.');
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    async function loadThanas() {
      try {
        const { data, error } = await supabase
          .from('system_users')
          .select('id, thana_name')
          .eq('role', 'thana_user')
          .eq('is_active', true)
          .order('thana_name');
        if (error) throw error;
        if (data && data.length > 0) {
          setThanas(data.map(t => ({ id: t.id, name: t.thana_name })));
        } else {
          setThanas([
            { id: 'u1', name: 'Kotwali Nagar (Mock)' },
            { id: 'u2', name: 'Kotwali Cantt (Mock)' },
            { id: 'u4', name: 'Kotwali Ayodhya (Mock)' },
            { id: 'u5', name: 'Ram Janm Bhoomi (Mock)' }
          ]);
        }
      } catch (err) {
        console.error('Failed to load thanas from Supabase:', err);
        setThanas([
          { id: 'u1', name: 'Kotwali Nagar (Fallback)' },
          { id: 'u2', name: 'Kotwali Cantt (Fallback)' },
          { id: 'u4', name: 'Kotwali Ayodhya (Fallback)' }
        ]);
      }
    }
    loadThanas();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Basic URL validation
    if (!officialUrl.startsWith('http://') && !officialUrl.startsWith('https://')) {
      setErrorMsg('Error: Official URL must begin with http:// or https://');
      setLoading(false);
      return;
    }

    logVisitorAction('Submitted registration for property: ' + hotelName);

    try {
      // Get the next serial number by counting existing entries
      let nextSerial = 1;
      try {
        const { count, error: countErr } = await supabase
          .from('verified_hotels')
          .select('id', { count: 'exact', head: true });
        if (!countErr && count !== null) {
          nextSerial = count + 1;
        } else {
          nextSerial = Math.floor(1000 + Math.random() * 9000);
        }
      } catch (err) {
        nextSerial = Math.floor(1000 + Math.random() * 9000);
      }

      // Generate Ticket ID using formula:
      // apply on the gst no, police pvr no, mobile no, and police station name followed by year and 04 digit serial no.
      const stationName = thanas.find(t => t.id === thanaId)?.name || 'Ayodhya';
      const gstClean = (gstNumber || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 4).padEnd(4, 'X');
      const pvrClean = (policeVerification || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 4).padEnd(4, 'X');
      const mobClean = (whatsappNumber || '').replace(/[^0-9]/g, '');
      const mobLast4 = mobClean.substring(Math.max(0, mobClean.length - 4)).padStart(4, '0');
      const stationClean = stationName.replace(/[^A-Z]/gi, '').toUpperCase().substring(0, 3).padEnd(3, 'STN');
      const year = new Date().getFullYear();
      const serialStr = String(nextSerial).padStart(4, '0');

      const ticketId = `TKT-${gstClean}-${pvrClean}-${mobLast4}-${stationClean}-${year}-${serialStr}`;
      setGeneratedTicketId(ticketId);

      // Save police verification with appended Ticket ID
      const fullVerification = `${policeVerification} [TICKET:${ticketId}]`;

      // Insert to verified_hotels via Supabase
      const { error } = await supabase
        .from('verified_hotels')
        .insert([{
          hotel_name: hotelName,
          official_url: officialUrl,
          email,
          whatsapp_number: whatsappNumber,
          gst_number: gstNumber,
          police_verification: fullVerification,
          thana_id: thanaId,
          status: 'Pending Verification'
        }]);

      if (error) throw error;

      setSuccess(true);

    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-between p-6">
      
      {/* Visual background accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl mx-auto my-auto space-y-6 relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
        </button>

        {/* Title */}
        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('register_title')}</h2>
          <p className="text-xs text-slate-500 font-semibold">{t('register_desc')}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveRegTab('apply')}
            className={`flex-1 pb-3.5 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 text-center cursor-pointer ${
              activeRegTab === 'apply'
                ? 'border-amber-500 text-amber-600 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Property Registration Application
          </button>
          <button
            onClick={() => {
              setActiveRegTab('status');
              setSearchGst('');
              setStatusResult(null);
              setStatusError(null);
            }}
            className={`flex-1 pb-3.5 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 text-center cursor-pointer ${
              activeRegTab === 'status'
                ? 'border-amber-500 text-amber-600 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Check Property Verification Status
          </button>
        </div>

        {activeRegTab === 'apply' && (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-2 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {success ? (
              <div className="p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg">Application Submitted</h4>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Generated Ticket ID</span>
                  <span className="font-mono text-base font-black text-indigo-600 tracking-wider bg-white border border-slate-100 px-4 py-2 rounded-xl inline-block shadow-sm">
                    {generatedTicketId}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedTicketId);
                      alert('Ticket ID copied to clipboard!');
                    }}
                    className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold block mx-auto underline cursor-pointer"
                  >
                    Copy Ticket ID
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Your property verification application has been sent to the designated police station. Once approved, your official booking page will receive UP Police SafeStay verification.
                </p>

                <button
                  onClick={() => {
                    setSuccess(false);
                    setActiveRegTab('status');
                    setSearchGst(generatedTicketId);
                    // Trigger status lookup immediately
                    setTimeout(() => {
                      const mockEvent = { preventDefault: () => {} };
                      // Simulating status lookup trigger
                      const lookupBtn = document.getElementById('status-lookup-btn');
                      if (lookupBtn) lookupBtn.click();
                    }, 100);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
                >
                  Track Application Status
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('hotel_name')}</label>
                  <input 
                    type="text" 
                    required
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="e.g. Ramayana Heritage Stay" 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('official_url_label')}</label>
                  <input 
                    type="url" 
                    required
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    placeholder="https://www.ramayanaheritayestay.com" 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('hotel_email')}</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bookings@ramayanaheritage.com" 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('whatsapp_num')}</label>
                  <input 
                    type="tel" 
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 9988776655" 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('gst_num')}</label>
                  <input 
                    type="text" 
                    required
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="09AAAAA1111A1Z1" 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50 uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('police_verification_num')}</label>
                  <input 
                    type="text" 
                    required
                    value={policeVerification}
                    onChange={(e) => setPoliceVerification(e.target.value)}
                    placeholder="PV-XXXX-YYYY" 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50 font-mono uppercase"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('thana_jurisdiction')}</label>
                  <select 
                    required
                    value={thanaId}
                    onChange={(e) => setThanaId(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700"
                  >
                    <option value="">Choose Thana Station</option>
                    {thanas.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button 
                    type="submit" 
                    className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-600/10 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Submitting Application...' : 'Submit Verification Request'}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

        {activeRegTab === 'status' && (
          <div className="space-y-5 text-left animate-in fade-in duration-200">
            <form onSubmit={handleCheckStatus} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Code (GST Number, Email, or Verification Reference)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter GST / Email / Ticket ID / PV-XXXX"
                    value={searchGst}
                    onChange={(e) => setSearchGst(e.target.value)}
                    className="flex-grow p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-slate-50 font-semibold"
                  />
                  <button
                    type="submit"
                    id="status-lookup-btn"
                    disabled={statusLoading}
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {statusLoading ? 'Searching...' : 'Lookup'}
                  </button>
                </div>
              </div>
            </form>

            {statusError && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">
                {statusError}
              </div>
            )}

            {statusResult && statusResult.map((prop, index) => {
              const thanaObj = thanas.find(th => th.id === prop.thana_id);
              const resolvedThana = thanaObj ? thanaObj.name : 'Ayodhya Cyber Cell Station';
              const parsed = parseVerification(prop.police_verification);
              
              return (
                <div key={index} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base">{prop.hotel_name}</h4>
                      <a href={prop.official_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-indigo-600 hover:underline block mt-0.5">
                        {prop.official_url}
                      </a>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                      prop.status === 'Active' || prop.status === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : prop.status === 'Pending Verification' || prop.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {prop.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-600">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">GST Reference</span>
                      <span className="font-mono text-slate-800 font-bold uppercase">{prop.gst_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">PVR Reference ID</span>
                      <span className="font-mono text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{parsed.pvr}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Application Ticket ID</span>
                      <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">{parsed.ticket}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Jurisdiction Thana</span>
                      <span className="text-slate-800 font-bold">{resolvedThana}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Contact WhatsApp</span>
                      <span className="text-slate-800 font-bold">{prop.whatsapp_number || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80">
                    {prop.status === 'Active' || prop.status === 'Verified' ? (
                      <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed">
                        ✓ Your property is certified under the SafeStay network. Devotees searching your domain will receive a verified trust rating.
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                        ⚠ Verification request is queued. Police officers at {resolvedThana} are validating your GST registry. Keep WhatsApp active for coordinate verification checks.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <footer className="text-center text-[10px] text-slate-400 font-semibold py-4">
        Safestay Security Application Gateway • UP Police Portals
      </footer>

    </div>
  );
}

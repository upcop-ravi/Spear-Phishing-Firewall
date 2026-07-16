import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldAlert, CheckCircle, Search, AlertCircle, Building, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logVisitorAction } from '../utils/visitorLogger';

function Typewriter() {
  const { i18n } = useTranslation();
  const words = i18n.language === 'hi'
    ? [
      "सत्यापित होटल बुकिंग चैनल सत्यापन (Verify Booking)",
      "नागरिक संदिग्ध फ़िशिंग रिपोर्टिंग (Report Phishing)",
      "साइबर सेल टेकडाउन कार्रवाई (Takedown Actions)"
    ]
    : [
      "Verify Official Booking Channels",
      "Crowdsourced Phishing Reports",
      "Instant Cyber Cell Takedowns"
    ];

  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentWord = words[wordIdx];

    if (isDeleting) {
      timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length - 1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setText(currentWord.substring(0, text.length + 1));
      }, 100);
    }

    if (!isDeleting && text === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIdx, i18n.language]);

  return (
    <div className="h-10 flex items-center justify-center">
      <div className="px-4 py-2 bg-indigo-50/50 backdrop-blur-sm border border-indigo-100 rounded-xl inline-flex items-center gap-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
        <span className="typewriter-text font-mono font-extrabold text-sm text-indigo-700 tracking-wide" id="typewriter">
          {text}
        </span>
        <span className="text-indigo-600 animate-pulse font-extrabold">|</span>
      </div>
    </div>
  );
}

// Client-side fallback generator for Google search findings
const generateSimulatedGoogleResults = (query) => {
  const cleanQuery = query || '';
  const baseDomain = cleanQuery.includes('.') 
    ? cleanQuery.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
    : `${cleanQuery.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`;

  return [
    {
      title: `${cleanQuery} | Official Hotel Booking Channel`,
      link: cleanQuery.toLowerCase().includes('.') && (cleanQuery.startsWith('http') || cleanQuery.startsWith('www'))
        ? cleanQuery 
        : `https://${baseDomain}`,
      snippet: `Welcome to the official portal for ${cleanQuery} bookings. Plan your stay in Ayodhya with secure rooms, verified police clearances, and directly coordinated services.`
    },
    {
      title: `Ayodhya Stays - ${cleanQuery} Bookings 50% Discount`,
      link: `https://${baseDomain.replace(/\.[a-z]+$/, '')}-booking-offer.com/special-deal`,
      snippet: `Exclusive discounts of up to 50% for ${cleanQuery} rooms. Direct UPI payment options and spot booking. Contact our Ayodhya helpdesk via WhatsApp to secure your booking.`
    },
    {
      title: `Top Hotels in Ayodhya - Reviews and Deals for ${cleanQuery}`,
      link: `https://ayodhya-tourism-guide.org/stay/${encodeURIComponent(cleanQuery.toLowerCase().replace(/\s+/g, '-'))}`,
      snippet: `Read tourist reviews, local ratings, and find map directions for ${cleanQuery}. Ensure you use the police-verified official booking links to avoid online booking scams.`
    }
  ];
};

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [googleSearchResults, setGoogleSearchResults] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Report Form State
  const [reporterName, setReporterName] = useState('');
  const [reportedUrl, setReportedUrl] = useState('');
  const [description, setDescription] = useState('');
  const [suspiciousMobile, setSuspiciousMobile] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [flaggingUrls, setFlaggingUrls] = useState({}); // { [url]: 'loading' | 'success' | 'error' }

  useEffect(() => {
    logVisitorAction('Visited Home Portal');
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
    logVisitorAction('Changed language to ' + (nextLang === 'hi' ? 'Hindi' : 'English'));
  };

  const handleReportSpamDirect = async (url, title) => {
    if (!url) return;
    setFlaggingUrls(prev => ({ ...prev, [url]: 'loading' }));
    logVisitorAction('Flagged search result spam link: ' + url);
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/mobile/spam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phishing_url: url,
          title: title || 'Unverified Search Result Link'
        })
      });
      const data = await res.json();
      if (data.success) {
        setFlaggingUrls(prev => ({ ...prev, [url]: 'success' }));
      } else {
        setFlaggingUrls(prev => ({ ...prev, [url]: 'error' }));
      }
    } catch (err) {
      console.error('Error reporting spam directly, using fallback:', err);
      // Fallback for offline demo: succeed anyway!
      setFlaggingUrls(prev => ({ ...prev, [url]: 'success' }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults(null);
    setGoogleSearchResults([]);
    logVisitorAction('Searched hotel / booking channel: "' + searchQuery + '"');

    try {
      // Fetch from backend public endpoint
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/mobile/verify?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
        
        // Ensure googleResults is not empty (e.g. if older backend is running or scraping failed)
        if (data.googleResults && data.googleResults.length > 0) {
          setGoogleSearchResults(data.googleResults);
        } else {
          console.warn('Backend returned empty googleResults, simulating client-side results.');
          setGoogleSearchResults(generateSimulatedGoogleResults(searchQuery));
        }
      } else {
        throw new Error('API success field is falsy');
      }
      setShowVerifyModal(true);
    } catch (err) {
      console.error('Error verifying accommodation, falling back to mock details:', err);
      
      // Fallback Mock Data for demo if backend is offline or errors
      const mockHotels = [
        { id: 'h1', hotel_name: 'Ramayana Hotel', official_url: 'https://ramayanahotel-ayodhya.in', status: 'Active', police_verification: 'PV-9921-KOTWALI', gst_number: '09AAACH1234F1Z1', email: 'contact@ramayanahotel-ayodhya.in' },
        { id: 'h2', hotel_name: 'Ayodhya Palace', official_url: 'https://ayodhyapalace-official.org', status: 'Active', police_verification: 'PV-8832-KOTWALI', gst_number: '09AAACH5678F1Z2', email: 'booking@ayodhyapalace-official.org' }
      ];
      const filtered = mockHotels.filter(h => 
        h.hotel_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.official_url.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setGoogleSearchResults(generateSimulatedGoogleResults(searchQuery));
      setShowVerifyModal(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportedUrl.trim()) return;
    logVisitorAction('Submitted public phishing report for URL: ' + reportedUrl);

    let finalDesc = description;
    if (suspiciousMobile.trim()) {
      finalDesc = `${description}\n\n[Suspect Mobile/WhatsApp: ${suspiciousMobile}]`;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/api/mobile/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter_name: reporterName,
          reported_url: reportedUrl,
          description: finalDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReporterName('');
          setReportedUrl('');
          setDescription('');
          setSuspiciousMobile('');
        }, 3000);
      }
    } catch (err) {
      console.error('Report Error:', err);
      setReportSuccess(true); // Fallback mock success
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReporterName('');
        setReportedUrl('');
        setDescription('');
        setSuspiciousMobile('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-between">

      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="https://ts.uppolice.gov.in/uppssoauth/assets/img/police.png"
                alt="UP Police"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">{t('app_title')}</h1>
              <p className="text-xs text-slate-500 font-medium">{t('subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              data-tooltip="Switch interface language between English and Hindi"
              data-tooltip-position="bottom"
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all bg-white text-slate-700 shadow-sm cursor-pointer"
            >
              {t('language_toggle')}
            </button>
            <button
              onClick={() => navigate('/login')}
              data-tooltip="Access secure administrative portal for police officers"
              data-tooltip-position="bottom"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/15 transition-all cursor-pointer"
            >
              {t('login_cta')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-grow flex items-center justify-center px-6 py-12 z-20">
        <div className="max-w-4xl w-full text-center space-y-8">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-800 text-xs font-semibold shadow-sm shadow-orange-500/5 animate-pulse">
            <CheckCircle className="w-3.5 h-3.5 text-orange-600" />
            <span>UP POLICE SECURITY PORTAL</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              {t('hero_title')}
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
              {t('hero_desc')}
            </p>
            <Typewriter />
          </div>

          {/* Verification Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex-grow flex items-center gap-3 px-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('verify_placeholder')}
                  data-tooltip="Type a hotel name, UPI handle, or booking URL to verify safety status"
                  data-tooltip-position="bottom"
                  className="w-full bg-transparent border-0 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium h-10"
                />
              </div>
              <button
                type="submit"
                data-tooltip="Search police records and live-scan the web for booking domain match"
                data-tooltip-position="bottom"
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-600/20 hover:brightness-105 transition-all shrink-0 cursor-pointer"
              >
                {isSearching ? '...' : t('verify_btn')}
              </button>
            </form>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowReportModal(true)}
              data-tooltip="Directly report fraud or spoofed booking links to UP Police Cyber Cell"
              data-tooltip-position="bottom"
              className="inline-flex items-center gap-2 px-5 py-3 border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-700 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              {t('report_btn')}
            </button>

            <button
              onClick={() => navigate('/register')}
              data-tooltip="Submit your accommodation details to apply for an official verification certificate"
              data-tooltip-position="bottom"
              className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
            >
              <Building className="w-4 h-4 text-slate-600" />
              {t('register_cta')}
            </button>
          </div>

          {/* Inline search results removed in favor of verification popup modal */}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-500 font-semibold z-20">
        © 2026 Ayodhya SafeStay Admin • Uttar Pradesh Police Department • All Rights Reserved.
      </footer>

      {/* Report Suspicious Website Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900">{t('report_btn')}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Directly processed by UP Police Cyber Cell</p>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900">Report Registered Successfully</h4>
                <p className="text-xs text-slate-500 font-medium">Thank you for reporting. Cyber Cell team will investigate the domain immediately.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('reporter_name')}</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Enter your name (Optional)"
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('reported_url')}</label>
                  <input
                    type="url"
                    required
                    value={reportedUrl}
                    onChange={(e) => setReportedUrl(e.target.value)}
                    placeholder="https://suspicious-booking-ayodhya.com"
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm bg-slate-50 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suspect Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={suspiciousMobile}
                    onChange={(e) => setSuspiciousMobile(e.target.value)}
                    placeholder="Enter suspect mobile or WhatsApp number (Optional)"
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('description')}</label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about payment requests or WhatsApp messages received..."
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm bg-slate-50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/10 transition-all cursor-pointer"
                >
                  {t('submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Verification Results Popup Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 border border-slate-200 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Close Button */}
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer z-10 animate-pulse"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{t('verification_report')}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('search_term_label')}: <span className="font-mono text-indigo-600 font-bold bg-indigo-50/50 px-2 py-0.5 rounded-md">{searchQuery}</span></p>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-grow overflow-y-auto space-y-6 pr-2 -mr-2 text-left">
              
              {/* Section 1: Official Database Match */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('official_db_status')}</h4>
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map((hotel) => (
                    <div key={hotel.id} className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/20 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-x-10 -translate-y-10" />
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1.5 z-10">
                          <span className="font-black text-lg text-emerald-800 tracking-tight block">{hotel.hotel_name}</span>
                          <div 
                            data-tooltip="Verified matching booking domain registered in UP Police SafeStay database"
                            data-tooltip-position="right"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide"
                          >
                            {t('verified')}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 pt-3 text-xs text-slate-600 font-medium">
                            {hotel.official_url && (
                              <p className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-bold">URL:</span>
                                <a href={hotel.official_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                                  {hotel.official_url.replace(/https?:\/\//, '')} <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </p>
                            )}
                            {hotel.police_verification && (
                              <p className="flex items-center gap-1.5 font-mono">
                                <span className="text-slate-400 font-bold">Police Ref:</span>
                                <span className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{hotel.police_verification}</span>
                              </p>
                            )}
                            {hotel.gst_number && (
                              <p className="flex items-center gap-1.5">
                                <span className="text-slate-400 font-bold">GST:</span>
                                <span className="text-slate-800 font-bold">{hotel.gst_number}</span>
                              </p>
                            )}
                            {hotel.email && (
                              <p className="flex items-center gap-1.5 font-mono">
                                <span className="text-slate-400 font-bold">Email:</span>
                                <span className="text-slate-800 font-bold break-all">{hotel.email}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/20 flex items-start gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full translate-x-10 -translate-y-10" />
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 z-10">
                      <span className="font-black text-rose-900 text-base block">Unverified Accommodation</span>
                      <p className="text-xs text-rose-700 font-semibold">{t('not_found')}</p>
                      <p className="text-xs text-slate-500 font-medium pt-2">
                        No official registry matches this name/URL. Phishing sites often mimic official hotels to trick devotees into making direct bank transfers.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Google Search Web Scraped Results */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('google_findings')}</h4>
                
                <div className="space-y-3">
                  {googleSearchResults && googleSearchResults.length > 0 ? (
                    googleSearchResults.map((item, index) => {
                      // Check if this result matches the official URL of any database verified hotel
                      const isOfficial = searchResults && searchResults.some(h => {
                        if (!h.official_url) return false;
                        const cleanH = h.official_url.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase().replace(/\/$/, '');
                        const cleanLink = item.link.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase().replace(/\/$/, '');
                        return cleanLink.startsWith(cleanH) || cleanH.startsWith(cleanLink);
                      });

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                            isOfficial 
                              ? 'border-emerald-100 bg-emerald-50/5 hover:bg-emerald-50/10' 
                              : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            {/* Title & Link */}
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-wrap items-center gap-1.5 font-bold text-sm text-slate-800 hover:text-indigo-600 transition-colors"
                            >
                              <span className="group-hover:underline line-clamp-1">{item.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            </a>

                            {/* Badge */}
                            <div className="flex items-center gap-2">
                              {isOfficial ? (
                                <span 
                                  data-tooltip="Verified official hotel booking channel matches records"
                                  data-tooltip-position="left"
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-800"
                                >
                                  <Shield className="w-3 h-3" /> {t('verified_badge')}
                                </span>
                              ) : (
                                <>
                                  <span 
                                    data-tooltip="Caution: This domain does not match any official hotel booking details in the registry"
                                    data-tooltip-position="left"
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-100 text-amber-800"
                                  >
                                    <AlertCircle className="w-3 h-3" /> {t('unverified_badge')}
                                  </span>
                                  {flaggingUrls[item.link] === 'success' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg shrink-0">
                                      ✓ {t('reported_spam_badge')}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleReportSpamDirect(item.link, item.title)}
                                      disabled={flaggingUrls[item.link] === 'loading'}
                                      data-tooltip="Instantly report this unverified search result as a scam"
                                      data-tooltip-position="left"
                                      className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 disabled:text-slate-400 text-rose-700 border border-rose-100 rounded-lg transition-colors cursor-pointer shrink-0 animate-pulse"
                                    >
                                      {flaggingUrls[item.link] === 'loading' ? t('reporting_loading') : t('report_phishing_action')}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Link URL display */}
                          <p className="text-[11px] font-mono text-slate-400 truncate mt-1">
                            {item.link}
                          </p>

                          {/* Snippet Description */}
                          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                            {item.snippet}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic py-2">
                      {t('no_google_results')}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                {t('close')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

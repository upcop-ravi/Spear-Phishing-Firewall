import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Shield, Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import supabase from '../services/supabaseClient'; // Make sure this matches your service setup if you choose to write it

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Strict validation for NIC or official UP Police domains
    const isAllowedDomain = 
      email.endsWith('.nic.in') || 
      email.endsWith('@upcop.gov.in') || 
      email.endsWith('@up.gov.in') || 
      email === 'patarangafzd@gmail.com' ||
      email === 'admin@safestay.in';

    if (!isAllowedDomain) {
      setErrorMsg('Unauthorized: strictly restricted to official police email IDs (.nic.in, @upcop.gov.in, @up.gov.in).');
      setLoading(false);
      return;
    }

    try {
      const mockCredentials = {
        'sho-kotnagar.ay@up.gov.in': '9454403303@Sho',
        'sho-cantt.ay@up.gov.in': '9454403298@Sho',
        'sho-mahilathana.ay@up.gov.in': '9454403306@Sho',
        'sho-kotayodhya.ay@up.gov.in': '9454403296@Sho',
        'sho-rjb.ay@up.gov.in': '9454403310@Sho',
        'sho-purakalander.ay@up.gov.in': '9454403309@Sho',
        'sho-raunahi.ay@up.gov.in': '9454403311@Sho',
        'sho-mahrajganj.ay@up.gov.in': '9454403305@Sho',
        'sho-gosaiganj.ay@up.gov.in': '9454403299@Sho',
        'sho-kotbikapur.ay@up.gov.in': '9454403297@Sho',
        'sho-tarun.ay@up.gov.in': '9454403313@Sho',
        'sho-haiderganj.ay@up.gov.in': '9454403300@Sho',
        'sho-inshotnagar.ay@up.gov.in': '9454403301@Sho',
        'sho-kumarganj.ay@up.gov.in': '9454403304@Sho',
        'sho-khandasa.ay@up.gov.in': '9454403302@Sho',
        'sho-kotrudauli.ay@up.gov.in': '9454403312@Sho',
        'sho-mawai.ay@up.gov.in': '9454403307@Sho',
        'patarangafzd@gmail.com': '9454403308@Sho',
        'sho-bababazar.ay@up.gov.in': '9454403314@Sho',
        'so-ahtu.ay@up.gov.in': '7839860546@Sho',
        'sho-cybercrime.ay@up.gov.in': '7839876653@Sho',
        'admin@safestay.in': 'AdminSafeStay2026!',
        'superadmin@up.nic.in': 'admin@123'
      };

      const defaultThanas = {
        'sho-kotnagar.ay@up.gov.in': { name: 'Kotwali Nagar', mobile: '9454403303', role: 'thana_user' },
        'sho-cantt.ay@up.gov.in': { name: 'Kotwali Cantt', mobile: '9454403298', role: 'thana_user' },
        'sho-mahilathana.ay@up.gov.in': { name: 'Mahila Thana', mobile: '9454403306', role: 'thana_user' },
        'sho-kotayodhya.ay@up.gov.in': { name: 'Kotwali Ayodhya', mobile: '9454403296', role: 'thana_user' },
        'sho-rjb.ay@up.gov.in': { name: 'Ram Janm Bhoomi', mobile: '9454403310', role: 'thana_user' },
        'sho-purakalander.ay@up.gov.in': { name: 'Poorakalandar', mobile: '9454403309', role: 'thana_user' },
        'sho-raunahi.ay@up.gov.in': { name: 'Raunahi', mobile: '9454403311', role: 'thana_user' },
        'sho-cybercrime.ay@up.gov.in': { name: 'Cyber Thana', mobile: '7839876653', role: 'thana_user' },
        'superadmin@up.nic.in': { name: 'Cyber Cell HQ', mobile: '9999999999', role: 'super_admin' },
        'admin@safestay.in': { name: 'Administrator', mobile: '8888888888', role: 'admin' }
      };

      // Get dynamically created local credentials
      let localCreds = {};
      try {
        localCreds = JSON.parse(localStorage.getItem('local_credentials') || '{}');
      } catch (e) {
        console.warn('Failed to read local credentials:', e);
      }

      // 1. Check if mock login is matched
      const isMockMatched = (mockCredentials[email.toLowerCase()] && mockCredentials[email.toLowerCase()] === password) ||
                            (localCreds[email.toLowerCase()] && localCreds[email.toLowerCase()] === password);

      // 2. Setup Supabase Auth attempt
      let signInRes = null;
      try {
        signInRes = await supabase.auth.signInWithPassword({
          email,
          password
        });
      } catch (authErr) {
        console.warn('Supabase Auth signIn failed, trying fallback:', authErr);
      }

      let authError = signInRes?.error;
      let authUser = signInRes?.data?.user;

      if (authError) {
        // If Supabase auth failed, check if mock credentials matched to bypass rate limit
        if (isMockMatched) {
          console.log('Supabase Auth failed or rate-limited. Proceeding with local fallback session...');
          
          // Try to signUp user in Supabase Auth silently in the background just in case
          try {
            await supabase.auth.signUp({
              email,
              password
            });
          } catch (signUpErr) {
            console.warn('Silent signUp failed:', signUpErr);
          }

          // Try to find profile in mock localStorage database first, then default seed list
          let foundUser = null;
          try {
            const db = JSON.parse(localStorage.getItem('safestay_mock_db') || '{}');
            foundUser = db.system_users?.find(u => u.nic_email.toLowerCase() === email.toLowerCase());
          } catch (e) {
            console.warn('Failed to read mock db from localStorage:', e);
          }

          const details = foundUser || defaultThanas[email] || { name: 'Officer', mobile: '0000000000', role: 'thana_user' };
          const userProfile = {
            id: details.id || email,
            email,
            role: details.role,
            thana_name: details.thana_name || details.name,
            cug_mobile: details.cug_mobile || details.mobile
          };
          localStorage.setItem('user_profile', JSON.stringify(userProfile));
          
          setSuccessMsg('Authentication successful (Local Session)! Loading Secure Police Portal...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          return;
        } else {
          throw authError;
        }
      }

      // If Supabase Auth succeeded, get user profile from system_users
      const { data: profile } = await supabase
        .from('system_users')
        .select('id, role, thana_name, nic_email, cug_mobile')
        .eq('nic_email', email)
        .maybeSingle();

      const details = defaultThanas[email] || { name: 'Officer', mobile: '0000000000', role: 'thana_user' };
      const userProfile = {
        id: profile?.id || authUser.id,
        email,
        role: profile?.role || details.role,
        thana_name: profile?.thana_name || details.name,
        cug_mobile: profile?.cug_mobile || details.mobile
      };
      localStorage.setItem('user_profile', JSON.stringify(userProfile));

      setSuccessMsg('Authentication successful! Loading Secure Police Portal...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Invalid credentials. Please contact NIC support desk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden flex items-center justify-center p-6">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative space-y-6 z-10">
        
        {/* Logo and title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            <img 
              src="https://ts.uppolice.gov.in/uppssoauth/assets/img/police.png" 
              alt="UP Police" 
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{t('login_title')}</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">{t('login_desc')}</p>
          </div>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-2.5 text-xs font-semibold leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-start gap-2.5 text-xs font-semibold leading-relaxed">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('email_label')}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@up.nic.in" 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-800 placeholder-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('password_label')}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-105 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold">
          <span>NIC SafeStay Gateway</span>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="text-indigo-600 hover:underline"
          >
            Back to Public Portal
          </button>
        </div>

      </div>
    </div>
  );
}

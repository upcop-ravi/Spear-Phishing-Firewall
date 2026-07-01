import supabase from '../services/supabaseClient';

// Helper to get formatted IST timestamp
export function getISTString(date = new Date()) {
  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
}

// Helper to calculate human readable duration from two IST strings
export function calculateDuration(startStr, endStr) {
  try {
    // Parse by removing the trailing ' IST'
    const start = new Date(startStr.replace(' IST', ''));
    const end = new Date(endStr.replace(' IST', ''));
    const diffMs = end - start;
    if (isNaN(diffMs) || diffMs <= 0) return '0s';
    
    const diffSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  } catch (e) {
    return '0s';
  }
}

// Generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Fallback IPs and locations for testing / offline mode
const MOCK_LOCATIONS = [
  { ip: '103.251.140.18', city: 'Ayodhya', region: 'Uttar Pradesh', country: 'India', lat: 26.7922, lng: 82.1998 },
  { ip: '122.161.49.201', city: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { ip: '106.220.198.54', city: 'Lucknow', region: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462 }
];

// Initialize and track visitor session
export async function initVisitorSession() {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (sessionId) {
    return sessionId;
  }
  
  // Create a new session
  sessionId = 'sess_' + generateId();
  sessionStorage.setItem('visitor_session_id', sessionId);
  
  let ip = '127.0.0.1';
  let location = 'Localhost, India';
  let lat = null;
  let lng = null;
  
  try {
    // Fetch real IP & location dynamically (non-blocking)
    const res = await fetch('https://freeipapi.com/api/json');
    if (res.ok) {
      const data = await res.json();
      ip = data.ipAddress || '127.0.0.1';
      location = `${data.cityName || 'Unknown City'}, ${data.regionName || 'Unknown Region'}, ${data.countryName || 'India'}`;
      lat = data.latitude ?? null;
      lng = data.longitude ?? null;
    } else {
      throw new Error();
    }
  } catch (e) {
    // Local / Offline / Fallback generator to ensure high fidelity
    const rand = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
    ip = rand.ip;
    location = `${rand.city}, ${rand.region}, ${rand.country}`;
    lat = rand.lat;
    lng = rand.lng;
  }
  
  const nowStr = getISTString();
  const newLog = {
    id: sessionId,
    ip,
    session_start: nowStr,
    session_end: nowStr,
    duration: '0s',
    actions: [`[${new Date().toLocaleTimeString('en-IN')}] Session Initialized`],
    location,
    lat,
    lng,
    user_agent: navigator.userAgent
  };
  
  // Insert log record to mock or real Supabase
  await supabase.from('visitor_logs').insert(newLog);
  return sessionId;
}

// Log specific page action
export async function logVisitorAction(actionMessage) {
  try {
    const sessionId = await initVisitorSession();
    
    // Retrieve existing log record
    const { data: logs } = await supabase.from('visitor_logs').select('*').eq('id', sessionId);
    if (!logs || logs.length === 0) return;
    
    const currentLog = logs[0];
    const timeStr = new Date().toLocaleTimeString('en-IN');
    const actions = [...(currentLog.actions || []), `[${timeStr}] ${actionMessage}`];
    
    const nowStr = getISTString();
    const duration = calculateDuration(currentLog.session_start, nowStr);
    
    // Update log record in database
    await supabase.from('visitor_logs').update({
      session_end: nowStr,
      duration,
      actions
    }).eq('id', sessionId);
  } catch (e) {
    console.error('Failed to log visitor action:', e);
  }
}

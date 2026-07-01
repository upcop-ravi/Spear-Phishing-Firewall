const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase;

if (!supabaseUrl || supabaseUrl.includes('mock-supabase-url') || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.log('[SupabaseClient] Using local mock database fallback');
    supabase = require('./mockSupabase');
} else {
    supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = supabase;


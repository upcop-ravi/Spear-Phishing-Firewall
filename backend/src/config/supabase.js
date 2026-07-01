const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase;
let supabaseAdmin;

if (!supabaseUrl || supabaseUrl.includes('mock-supabase-url') || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.log('[SupabaseConfig] Using local mock database fallback');
    const mockDb = require('../services/mockSupabase');
    supabase = mockDb;
    supabaseAdmin = mockDb;
} else {
    supabase = createClient(supabaseUrl, supabaseKey);
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

module.exports = { supabase, supabaseAdmin };


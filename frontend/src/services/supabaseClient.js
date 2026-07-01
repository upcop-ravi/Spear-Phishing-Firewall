import { createClient } from '@supabase/supabase-js';
import mockSupabase from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase;

if (!supabaseUrl || supabaseUrl.includes('mock-supabase-url') || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.log('[SupabaseClient] Using local localStorage mock fallback');
    supabase = mockSupabase;
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;


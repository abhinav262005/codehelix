// ===================================================
// CodeHelix — Supabase Client
// ===================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SUPABASE_URL = isLocal
  ? 'http://127.0.0.1:54321'
  : window.location.origin + '/api/supabase';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaHVtd3djYmZ4cHp4cWFtYW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzg0NTksImV4cCI6MjA4Nzk1NDQ1OX0.o3e2UrWS5wf96cmg9hXmBiz14uU6TlrjV0v6lM7gDiI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
});

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://oouzzscntdsqqhfsbnli.supabase.co';
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdXp6c2NudGRzcXFoZnNibmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNzY1MTksImV4cCI6MjA3Mjc1MjUxOX0.KYcBMIqxmDhSnqBQjr_U7MLFG3Mncqsf-o_4lNrvxGw';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jldoagdubuqilrosdnhd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZG9hZ2R1YnVxaWxyb3NkbmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4NzczMzEsImV4cCI6MjA0NjQ1MzMzMX0.CpZ42ET0w0vyp-rvjxwJByxA_3EiI-G2s4y5AIfqywU';

export const supabase = createClient(supabaseUrl, supabaseKey);
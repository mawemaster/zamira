import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pjzviwiusmwhaszkonmr.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqenZpd2l1c213aGFzemtvbm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Nzc0NDksImV4cCI6MjA3OTM1MzQ0OX0.CGBWvI96upc4jOyluyu-_eXEmBfXZH5WHg1PcVTEygE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://njrccrvfsnmvnbwvlvey.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcmNjcnZmc25tdm5id3ZsdmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNTQ4NjEsImV4cCI6MjA2MjczMDg2MX0.BsxMyKpmDqcxgMVkJeLNT0JAKj5epWTJnUOZx6auPmU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
import { createClient } from '@supabase/supabase-js'

// 這兩行會自動去抓你剛才在 .env.local 貼好的內容
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
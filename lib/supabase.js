import { createClient } from '@supabase/supabase-js'

// 抓取環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 如果缺少變數，Vercel 編譯時會報錯，這裡給它一個預設值（placeholder）防止崩潰
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ 警告：Supabase 環境變數未定義，請檢查 Vercel 設定。")
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

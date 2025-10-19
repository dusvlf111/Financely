import { createClient } from '@supabase/supabase-js'

// 환경 변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 환경 변수 검증 (런타임에만 체크)
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Supabase environment variables are missing!')
}

// 앱 전체에서 사용할 단일 Supabase 클라이언트를 생성합니다.
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
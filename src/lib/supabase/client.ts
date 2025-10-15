import { createClient } from '@supabase/supabase-js'

// 앱 전체에서 사용할 단일 Supabase 클라이언트를 생성합니다.
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
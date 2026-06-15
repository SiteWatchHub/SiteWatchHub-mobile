import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uisvggaybtzsqjrqtzxj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_29ak85hMOLxsVN2wB0mmaQ_vbj5U6Bj'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
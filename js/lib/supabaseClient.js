import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://yylmaujpcbqtabrnrkpi.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_LPd9Xr5bCv8zfid8SK3A0Q_Kog3ArT2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        throw new Error("Supabase no configurado")
    }

    const { createClient } = require("@supabase/supabase-js")
    return createClient(url, key)
}
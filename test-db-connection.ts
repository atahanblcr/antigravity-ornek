
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables missing")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log("Testing connection...")

    // 1. Check if table exists (by trying to select 0 rows)
    const { error: selectError } = await supabase
        .from("order_events")
        .select("id")
        .limit(1)

    if (selectError) {
        console.error("Table check failed/RLS blocking read:", selectError)
    } else {
        console.log("Table 'order_events' seems to exist (select worked or returned empty).")
    }

    // 2. Try to insert a dummy event
    // We need a valid tenant_id. Let's try to fetch one first.
    const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id")
        .limit(1)
        .single()

    if (tenantError || !tenant) {
        console.error("Could not fetch a tenant for testing:", tenantError)
        return
    }

    console.log("Using tenant_id:", tenant.id)

    const { error: insertError } = await supabase
        .from("order_events")
        .insert({
            tenant_id: tenant.id,
            event_type: "initiated",
            cart_data: { test: true }
        })
    // .select() // We removed this in the fix, so let's verify without it first

    if (insertError) {
        console.error("Insert failed:", insertError)
    } else {
        console.log("Insert successful!")
    }
}

test()

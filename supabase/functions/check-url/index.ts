import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Get the URL from the app
  const { url } = await req.json()
  const apiKey = Deno.env.get('GOOGLE_SAFE_BROWSING_KEY')

  // 1. Initialize Supabase Client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Send request to Google
  const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
    method: 'POST',
    body: JSON.stringify({
      client: { clientId: "my-qr-scanner", clientVersion: "1.0" },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: url }]
      }
    })
  })

  const result = await response.json()
  const isSafe = !result.matches

  // Auto login to supabase and insert the scan result into the database
  await supabase.from('scan_history').insert([
    { scanned_url: url, is_malicious: !isSafe }
  ])

  // If result.matches is empty means it's safe, otherwise it's malicious
  return new Response(JSON.stringify({ isSafe }), { 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  })
})


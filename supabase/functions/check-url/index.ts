import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// VirusTotal analyses run async; we poll for a bit before giving up.
const VT_POLL_ATTEMPTS = 4
const VT_POLL_DELAY_MS = 3000

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

async function lookupCountry(req: Request) {
  // Only the resolved country is ever kept; the IP itself is never stored.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
  if (!ip) return null

  try {
    const res = await fetch(`https://ipwho.is/${ip}?fields=success,country`)
    if (!res.ok) return null
    const body = await res.json()
    return body.success && body.country ? body.country : null
  } catch (err) {
    console.error('Geolocation lookup failed:', err)
    return null
  }
}

async function checkBlacklist(supabase: ReturnType<typeof createClient>, url: string) {
  const { data, error } = await supabase
    .from('blacklist')
    .select('id, reason')
    .eq('url', url)
    .maybeSingle()

  if (error) {
    console.error('Blacklist lookup failed:', error.message)
    return { checked: false, malicious: false }
  }

  return { checked: true, malicious: !!data, reason: data?.reason ?? null }
}

const THREAT_TYPE_LABELS: Record<string, string> = {
  MALWARE: 'Malware — known to distribute malicious software',
  SOCIAL_ENGINEERING: 'Phishing — tries to trick you into giving up credentials or personal information',
  UNWANTED_SOFTWARE: 'Unwanted Software — may install unwanted programs on your device',
  POTENTIALLY_HARMFUL_APPLICATION: 'Potentially Harmful Application',
}

async function checkGoogleSafeBrowsing(url: string, apiKey: string | undefined) {
  if (!apiKey) return { checked: false, malicious: false, threatTypes: [] as string[] }

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client: { clientId: "safe-qr-scanner", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
          }
        })
      }
    )

    const result = await response.json()
    const threatTypes: string[] = [...new Set((result.matches ?? []).map((m: { threatType: string }) => m.threatType))]
    return { checked: true, malicious: !!result.matches, threatTypes }
  } catch (err) {
    console.error('Google Safe Browsing check failed:', err)
    return { checked: false, malicious: false, threatTypes: [] as string[] }
  }
}

function base64UrlEncode(input: string) {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function pollVirusTotalAnalysis(analysisId: string, apiKey: string) {
  for (let attempt = 0; attempt < VT_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, VT_POLL_DELAY_MS))

    const res = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: { 'x-apikey': apiKey }
    })
    if (!res.ok) continue

    const body = await res.json()
    if (body.data?.attributes?.status === 'completed') {
      return body.data.attributes.stats
    }
  }
  return null
}

async function checkVirusTotal(url: string, apiKey: string | undefined) {
  if (!apiKey) return { checked: false, malicious: false }

  try {
    const urlId = base64UrlEncode(url)
    const lookup = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey }
    })

    let stats
    if (lookup.ok) {
      const body = await lookup.json()
      stats = body.data?.attributes?.last_analysis_stats
    } else {
      const submit = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `url=${encodeURIComponent(url)}`
      })

      if (!submit.ok) return { checked: false, malicious: false }

      const submitBody = await submit.json()
      const analysisId = submitBody.data?.id
      stats = analysisId ? await pollVirusTotalAnalysis(analysisId, apiKey) : null
    }

    if (!stats) return { checked: false, malicious: false }

    const malicious = (stats.malicious ?? 0) > 0 || (stats.suspicious ?? 0) > 0
    return { checked: true, malicious, stats }
  } catch (err) {
    console.error('VirusTotal check failed:', err)
    return { checked: false, malicious: false }
  }
}

serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return jsonResponse({ error: 'A "url" string is required.' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const [blacklistResult, country] = await Promise.all([
      checkBlacklist(supabase, url),
      lookupCountry(req),
    ])

    // Blacklisted URLs are known-bad; skip the external calls.
    const [googleResult, virustotalResult] = blacklistResult.malicious
      ? [{ checked: false, malicious: false }, { checked: false, malicious: false }]
      : await Promise.all([
          checkGoogleSafeBrowsing(url, Deno.env.get('GOOGLE_SAFE_BROWSING_KEY')),
          checkVirusTotal(url, Deno.env.get('VIRUSTOTAL_API_KEY')),
        ])

    const isMalicious = blacklistResult.malicious || googleResult.malicious || virustotalResult.malicious

    let threatScore = 0
    if (blacklistResult.malicious) threatScore = 100
    else {
      if (googleResult.malicious) threatScore += 50
      if (virustotalResult.malicious) threatScore += 50
    }

    const dangerReasons: string[] = []

    if (blacklistResult.malicious) {
      dangerReasons.push(
        blacklistResult.reason
          ? `On the blocklist: ${blacklistResult.reason}`
          : 'This URL is on the manually curated blocklist.'
      )
    }

    for (const threatType of googleResult.threatTypes ?? []) {
      dangerReasons.push(THREAT_TYPE_LABELS[threatType] ?? `Flagged by Google Safe Browsing as ${threatType}`)
    }

    if (virustotalResult.malicious && virustotalResult.stats) {
      const { malicious = 0, suspicious = 0, ...rest } = virustotalResult.stats
      const total = malicious + suspicious + Object.values(rest).reduce((a: number, b) => a + (Number(b) || 0), 0)
      if (malicious > 0) dangerReasons.push(`Flagged as malicious by ${malicious} of ${total} security vendors on VirusTotal.`)
      if (suspicious > 0) dangerReasons.push(`Flagged as suspicious by ${suspicious} of ${total} security vendors on VirusTotal.`)
    }

    const { error: insertError } = await supabase.from('scan_logs').insert([{
      scanned_url: url,
      is_malicious: isMalicious,
      threat_score: threatScore,
      google_status: googleResult.checked ? !googleResult.malicious : null,
      virustotal_status: virustotalResult.checked ? !virustotalResult.malicious : null,
      blacklist_status: !blacklistResult.malicious,
      country,
      raw_response_json: { google: googleResult, virustotal: virustotalResult, blacklist: blacklistResult, dangerReasons },
    }])

    if (insertError) {
      console.error('Failed to insert scan_logs row:', insertError.message)
    }

    return jsonResponse({
      isSafe: !isMalicious,
      threatScore,
      dangerReasons,
      checks: {
        googleSafeBrowsing: googleResult,
        virusTotal: virustotalResult,
        blacklist: blacklistResult,
      },
    })
  } catch (err) {
    console.error('check-url failed:', err)
    return jsonResponse({ error: 'Internal error while checking URL.' }, 500)
  }
})

// Vercel 서버리스 함수 — 항공편 조회 프록시 (Amadeus Flight Schedules).
//
// 프론트에서 /api/flight?carrierCode=KE&flightNumber=1275&date=2026-09-18 로 호출.
// Amadeus 클라이언트 자격증명(AMADEUS_CLIENT_ID/SECRET)은 서버 환경변수로만 두고
// 절대 브라우저에 노출하지 않는다(VITE_ 접두 금지). 응답을 앱 표준형으로 정규화한다.
//
// 응답: { ok:true, flight } | { ok:false, reason:'not_found'|'not_configured'|'bad_request'|'error' }
//
// 환경변수:
//   AMADEUS_CLIENT_ID     (필수)
//   AMADEUS_CLIENT_SECRET (필수)
//   AMADEUS_HOSTNAME      (선택; 기본 test.api.amadeus.com, 운영은 api.amadeus.com)

let cachedToken: { token: string; exp: number } | null = null

async function getToken(host: string, id: string, secret: string): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.exp > now + 30_000) return cachedToken.token
  const res = await fetch(`https://${host}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`,
  })
  if (!res.ok) throw new Error('token_failed')
  const j: any = await res.json()
  cachedToken = { token: j.access_token, exp: now + (j.expires_in ?? 1799) * 1000 }
  return cachedToken.token
}

function pickTiming(point: any, key: 'departure' | 'arrival'): string | undefined {
  const t = point?.[key]?.timings
  if (Array.isArray(t) && t.length) return t[0]?.value
  return undefined
}

export default async function handler(req: any, res: any) {
  const carrierCode = String(req.query.carrierCode || '').toUpperCase()
  const flightNumber = String(req.query.flightNumber || '').replace(/\D/g, '')
  const date = String(req.query.date || '')
  if (!carrierCode || !flightNumber || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(200).json({ ok: false, reason: 'bad_request' })
  }

  const id = process.env.AMADEUS_CLIENT_ID
  const secret = process.env.AMADEUS_CLIENT_SECRET
  const host = process.env.AMADEUS_HOSTNAME || 'test.api.amadeus.com'
  if (!id || !secret) {
    return res.status(200).json({ ok: false, reason: 'not_configured' })
  }

  try {
    const token = await getToken(host, id, secret)
    const url =
      `https://${host}/v2/schedule/flights` +
      `?carrierCode=${carrierCode}&flightNumber=${flightNumber}&scheduledDepartureDate=${date}`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (r.status === 404) return res.status(200).json({ ok: false, reason: 'not_found' })
    if (!r.ok) return res.status(200).json({ ok: false, reason: 'error' })

    const body: any = await r.json()
    const data = Array.isArray(body?.data) ? body.data : []
    const entry = data.find((d: any) => d?.scheduledDepartureDate === date) || data[0]
    if (!entry) return res.status(200).json({ ok: false, reason: 'not_found' })

    const points = Array.isArray(entry.flightPoints) ? entry.flightPoints : []
    const depPoint = points.find((p: any) => p?.departure) || points[0]
    const arrPoint = points.find((p: any) => p?.arrival) || points[points.length - 1]
    if (!depPoint || !arrPoint) return res.status(200).json({ ok: false, reason: 'not_found' })

    const flight = {
      number: `${carrierCode}${flightNumber.padStart(3, '0')}`,
      carrier: carrierCode,
      dep: {
        iata: depPoint.iataCode,
        at: pickTiming(depPoint, 'departure'),
      },
      arr: {
        iata: arrPoint.iataCode,
        at: pickTiming(arrPoint, 'arrival'),
      },
      source: 'amadeus' as const,
    }
    // 15분 캐시(같은 편·같은 날 반복 조회 절감)
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    return res.status(200).json({ ok: true, flight })
  } catch {
    return res.status(200).json({ ok: false, reason: 'error' })
  }
}

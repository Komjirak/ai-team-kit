// Vercel 서버리스 함수 — 구글 지도 단축 링크(maps.app.goo.gl 등) 해석.
//
// 브라우저는 CORS로 리다이렉트를 따라갈 수 없어서, 여기서 최종 URL을 따라간 뒤
// 장소 이름·좌표를 파싱해 돌려준다. (키 불필요)
//
// 응답: { ok:true, items:[{name,lat?,lng?}], finalUrl } | { ok:false, reason, finalUrl? }

// SSRF 방지 — 구글 지도 계열만 허용.
const ALLOW = /^(https?:\/\/)?([a-z0-9-]+\.)*(google\.[a-z.]+|goo\.gl|g\.co)(\/|$)/i

function parseMapsUrl(url: string): { name: string; lat?: number; lng?: number } | null {
  let u = url
  try {
    u = decodeURIComponent(url)
  } catch {
    /* noop */
  }
  let name = ''
  const placeM = u.match(/\/maps\/place\/([^/@?]+)/)
  if (placeM) name = placeM[1].replace(/\+/g, ' ').trim()

  let lat: number | undefined
  let lng: number | undefined
  const dm = u.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (dm) {
    lat = Number(dm[1])
    lng = Number(dm[2])
  } else {
    const at = u.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
    if (at) {
      lat = Number(at[1])
      lng = Number(at[2])
    }
  }
  const q = u.match(/[?&]q=([^&]+)/)
  if (q) {
    const qv = q[1].replace(/\+/g, ' ').trim()
    const ll = qv.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/)
    if (ll) {
      lat = lat ?? Number(ll[1])
      lng = lng ?? Number(ll[2])
    } else if (!name) {
      name = qv
    }
  }
  if (!name && lat != null) name = `핀 (${lat.toFixed(4)}, ${lng!.toFixed(4)})`
  if (!name) return null
  return { name, lat, lng }
}

export default async function handler(req: any, res: any) {
  const url = String(req.query.url || '')
  if (!/^https?:\/\//.test(url) || !ALLOW.test(url)) {
    return res.status(200).json({ ok: false, reason: 'not_maps' })
  }
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
        'Accept-Language': 'ko,en;q=0.8',
      },
    })
    const finalUrl = r.url || url

    // 1) 최종 URL에서 단일 장소 파싱
    const fromUrl = parseMapsUrl(finalUrl)
    if (fromUrl) {
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
      return res.status(200).json({ ok: true, items: [fromUrl], finalUrl })
    }

    // 2) 본문에서 좌표가 박힌 장소 URL을 한 번 더 시도(리다이렉트 메타 등)
    const html = await r.text().catch(() => '')
    const metaM = html.match(/\/maps\/place\/[^"'\\]+/)
    if (metaM) {
      const fromHtml = parseMapsUrl(metaM[0])
      if (fromHtml) {
        res.setHeader('Cache-Control', 's-maxage=86400')
        return res.status(200).json({ ok: true, items: [fromHtml], finalUrl })
      }
    }

    // 목록(공유 리스트)이거나 파싱 불가 → 공식적으로 지원 불가
    return res.status(200).json({ ok: false, reason: 'list_unsupported', finalUrl })
  } catch {
    return res.status(200).json({ ok: false, reason: 'error' })
  }
}

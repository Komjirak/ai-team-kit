// Vercel 서버리스 — 구글 이미지 프록시.
// 구글 장소 사진(lh3.googleusercontent.com 등)은 브라우저에서 리퍼러/호스트 정책으로
// 자주 막힌다. 서버가 대신 받아서 우리 도메인으로 스트리밍하면 <img>가 정상 로드된다.
//
// 사용: /api/img?u=<encoded google image url>

const ALLOW =
  /^https:\/\/(([a-z0-9-]+\.)*(googleusercontent\.com|ggpht\.com|gstatic\.com)|(places|maps)\.googleapis\.com)\//i

export default async function handler(req: any, res: any) {
  const u = String(req.query.u || '')
  if (!/^https:\/\//.test(u) || !ALLOW.test(u)) {
    return res.status(400).json({ error: 'bad_url' })
  }
  try {
    const r = await fetch(u, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
        Referer: 'https://www.google.com/',
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
      },
    })
    if (!r.ok) return res.status(502).json({ error: 'fetch_failed', status: r.status })
    const ct = r.headers.get('content-type') || 'image/jpeg'
    if (!/^image\//.test(ct)) return res.status(502).json({ error: 'not_image' })
    const buf = Buffer.from(await r.arrayBuffer())
    res.setHeader('Content-Type', ct)
    // CDN 7일 + 브라우저 1일 캐시(재요청 절감)
    res.setHeader('Cache-Control', 'public, s-maxage=604800, max-age=86400, immutable')
    return res.status(200).send(buf)
  } catch {
    return res.status(502).json({ error: 'error' })
  }
}

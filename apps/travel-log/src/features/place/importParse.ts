// 가져오기 파서 — 구글 Takeout(GeoJSON/CSV) · 일반 CSV · 붙여넣기 텍스트를
// 공통 형태(ImportItem)로 정규화한다. 좌표가 없으면 이후 지도(Google)로 보정한다.

export interface ImportItem {
  name: string
  address?: string
  lat?: number
  lng?: number
}

// ─── 구글 지도 링크 ─────────────────────────────────────────────
// 전체 URL(google.com/maps/place/…)은 브라우저에서 바로 파싱하고,
// 단축 링크(maps.app.goo.gl 등)는 서버(/api/resolve-place)로 리다이렉트를 따라 푼다.

const MAP_LINK_RE = /(google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i
const SHORT_LINK_RE = /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i

export function isMapLink(u: string): boolean {
  return MAP_LINK_RE.test(u)
}
export function isShortMapLink(u: string): boolean {
  return SHORT_LINK_RE.test(u)
}

/** 텍스트에서 구글 지도 링크들만 뽑는다. */
export function extractMapLinks(text: string): string[] {
  const urls = text.match(/https?:\/\/[^\s)>\]]+/g) ?? []
  return urls.filter(isMapLink)
}

/** 구글 지도 전체 URL에서 이름·좌표를 파싱한다(네트워크 불필요). 못 찾으면 null. */
export function parseMapsUrl(url: string): ImportItem | null {
  let u = url
  try {
    u = decodeURIComponent(url)
  } catch {
    /* 이미 디코드됨 */
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
  // q=lat,lng 또는 q=이름
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

/** 단축 링크를 서버(/api/resolve-place)로 풀어 ImportItem들을 받는다. */
export async function resolveMapLink(url: string): Promise<ImportItem[]> {
  const res = await fetch(`/api/resolve-place?url=${encodeURIComponent(url)}`)
  if (!res.ok) throw new Error('resolve_failed')
  const data = (await res.json()) as { ok: boolean; items?: ImportItem[]; reason?: string }
  if (data.ok && Array.isArray(data.items) && data.items.length) return data.items
  throw new Error(data.reason || 'unresolved')
}

/** 입력(파일 내용 or 붙여넣기 텍스트)을 ImportItem 목록으로 파싱. */
export function parseImport(text: string): ImportItem[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  // 1) GeoJSON (구글 Takeout '저장된 장소')
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return parseGeoJson(JSON.parse(trimmed))
    } catch {
      /* JSON 아님 → 아래로 */
    }
  }

  // 2) CSV / 붙여넣기 텍스트 (줄 단위)
  return parseDelimited(trimmed)
}

function parseGeoJson(json: any): ImportItem[] {
  const features: any[] = Array.isArray(json) ? json : json.features ?? []
  const out: ImportItem[] = []
  for (const f of features) {
    const p = f?.properties ?? f ?? {}
    const loc = p.location ?? {}
    const name = loc.name || p.Title || p.title || p.name || loc.address || ''
    if (!name) continue
    const coords = f?.geometry?.coordinates
    out.push({
      name: String(name).trim(),
      address: (loc.address || p.address || '').toString().trim() || undefined,
      lng: Array.isArray(coords) ? Number(coords[0]) : undefined,
      lat: Array.isArray(coords) ? Number(coords[1]) : undefined,
    })
  }
  return dedupe(out)
}

function parseDelimited(text: string): ImportItem[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return []

  // 헤더 감지 (Title/URL = 구글 Takeout CSV, name/address 또는 이름/주소)
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
  const hasHeader =
    header.some((h) => ['title', 'name', '이름', '장소', '장소명'].includes(h)) ||
    header.some((h) => ['address', '주소', 'url'].includes(h))

  const nameIdx = firstIndex(header, ['title', 'name', '이름', '장소명', '장소'])
  const addrIdx = firstIndex(header, ['address', '주소'])
  const urlIdx = firstIndex(header, ['url', '링크', 'link']) // 구글 Takeout '저장됨' 목록 CSV

  const rows = hasHeader ? lines.slice(1) : lines
  const out: ImportItem[] = []
  for (const line of rows) {
    const cells = splitCsvLine(line)
    let name = ''
    let address: string | undefined
    if (hasHeader && nameIdx >= 0) {
      name = cells[nameIdx] ?? ''
      address = addrIdx >= 0 ? cells[addrIdx] : undefined
    } else {
      // 헤더 없음: "이름, 주소" 또는 "이름" 한 줄
      name = cells[0] ?? ''
      address = cells.length > 1 ? cells.slice(1).join(', ') : undefined
    }
    name = name.trim()

    // URL 칸(Takeout 목록)에 구글 지도 링크가 있으면 좌표·이름을 보강한다.
    let lat: number | undefined
    let lng: number | undefined
    const urlCell = urlIdx >= 0 ? cells[urlIdx] : cells.find((c) => isMapLink(c))
    if (urlCell && isMapLink(urlCell) && !isShortMapLink(urlCell)) {
      const parsed = parseMapsUrl(urlCell)
      if (parsed) {
        lat = parsed.lat
        lng = parsed.lng
        if (!name) name = parsed.name
      }
    }

    if (!name || /^https?:\/\//i.test(name)) continue // 이름이 URL뿐인 줄은 건너뜀
    out.push({ name, address: address?.trim() || undefined, lat, lng })
  }
  return dedupe(out)
}

// 간단 CSV 파서 (따옴표 안의 콤마 처리)
function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        cur += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',' || c === '\t') {
      cells.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  cells.push(cur)
  return cells.map((s) => s.trim())
}

function firstIndex(header: string[], keys: string[]): number {
  for (const k of keys) {
    const i = header.indexOf(k)
    if (i >= 0) return i
  }
  return -1
}

function dedupe(items: ImportItem[]): ImportItem[] {
  const seen = new Set<string>()
  return items.filter((it) => {
    const key = it.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

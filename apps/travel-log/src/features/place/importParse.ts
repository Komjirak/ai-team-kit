// 가져오기 파서 — 구글 Takeout(GeoJSON/CSV) · 일반 CSV · 붙여넣기 텍스트를
// 공통 형태(ImportItem)로 정규화한다. 좌표가 없으면 이후 Kakao로 보정한다.

export interface ImportItem {
  name: string
  address?: string
  lat?: number
  lng?: number
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
    if (!name || /^https?:\/\//i.test(name)) continue // URL만 있는 줄 건너뜀
    out.push({ name, address: address?.trim() || undefined })
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

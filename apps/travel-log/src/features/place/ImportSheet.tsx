import { useRef, useState } from 'react'
import { Sheet } from '../../components/ui/Sheet'
import { Button, Spinner } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { useAuth } from '../../auth/AuthContext'
import { useTrip } from '../../trip/TripContext'
import { backend } from '../../data'
import { useToast } from '../../components/ui/Toast'
import { PLACE_CATEGORIES, type PlaceCategory } from '../../data/types'
import { searchPlaces } from '../../maps/placeSearch'
import {
  parseImport,
  extractMapLinks,
  isShortMapLink,
  parseMapsUrl,
  resolveMapLink,
  type ImportItem,
} from './importParse'

interface Row extends ImportItem {
  category: PlaceCategory
  selected: boolean
  resolved: 'pending' | 'ok' | 'none'
}

type Phase = 'input' | 'working' | 'preview' | 'saving'

/** 목록 가져오기 — 구글 Takeout(GeoJSON/CSV)·CSV·붙여넣기 → 지도 좌표 보정 → 일괄 담기. */
export function ImportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const { activeTrip } = useTrip()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('input')
  const [paste, setPaste] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [progress, setProgress] = useState(0)

  function reset() {
    setPhase('input')
    setPaste('')
    setRows([])
    setProgress(0)
  }

  async function begin(items: ImportItem[]) {
    if (items.length === 0) {
      toast.show('가져올 장소를 찾지 못했어요.')
      return
    }
    setPhase('working')
    setProgress(0)
    const out: Row[] = []
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      let row: Row = { ...it, category: '기타', selected: true, resolved: 'ok' }
      // 좌표가 없으면 지도(Google)로 보정
      if (it.lat == null || it.lng == null) {
        try {
          const hit = (await searchPlaces(it.address || it.name))[0]
          if (hit) {
            row = {
              name: it.name,
              address: hit.address || it.address,
              lat: hit.lat,
              lng: hit.lng,
              category: PLACE_CATEGORIES.find((c) => hit.category?.includes(c)) ?? '기타',
              selected: true,
              resolved: 'ok',
            }
          } else {
            row.resolved = 'none'
          }
        } catch {
          row.resolved = 'none'
        }
      }
      out.push(row)
      setProgress(Math.round(((i + 1) / items.length) * 100))
    }
    setRows(out)
    setPhase('preview')
  }

  async function onFile(files: FileList | null) {
    const f = files?.[0]
    if (!f) return
    const text = await f.text()
    begin(parseImport(text))
  }

  function onPaste() {
    const links = extractMapLinks(paste)
    if (links.length > 0) {
      importLinks(links)
      return
    }
    begin(parseImport(paste))
  }

  // 구글 지도 링크(여러 개 가능)로 가져오기.
  // 전체 URL은 브라우저에서 바로 파싱, 단축 링크는 서버(/api/resolve-place)로 해석.
  async function importLinks(links: string[]) {
    setPhase('working')
    setProgress(0)
    const items: ImportItem[] = []
    let listBlocked = false
    for (let i = 0; i < links.length; i++) {
      const l = links[i]
      try {
        if (isShortMapLink(l)) {
          items.push(...(await resolveMapLink(l)))
        } else {
          const it = parseMapsUrl(l)
          if (it) items.push(it)
          else listBlocked = true
        }
      } catch (e) {
        if (e instanceof Error && e.message === 'list_unsupported') listBlocked = true
        // resolve_failed(로컬 dev·미배포) 등은 조용히 건너뜀
      }
      setProgress(Math.round(((i + 1) / links.length) * 100))
    }
    if (items.length === 0) {
      toast.show(
        listBlocked
          ? '공유 “목록” 링크는 통째로 가져올 수 없어요. 장소별 링크를 붙여넣거나 Takeout을 써주세요.'
          : '링크에서 장소를 찾지 못했어요. 전체 주소(google.com/maps/…) 링크로 다시 시도해 주세요.',
      )
      setPhase('input')
      return
    }
    await begin(items)
  }

  function toggle(i: number) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, selected: !r.selected } : r)))
  }
  function setCategory(i: number, category: PlaceCategory) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, category } : r)))
  }

  async function save() {
    if (!user || !activeTrip) return
    const chosen = rows.filter((r) => r.selected)
    if (chosen.length === 0) return
    setPhase('saving')
    setProgress(0)
    let done = 0
    for (const r of chosen) {
      try {
        await backend.addPlace({
          tripId: activeTrip.id,
          name: r.name,
          address: r.address || '',
          lat: r.lat,
          lng: r.lng,
          category: r.category,
          status: 'wishlist',
          createdBy: user.id,
        })
      } catch {
        /* 개별 실패는 건너뜀 */
      }
      done++
      setProgress(Math.round((done / chosen.length) * 100))
    }
    toast.show(`${done}곳을 가고 싶은 곳에 담았어요.`)
    reset()
    onClose()
  }

  const selectedCount = rows.filter((r) => r.selected).length

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="목록 가져오기"
      footer={
        phase === 'preview' ? (
          <>
            <Button variant="ghost" className="flex-1" onClick={reset}>
              다시
            </Button>
            <Button className="flex-1" onClick={save} disabled={selectedCount === 0} icon="add">
              {selectedCount}곳 담기
            </Button>
          </>
        ) : undefined
      }
    >
      {phase === 'input' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-primary-soft/60 px-4 py-3 text-sm text-ink">
            <p className="font-semibold">구글 지도 링크를 붙여넣으면 담아드려요.</p>
            <p className="mt-1 text-muted">
              장소 공유 링크(<span className="dl-mono">maps.app.goo.gl/…</span> 또는 전체 주소)를 아래에
              붙여넣으세요. <b>여러 개를 한 번에</b> 넣어도 됩니다. 파일(GeoJSON·CSV)도 가능해요.
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted">구글 지도 링크 붙여넣기 (여러 개는 줄바꿈)</p>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={4}
              placeholder={'예)\nhttps://maps.app.goo.gl/…\nhttps://www.google.com/maps/place/성수연방/@37.5,127.0\n\n또는 "이름, 주소" 한 줄씩'}
              className="w-full resize-none rounded-2xl bg-surface-container px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button className="mt-2 w-full" variant="soft" onClick={onPaste} disabled={!paste.trim()}>
              불러오기
            </Button>
            <p className="mt-1.5 text-[11px] text-muted-soft">
              · 단축 링크는 <b>배포된 사이트(Vercel)</b>에서 동작해요(로컬 개발 서버에선 전체 주소만).
              <br />· 여러 장소가 담긴 <b>공유 “목록”</b>은 통째로는 못 가져와요 — 장소별 링크나 Takeout을 써주세요.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-soft">
            <span className="h-px flex-1 bg-surface-variant" /> 또는 파일로 <span className="h-px flex-1 bg-surface-variant" />
          </div>

          <button
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-surface-variant py-8 text-muted"
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="add" size={28} className="text-primary" />
            <span className="text-sm font-semibold text-ink">파일 선택 (GeoJSON · CSV)</span>
            <span className="text-xs">구글 Takeout 또는 이름,주소 CSV</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.geojson,.csv,.txt,application/json,text/csv"
            hidden
            onChange={(e) => onFile(e.target.files)}
          />

          <p className="text-center text-xs text-muted-soft">
            네이버 지도 즐겨찾기는 공식 내보내기가 없어, 위 붙여넣기(이름, 주소)로 옮겨주세요.
          </p>
        </div>
      )}

      {(phase === 'working' || phase === 'saving') && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Spinner size={28} className="text-primary" />
          <p className="text-sm font-semibold text-ink">
            {phase === 'working' ? '장소 위치를 찾는 중' : '담는 중'} · {progress}%
          </p>
          <div className="h-2 w-56 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {phase === 'preview' && (
        <div className="space-y-2">
          <p className="text-sm text-muted">
            {rows.length}곳 중 <b className="text-ink">{selectedCount}곳</b> 선택됨. 카테고리를 바꾸거나 체크를 해제할 수 있어요.
          </p>
          <ul className="max-h-[46vh] space-y-2 overflow-y-auto">
            {rows.map((r, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 rounded-2xl border px-3 py-2.5 ${
                  r.selected ? 'border-primary/40 bg-primary-soft/40' : 'border-surface-variant'
                }`}
              >
                <button
                  className="mt-0.5 shrink-0"
                  onClick={() => toggle(i)}
                  aria-label={r.selected ? '선택 해제' : '선택'}
                >
                  <Icon
                    name={r.selected ? 'check' : 'add'}
                    size={20}
                    className={r.selected ? 'text-primary' : 'text-muted'}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{r.name}</p>
                  <p className="truncate text-xs text-muted">
                    {r.resolved === 'none' ? '위치를 못 찾았어요 (이름만 저장)' : r.address || '주소 없음'}
                  </p>
                  <select
                    value={r.category}
                    onChange={(e) => setCategory(i, e.target.value as PlaceCategory)}
                    className="dl-mono mt-1 rounded-lg bg-surface-container px-2 py-1 text-xs outline-none"
                  >
                    {PLACE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  )
}

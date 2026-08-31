import { useEffect, useRef, useState } from 'react'
import { loadKakao, hasKakao } from './loader'
import type { Place } from '../data/types'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/basics'

type Status = 'loading' | 'ready' | 'failed' | 'disabled'

/**
 * Renders an ordered route of place pins connected by a dashed line.
 * On SDK failure it degrades to the map.load_failed panel — the list, the
 * distances and 길찾기 links keep working without the map (PRD §5-4).
 */
export function RouteMap({ places }: { places: Place[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>(hasKakao ? 'loading' : 'disabled')
  const [attempt, setAttempt] = useState(0)

  const pts = places.filter((p) => p.lat != null && p.lng != null)

  useEffect(() => {
    if (!hasKakao) {
      setStatus('disabled')
      return
    }
    let cancelled = false
    setStatus('loading')
    loadKakao()
      .then((kakao) => {
        if (cancelled || !ref.current) return
        const bounds = new kakao.maps.LatLngBounds()
        const map = new kakao.maps.Map(ref.current, {
          center: new kakao.maps.LatLng(pts[0]?.lat ?? 37.5445, pts[0]?.lng ?? 127.0445),
          level: 5,
        })
        const path: any[] = []
        pts.forEach((p, i) => {
          const pos = new kakao.maps.LatLng(p.lat, p.lng)
          path.push(pos)
          bounds.extend(pos)
          const marker = new kakao.maps.CustomOverlay({
            position: pos,
            yAnchor: 1,
            content: `<div style="background:#984631;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.3)">${i + 1}</div>`,
          })
          marker.setMap(map)
        })
        if (path.length > 1) {
          new kakao.maps.Polyline({
            path,
            strokeWeight: 4,
            strokeColor: '#984631',
            strokeOpacity: 0.9,
            strokeStyle: 'dashed',
          }).setMap(map)
        }
        if (pts.length > 0) map.setBounds(bounds)
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('failed'))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, places.map((p) => p.id).join(',')])

  if (status === 'failed' || status === 'disabled') {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-card bg-surface-container text-center">
        <Icon name="map" size={32} className="text-muted" />
        <p className="text-sm font-semibold text-ink">
          {status === 'disabled' ? '지도 키가 설정되지 않았어요.' : '지도를 불러오지 못했어요.'}
        </p>
        <p className="dl-mono text-xs text-muted">(map.load_failed)</p>
        <p className="max-w-xs text-xs text-muted">아래 순서·거리·길찾기는 지도 없이도 그대로 써요.</p>
        {status === 'failed' && (
          <Button variant="soft" icon="refresh" onClick={() => setAttempt((a) => a + 1)}>
            다시 시도
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {status === 'loading' && (
        <div className="dl-skeleton absolute inset-0 z-10 rounded-card" aria-hidden />
      )}
      <div ref={ref} className="h-56 w-full overflow-hidden rounded-card sm:h-72" />
    </div>
  )
}

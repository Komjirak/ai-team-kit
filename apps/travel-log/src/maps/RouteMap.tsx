import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps, hasGoogleMaps } from './loader'
import { Icon } from '../components/ui/Icon'

export interface RouteStop {
  name: string
  lat?: number
  lng?: number
}

// 일정 순서대로 지도에 번호 핀을 찍고 경로선으로 잇는다.
// 키가 없거나(데모) 좌표가 없으면 스크랩북 톤의 폴백 카드를 보여준다.
export function RouteMap({ stops, className = '' }: { stops: RouteStop[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'nokey' | 'failed'>('loading')

  const withCoords = stops.filter(
    (s): s is Required<RouteStop> => typeof s.lat === 'number' && typeof s.lng === 'number',
  )
  const key = withCoords.map((s) => `${s.lat},${s.lng}`).join('|')

  useEffect(() => {
    if (!hasGoogleMaps) {
      setStatus('nokey')
      return
    }
    if (withCoords.length === 0) {
      setStatus('failed')
      return
    }
    let cancelled = false
    setStatus('loading')
    loadGoogleMaps()
      .then(async (g: any) => {
        if (cancelled || !ref.current) return
        await g.maps.importLibrary('maps')
        const map = new g.maps.Map(ref.current, {
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          backgroundColor: '#fff8f2',
        })
        const bounds = new g.maps.LatLngBounds()
        const path: { lat: number; lng: number }[] = []
        withCoords.forEach((s, i) => {
          const pos = { lat: s.lat, lng: s.lng }
          new g.maps.Marker({
            position: pos,
            map,
            title: s.name,
            label: { text: String(i + 1), color: '#ffffff', fontSize: '12px', fontWeight: '700' },
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 13,
              fillColor: '#984631',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
          })
          bounds.extend(pos)
          path.push(pos)
        })
        if (path.length > 1) {
          new g.maps.Polyline({
            path,
            map,
            strokeColor: '#984631',
            strokeOpacity: 0.85,
            strokeWeight: 3,
            icons: [
              {
                icon: { path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5, fillColor: '#984631', fillOpacity: 1, strokeWeight: 0 },
                offset: '50%',
                repeat: '120px',
              },
            ],
          })
          map.fitBounds(bounds, 56)
        } else {
          map.setCenter(path[0])
          map.setZoom(15)
        }
        if (!cancelled) setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('failed')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const base = `relative overflow-hidden rounded-2xl border-2 border-outline-variant/60 ${className}`

  if (status === 'nokey' || status === 'failed') {
    return (
      <div className={`${base} grid place-items-center bg-surface-container-low p-6 text-center`}>
        {/* 데코 테이프 */}
        <span className="absolute -top-2 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 bg-tape-yellow/70" />
        <div className="flex flex-col items-center gap-2 text-muted">
          <Icon name="map" size={30} className="text-primary/70" />
          <p className="text-sm font-semibold text-ink">
            {status === 'nokey' ? '지도 미리보기 (데모)' : '지도를 불러오지 못했어요'}
          </p>
          <p className="dl-mono text-xs text-muted">
            {withCoords.length > 0
              ? `${withCoords.length}개 지점의 동선`
              : '좌표가 있는 장소를 담으면 여기에 동선이 그려져요'}
          </p>
          {withCoords.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
              {withCoords.map((s, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="dl-mono grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                    {i + 1}
                  </span>
                  <span className="max-w-[90px] truncate text-xs text-ink">{s.name}</span>
                  {i < withCoords.length - 1 && <Icon name="chevron_right" size={12} className="text-muted-soft" />}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={base}>
      <span className="pointer-events-none absolute -top-2 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rotate-2 bg-tape-yellow/70" />
      <div ref={ref} className="h-full w-full" />
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center bg-surface-container-low">
          <Icon name="map" size={28} className="animate-pulse text-primary/60" />
        </div>
      )}
    </div>
  )
}

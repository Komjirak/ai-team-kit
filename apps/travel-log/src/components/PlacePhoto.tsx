import { useEffect, useState } from 'react'
import { photoSrc } from '../lib/photo'

// 구글 장소 사진 로더 — URL 종류에 따라 로드 방식이 달라서 순차 폴백한다.
//  1) 직접 로드(도메인 리퍼러 → 키 기반 URL 통과)
//  2) 실패하면 서버 프록시(/api/img, 리퍼러 우회 → lh3 콘텐츠 URL 통과)
//  3) 그래도 실패하면 숨김 + onFail (부모가 플레이스홀더 표시)
export function PlacePhoto({
  url,
  alt = '',
  className,
  onFail,
}: {
  url?: string
  alt?: string
  className?: string
  onFail?: () => void
}) {
  const [stage, setStage] = useState<'direct' | 'proxy' | 'failed'>('direct')

  useEffect(() => {
    setStage('direct')
  }, [url])

  if (!url || stage === 'failed') return null

  const proxied = photoSrc(url) // 구글 호스트면 /api/img?..., 아니면 원본 그대로
  const canProxy = proxied !== url
  const src = stage === 'direct' ? url : proxied

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        if (stage === 'direct' && canProxy) setStage('proxy')
        else {
          setStage('failed')
          onFail?.()
        }
      }}
    />
  )
}

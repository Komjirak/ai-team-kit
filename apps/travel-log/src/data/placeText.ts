// 장소 이름/데이터 정합성 유틸 — 가져오기 검증과 화면 표시에 공통 사용.

/** 이름 뒤에 URL이 붙어 저장된 경우(옛 가져오기 버그) URL을 떼고 이름만 남긴다. */
export function cleanPlaceName(name?: string): string {
  return (name ?? '').replace(/[,\t|]?\s*https?:\/\/\S+.*$/i, '').trim()
}

/** 담을 만한 유효한 장소 이름인가 (빈값·URL·과도한 길이 배제). */
export function isValidPlaceName(name?: string): boolean {
  const n = cleanPlaceName(name)
  if (!n) return false
  if (/^https?:\/\//i.test(n)) return false // URL만 있는 이름
  if (n.length > 120) return false // 비정상적으로 긴 값(깨진 데이터)
  return true
}

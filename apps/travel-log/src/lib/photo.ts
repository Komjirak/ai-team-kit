// 구글 이미지(장소 사진)는 브라우저 직접 로드가 막히므로 서버 프록시(/api/img)를
// 거쳐 우리 도메인으로 받는다. 그 외(Firebase Storage, data URL 등)는 그대로 사용.

// 구글 장소 사진 호스트만 프록시(파이어베이스 스토리지 등은 그대로 로드).
const GOOGLE_IMG =
  /^https:\/\/([a-z0-9-]+\.)*(googleusercontent\.com|ggpht\.com|gstatic\.com)\//i
const GOOGLE_API_IMG = /^https:\/\/(places|maps)\.googleapis\.com\//i

export function photoSrc(url?: string): string | undefined {
  if (!url) return undefined
  return GOOGLE_IMG.test(url) || GOOGLE_API_IMG.test(url)
    ? `/api/img?u=${encodeURIComponent(url)}`
    : url
}

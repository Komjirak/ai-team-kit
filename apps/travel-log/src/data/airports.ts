// 공항 사전 — IATA 코드 → 이름·도시·좌표. 항공편 조회 결과의 경로(지도/카드)를
// 보강하는 용도. Amadeus 스케줄 응답은 좌표를 주지 않으므로 여기서 채운다.
// 전 세계 전량이 아니라 한국·아시아 주요 + 대표 국제공항 위주(여행앱 실사용 커버).
// 없는 공항이면 좌표 없이 IATA/이름만 표시(경로선만 생략).

export interface AirportInfo {
  iata: string
  name: string
  city: string
  lat: number
  lng: number
}

const AIRPORTS: Record<string, Omit<AirportInfo, 'iata'>> = {
  // ── 대한민국 ──
  ICN: { name: '인천국제공항', city: '서울', lat: 37.4602, lng: 126.4407 },
  GMP: { name: '김포국제공항', city: '서울', lat: 37.5583, lng: 126.7906 },
  CJU: { name: '제주국제공항', city: '제주', lat: 33.5113, lng: 126.4930 },
  PUS: { name: '김해국제공항', city: '부산', lat: 35.1795, lng: 128.9382 },
  TAE: { name: '대구국제공항', city: '대구', lat: 35.8941, lng: 128.6588 },
  CJJ: { name: '청주국제공항', city: '청주', lat: 36.7166, lng: 127.4991 },
  RSU: { name: '여수공항', city: '여수', lat: 34.8423, lng: 127.6169 },
  KWJ: { name: '광주공항', city: '광주', lat: 35.1264, lng: 126.8089 },
  MWX: { name: '무안국제공항', city: '무안', lat: 34.9914, lng: 126.3828 },
  USN: { name: '울산공항', city: '울산', lat: 35.5935, lng: 129.3517 },
  // ── 일본 ──
  NRT: { name: '나리타국제공항', city: '도쿄', lat: 35.7720, lng: 140.3929 },
  HND: { name: '하네다공항', city: '도쿄', lat: 35.5494, lng: 139.7798 },
  KIX: { name: '간사이국제공항', city: '오사카', lat: 34.4273, lng: 135.2440 },
  ITM: { name: '오사카국제공항', city: '오사카', lat: 34.7855, lng: 135.4382 },
  NGO: { name: '주부국제공항', city: '나고야', lat: 34.8584, lng: 136.8054 },
  FUK: { name: '후쿠오카공항', city: '후쿠오카', lat: 33.5859, lng: 130.4510 },
  CTS: { name: '신치토세공항', city: '삿포로', lat: 42.7752, lng: 141.6923 },
  OKA: { name: '나하공항', city: '오키나와', lat: 26.1958, lng: 127.6459 },
  // ── 중화권 ──
  TPE: { name: '타오위안국제공항', city: '타이베이', lat: 25.0777, lng: 121.2328 },
  TSA: { name: '쑹산공항', city: '타이베이', lat: 25.0694, lng: 121.5525 },
  HKG: { name: '홍콩국제공항', city: '홍콩', lat: 22.3080, lng: 113.9185 },
  MFM: { name: '마카오국제공항', city: '마카오', lat: 22.1496, lng: 113.5915 },
  PVG: { name: '푸둥국제공항', city: '상하이', lat: 31.1443, lng: 121.8083 },
  PEK: { name: '베이징서우두국제공항', city: '베이징', lat: 40.0801, lng: 116.5846 },
  CAN: { name: '바이윈국제공항', city: '광저우', lat: 23.3924, lng: 113.2988 },
  // ── 동남아 ──
  BKK: { name: '수완나품국제공항', city: '방콕', lat: 13.6900, lng: 100.7501 },
  DMK: { name: '돈므앙국제공항', city: '방콕', lat: 13.9126, lng: 100.6068 },
  HKT: { name: '푸껫국제공항', city: '푸껫', lat: 8.1132, lng: 98.3169 },
  SIN: { name: '창이국제공항', city: '싱가포르', lat: 1.3644, lng: 103.9915 },
  KUL: { name: '쿠알라룸푸르국제공항', city: '쿠알라룸푸르', lat: 2.7456, lng: 101.7099 },
  CGK: { name: '수카르노하타국제공항', city: '자카르타', lat: -6.1256, lng: 106.6559 },
  DPS: { name: '응우라라이국제공항', city: '발리', lat: -8.7482, lng: 115.1672 },
  MNL: { name: '니노이아키노국제공항', city: '마닐라', lat: 14.5086, lng: 121.0198 },
  CEB: { name: '막탄세부국제공항', city: '세부', lat: 10.3075, lng: 123.9793 },
  SGN: { name: '떤선녓국제공항', city: '호치민', lat: 10.8188, lng: 106.6520 },
  HAN: { name: '노이바이국제공항', city: '하노이', lat: 21.2212, lng: 105.8072 },
  DAD: { name: '다낭국제공항', city: '다낭', lat: 16.0439, lng: 108.1994 },
  CXR: { name: '깜란국제공항', city: '나트랑', lat: 11.9982, lng: 109.2192 },
  // ── 서남아·오세아니아 ──
  DEL: { name: '인디라간디국제공항', city: '델리', lat: 28.5562, lng: 77.1000 },
  SYD: { name: '시드니국제공항', city: '시드니', lat: -33.9399, lng: 151.1753 },
  MEL: { name: '멜버른공항', city: '멜버른', lat: -37.6690, lng: 144.8410 },
  AKL: { name: '오클랜드공항', city: '오클랜드', lat: -37.0082, lng: 174.7850 },
  GUM: { name: '괌국제공항', city: '괌', lat: 13.4834, lng: 144.7960 },
  SPN: { name: '사이판국제공항', city: '사이판', lat: 15.1190, lng: 145.7294 },
  // ── 미주 ──
  LAX: { name: '로스앤젤레스국제공항', city: 'LA', lat: 33.9416, lng: -118.4085 },
  SFO: { name: '샌프란시스코국제공항', city: '샌프란시스코', lat: 37.6213, lng: -122.3790 },
  JFK: { name: '존F케네디국제공항', city: '뉴욕', lat: 40.6413, lng: -73.7781 },
  SEA: { name: '시애틀타코마국제공항', city: '시애틀', lat: 47.4502, lng: -122.3088 },
  HNL: { name: '호놀룰루국제공항', city: '호놀룰루', lat: 21.3245, lng: -157.9251 },
  YVR: { name: '밴쿠버국제공항', city: '밴쿠버', lat: 49.1967, lng: -123.1815 },
  // ── 유럽·중동 ──
  LHR: { name: '히스로공항', city: '런던', lat: 51.4700, lng: -0.4543 },
  CDG: { name: '샤를드골공항', city: '파리', lat: 49.0097, lng: 2.5479 },
  FRA: { name: '프랑크푸르트공항', city: '프랑크푸르트', lat: 50.0379, lng: 8.5622 },
  AMS: { name: '스히폴공항', city: '암스테르담', lat: 52.3105, lng: 4.7683 },
  IST: { name: '이스탄불공항', city: '이스탄불', lat: 41.2753, lng: 28.7519 },
  DXB: { name: '두바이국제공항', city: '두바이', lat: 25.2532, lng: 55.3657 },
  DOH: { name: '하마드국제공항', city: '도하', lat: 25.2731, lng: 51.6081 },
}

/** IATA 코드로 공항 정보를 찾는다(대소문자 무시). 없으면 undefined. */
export function airport(iata?: string): AirportInfo | undefined {
  if (!iata) return undefined
  const code = iata.trim().toUpperCase()
  const a = AIRPORTS[code]
  return a ? { iata: code, ...a } : undefined
}

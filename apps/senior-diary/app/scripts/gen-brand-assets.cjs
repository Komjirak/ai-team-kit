// 하루담 브랜드 에셋 생성기 (순수 Node, zlib PNG 인코더 + 슈퍼샘플링 안티에일리어싱).
// 이미지 변환 툴(sharp/imagemagick/rsvg)이 이 환경에 없어 직접 픽셀을 합성한다.
// 그림은 지어내지 않고 BRAND.md §4-3 "★ 주 방향: 담기고 쌓이는 하루 — 그릇/켜 은유"를 따른다:
//   열린 그릇(먹) + 하루의 획이 켜켜이 포개짐 + 위에 작은 해(놀). 강조색 1점 원칙.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const CREAM = [255, 248, 243];   // 종이 #fff8f3
const INK = [42, 36, 28];        // 먹 #2a241c
const SUN = [180, 84, 44];       // 놀 #b4542c

// 심볼을 정규화 좌표(0..1)에서 그린다. 반환: [r,g,b,a] (a 0..1, 커버리지).
function symbolAt(x, y) {
  const cx = 0.5;
  const dx = x - cx;

  // 그릇: 하반원 두께 링(annulus). 중심 (0.5, 0.46), 바깥 R, 안쪽 r.
  const bowlCx = 0.5, bowlCy = 0.46, R = 0.30, r = 0.205;
  const bdist = Math.hypot(dx, y - bowlCy);
  const inBowlRing = bdist <= R && bdist >= r;
  // 그릇은 열린 형태 — 위쪽 약 40%를 비운다(그릇 입구). y가 그릇 중심보다 위이면서 링이면 제거.
  const bowlOpen = (y - bowlCy) > -0.06;
  const bowl = inBowlRing && bowlOpen ? INK : null;

  // 켜(쌓인 이야기): 그릇 안 바닥에 짧은 둥근 막대 2겹.
  function bar(barCy, halfW, halfH) {
    return Math.abs(dx) <= halfW && Math.abs(y - barCy) <= halfH;
  }
  const kye1 = bar(0.52, 0.135, 0.017) ? INK : null;
  const kye2 = bar(0.575, 0.10, 0.017) ? INK : null;

  // 해: 그릇 입구 위에 얹힌 원(놀). 중심 (0.5, 0.30), 반지름 sunR.
  const sunR = 0.115;
  const sdist = Math.hypot(dx, y - 0.30);
  const sun = sdist <= sunR ? SUN : null;

  // 합성 우선순위: 해 > 켜 > 그릇.
  const c = sun || kye2 || kye1 || bowl;
  if (!c) return [0, 0, 0, 0];
  return [c[0], c[1], c[2], 1];
}

// 슈퍼샘플링으로 커버리지 평균 → 안티에일리어싱. bg=null이면 투명 배경.
function render(size, ss, bg, pad) {
  const buf = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let R = 0, G = 0, B = 0, A = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          // pad: 심볼을 [pad,1-pad] 안으로 축소 배치(어댑티브 안전영역).
          const nx = ((px + (sx + 0.5) / ss) / size);
          const ny = ((py + (sy + 0.5) / ss) / size);
          const mx = (nx - 0.5) / (1 - 2 * pad) + 0.5;
          const my = (ny - 0.5) / (1 - 2 * pad) + 0.5;
          const [r, g, b, a] = symbolAt(mx, my);
          R += r * a; G += g * a; B += b * a; A += a;
        }
      }
      const n = ss * ss;
      const cov = A / n;
      const i = (py * size + px) * 4;
      if (bg) {
        // 심볼을 배경 위에 알파 합성.
        const sr = A > 0 ? R / A : 0, sg = A > 0 ? G / A : 0, sb = A > 0 ? B / A : 0;
        buf[i] = Math.round(sr * cov + bg[0] * (1 - cov));
        buf[i + 1] = Math.round(sg * cov + bg[1] * (1 - cov));
        buf[i + 2] = Math.round(sb * cov + bg[2] * (1 - cov));
        buf[i + 3] = 255;
      } else {
        buf[i] = A > 0 ? Math.round(R / A) : 0;
        buf[i + 1] = A > 0 ? Math.round(G / A) : 0;
        buf[i + 2] = A > 0 ? Math.round(B / A) : 0;
        buf[i + 3] = Math.round(cov * 255);
      }
    }
  }
  return buf;
}

function writePng(file, size, rgba) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunks = [];
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])) >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  chunks.push(sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0)));
  fs.writeFileSync(file, Buffer.concat(chunks));
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return c ^ 0xffffffff; }

const dir = path.join(__dirname, '..', 'assets');
const SS = 4;
// iOS/웹 아이콘: 크림 배경 + 심볼(패딩 0.14).
writePng(path.join(dir, 'icon.png'), 1024, render(1024, SS, CREAM, 0.16));
// Android 어댑티브 전경: 투명 + 심볼(안전영역 위해 패딩 크게 0.26).
writePng(path.join(dir, 'android-icon-foreground.png'), 1024, render(1024, SS, null, 0.28));
// Android 어댑티브 배경: 단색 크림.
writePng(path.join(dir, 'android-icon-background.png'), 1024, render(1024, 1, CREAM, 0.5));
// 스플래시 심볼: 투명 배경 + 심볼(플러그인이 크림 배경에 얹음).
writePng(path.join(dir, 'splash-icon.png'), 1024, render(1024, SS, null, 0.30));
// 파비콘(웹): 크림 + 심볼.
writePng(path.join(dir, 'favicon.png'), 96, render(96, SS, CREAM, 0.14));
console.log('brand assets written to', dir);

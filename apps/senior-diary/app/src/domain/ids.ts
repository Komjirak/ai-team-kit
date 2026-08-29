/** id 생성 — 로컬 데모용. crypto가 없어도 도는 단순 유일 id. */

let counter = 0;

export function newId(prefix: string): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}${rand}`;
}

/** 초대 코드 — P0/C2에 표시되는 짧은 코드. */
export function newInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

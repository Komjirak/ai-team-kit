import type { BankQuestion } from '@/domain/types';

/**
 * 질문 뱅크 시드 — 전량 자체 제작(R6). 32문항 · 7챕터. "작아도 되는 실제 시드"다.
 * order는 삶의 흐름(어린 시절→…→전하고 싶은 말)을 따르는 기본 시퀀스.
 * topicTags: 민감 주제 스위치(I8)로 제외되는 질문 표시.
 *
 * 치환 관계(분기 룰, branchRules.ts):
 *  - q-seoul-arrival(처음 상경) ⇄ q-hometown-neighborhood(살던 동네)  — 고향=서울 치환
 *  - ch-spouse 전체 — 사별/이혼 또는 배우자 스위치 off 시 대체
 */
export const QUESTION_BANK: BankQuestion[] = [
  // ── 어린 시절 ──────────────────────────────────────────────
  { id: 'q-child-food', chapterId: 'ch-child', order: 10, topicTags: [], text: '어릴 적 가장\n좋아했던 음식은\n무엇이었나요?' },
  { id: 'q-child-play', chapterId: 'ch-child', order: 11, topicTags: [], text: '어릴 적엔 주로\n무얼 하며 놀았나요?' },
  { id: 'q-child-house', chapterId: 'ch-child', order: 12, topicTags: [], text: '어릴 적 살던 집을\n떠올리면 무엇이\n먼저 생각나세요?' },
  { id: 'q-child-school', chapterId: 'ch-child', order: 13, topicTags: [], text: '학교 가던 길은\n어떤 길이었나요?' },
  { id: 'q-child-parent', chapterId: 'ch-child', order: 14, topicTags: [], text: '부모님은 어떤\n분이셨어요?' },

  // ── 고향과 가족 ────────────────────────────────────────────
  { id: 'q-hometown-neighborhood', chapterId: 'ch-home', order: 20, topicTags: [], text: '어릴 적 살던 동네는\n어떤 곳이었나요?' },
  { id: 'q-seoul-arrival', chapterId: 'ch-home', order: 21, topicTags: [], text: '처음 서울에\n올라오던 날,\n기억나세요?' },
  { id: 'q-home-siblings', chapterId: 'ch-home', order: 22, topicTags: [], text: '형제 중 몇째로\n자라셨어요?' },
  { id: 'q-home-mother-song', chapterId: 'ch-home', order: 23, topicTags: [], text: '어머니가 좋아하시던\n노래가 있었나요?' },
  { id: 'q-home-holiday', chapterId: 'ch-home', order: 24, topicTags: [], text: '명절이면 온 가족이\n무얼 하며 보냈나요?' },
  { id: 'q-home-market', chapterId: 'ch-home', order: 25, topicTags: [], text: '어릴 적 장 서던 날\n풍경이 기억나세요?' },

  // ── 배우자를 만나다 (스위치 off·사별·이혼 시 대체) ──────────
  { id: 'q-spouse-meet', chapterId: 'ch-spouse', order: 30, topicTags: ['spouse'], text: '배우자를 처음\n만난 날을\n기억하세요?' },
  { id: 'q-spouse-first', chapterId: 'ch-spouse', order: 31, topicTags: ['spouse'], text: '배우자의 첫인상은\n어땠어요?' },
  { id: 'q-spouse-wedding', chapterId: 'ch-spouse', order: 32, topicTags: ['spouse'], text: '결혼식 날은\n어떤 마음이었나요?' },
  { id: 'q-spouse-hard', chapterId: 'ch-spouse', order: 33, topicTags: ['spouse'], text: '함께 살며 가장\n힘들었던 고비는\n무엇이었나요?' },

  // ── 일과 살림 ──────────────────────────────────────────────
  { id: 'q-work-first', chapterId: 'ch-work', order: 40, topicTags: [], text: '처음 돈을 벌던 일은\n무엇이었어요?' },
  { id: 'q-work-day', chapterId: 'ch-work', order: 41, topicTags: [], text: '한창때 하루 일과는\n보통 어땠어요?' },
  { id: 'q-work-proud', chapterId: 'ch-work', order: 42, topicTags: [], text: '일하면서 가장\n뿌듯했던 순간은\n언제였나요?' },
  { id: 'q-work-money', chapterId: 'ch-work', order: 43, topicTags: ['money'], text: '살림이 빠듯하던 시절,\n어떻게 견디셨어요?' },

  // ── 아이들 ─────────────────────────────────────────────────
  { id: 'q-kids-born', chapterId: 'ch-kids', order: 50, topicTags: [], text: '첫 아이를 품에\n안았을 때 어떤\n마음이었나요?' },
  { id: 'q-kids-name', chapterId: 'ch-kids', order: 51, topicTags: [], text: '아이 이름은 어떻게\n지으셨어요?' },
  { id: 'q-kids-proud', chapterId: 'ch-kids', order: 52, topicTags: [], text: '자식을 키우며 가장\n자랑스러웠던 순간은?' },
  { id: 'q-kids-worry', chapterId: 'ch-kids', order: 53, topicTags: [], text: '자식 때문에 밤새\n걱정한 적 있으세요?' },

  // ── 지금의 나날 ────────────────────────────────────────────
  { id: 'q-now-day', chapterId: 'ch-now', order: 60, topicTags: [], text: '요즘 하루는 어떻게\n보내세요?' },
  { id: 'q-now-joy', chapterId: 'ch-now', order: 61, topicTags: [], text: '요즘 가장 큰 기쁨은\n무엇인가요?' },
  { id: 'q-now-friend', chapterId: 'ch-now', order: 62, topicTags: [], text: '요즘 자주 만나는\n벗이 있으세요?' },
  { id: 'q-now-tv', chapterId: 'ch-now', order: 63, topicTags: [], text: '요즘 즐겨 보는\n프로그램이 있으세요?' },
  { id: 'q-now-health', chapterId: 'ch-now', order: 64, topicTags: ['health'], text: '요즘 몸은 좀\n어떠세요?' },

  // ── 전하고 싶은 말 ─────────────────────────────────────────
  { id: 'q-words-child', chapterId: 'ch-words', order: 70, topicTags: [], text: '자식에게 꼭 해주고\n싶은 말이 있다면요?' },
  { id: 'q-words-young', chapterId: 'ch-words', order: 71, topicTags: [], text: '젊은 날의 나에게\n한마디 한다면요?' },
  { id: 'q-words-remember', chapterId: 'ch-words', order: 72, topicTags: [], text: '어떤 사람으로\n기억되고 싶으세요?' },
  { id: 'q-words-thanks', chapterId: 'ch-words', order: 73, topicTags: [], text: '지금 가장 고마운\n사람은 누구인가요?' },
];

export function bankQuestionById(id: string): BankQuestion | undefined {
  return QUESTION_BANK.find((q) => q.id === id);
}

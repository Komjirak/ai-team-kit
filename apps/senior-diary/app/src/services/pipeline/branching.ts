import type { BankQuestion, Chapter, ParentProfile } from '@/domain/types';
import { QUESTION_BANK, bankQuestionById } from '@/data/seed/questionBank';
import { CHAPTERS, chapterById } from '@/data/seed/chapters';
import { BRANCH_RULES } from '@/data/seed/branchRules';

/**
 * 질문 분기 엔진 (I2) — 룰 기반, AI 아님. 프로필 + 스킵/제외 신호 → 다음 질문 선택/치환/챕터 대체.
 * 규칙은 데이터(branchRules.ts). 이 파일은 해석기다.
 */

function matchesHometown(hometown: string | null, keywords: string[]): boolean {
  if (!hometown) return false;
  const h = hometown.trim();
  return keywords.some((k) => h.includes(k));
}

/** 배달될 질문을 프로필에 맞게 치환한다(같은 슬롯 치환 — 고향=서울 등). */
export function resolveQuestion(base: BankQuestion, profile: ParentProfile): BankQuestion {
  for (const rule of BRANCH_RULES) {
    if (rule.kind === 'hometown-sub' && base.id === rule.from && matchesHometown(profile.hometown, rule.keywords)) {
      return bankQuestionById(rule.to) ?? base;
    }
  }
  return base;
}

/** 이 질문이 프로필상 시퀀스에서 제외되는가(민감 주제 off · 배우자 챕터 대체 · 고향 치환된 원질문). */
export function isExcluded(q: BankQuestion, profile: ParentProfile): boolean {
  for (const rule of BRANCH_RULES) {
    if (rule.kind === 'topic-exclude' && q.topicTags.includes(rule.topic) && profile.ask[rule.topic] === false) {
      return true;
    }
    if (rule.kind === 'chapter-sub' && q.chapterId === rule.chapterId) {
      if (rule.maritalIn && rule.maritalIn.includes(profile.maritalStatus)) return true;
      if (rule.topicOff && profile.ask[rule.topicOff] === false) return true;
    }
    if (rule.kind === 'hometown-sub' && q.id === rule.from && matchesHometown(profile.hometown, rule.keywords)) {
      // 원질문은 to로 치환됨 → 시퀀스에선 원질문을 제외한다(중복 방지).
      return true;
    }
  }
  return false;
}

/** 다음 배달 질문 — 기본 시퀀스(order)에서 소비/제외되지 않은 첫 질문. 치환 반영. */
export function nextQuestion(profile: ParentProfile, consumedBaseIds: Set<string>): BankQuestion | null {
  const ordered = [...QUESTION_BANK].sort((a, b) => a.order - b.order);
  for (const q of ordered) {
    if (consumedBaseIds.has(q.id)) continue;
    if (isExcluded(q, profile)) continue;
    return resolveQuestion(q, profile);
  }
  return null;
}

/** 스킵 대체 질문(하루 1회) — 같은 챕터 우선, 없으면 다음 슬롯(§9-4 P1 규칙). */
export function alternateQuestion(
  currentBaseId: string,
  profile: ParentProfile,
  consumedBaseIds: Set<string>,
): BankQuestion | null {
  const current = bankQuestionById(currentBaseId);
  if (current) {
    const sameChapter = [...QUESTION_BANK]
      .filter((q) => q.chapterId === current.chapterId && q.order > current.order)
      .sort((a, b) => a.order - b.order);
    for (const q of sameChapter) {
      if (consumedBaseIds.has(q.id)) continue;
      if (isExcluded(q, profile)) continue;
      return resolveQuestion(q, profile);
    }
  }
  const consumedPlus = new Set(consumedBaseIds);
  consumedPlus.add(currentBaseId);
  return nextQuestion(profile, consumedPlus);
}

/** 챕터 제목 — 대체 규칙 반영("빠진 장"을 보여주지 않는다, §9-4 B2). */
export function chapterTitle(chapterId: string, profile: ParentProfile): string {
  const base = chapterById(chapterId);
  const title = base?.title ?? '';
  for (const rule of BRANCH_RULES) {
    if (rule.kind === 'chapter-sub' && rule.chapterId === chapterId) {
      if (rule.maritalIn && rule.maritalIn.includes(profile.maritalStatus)) return rule.replacementTitle;
      if (rule.topicOff && profile.ask[rule.topicOff] === false) return rule.replacementTitle;
    }
  }
  return title;
}

/** C1b 신뢰 장치 — 고향 입력 시 치환 미리보기 한 줄. 없으면 null. */
export function hometownPreview(hometown: string | null): string | null {
  for (const rule of BRANCH_RULES) {
    if (rule.kind === 'hometown-sub' && matchesHometown(hometown, rule.keywords)) return rule.previewText;
  }
  return null;
}

/** 프로필상 노출될 챕터 목록(제목 대체 반영, 순서 유지). */
export function visibleChapters(profile: ParentProfile): Chapter[] {
  return [...CHAPTERS]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ ...c, title: chapterTitle(c.id, profile) }));
}

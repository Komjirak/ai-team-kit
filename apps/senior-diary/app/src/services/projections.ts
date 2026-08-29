import type { Answer, DailyQuestion, Family, ParentProfile } from '@/domain/types';
import type {
  ChildHomeView,
  FamilyView,
  LibraryProgressView,
  QuestionView,
  StoryView,
} from '@/domain/views';
import { formatDuration, shortDateLabel } from '@/domain/views';
import { bankQuestionById } from '@/data/seed/questionBank';
import { chapterTitle } from './pipeline/branching';

/**
 * 도메인 개체 → 화면 view 투영. 순수 함수. (BE 소유)
 * 화면(APP 소유)이 기대하는 모양을 그대로 만들어 배선 교체 시 JSX가 바뀌지 않게 한다.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function flatten(text: string): string {
  return text.split('\n').join(' ').trim();
}

function excerptOf(a: Answer): string {
  const src = a.transcriptClean ?? a.transcriptRaw;
  if (!src) return '밤사이 정리 중이에요…';
  const flat = src.split('\n').join(' ').trim();
  return flat.length > 46 ? `${flat.slice(0, 46)}…` : flat;
}

export function toStoryView(a: Answer): StoryView {
  return {
    id: a.id,
    answerId: a.id,
    dateLabel: shortDateLabel(new Date(a.createdAt)),
    question: flatten(a.questionText),
    status: a.state === 'done' ? 'written' : 'organizing',
    excerpt: excerptOf(a),
    body: a.transcriptClean ?? '',
    audioDuration: formatDuration(a.audio.durationSec),
    cheerSent: !!a.cheer,
  };
}

/** 답변 목록(P3·C5) — 최신순. */
export function pastStories(answers: Answer[]): StoryView[] {
  return [...answers].sort((a, b) => b.createdAt - a.createdAt).map(toStoryView);
}

/** 가장 최근 답변(C3 recent·C4 표시 대상). */
export function latestAnswer(answers: Answer[]): Answer | null {
  if (answers.length === 0) return null;
  return [...answers].sort((a, b) => b.createdAt - a.createdAt)[0];
}

export function familyView(f: Family): FamilyView {
  return {
    childName: f.childName,
    childFullName: f.childFullName,
    parentTitle: f.parentTitle,
    parentName: f.parentName,
  };
}

export function questionView(daily: DailyQuestion, profile: ParentProfile, ordinal: number): QuestionView {
  const q = bankQuestionById(daily.questionId) ?? bankQuestionById(daily.baseQuestionId);
  if (!q) {
    return { id: daily.questionId, ordinal, text: '오늘의 질문', chapter: '' };
  }
  return { id: q.id, ordinal, text: q.text, chapter: chapterTitle(q.chapterId, profile) };
}

export function childHomeView(
  family: Family,
  answers: Answer[],
  daily: DailyQuestion,
  profile: ParentProfile,
): ChildHomeView {
  const now = Date.now();
  const weekAnswered = answers.filter((a) => now - a.createdAt <= WEEK_MS).length;
  const recent = latestAnswer(answers);
  const q = questionView(daily, profile, 0);
  return {
    weekAnswered,
    weekTotal: 7,
    todayQuestion: flatten(q.text),
    parentAnsweredToday: daily.status === 'answered',
    recent: recent ? toStoryView(recent) : null,
  };
}

export function libraryProgress(answers: Answer[], offset: number): LibraryProgressView {
  const done = answers.filter((a) => a.state === 'done').length;
  return { count: done + offset, total: 365 };
}

/** P1 순번 = 다음에 쌓일 이야기 번호(진행감 count + 1). */
export function todayOrdinal(answers: Answer[], offset: number): number {
  return libraryProgress(answers, offset).count + 1;
}

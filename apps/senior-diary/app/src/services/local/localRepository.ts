import type {
  Answer,
  BankQuestion,
  Chapter,
  Cheer,
  DailyQuestion,
  Family,
  ParentProfile,
  PersistedDoc,
} from '@/domain/types';
import type { DiaryRepository } from '@/services/repository';
import { CHAPTERS } from '@/data/seed/chapters';
import { QUESTION_BANK } from '@/data/seed/questionBank';
import { logEvent } from '@/services/log';
import { clearDoc, readDoc, writeDoc } from './storage';

/**
 * LocalRepository — DiaryRepository의 온디바이스 구현(AsyncStorage 단일 JSON 문서). (BE 소유)
 *
 * 스토어는 loadSnapshot/saveSnapshot을 durable 경로로 쓴다(권위 상태는 React, 여기는 버퍼).
 * 개체별 메서드(getFamily·saveFamily·putAnswer·putCheer 등)는 서버(Firestore) 구현이 컬렉션에 매핑할
 * "실제 seam"이며, 로컬에서는 캐시 문서를 갱신 후 통째로 flush한다 — 부분 쓰기여도 문서는 항상 완결.
 */
export class LocalRepository implements DiaryRepository {
  private cache: PersistedDoc | null = null;

  private async ensure(): Promise<PersistedDoc | null> {
    if (this.cache) return this.cache;
    this.cache = await readDoc();
    return this.cache;
  }

  private async mutate(fn: (doc: PersistedDoc) => void): Promise<void> {
    const doc = await this.ensure();
    if (!doc) {
      logEvent('repo.mutate', 'fail', { reason: 'no_doc' });
      return;
    }
    fn(doc);
    this.cache = doc;
    await writeDoc(doc);
  }

  // ── 가족 ──
  async getFamily(): Promise<Family | null> {
    return (await this.ensure())?.family ?? null;
  }
  async saveFamily(family: Family): Promise<void> {
    await this.mutate((d) => {
      d.family = family;
    });
  }

  // ── 프로필 ──
  async getProfile(): Promise<ParentProfile | null> {
    return (await this.ensure())?.profile ?? null;
  }
  async saveProfile(profile: ParentProfile): Promise<void> {
    await this.mutate((d) => {
      d.profile = profile;
    });
  }

  // ── 질문 뱅크·챕터 (읽기 전용 시드) ──
  async listChapters(): Promise<Chapter[]> {
    return CHAPTERS;
  }
  async listQuestions(): Promise<BankQuestion[]> {
    return QUESTION_BANK;
  }

  // ── 오늘의 질문 ──
  async getDaily(_familyId: string, date: string): Promise<DailyQuestion | null> {
    const d = await this.ensure();
    if (!d) return null;
    return d.daily.date === date ? d.daily : null;
  }
  async saveDaily(daily: DailyQuestion): Promise<void> {
    await this.mutate((d) => {
      d.daily = daily;
    });
  }

  // ── 답변 ──
  async listAnswers(): Promise<Answer[]> {
    return (await this.ensure())?.answers ?? [];
  }
  async getAnswer(_familyId: string, answerId: string): Promise<Answer | null> {
    return (await this.ensure())?.answers.find((a) => a.id === answerId) ?? null;
  }
  async putAnswer(answer: Answer): Promise<void> {
    // 멱등 upsert — 같은 id면 교체, 없으면 추가.
    await this.mutate((d) => {
      const idx = d.answers.findIndex((a) => a.id === answer.id);
      if (idx >= 0) d.answers[idx] = answer;
      else d.answers.push(answer);
    });
  }

  // ── 응원 ──
  async putCheer(_familyId: string, cheer: Cheer): Promise<void> {
    await this.mutate((d) => {
      const a = d.answers.find((x) => x.id === cheer.answerId);
      if (a) a.cheer = cheer;
    });
  }
  async getParentCheer(): Promise<Cheer | null> {
    return (await this.ensure())?.parentCheer ?? null;
  }
  async setParentCheer(_familyId: string, cheer: Cheer | null): Promise<void> {
    await this.mutate((d) => {
      d.parentCheer = cheer;
    });
  }

  // ── 스냅샷 ──
  async loadSnapshot(): Promise<PersistedDoc | null> {
    this.cache = await readDoc();
    return this.cache;
  }
  async saveSnapshot(doc: PersistedDoc): Promise<void> {
    this.cache = doc;
    await writeDoc(doc);
  }
  async clearAll(): Promise<void> {
    this.cache = null;
    await clearDoc();
  }
}

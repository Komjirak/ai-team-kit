import type { Answer, Family, ParentProfile } from '@/domain/types';
import type { BookPreviewView } from '@/domain/views';
import { josa, shortDateLabel } from '@/domain/views';
import { visibleChapters } from './branching';

/**
 * 책 조립 (I9) — 답변을 챕터별로 모아 C6 미리보기 데이터로. §3-5 "챕터 구조가 곧 목차".
 * 정리 전(밤사이) 답변은 펼침면에 넣지 않는다(§9-4 B3) — done만 본문이 된다.
 */
function firstLine(text: string): string {
  return text.split('\n').join(' ').replace(/[?？]$/, '');
}

export function assembleBook(family: Family, profile: ParentProfile, answers: Answer[]): BookPreviewView {
  const done = answers.filter((a) => a.state === 'done' && a.transcriptClean);
  const chapters = visibleChapters(profile);

  // 목차 — 챕터별 담긴(done) 이야기 수로 페이지가 두꺼워진다(진행감의 물리적 표현).
  let page = 8;
  const toc = chapters.map((c, idx) => {
    const count = done.filter((a) => a.chapterId === c.id).length;
    const at = page;
    page += 6 + count * 8;
    return { n: idx + 1, title: c.title, page: at };
  });

  // 펼침면 — 가장 최근 done 답변 1편. 없으면 플레이스홀더(빈 상태에서도 진입 막지 않음, §9-4 B2).
  const latest = [...done].sort((a, b) => b.createdAt - a.createdAt)[0];
  const spread = latest
    ? {
        title: firstLine(latest.questionText),
        body: latest.transcriptClean as string,
        caption: `${shortDateLabel(new Date(latest.createdAt))}에 담긴 이야기.`,
      }
    : {
        title: '첫 이야기가 담기면 여기서 책이 시작돼요',
        body: '아직 정리된 이야기가 없어요. 부모님의 첫 이야기가 도착하면 이 자리에 펼쳐집니다.',
        caption: '미리보기.',
      };

  const childJosa = josa(family.childFullName, '이', '가');
  const parentJosa = josa(family.parentName, '이', '가');

  return {
    title: `${family.parentName} 이야기`,
    subtitle: `자녀 ${family.childFullName}${childJosa} 묻고,\n${family.parentName}${parentJosa} 답하다`,
    year: new Date().getFullYear().toString(),
    toc,
    spread,
  };
}

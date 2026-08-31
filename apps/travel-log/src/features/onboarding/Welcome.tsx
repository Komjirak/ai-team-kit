import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/basics'
import { Icon } from '../../components/ui/Icon'
import { Washi, Sticker } from '../../components/ui/deco'
import { BRAND } from '../../components/layout/nav'
import { isDemo } from '../../lib/env'

/** Login / landing (design screen _5). */
export function Welcome() {
  const { signIn } = useAuth()
  const [busy, setBusy] = useState(false)

  async function go() {
    setBusy(true)
    try {
      await signIn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
      <div className="flex items-center gap-2">
        <Icon name="favorite" fill className="text-primary-container" size={28} />
        <span className="font-display text-2xl font-extrabold text-primary">{BRAND}</span>
      </div>

      {/* Hero polaroid */}
      <div className="relative mx-auto mt-8 w-full max-w-xs">
        <Washi color="yellow" className="left-6 -top-3" rotate={-8} />
        <Washi color="lavender" className="right-6 -top-2" rotate={9} />
        <div className="polaroid rotate-[-2deg] rounded-2xl">
          <div className="overflow-hidden rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=720&q=70"
              alt="함께 걷는 커플"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <p className="mt-3 text-center font-display text-lg font-bold text-ink">함께하는 산책의 즐거움</p>
          <p className="text-center text-xs text-muted">서로의 발걸음을 맞춰보세요.</p>
        </div>
        <Sticker
          icon={<Icon name="auto_awesome" size={18} />}
          className="-bottom-3 right-2"
          bg="bg-pastel-blue"
          color="text-secondary"
        />
      </div>

      <div className="mt-10 text-center">
        <h1 className="font-display text-4xl font-extrabold leading-tight text-ink">
          너와 나의
          <br />
          <span className="wobbly-underline">특별한 기록</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xs text-[15px] leading-relaxed text-muted">
          우리의 데이트를 다꾸하듯 예쁘게 기록해보세요. 작은 조각들이 모여 큰 추억이 됩니다.
        </p>
      </div>

      <div className="mt-auto space-y-3 pt-10">
        <Button className="w-full py-4 text-lg" icon="edit_note" onClick={go} loading={busy}>
          Google로 시작하기
        </Button>
        <button
          className="dl-focus w-full rounded-full bg-surface-container py-3.5 font-semibold text-muted"
          onClick={go}
          disabled={busy}
        >
          기존 계정으로 로그인
        </button>
        {isDemo && (
          <p className="pt-2 text-center text-xs text-muted-soft">
            데모 모드 · 키 없이 전체 흐름을 체험할 수 있어요
          </p>
        )}
      </div>
    </div>
  )
}

import { backend } from '../data'
import type { Place } from '../data/types'
import { cleanPlaceName } from '../data/placeText'
import { useToast } from '../components/ui/Toast'

/** Shared place mutations with the optimistic "다녀왔어요" + undo flow (C4). */
export function usePlaceActions() {
  const toast = useToast()

  async function markVisited(place: Place) {
    await backend.updatePlace(place.id, { status: 'visited', visitedAt: Date.now() })
    toast.show('다녀온 곳으로 옮겼어요.', {
      actionLabel: '되돌리기',
      onAction: () => backend.updatePlace(place.id, { status: 'wishlist', visitedAt: undefined }),
    })
  }

  async function remove(place: Place) {
    const label = cleanPlaceName(place.name) || place.name
    if (!confirm(`‘${label}’을(를) 삭제할까요?`)) return
    try {
      await backend.deletePlace(place.id)
      toast.show('삭제했어요.')
    } catch {
      toast.show('삭제하지 못했어요. 권한/네트워크를 확인해 주세요.')
    }
  }

  return { markVisited, remove }
}

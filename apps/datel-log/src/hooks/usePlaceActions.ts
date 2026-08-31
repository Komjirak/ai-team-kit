import { backend } from '../data'
import type { Place } from '../data/types'
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
    if (!confirm(`‘${place.name}’을(를) 삭제할까요?`)) return
    await backend.deletePlace(place.id)
    toast.show('삭제했어요.')
  }

  return { markVisited, remove }
}

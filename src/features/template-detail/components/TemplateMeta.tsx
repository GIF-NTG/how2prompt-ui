import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { templateDetailClient } from '../api/templateDetailClient'
import { useAuth } from '@/features/auth/context/useAuth'
import { useFavorites } from '@/features/history/context/useFavorites'

interface TemplateMetaProps {
  templateId: string
  usageCount: number
  isFavorited: boolean
  isSignedIn: boolean
}

export function TemplateMeta({
  templateId,
  usageCount,
  isFavorited,
  isSignedIn,
}: TemplateMetaProps) {
  const [favorited, setFavorited] = useState(isFavorited)
  const [toggling, setToggling] = useState(false)
  const { session } = useAuth()
  const { isFavorited: isCachedFavorite, setFavorited: cacheFavorited } = useFavorites()

  // The real backend doesn't return isFavorited on the detail response (see
  // templateDetailClient.real.ts) — correct the initial render from the
  // /favorites id cache once it's loaded, without forcing a false over a
  // state the user already flipped locally.
  useEffect(() => {
    if (isCachedFavorite(templateId)) {
      setFavorited(true)
    }
  }, [isCachedFavorite, templateId])

  async function handleToggle() {
    if (toggling) return
    // Optimistic: flip immediately (SC-004's <500ms-perceived requirement),
    // revert if the request fails.
    const previous = favorited
    setFavorited(!previous)
    setToggling(true)
    try {
      const result = await templateDetailClient.toggleFavorite(templateId, previous, session?.token)
      setFavorited(result.isFavorited)
      cacheFavorited(templateId, result.isFavorited)
    } catch {
      setFavorited(previous)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[0.7rem] text-[#8B8F86] dark:text-[#6D726A]">
        {usageCount.toLocaleString()} lượt dùng
      </span>
      {isSignedIn && (
        <button
          type="button"
          onClick={() => void handleToggle()}
          disabled={toggling}
          aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          aria-pressed={favorited}
          className={`flex h-[1.9rem] w-[1.9rem] cursor-pointer items-center justify-center rounded-lg border transition-colors duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] disabled:cursor-not-allowed disabled:opacity-60 ${
            favorited
              ? 'border-[#C23A2E] bg-[#FBE7E4] text-[#C23A2E] dark:border-[#FF7A6B] dark:bg-[#3A2224] dark:text-[#FF7A6B]'
              : 'border-[#DBDFD3] bg-white text-[#8B8F86] hover:border-[#C23A2E] hover:text-[#C23A2E] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#6D726A] dark:hover:border-[#FF7A6B] dark:hover:text-[#FF7A6B]'
          }`}
        >
          <Heart
            key={String(favorited)}
            size={16}
            fill={favorited ? 'currentColor' : 'none'}
            className="animate-[pop_300ms_ease]"
          />
        </button>
      )}
    </div>
  )
}

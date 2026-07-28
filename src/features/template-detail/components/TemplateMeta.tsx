import { useState } from 'react'
import { templateDetailClient } from '../api/templateDetailClient'

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

  async function handleToggle() {
    if (toggling) return
    setToggling(true)
    try {
      const result = await templateDetailClient.toggleFavorite(templateId)
      setFavorited(result.is_favorited)
    } catch {
      // silently fail
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
          className={`flex h-[1.9rem] w-[1.9rem] items-center justify-center rounded-lg border text-[1rem] leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] ${
            favorited
              ? 'border-[#C23A2E] bg-[#FBE7E4] text-[#C23A2E] dark:border-[#FF7A6B] dark:bg-[#3A2224] dark:text-[#FF7A6B]'
              : 'border-[#DBDFD3] bg-white text-[#8B8F86] hover:border-[#C23A2E] hover:text-[#C23A2E] dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#6D726A] dark:hover:border-[#FF7A6B] dark:hover:text-[#FF7A6B]'
          }`}
        >
          {favorited ? '♥' : '♡'}
        </button>
      )}
    </div>
  )
}

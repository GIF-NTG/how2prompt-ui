import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/features/auth/context/useAuth'
import { useTemplateDetail } from '@/features/template-detail/hooks/useTemplateDetail'
import { ReloadUnavailableBanner } from '@/features/template-detail/components/ReloadUnavailableBanner'
import { TemplateGenerateSection } from '@/features/template-generate/components/TemplateGenerateSection'
import { createHistoryClient } from '../api/historyClient'
import { getHistoryDisplayTitle } from '../utils/displayTitle'
import type { HistoryDetail } from '../types'

function BackToHistoryLink() {
  return (
    <Link
      to="/history"
      className="inline-flex items-center gap-1 font-mono text-[0.8rem] text-[#5B5F58] underline underline-offset-2 transition-colors duration-150 hover:text-[#1B1D1B] dark:text-[#A2A79C] dark:hover:text-[#ECEEE8]"
    >
      <ArrowLeft size={14} />
      Back to History
    </Link>
  )
}

/**
 * A lean edit view scoped to one history entry — reached from HistoryList's
 * Regenerate action. Reuses the same generate form as the template detail
 * page (`TemplateGenerateSection`, pre-filled via `reloadOverride`), but
 * without the template's hero/description/meta chrome, so it reads as
 * "editing this history item" rather than "browsing the template".
 */
export function RegenerateHistoryPage() {
  const { historyId } = useParams<{ historyId: string }>()
  const { session, isRestoring } = useAuth()
  const historyClient = useMemo(() => createHistoryClient(session?.token), [session?.token])

  const [entry, setEntry] = useState<HistoryDetail | null>(null)
  const [entryError, setEntryError] = useState<string | null>(null)
  const [entryLoading, setEntryLoading] = useState(true)

  useEffect(() => {
    if (!historyId) return
    let cancelled = false
    setEntryLoading(true)
    setEntryError(null)
    historyClient
      .get(historyId)
      .then((result) => {
        if (!cancelled) setEntry(result)
      })
      .catch(() => {
        if (!cancelled) {
          setEntryError('Unable to load this history entry, please try again later.')
        }
      })
      .finally(() => {
        if (!cancelled) setEntryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [historyId, historyClient])

  const {
    template,
    isLoading: templateLoading,
    error: templateError,
    notFound: templateNotFound,
  } = useTemplateDetail(entry?.templateId ?? '')

  if (isRestoring) return null
  if (!session) return <Navigate to="/login" replace />

  const hasTemplate = Boolean(entry?.templateId)
  const loading = entryLoading || (hasTemplate && templateLoading)
  const templateUnavailable = !!entry && (!hasTemplate || templateNotFound)

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <BackToHistoryLink />

      {entryError || templateError ? (
        <p className="m-0 text-[0.88rem] text-[#C23A2E] dark:text-[#FF7A6B]">
          {entryError ?? templateError}
        </p>
      ) : loading || !entry ? (
        <div className="flex flex-col gap-3">
          <div className="h-[1.5rem] w-[20rem] animate-pulse rounded bg-[#DBDFD3] dark:bg-[#2C3130]" />
          <div className="h-[10rem] animate-pulse rounded-panel bg-[#DBDFD3] dark:bg-[#2C3130]" />
        </div>
      ) : (
        <>
          <h1 className="m-0 text-[clamp(1.4rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.015em]">
            Regenerate: {getHistoryDisplayTitle(entry)}
          </h1>

          {templateUnavailable ? (
            <ReloadUnavailableBanner finalPrompt={entry.finalPrompt} />
          ) : (
            template && (
              <TemplateGenerateSection
                template={template}
                reloadOverride={{
                  modelCode: entry.aiModelCode,
                  inputValues: entry.inputValues as Record<
                    string,
                    string | number | boolean | string[]
                  >,
                  extraInstructions: entry.extraInstructions,
                }}
              />
            )
          )}
        </>
      )}
    </main>
  )
}

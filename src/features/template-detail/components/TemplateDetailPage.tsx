import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { useTemplateDetail } from '../hooks/useTemplateDetail'
import { BackLink } from './BackLink'
import { TemplateHero } from './TemplateHero'
import { ModelTags } from './ModelTags'
import { TemplateMeta } from './TemplateMeta'
import { NotFoundState } from './NotFoundState'
import { ReloadUnavailableBanner } from './ReloadUnavailableBanner'
import { NewerVersionBadge } from './NewerVersionBadge'
import { TemplateGenerateSection } from '@/features/template-generate/components/TemplateGenerateSection'
import { createHistoryClient } from '@/features/history/api/historyClient'
import type { HistoryDetail } from '@/features/history/types'

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const { template, isLoading, error, notFound } = useTemplateDetail(id ?? '')

  const [searchParams] = useSearchParams()
  const reloadId = searchParams.get('reload')
  const historyClient = useMemo(() => createHistoryClient(session?.token), [session?.token])
  const [reloadEntry, setReloadEntry] = useState<HistoryDetail | null>(null)
  const [reloadUnavailable, setReloadUnavailable] = useState(false)

  useEffect(() => {
    if (!reloadId) {
      setReloadEntry(null)
      setReloadUnavailable(false)
      return
    }
    let cancelled = false
    historyClient
      .get(reloadId)
      .then((entry) => {
        if (cancelled) return
        if (!entry.templateId) {
          setReloadUnavailable(true)
          setReloadEntry(entry)
        } else {
          setReloadEntry(entry)
          setReloadUnavailable(false)
        }
      })
      .catch(() => {
        if (!cancelled) setReloadUnavailable(true)
      })
    return () => {
      cancelled = true
    }
  }, [reloadId, historyClient])

  if (notFound) {
    return <NotFoundState />
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
        <BackLink />
        <p className="m-0 text-[0.88rem] text-[#C23A2A] dark:text-[#FF7A6B]">{error}</p>
      </main>
    )
  }

  if (isLoading || !template) {
    return (
      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
        <div className="h-[1rem] w-[12rem] animate-pulse rounded bg-[#DBDFD3] dark:bg-[#2C3130]" />
        <div className="flex flex-col gap-3">
          <div className="h-[1rem] w-[6rem] animate-pulse rounded bg-[#DBDFD3] dark:bg-[#2C3130]" />
          <div className="h-[1.5rem] w-[20rem] animate-pulse rounded bg-[#DBDFD3] dark:bg-[#2C3130]" />
          <div className="h-[0.9rem] w-[28rem] animate-pulse rounded bg-[#DBDFD3] dark:bg-[#2C3130]" />
        </div>
        <div className="flex gap-2">
          <div className="h-[1.5rem] w-[4rem] animate-pulse rounded-full bg-[#DBDFD3] dark:bg-[#2C3130]" />
          <div className="h-[1.5rem] w-[5rem] animate-pulse rounded-full bg-[#DBDFD3] dark:bg-[#2C3130]" />
        </div>
        <div className="h-[8rem] animate-pulse rounded-panel bg-[#DBDFD3] dark:bg-[#2C3130]" />
        <div className="h-[10rem] animate-pulse rounded-panel bg-[#DBDFD3] dark:bg-[#2C3130]" />
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 pb-16 pt-2 sm:px-[clamp(1.25rem,4vw,3rem)]">
      <BackLink />

      <TemplateHero
        title={template.title}
        description={template.description}
        categories={template.categories}
        isOfficial={template.isOfficial}
      />

      <ModelTags models={template.supportedModels} />

      <TemplateMeta
        templateId={template.id}
        usageCount={template.usageCount}
        isFavorited={template.isFavorited}
        isSignedIn={!!session}
      />

      {reloadId && reloadUnavailable && reloadEntry ? (
        <ReloadUnavailableBanner finalPrompt={reloadEntry.finalPrompt} />
      ) : (
        <>
          {reloadEntry &&
            reloadEntry.templateVersionId &&
            reloadEntry.templateVersionId !== template.currentVersion.id && <NewerVersionBadge />}
          <TemplateGenerateSection
            template={template}
            reloadOverride={
              reloadEntry
                ? {
                    modelCode: reloadEntry.aiModelCode,
                    inputValues: reloadEntry.inputValues as Record<
                      string,
                      string | number | boolean | string[]
                    >,
                    extraInstructions: reloadEntry.extraInstructions,
                  }
                : undefined
            }
          />
        </>
      )}
    </main>
  )
}

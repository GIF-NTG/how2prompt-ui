import { useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/useAuth'
import { useTemplateDetail } from '../hooks/useTemplateDetail'
import { BackLink } from './BackLink'
import { TemplateHero } from './TemplateHero'
import { ModelTags } from './ModelTags'
import { UsageGuide } from './UsageGuide'
import { ExampleOutput } from './ExampleOutput'
import { TemplateMeta } from './TemplateMeta'
import { NotFoundState } from './NotFoundState'
import { TemplateGenerateSection } from '@/features/template-generate/components/TemplateGenerateSection'

export function TemplateDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { session } = useAuth()
  const { template, isLoading, error, notFound } = useTemplateDetail(slug ?? '')

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
        <div className="h-[8rem] animate-pulse rounded-[10px] bg-[#DBDFD3] dark:bg-[#2C3130]" />
        <div className="h-[10rem] animate-pulse rounded-[10px] bg-[#DBDFD3] dark:bg-[#2C3130]" />
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
        isOfficial={template.is_official}
      />

      <ModelTags models={template.supported_models} />

      <UsageGuide guide={template.current_version.guide} />

      <ExampleOutput exampleOutput={template.current_version.example_output} />

      <TemplateMeta
        templateId={template.id}
        usageCount={template.usage_count}
        isFavorited={template.is_favorited}
        isSignedIn={!!session}
      />

      <TemplateGenerateSection template={template} />
    </main>
  )
}

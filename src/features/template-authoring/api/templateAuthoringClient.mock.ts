import { ApiError } from '@/shared/utils/httpClient'
import type {
  TemplateAuthoringCreateInput,
  TemplateAuthoringEditInput,
  TemplateAuthoringResponse,
  TemplateSubmitResult,
  TemplateVersionDiff,
  TemplateVersionSummary,
} from '../types'
import type { TemplateAuthoringClient } from './templateAuthoringClient.types'

interface VersionRecord extends TemplateVersionSummary {
  promptBody: string
  systemPrompt: string | null
  guideI18n: TemplateAuthoringResponse['titleI18n']
}

const templates = new Map<string, TemplateAuthoringResponse>()
const versions = new Map<string, VersionRecord[]>()

const MODERATION_BLOCKLIST = ['spam', 'scam', 'phishing', 'malware', 'exploit']
const REQUIRED_SUBMIT_FIELDS: Array<keyof TemplateAuthoringResponse> = [
  'coverImage',
  'descriptionI18n',
]

let nextId = 1

function newVersion(templateId: string, input: TemplateAuthoringCreateInput): VersionRecord {
  const list = versions.get(templateId) ?? []
  return {
    id: `v-${templateId}-${list.length + 1}`,
    versionNumber: list.length + 1,
    changelog: null,
    createdBy: 'mock-user',
    createdAt: new Date().toISOString(),
    current: true,
    archivedAt: null,
    promptBody: input.promptBody,
    systemPrompt: input.systemPrompt ?? null,
    guideI18n: input.guideI18n ?? { en: '' },
  }
}

function requireOwned(templateId: string): TemplateAuthoringResponse {
  const template = templates.get(templateId)
  if (!template) {
    throw new ApiError('NOT_FOUND', `Template ${templateId} not found.`, 404)
  }
  return template
}

export function createMockTemplateAuthoringClient(): TemplateAuthoringClient {
  return {
    async create(input) {
      const id = `ta${nextId++}`
      const version = newVersion(id, input)
      versions.set(id, [version])

      const template: TemplateAuthoringResponse = {
        id,
        workspaceId: 'w1',
        slug: input.slug,
        titleI18n: input.titleI18n ?? { en: '' },
        descriptionI18n: input.descriptionI18n ?? { en: '' },
        coverImage: input.coverImage ?? null,
        authorId: 'mock-user',
        authorType: 'user',
        official: false,
        isPublic: false,
        status: 'draft',
        currentVersionId: version.id,
        usageCount: 0,
        favoriteCount: 0,
        featuredAt: null,
        publishedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categoryIds: [],
        tagIds: [],
        models: [],
        forkedFromTemplateId: null,
        forkedFromVersionId: null,
        forkCount: 0,
        lockVersion: 0,
      }
      templates.set(id, template)
      return template
    },

    async fork(templateId) {
      const source = requireOwned(templateId)
      if (!source.isPublic && !source.official) {
        throw new ApiError('FORBIDDEN', 'Source template is not public/official.', 403)
      }
      const sourceVersions = versions.get(templateId) ?? []
      const currentSourceVersion = sourceVersions.find((v) => v.id === source.currentVersionId)

      const id = `ta${nextId++}`
      const version = newVersion(id, {
        slug: `${source.slug}-fork`,
        promptBody: currentSourceVersion?.promptBody ?? '',
        systemPrompt: currentSourceVersion?.systemPrompt,
        guideI18n: currentSourceVersion?.guideI18n,
      })
      versions.set(id, [version])

      const forked: TemplateAuthoringResponse = {
        ...source,
        id,
        slug: `${source.slug}-fork-${id}`,
        status: 'draft',
        isPublic: false,
        official: false,
        currentVersionId: version.id,
        forkedFromTemplateId: source.id,
        forkedFromVersionId: source.currentVersionId,
        forkCount: 0,
        lockVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      templates.set(id, forked)
      source.forkCount += 1
      return forked
    },

    async edit(templateId, input: TemplateAuthoringEditInput) {
      const template = requireOwned(templateId)
      if (input.expectedLockVersion !== template.lockVersion) {
        throw new ApiError(
          'CONFLICT',
          'expectedLockVersion does not match the current lockVersion.',
          409,
        )
      }

      const contentChanged =
        input.promptBody !== undefined ||
        input.systemPrompt !== undefined ||
        input.exampleOutput !== undefined ||
        input.guideI18n !== undefined

      if (contentChanged) {
        const list = versions.get(templateId) ?? []
        const current = list.find((v) => v.id === template.currentVersionId)
        list.forEach((v) => {
          v.current = false
        })
        const version = newVersion(templateId, {
          slug: template.slug,
          promptBody: input.promptBody ?? current?.promptBody ?? '',
          systemPrompt: input.systemPrompt ?? current?.systemPrompt,
          guideI18n: input.guideI18n ?? current?.guideI18n,
        })
        list.push(version)
        versions.set(templateId, list)
        template.currentVersionId = version.id
      }

      const updated: TemplateAuthoringResponse = {
        ...template,
        titleI18n: input.titleI18n ?? template.titleI18n,
        descriptionI18n: input.descriptionI18n ?? template.descriptionI18n,
        updatedAt: new Date().toISOString(),
        lockVersion: template.lockVersion + 1,
      }
      templates.set(templateId, updated)
      return updated
    },

    async listVersions(templateId) {
      requireOwned(templateId)
      return [...(versions.get(templateId) ?? [])].sort((a, b) => b.versionNumber - a.versionNumber)
    },

    async diffVersions(templateId, fromVersionId, toVersionId): Promise<TemplateVersionDiff> {
      const list = versions.get(templateId) ?? []
      const from = list.find((v) => v.id === fromVersionId)
      const to = list.find((v) => v.id === toVersionId)
      if (!from || !to) {
        throw new ApiError('BAD_REQUEST', 'Version id does not belong to this template.', 400)
      }
      return {
        promptBodyChanged: from.promptBody !== to.promptBody,
        oldPromptBody: from.promptBody,
        newPromptBody: to.promptBody,
        systemPromptChanged: from.systemPrompt !== to.systemPrompt,
        oldSystemPrompt: from.systemPrompt,
        newSystemPrompt: to.systemPrompt,
        guideI18nChanged: from.guideI18n.en !== to.guideI18n.en,
        oldGuideI18n: from.guideI18n,
        newGuideI18n: to.guideI18n,
        addedVariableKeys: [],
        removedVariableKeys: [],
        changedVariableKeys: [],
      }
    },

    async setCurrentVersion(templateId, versionId) {
      const template = requireOwned(templateId)
      const list = versions.get(templateId) ?? []
      const target = list.find((v) => v.id === versionId)
      if (!target) {
        throw new ApiError('NOT_FOUND', `Version ${versionId} not found.`, 404)
      }
      if (target.archivedAt) {
        throw new ApiError('BAD_REQUEST', 'Cannot set an archived version as current.', 400)
      }
      list.forEach((v) => {
        v.current = v.id === versionId
      })
      const updated = {
        ...template,
        currentVersionId: versionId,
        updatedAt: new Date().toISOString(),
      }
      templates.set(templateId, updated)
      return updated
    },

    async archiveVersion(templateId, versionId) {
      const template = requireOwned(templateId)
      if (template.currentVersionId === versionId) {
        throw new ApiError('BAD_REQUEST', 'Cannot archive the current version.', 400)
      }
      const list = versions.get(templateId) ?? []
      const target = list.find((v) => v.id === versionId)
      if (!target) {
        throw new ApiError('NOT_FOUND', `Version ${versionId} not found.`, 404)
      }
      target.archivedAt = new Date().toISOString()
      return target
    },

    async submit(templateId): Promise<TemplateSubmitResult> {
      const template = requireOwned(templateId)
      if (template.status !== 'draft') {
        throw new ApiError('BAD_REQUEST', 'Template is not currently draft.', 400)
      }

      const missingFields = REQUIRED_SUBMIT_FIELDS.filter((field) => {
        const value = template[field]
        return value === null || value === undefined || value === ''
      })
      if (missingFields.length > 0) {
        return { templateId, status: 'draft', rejectionReason: null, missingFields }
      }

      const currentVersion = (versions.get(templateId) ?? []).find(
        (v) => v.id === template.currentVersionId,
      )
      const textToScan =
        `${currentVersion?.promptBody ?? ''} ${template.descriptionI18n.en}`.toLowerCase()
      const hit = MODERATION_BLOCKLIST.find((word) => textToScan.includes(word))
      if (hit) {
        return {
          templateId,
          status: 'draft',
          rejectionReason: `Content flagged by auto-moderation (keyword: "${hit}").`,
          missingFields: [],
        }
      }

      templates.set(templateId, {
        ...template,
        status: 'pending',
        updatedAt: new Date().toISOString(),
      })
      return { templateId, status: 'pending', rejectionReason: null, missingFields: [] }
    },
  }
}

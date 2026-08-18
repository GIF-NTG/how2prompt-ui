import type {
  TemplateAuthoringCreateInput,
  TemplateAuthoringEditInput,
  TemplateAuthoringResponse,
  TemplateSubmitResult,
  TemplateVersionDiff,
  TemplateVersionSummary,
} from '../types'

export interface TemplateAuthoringClient {
  create(
    input: TemplateAuthoringCreateInput,
    accessToken?: string,
  ): Promise<TemplateAuthoringResponse>
  fork(templateId: string, accessToken?: string): Promise<TemplateAuthoringResponse>
  edit(
    templateId: string,
    input: TemplateAuthoringEditInput,
    accessToken?: string,
  ): Promise<TemplateAuthoringResponse>
  listVersions(templateId: string, accessToken?: string): Promise<TemplateVersionSummary[]>
  diffVersions(
    templateId: string,
    fromVersionId: string,
    toVersionId: string,
    accessToken?: string,
  ): Promise<TemplateVersionDiff>
  setCurrentVersion(
    templateId: string,
    versionId: string,
    accessToken?: string,
  ): Promise<TemplateAuthoringResponse>
  archiveVersion(
    templateId: string,
    versionId: string,
    accessToken?: string,
  ): Promise<TemplateVersionSummary>
  submit(templateId: string, accessToken?: string): Promise<TemplateSubmitResult>
}

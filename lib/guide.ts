import fs from 'fs/promises'
import path from 'path'
import type { GuideDocument, GuideFolder, GuideProject, PublicProject, ResolvedDocument } from './types'

const DOCS_ROOT = path.join(process.cwd(), 'docs-content')
const SAFE_SEGMENT = /^[a-z0-9][a-z0-9-_]*$/i

function assertSafeSegment(value: string, label: string) {
  if (!SAFE_SEGMENT.test(value)) {
    throw new Error(`Invalid ${label}`)
  }
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function assertManifest(project: GuideProject) {
  if (!project.projectCode || !project.projectName || !Array.isArray(project.folders)) {
    throw new Error('Invalid guide manifest')
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

export async function getProject(projectCode: string): Promise<GuideProject> {
  const normalized = normalize(projectCode)
  assertSafeSegment(normalized, 'project code')

  const manifestPath = path.join(DOCS_ROOT, normalized, 'manifest.json')
  const manifest = await readJson<GuideProject>(manifestPath)
  assertManifest(manifest)

  return {
    ...manifest,
    projectCode: normalize(manifest.projectCode),
    folders: manifest.folders.map((folder) => ({
      ...folder,
      folderCode: normalize(folder.folderCode),
      documents: folder.documents.map((document) => ({
        ...document,
        slug: normalize(document.slug)
      }))
    }))
  }
}

export async function getProjects(): Promise<PublicProject[]> {
  const entries = await fs.readdir(DOCS_ROOT, { withFileTypes: true }).catch(() => [])
  const projects = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        try {
          const project = await getProject(entry.name)
          const documentCount = project.folders.reduce((sum, folder) => sum + folder.documents.length, 0)
          return {
            projectCode: project.projectCode,
            projectName: project.projectName,
            description: project.description,
            icon: project.icon,
            status: project.status || 'active',
            folderCount: project.folders.length,
            documentCount
          } satisfies PublicProject
        } catch {
          return null
        }
      })
  )

  return projects.filter(Boolean) as PublicProject[]
}

export function findFolder(project: GuideProject, folderCode: string): GuideFolder | undefined {
  const normalized = normalize(folderCode)
  return project.folders.find((folder) => folder.folderCode === normalized)
}

export function findDocument(folder: GuideFolder, slug: string): GuideDocument | undefined {
  const normalized = normalize(slug)
  return folder.documents.find((document) => document.slug === normalized)
}

export async function readDocument(
  projectCode: string,
  folderCode: string,
  slug: string
): Promise<ResolvedDocument> {
  const project = await getProject(projectCode)
  const folder = findFolder(project, folderCode)
  if (!folder) throw new Error('Folder not found')

  const document = findDocument(folder, slug)
  if (!document) throw new Error('Document not found')

  const projectRoot = path.join(DOCS_ROOT, project.projectCode)
  const filePath = path.resolve(projectRoot, document.file)

  if (!filePath.startsWith(projectRoot)) {
    throw new Error('Invalid document path')
  }

  const content = await fs.readFile(filePath, 'utf8')
  return { project, folder, document, content }
}

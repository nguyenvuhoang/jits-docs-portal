import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DocumentList } from '@/components/DocumentList'
import { cookieName, normalizeProjectCode, verifyProjectToken } from '@/lib/auth'
import { findFolder, getProject } from '@/lib/guide'

export default async function FolderPage({
  params
}: {
  params: Promise<{ projectCode: string; folderCode: string }>
}) {
  const { projectCode, folderCode } = await params
  const normalized = normalizeProjectCode(projectCode)
  const cookieStore = await cookies()
  const token = cookieStore.get(cookieName(normalized))?.value

  if (!verifyProjectToken(normalized, token)) {
    redirect(`/user-guide/${normalized}`)
  }

  let project
  try {
    project = await getProject(normalized)
  } catch {
    notFound()
  }

  const folder = findFolder(project, folderCode)
  if (!folder) notFound()

  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'User Guide', href: '/user-guide' },
            { label: project.projectName, href: `/user-guide/${normalized}/home` },
            { label: folder.title }
          ]}
        />
        <section className="hero">
          <div>
            <p className="eyebrow"><FileText size={16} /> Documents</p>
            <h1>{folder.title}</h1>
            <p className="lead">{folder.description}</p>
          </div>
        </section>

        <DocumentList projectCode={normalized} folderCode={folder.folderCode} documents={folder.documents} />
      </div>
    </main>
  )
}

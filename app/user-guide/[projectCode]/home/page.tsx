import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { FolderKanban } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { FolderCard } from '@/components/FolderCard'
import { cookieName, normalizeProjectCode, verifyProjectToken } from '@/lib/auth'
import { getProject } from '@/lib/guide'

export default async function GuideHomePage({ params }: { params: Promise<{ projectCode: string }> }) {
  const { projectCode } = await params
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

  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ label: 'User Guide', href: '/user-guide' }, { label: project.projectName }]} />
        <section className="hero">
          <div>
            <p className="eyebrow"><FolderKanban size={16} /> Guide Categories</p>
            <h1>{project.projectName}</h1>
            <p className="lead">{project.description}</p>
          </div>
        </section>

        {project.folders.length === 0 ? (
          <div className="empty-state">Dự án này chưa có nhóm tài liệu.</div>
        ) : (
          <section className="grid">
            {project.folders.map((folder) => (
              <FolderCard key={folder.folderCode} projectCode={normalized} folder={folder} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

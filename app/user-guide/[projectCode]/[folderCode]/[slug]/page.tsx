import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DocumentRenderer } from '@/components/DocumentRenderer'
import { GuideSidebar } from '@/components/GuideSidebar'
import { cookieName, normalizeProjectCode, verifyProjectToken } from '@/lib/auth'
import { readDocument } from '@/lib/guide'

export default async function DocumentPage({
  params
}: {
  params: Promise<{ projectCode: string; folderCode: string; slug: string }>
}) {
  const { projectCode, folderCode, slug } = await params
  const normalized = normalizeProjectCode(projectCode)
  const cookieStore = await cookies()
  const token = cookieStore.get(cookieName(normalized))?.value

  if (!verifyProjectToken(normalized, token)) {
    redirect(`/user-guide/${normalized}`)
  }

  let resolved
  try {
    resolved = await readDocument(normalized, folderCode, slug)
  } catch {
    notFound()
  }

  const { project, folder, document, content } = resolved

  return (
    <main className="page">
     <div className="container doc-container">
        <Breadcrumbs
          items={[
            { label: 'User Guide', href: '/user-guide' },
            { label: project.projectName, href: `/user-guide/${normalized}/home` },
            { label: folder.title, href: `/user-guide/${normalized}/${folder.folderCode}` },
            { label: document.title }
          ]}
        />

        <section className="layout-doc">
          <GuideSidebar
            projectCode={normalized}
            folderCode={folder.folderCode}
            activeSlug={document.slug}
            documents={folder.documents}
          />

          <article className="article-shell">
            <div className="article-title">
              <span className="badge">{document.type}</span>
              <h1 style={{ marginTop: 16 }}>{document.title}</h1>
              <p className="lead" style={{ fontSize: 16 }}>{document.summary}</p>
            </div>
            <DocumentRenderer type={document.type} content={content} />
          </article>
        </section>
      </div>
    </main>
  )
}

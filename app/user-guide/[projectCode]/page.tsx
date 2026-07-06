import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'
import { AccessKeyForm } from '@/components/AccessKeyForm'
import { cookieName, normalizeProjectCode, verifyProjectToken } from '@/lib/auth'
import { getProject } from '@/lib/guide'

export default async function ProjectAccessPage({ params }: { params: Promise<{ projectCode: string }> }) {
  const { projectCode } = await params
  const normalized = normalizeProjectCode(projectCode)

  let project
  try {
    project = await getProject(normalized)
  } catch {
    notFound()
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(cookieName(normalized))?.value
  if (verifyProjectToken(normalized, token)) {
    redirect(`/user-guide/${normalized}/home`)
  }

  return (
    <main className="lock-page">
      <section className="lock-panel">
        <p className="eyebrow"><LockKeyhole size={16} /> Protected Guide</p>
        <h1>{project.projectName}</h1>
        <p className="lead" style={{ fontSize: 16 }}>
          Tài liệu này yêu cầu access key. Vui lòng nhập key được cấp cho dự án để tiếp tục.
        </p>
        <AccessKeyForm projectCode={normalized} />
      </section>
    </main>
  )
}

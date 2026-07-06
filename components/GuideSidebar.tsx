import Link from 'next/link'
import type { GuideDocument } from '@/lib/types'

export function GuideSidebar({
  projectCode,
  folderCode,
  activeSlug,
  documents
}: {
  projectCode: string
  folderCode: string
  activeSlug?: string
  documents: GuideDocument[]
}) {
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Tài liệu cùng nhóm</p>
      {documents.map((document) => (
        <Link
          key={document.slug}
          href={`/user-guide/${projectCode}/${folderCode}/${document.slug}`}
          className={`sidebar-link ${activeSlug === document.slug ? 'active' : ''}`}
        >
          {document.title}
        </Link>
      ))}
    </aside>
  )
}

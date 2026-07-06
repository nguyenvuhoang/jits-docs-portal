import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { GuideFolder } from '@/lib/types'
import { IconBadge } from './IconBadge'

export function FolderCard({ projectCode, folder }: { projectCode: string; folder: GuideFolder }) {
  return (
    <Link className="card" href={`/user-guide/${projectCode}/${folder.folderCode}`}>
      <div>
        <IconBadge icon={folder.icon || 'FolderKanban'} />
        <h2 className="card-title">{folder.title}</h2>
        <p className="card-desc">{folder.description}</p>
      </div>
      <div className="card-footer">
        <span>{folder.documents.length} tài liệu</span>
        <ArrowRight size={20} />
      </div>
    </Link>
  )
}

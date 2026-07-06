import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PublicProject } from '@/lib/types'
import { IconBadge } from './IconBadge'

export function ProjectCard({ project }: { project: PublicProject }) {
  return (
    <Link className="card" href={`/user-guide/${project.projectCode}`}>
      <div>
        <IconBadge icon={project.icon || 'BookOpen'} />
        <h2 className="card-title">{project.projectName}</h2>
        <p className="card-desc">{project.description}</p>
      </div>
      <div className="card-footer">
        <span>{project.folderCount} nhóm · {project.documentCount} tài liệu</span>
        <ArrowRight size={20} />
      </div>
    </Link>
  )
}

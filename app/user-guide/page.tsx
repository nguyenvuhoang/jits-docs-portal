import { BookOpen } from 'lucide-react'
import { getProjects } from '@/lib/guide'
import { ProjectCard } from '@/components/ProjectCard'

export default async function UserGuidePage() {
  const projects = await getProjects()

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <div>
            <p className="eyebrow"><BookOpen size={16} /> Documentation Portal</p>
            <h1>Kho tài liệu hướng dẫn cho từng dự án</h1>
            <p className="lead">
              Chọn dự án, nhập access key, sau đó xem tài liệu cài đặt, vận hành, deploy và xử lý lỗi theo từng nhóm.
            </p>
          </div>
        </section>

        {projects.length === 0 ? (
          <div className="empty-state">Chưa có dự án tài liệu nào trong thư mục docs-content.</div>
        ) : (
          <section className="grid">
            {projects.map((project) => (
              <ProjectCard key={project.projectCode} project={project} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

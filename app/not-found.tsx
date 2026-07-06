import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="lock-page">
      <section className="lock-panel">
        <h1>Không tìm thấy tài liệu</h1>
        <p className="lead" style={{ fontSize: 16 }}>
          Dự án, nhóm tài liệu hoặc file hướng dẫn không tồn tại.
        </p>
        <div className="form-group">
          <Link className="btn" href="/user-guide">Quay lại User Guide</Link>
        </div>
      </section>
    </main>
  )
}

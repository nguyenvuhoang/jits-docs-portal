'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { GuideDocument } from '@/lib/types'

export function DocumentList({
  projectCode,
  folderCode,
  documents
}: {
  projectCode: string
  folderCode: string
  documents: GuideDocument[]
}) {
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    const value = keyword.trim().toLowerCase()
    if (!value) return documents
    return documents.filter((document) => {
      return (
        document.title.toLowerCase().includes(value) ||
        document.summary.toLowerCase().includes(value) ||
        document.slug.toLowerCase().includes(value)
      )
    })
  }, [documents, keyword])

  return (
    <>
      <div className="search-wrap">
        <label className="label" htmlFor="document-search">Tìm tài liệu</label>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: 15, color: '#667085' }} />
          <input
            id="document-search"
            className="input"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Nhập tên tài liệu, docker, nginx, deploy..."
            style={{ paddingLeft: 42 }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">Không tìm thấy tài liệu phù hợp.</div>
      ) : (
        <div className="document-list">
          {filtered.map((document) => (
            <Link
              key={document.slug}
              className="document-item"
              href={`/user-guide/${projectCode}/${folderCode}/${document.slug}`}
            >
              <div>
                <h3>{document.title}</h3>
                <p>{document.summary}</p>
              </div>
              <span className="badge">{document.type}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

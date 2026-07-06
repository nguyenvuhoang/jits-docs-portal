import fs from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { isUnlockedFromRequest, normalizeProjectCode } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DOCS_ROOT = path.join(process.cwd(), 'docs-content')

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
}

function hasUnsafeSegment(segments: string[]) {
  return segments.some((segment) => {
    return (
      !segment ||
      segment === '.' ||
      segment === '..' ||
      segment.includes('\\') ||
      segment.includes('/')
    )
  })
}

export async function GET(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{
      projectCode: string
      assetPath: string[]
    }>
  }
) {
  const { projectCode, assetPath } = await params
  const normalizedProjectCode = normalizeProjectCode(projectCode)

  if (!isUnlockedFromRequest(request, normalizedProjectCode)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Chưa mở khóa tài liệu.'
      },
      { status: 401 }
    )
  }

  if (!assetPath?.length || hasUnsafeSegment(assetPath)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Đường dẫn file không hợp lệ.'
      },
      { status: 400 }
    )
  }

  const projectRoot = path.resolve(DOCS_ROOT, normalizedProjectCode)
  const filePath = path.resolve(projectRoot, ...assetPath)

  if (!filePath.startsWith(projectRoot + path.sep)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Đường dẫn file không hợp lệ.'
      },
      { status: 400 }
    )
  }

  try {
    const fileBuffer = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'
    const filename = path.basename(filePath)

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-store'
      }
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Không tìm thấy file.'
      },
      { status: 404 }
    )
  }
}
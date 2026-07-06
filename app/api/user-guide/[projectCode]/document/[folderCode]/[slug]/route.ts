import { NextRequest, NextResponse } from 'next/server'
import { isUnlockedFromRequest, normalizeProjectCode } from '@/lib/auth'
import { readDocument } from '@/lib/guide'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectCode: string; folderCode: string; slug: string }> }
) {
  const { projectCode, folderCode, slug } = await params
  const normalized = normalizeProjectCode(projectCode)

  if (!isUnlockedFromRequest(request, normalized)) {
    return NextResponse.json({ success: false, message: 'Chưa mở khóa tài liệu.' }, { status: 401 })
  }

  try {
    const data = await readDocument(normalized, folderCode, slug)
    return NextResponse.json({
      success: true,
      data: {
        project: data.project,
        folder: data.folder,
        document: data.document,
        content: data.content
      }
    })
  } catch {
    return NextResponse.json({ success: false, message: 'Không tìm thấy tài liệu.' }, { status: 404 })
  }
}

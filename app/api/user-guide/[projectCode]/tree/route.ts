import { NextRequest, NextResponse } from 'next/server'
import { getProject } from '@/lib/guide'
import { isUnlockedFromRequest, normalizeProjectCode } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectCode: string }> }
) {
  const { projectCode } = await params
  const normalized = normalizeProjectCode(projectCode)

  if (!isUnlockedFromRequest(request, normalized)) {
    return NextResponse.json({ success: false, message: 'Chưa mở khóa tài liệu.' }, { status: 401 })
  }

  try {
    const project = await getProject(normalized)
    return NextResponse.json({ success: true, data: project })
  } catch {
    return NextResponse.json({ success: false, message: 'Không tìm thấy dự án.' }, { status: 404 })
  }
}

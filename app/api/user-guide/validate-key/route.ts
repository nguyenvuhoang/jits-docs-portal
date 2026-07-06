import { NextRequest, NextResponse } from 'next/server'
import { cookieName, createProjectToken, validateProjectKey, normalizeProjectCode } from '@/lib/auth'
import { getProject } from '@/lib/guide'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const projectCode = normalizeProjectCode(body?.projectCode || '')
  const accessKey = String(body?.accessKey || '')

  if (!projectCode || !accessKey) {
    return NextResponse.json({ success: false, message: 'Thiếu project code hoặc access key.' }, { status: 400 })
  }

  try {
    await getProject(projectCode)
  } catch {
    return NextResponse.json({ success: false, message: 'Dự án tài liệu không tồn tại.' }, { status: 404 })
  }

  if (!validateProjectKey(projectCode, accessKey)) {
    return NextResponse.json({ success: false, message: 'Access key không hợp lệ.' }, { status: 401 })
  }

  const token = createProjectToken(projectCode)
  const response = NextResponse.json({ success: true, data: { projectCode } })
  response.cookies.set(cookieName(projectCode), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Number(process.env.GUIDE_UNLOCK_HOURS || '8') * 60 * 60
  })

  return response
}

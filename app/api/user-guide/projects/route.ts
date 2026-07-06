import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/guide'

export async function GET() {
  const projects = await getProjects()
  return NextResponse.json({ success: true, data: projects })
}

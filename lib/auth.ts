import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

const DEFAULT_KEYS: Record<string, string> = {
  emi: 'emi@2026',
  cmi: 'cmi@2026'
}

export function normalizeProjectCode(projectCode: string) {
  return projectCode.trim().toLowerCase()
}

export function getGuideKeys(): Record<string, string> {
  if (process.env.GUIDE_KEYS_JSON) {
    try {
      const parsed = JSON.parse(process.env.GUIDE_KEYS_JSON) as Record<string, string>
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [normalizeProjectCode(key), value])
      )
    } catch {
      return DEFAULT_KEYS
    }
  }

  return {
    ...DEFAULT_KEYS,
    ...(process.env.GUIDE_KEY_EMI ? { emi: process.env.GUIDE_KEY_EMI } : {}),
    ...(process.env.GUIDE_KEY_CMI ? { cmi: process.env.GUIDE_KEY_CMI } : {})
  }
}

function getSecret() {
  return process.env.GUIDE_AUTH_SECRET || 'dev-only-change-me'
}

function getUnlockHours() {
  const value = Number(process.env.GUIDE_UNLOCK_HOURS || '8')
  return Number.isFinite(value) && value > 0 ? value : 8
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function cookieName(projectCode: string) {
  return `guide_unlock_${normalizeProjectCode(projectCode)}`
}

export function createProjectToken(projectCode: string) {
  const normalized = normalizeProjectCode(projectCode)
  const expiresAt = Date.now() + getUnlockHours() * 60 * 60 * 1000
  const payload = `${normalized}.${expiresAt}`
  return `${payload}.${sign(payload)}`
}

export function verifyProjectToken(projectCode: string, token?: string | null) {
  if (!token) return false

  const [project, expiresAtRaw, signature] = token.split('.')
  if (!project || !expiresAtRaw || !signature) return false
  if (project !== normalizeProjectCode(projectCode)) return false

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false

  const payload = `${project}.${expiresAtRaw}`
  return safeCompare(sign(payload), signature)
}

export function validateProjectKey(projectCode: string, accessKey: string) {
  const normalized = normalizeProjectCode(projectCode)
  const keys = getGuideKeys()
  const expected = keys[normalized]
  return Boolean(expected && accessKey && safeCompare(expected, accessKey))
}

export function isUnlockedFromRequest(request: NextRequest, projectCode: string) {
  const token = request.cookies.get(cookieName(projectCode))?.value
  return verifyProjectToken(projectCode, token)
}

'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2 } from 'lucide-react'

export function AccessKeyForm({ projectCode }: { projectCode: string }) {
  const router = useRouter()
  const [accessKey, setAccessKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/user-guide/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectCode, accessKey })
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        setError(payload.message || 'Access key không hợp lệ.')
        return
      }

      router.replace(`/user-guide/${projectCode}/home`)
      router.refresh()
    } catch {
      setError('Không thể xác thực access key. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="label" htmlFor="accessKey">Access key</label>
        <input
          id="accessKey"
          className="input"
          type="password"
          value={accessKey}
          onChange={(event) => setAccessKey(event.target.value)}
          placeholder="Nhập key được cấp cho dự án"
          autoComplete="off"
        />
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="form-group">
        <button className="btn" type="submit" disabled={loading || !accessKey.trim()}>
          {loading ? <Loader2 size={18} /> : <KeyRound size={18} />}
          Truy cập tài liệu
        </button>
      </div>
    </form>
  )
}

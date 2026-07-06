'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

type CopyableCodeBlockProps = {
  code: string
  language?: string
}

function normalizeLanguage(language?: string) {
  if (!language) return 'bash'

  const value = language.toLowerCase()

  const map: Record<string, string> = {
    sh: 'bash',
    shell: 'bash',
    terminal: 'bash',
    command: 'bash',
    cmd: 'batch',
    ps: 'powershell',
    ps1: 'powershell',
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    csharp: 'csharp',
    'c#': 'csharp',
    cs: 'csharp',
    docker: 'dockerfile',
    dockerfile: 'dockerfile',
    yml: 'yaml'
  }

  return map[value] || value
}

export function CopyableCodeBlock({ code, language }: CopyableCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const lang = normalizeLanguage(language)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)

      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span className="code-lang">{lang}</span>

        <button type="button" className="copy-code-btn" onClick={handleCopy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '20px 22px',
          background: 'transparent',
          fontSize: '14px',
          lineHeight: '1.75'
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import sanitizeHtml from 'sanitize-html'
import type { DocumentType } from '@/lib/types'
import { CopyableCodeBlock } from '@/components/CopyableCodeBlock'

const allowedHtml = {
  ...sanitizeHtml.defaults,
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'code',
    'span',
    'div'
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    code: ['class'],
    span: ['class'],
    div: ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel']
}

type CodeElementProps = {
  className?: string
  children?: ReactNode
}

function extractText(children: ReactNode): string {
  if (children === null || children === undefined) {
    return ''
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(extractText).join('')
  }

  if (isValidElement<{ children?: ReactNode }>(children)) {
    return extractText(children.props.children)
  }

  return ''
}

function getCodeBlock(children: ReactNode) {
  const child = Children.toArray(children)[0] as
    | ReactElement<CodeElementProps>
    | undefined

  if (!child || !isValidElement<CodeElementProps>(child)) {
    return null
  }

  const className = child.props.className || ''
  const match = /language-([\w-]+)/.exec(className)

  return {
    code: extractText(child.props.children).replace(/\n$/, ''),
    language: match?.[1] || 'text'
  }
}

export function DocumentRenderer({
  type,
  content
}: {
  type: DocumentType
  content: string
}) {
  if (type === 'html') {
    const safeHtml = sanitizeHtml(content, allowedHtml)

    return <div className="prose" dangerouslySetInnerHTML={{ __html: safeHtml }} />
  }

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            const codeBlock = getCodeBlock(children)

            if (!codeBlock) {
              return <pre>{children}</pre>
            }

            return (
              <CopyableCodeBlock
                code={codeBlock.code}
                language={codeBlock.language}
              />
            )
          },
          code({ className, children, ...props }) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
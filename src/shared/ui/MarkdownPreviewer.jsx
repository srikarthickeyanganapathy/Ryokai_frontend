import React from 'react'
import { cn } from '@/shared/lib/cn'

export function MarkdownPreviewer({ content, className }) {
  if (!content || !content.trim()) {
    return (
      <div className={cn("text-[var(--text-muted)] italic text-xs py-8 text-center", className)}>
        Nothing to preview. Switch to "Write" mode to add content.
      </div>
    )
  }

  // Basic GitHub-style markdown renderer
  const renderMarkdown = (text) => {
    const lines = text.split('\n')
    const elements = []
    let inCodeBlock = false
    let codeBuffer = []
    let codeLang = ''

    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${index}`} className="my-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] p-3 overflow-x-auto font-mono text-xs text-[var(--accent)]">
              <pre><code>{codeBuffer.join('\n')}</code></pre>
            </div>
          )
          codeBuffer = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
          codeLang = line.replace('```', '').trim()
        }
        return
      }

      if (inCodeBlock) {
        codeBuffer.push(line)
        return
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl font-bold text-[var(--text-primary)] mt-4 mb-2 pb-1 border-b border-[var(--color-border-subtle)] tracking-tight">
            {formatInline(line.replace('# ', ''))}
          </h1>
        )
        return
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-lg font-bold text-[var(--text-primary)] mt-3 mb-1.5 tracking-tight">
            {formatInline(line.replace('## ', ''))}
          </h2>
        )
        return
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-bold text-[var(--text-primary)] mt-2 mb-1 uppercase tracking-wider">
            {formatInline(line.replace('### ', ''))}
          </h3>
        )
        return
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-[var(--accent)] pl-3 py-1 my-2 text-[var(--text-secondary)] italic bg-[var(--accent-soft)]/20 rounded-r-md text-xs leading-relaxed">
            {formatInline(line.replace('> ', ''))}
          </blockquote>
        )
        return
      }

      // Horizontal rules
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={index} className="my-4 border-[var(--color-border-subtle)]" />)
        return
      }

      // Checklists
      if (line.startsWith('- [ ] ') || line.startsWith('* [ ] ')) {
        elements.push(
          <div key={index} className="flex items-center gap-2 my-1 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" disabled className="rounded border-[var(--color-border-subtle)] text-[var(--accent)]" />
            <span>{formatInline(line.replace(/^[-\*]\s+\[ \]\s+/, ''))}</span>
          </div>
        )
        return
      }
      if (line.startsWith('- [x] ') || line.startsWith('* [x] ')) {
        elements.push(
          <div key={index} className="flex items-center gap-2 my-1 text-xs text-[var(--text-muted)] line-through">
            <input type="checkbox" checked disabled className="rounded border-[var(--color-border-subtle)] text-[var(--accent)]" />
            <span>{formatInline(line.replace(/^[-\*]\s+\[x\]\s+/, ''))}</span>
          </div>
        )
        return
      }

      // Bullet lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-4 list-disc text-xs text-[var(--text-secondary)] my-0.5 leading-relaxed">
            {formatInline(line.replace(/^[-\*]\s+/, ''))}
          </li>
        )
        return
      }

      // Blank lines
      if (!line.trim()) {
        elements.push(<div key={index} className="h-2" />)
        return
      }

      // Regular Paragraph
      elements.push(
        <p key={index} className="text-xs leading-relaxed text-[var(--text-primary)] my-1">
          {formatInline(line)}
        </p>
      )
    })

    return elements
  }

  // Format inline bold, italic, code, and links
  const formatInline = (text) => {
    if (!text) return ''

    // Bold **text**
    let parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>
      }

      // Italic *text*
      let subParts = part.split(/(\*.*?\*)/g)
      return subParts.map((sub, j) => {
        if (sub.startsWith('*') && sub.endsWith('*')) {
          return <em key={j} className="italic">{sub.slice(1, -1)}</em>
        }

        // Inline Code `code`
        let codeParts = sub.split(/(`.*?`)/g)
        return codeParts.map((code, k) => {
          if (code.startsWith('`') && code.endsWith('`')) {
            return (
              <code key={k} className="px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] font-mono text-[11px] text-[var(--accent)]">
                {code.slice(1, -1)}
              </code>
            )
          }
          return code
        })
      })
    })
  }

  return (
    <div className={cn("prose prose-invert max-w-none text-xs space-y-1 font-sans", className)}>
      {renderMarkdown(content)}
    </div>
  )
}

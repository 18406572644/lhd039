function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function parseInline(text) {
  let html = escapeHtml(text)

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>')

  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="md-italic">$1</em>')

  html = html.replace(/~~(.+?)~~/g, '<del class="md-strikethrough">$1</del>')

  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')

  return html
}

export function parseMarkdown(text) {
  if (!text) return ''

  const lines = text.split('\n')
  const output = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^---+$/.test(line.trim())) {
      output.push('<hr class="md-hr" />')
      i++
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = parseInline(headingMatch[2])
      output.push(`<h${level} class="md-heading md-heading-${level}">${content}</h${level}>`)
      i++
      continue
    }

    if (/^>\s?/.test(line)) {
      const blockquoteLines = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        blockquoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      const content = parseInline(blockquoteLines.join('\n'))
      output.push(`<blockquote class="md-blockquote"><p>${content}</p></blockquote>`)
      continue
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        const itemContent = lines[i].replace(/^\s*[-*+]\s+/, '')
        items.push(`<li class="md-list-item">${parseInline(itemContent)}</li>`)
        i++
      }
      output.push(`<ul class="md-list md-ul">${items.join('')}</ul>`)
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const itemContent = lines[i].replace(/^\s*\d+\.\s+/, '')
        items.push(`<li class="md-list-item">${parseInline(itemContent)}</li>`)
        i++
      }
      output.push(`<ol class="md-list md-ol">${items.join('')}</ol>`)
      continue
    }

    if (line.trim() === '') {
      output.push('<p class="md-paragraph md-empty">&nbsp;</p>')
      i++
      continue
    }

    output.push(`<p class="md-paragraph">${parseInline(line)}</p>`)
    i++
  }

  return output.join('\n')
}

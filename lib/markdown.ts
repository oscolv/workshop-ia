import { visit, SKIP } from 'unist-util-visit'
import type { Root, Text, Link } from 'mdast'

// rehype-callouts solo reconoce tipos [\w-]+, así que un tipo con acento
// como [!contradicción] jamás se transforma. Este plugin corre antes:
// normaliza el tipo a ASCII y, si el callout no traía título explícito,
// conserva la palabra original (capitalizada) como título visible.
export function remarkNormalizeCalloutTypes() {
  return (tree: Root) => {
    visit(tree, 'blockquote', node => {
      const para = node.children[0]
      if (!para || para.type !== 'paragraph') return
      const text = para.children[0]
      if (!text || text.type !== 'text') return
      const m = /^\[!([^\]\s]+)\]([+-]?)([^\n]*)([\s\S]*)$/.exec(text.value)
      if (!m) return
      const [, type, collapse, firstLineRest, body] = m
      const ascii = type.normalize('NFD').replace(/[̀-ͯ]/g, '')
      if (ascii === type) return
      const title = firstLineRest.trim()
        ? firstLineRest
        : ` ${type.charAt(0).toUpperCase()}${type.slice(1)}`
      text.value = `[!${ascii}]${collapse}${title}${body}`
    })
  }
}

const WIKILINK_RE = /\[\[([^\]|#\n]+)(?:\|([^\]\n]+))?\]\]/g

export function remarkWikilinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number') return
      if (parent.type === 'link') return
      const value = node.value
      WIKILINK_RE.lastIndex = 0
      if (!WIKILINK_RE.test(value)) return

      WIKILINK_RE.lastIndex = 0
      const newChildren: (Text | Link)[] = []
      let lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = WIKILINK_RE.exec(value)) !== null) {
        if (m.index > lastIndex) {
          newChildren.push({ type: 'text', value: value.slice(lastIndex, m.index) })
        }
        const slug = m[1].trim()
        const alias = m[2]?.trim()
        const url = `/wiki/${slug}`
        const text = alias ?? slug
        newChildren.push({
          type: 'link',
          url,
          children: [{ type: 'text', value: text }],
        } as Link)
        lastIndex = m.index + m[0].length
      }
      if (lastIndex < value.length) {
        newChildren.push({ type: 'text', value: value.slice(lastIndex) })
      }

      parent.children.splice(index, 1, ...newChildren)
      return [SKIP, index + newChildren.length]
    })
  }
}

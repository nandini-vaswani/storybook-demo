/**
 * The HTML the rich-text serializer produces, parsed back into nodes.
 *
 * `text-ingredient.tsx` renders serialized rich text by parsing it into React elements
 * rather than by handing it to `dangerouslySetInnerHTML`, which makes this parser the
 * real consumer of `serialize-rich-text.ts` and the place its escaping has to survive.
 * It lives here, apart from the `'use client'` component that uses it, so it can be
 * tested directly against that serializer.
 */

/** Tags that never take a closing tag, so the parser must not push them on the stack. */
const VOID_TAGS = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'source', 'track', 'wbr'])

export type HtmlAttrs = Record<string, string | true>

export type HtmlNode =
  | {
      type: 'element'
      tag: string
      attrs: HtmlAttrs
      children: HtmlNode[]
    }
  | {
      type: 'text'
      text: string
    }

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
}

const ENTITY = /&(?:#[xX]([0-9a-fA-F]+)|#([0-9]+)|([a-zA-Z]+));/g

/**
 * One pass, deliberately.
 *
 * This was a chain of `.replace` calls with `&amp;` decoded before `&lt;` and `&quot;`,
 * which decodes twice: `&amp;quot;` became `&quot;` on the first pass and then a bare `"`
 * on a later one. Since the serializer began escaping properly, that turned a text node
 * or CTA label containing a literal `&quot;` into a quote inside the `data-cta-inline`
 * JSON — `JSON.parse` threw, the surrounding `catch` returned null, and the CTA vanished
 * with a 200. A single pass cannot decode its own output, so the ordering stops mattering.
 *
 * Unknown entities are left as written, which is what the chain did too.
 */
export const decodeHtmlEntities = (input: string): string => {
  return input.replace(ENTITY, (match, hex, dec, name) => {
    if (hex) return String.fromCodePoint(parseInt(hex, 16))
    if (dec) return String.fromCodePoint(parseInt(dec, 10))
    const named = NAMED_ENTITIES[String(name).toLowerCase()]
    return named ?? match
  })
}

const parseAttributes = (input: string): HtmlAttrs => {
  const attrs: HtmlAttrs = {}
  const attrRegex = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>`]+)))?/g
  let match

  while ((match = attrRegex.exec(input)) !== null) {
    const name = match[1].toLowerCase()
    const rawValue = match[2] ?? match[3] ?? match[4]
    const value = rawValue !== undefined ? decodeHtmlEntities(rawValue) : true
    attrs[name] = value
  }

  return attrs
}

export const parseHtmlToNodes = (html: string): HtmlNode[] => {
  const tokens = html.match(/<!--[\s\S]*?-->|<\/?[^>]+>|[^<]+/g) ?? []
  const root: Extract<HtmlNode, { type: 'element' }> = {
    type: 'element',
    tag: 'root',
    attrs: {},
    children: [],
  }
  const stack: Array<Extract<HtmlNode, { type: 'element' }>> = [root]

  tokens.forEach((token) => {
    if (token.startsWith('<!--')) return

    if (token.startsWith('<')) {
      const closingMatch = token.match(/^<\/\s*([^\s>]+)[^>]*>$/)
      if (closingMatch) {
        const closingTag = closingMatch[1].toLowerCase()
        for (let i = stack.length - 1; i > 0; i -= 1) {
          if (stack[i].tag === closingTag) {
            stack.splice(i)
            break
          }
        }
        return
      }

      const openMatch = token.match(/^<\s*([^\s/>]+)([\s\S]*?)\/?>$/)
      if (!openMatch) return

      const tag = openMatch[1].toLowerCase()
      const attrs = parseAttributes(openMatch[2] ?? '')
      const element: Extract<HtmlNode, { type: 'element' }> = {
        type: 'element',
        tag,
        attrs,
        children: [],
      }
      stack[stack.length - 1].children.push(element)

      const selfClosing = /\/>$/.test(token) || VOID_TAGS.has(tag)
      if (!selfClosing) {
        stack.push(element)
      }
      return
    }

    const text = decodeHtmlEntities(token)
    if (text.length > 0) {
      stack[stack.length - 1].children.push({ type: 'text', text })
    }
  })

  return root.children
}

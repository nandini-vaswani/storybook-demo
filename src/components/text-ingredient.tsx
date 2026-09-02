'use client'

import {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type CSSProperties,
  type ReactNode,
  type JSX,
} from 'react'
import { cn } from '@/lib/utils'
import gsap from 'gsap'
import { Button } from '@/components/button'
import { parseHtmlToNodes, type HtmlAttrs, type HtmlNode } from '@/lib/parse-html-nodes'


type BlockNode = {
  tag: string
  attrs: HtmlAttrs
  children: HtmlNode[]
}

const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

const parseStyleString = (style: string): CSSProperties => {
  const styleObj: CSSProperties = {}

  style
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const [rawProp, ...valueParts] = part.split(':')
      if (!rawProp || valueParts.length === 0) return
      const prop = rawProp.trim()
      const value = valueParts.join(':').trim()
      if (!value) return
      const key = prop.startsWith('--')
        ? prop
        : prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
        ; (styleObj as Record<string, string>)[key] = value
    })

  return styleObj
}

const buildBlocks = (nodes: HtmlNode[]): BlockNode[] => {
  const blocks: BlockNode[] = []
  const inlineBuffer: HtmlNode[] = []

  const flushInline = () => {
    if (inlineBuffer.length === 0) return
    blocks.push({
      tag: 'p',
      attrs: {},
      children: inlineBuffer.splice(0, inlineBuffer.length),
    })
  }

  nodes.forEach((node) => {
    if (node.type === 'element' && BLOCK_TAGS.has(node.tag)) {
      flushInline()
      blocks.push({ tag: node.tag, attrs: node.attrs, children: node.children })
      return
    }

    if (node.type === 'text' && inlineBuffer.length === 0 && node.text.trim() === '') {
      return
    }

    inlineBuffer.push(node)
  })

  flushInline()
  return blocks
}

const attrsToProps = (attrs: HtmlAttrs): Record<string, any> => {
  const props: Record<string, any> = {}

  Object.entries(attrs).forEach(([name, value]) => {
    if (name === 'class' || name === 'classname') {
      props.className = value === true ? '' : value
      return
    }
    if (name === 'style' && typeof value === 'string') {
      const styleObj = parseStyleString(value)
      if (Object.keys(styleObj).length > 0) {
        props.style = styleObj
      }
      return
    }
    if (name === 'for') {
      props.htmlFor = value === true ? '' : value
      return
    }
    props[name] = value === true ? true : value
  })

  return props
}

const createNodeRenderer = (options: {
  splitWords: boolean
  wordClassName?: string
  wordStyle?: CSSProperties
  ctaClassName?: string
  ctaAlignClassName?: string
}) => {
  let keyIndex = 0
  const nextKey = () => `node-${keyIndex++}`

  const renderText = (text: string): ReactNode[] => {
    if (!options.splitWords) return [text]
    const parts = text.split(/(\s+)/).filter((part) => part.length > 0)
    return parts.map((part) => {
      if (/^\s+$/.test(part)) {
        return part
      }
      return (
        <span key={nextKey()} className={options.wordClassName} style={options.wordStyle}>
          {part}
        </span>
      )
    })
  }

  const renderNode = (node: HtmlNode): ReactNode | ReactNode[] => {
    if (node.type === 'text') {
      return renderText(node.text)
    }
    if (node.tag === 'br') {
      return <br key={nextKey()} />
    }

    if (node.tag === 'span' && node.attrs['data-cta-inline']) {
      try {
        const raw = node.attrs['data-cta-inline']
        const cta = JSON.parse(typeof raw === 'string' ? raw : '')
        const button = (
          <Button
            key={nextKey()}
            label={cta.label}
            size={cta.size}
            prominence={cta.prominence}
            theme={cta.theme}
            icon={cta.icon}
            iconPosition={cta.iconPosition}
            linkType={cta.linkType}
            externalLink={cta.externalLink}
            internalLink={cta.internalLink}
            modalId={cta.modalId}
            className={cn(options.ctaClassName, options.ctaAlignClassName)}
          />
        )
        if (options.splitWords) {
          return (
            <span key={nextKey()} className={options.wordClassName} style={options.wordStyle}>
              {button}
            </span>
          )
        }
        return button
      } catch {
        return null
      }
    }

    const props = attrsToProps(node.attrs)
    const Tag = node.tag as keyof JSX.IntrinsicElements
    const children = renderNodes(node.children)
    return (
      <Tag key={nextKey()} {...props}>
        {children}
      </Tag>
    )
  }

  const renderNodes = (nodes: HtmlNode[]): ReactNode[] => {
    return nodes.flatMap((node) => {
      const rendered = renderNode(node)
      return Array.isArray(rendered) ? rendered : [rendered]
    })
  }

  return renderNodes
}

// ---------------------------------------------------------------------------
// Visual-line splitter
// ---------------------------------------------------------------------------

interface VisualLineRange {
  start: number
  end: number
}

function extractVisualLineRanges(el: HTMLElement): VisualLineRange[] {
  const words: { start: number; end: number; top: number }[] = []
  let globalOffset = 0

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''
      const tokens = text.split(/(\s+)/)
      let localOffset = 0
      tokens.forEach((token) => {
        if (token.trim().length > 0) {
          const range = document.createRange()
          range.setStart(node, localOffset)
          range.setEnd(node, localOffset + token.length)
          const rect = range.getBoundingClientRect()
          words.push({
            start: globalOffset + localOffset,
            end: globalOffset + localOffset + token.length,
            top: Math.round(rect.top),
          })
        }
        localOffset += token.length
      })
      globalOffset += text.length
    } else {
      node.childNodes.forEach(walk)
    }
  }

  walk(el)
  if (words.length === 0) return []

  const lineMap = new Map<number, { start: number; end: number }>()
  words.forEach(({ start, end, top }) => {
    if (!lineMap.has(top)) {
      lineMap.set(top, { start, end })
    } else {
      const existing = lineMap.get(top)!
      lineMap.set(top, { start: Math.min(existing.start, start), end: Math.max(existing.end, end) })
    }
  })

  return Array.from(lineMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, range]) => range)
}

// ---------------------------------------------------------------------------
// Slice HtmlNode tree by char offsets
// ---------------------------------------------------------------------------

function sliceHtmlNodes(nodes: HtmlNode[], start: number, end: number): HtmlNode[] {
  let cursor = 0

  const sliceNode = (node: HtmlNode): HtmlNode | null => {
    if (node.type === 'text') {
      const nodeStart = cursor
      const nodeEnd = cursor + node.text.length
      cursor += node.text.length

      if (nodeEnd <= start || nodeStart >= end) return null
      const sliceStart = Math.max(start, nodeStart) - nodeStart
      const sliceEnd = Math.min(end, nodeEnd) - nodeStart
      return { type: 'text', text: node.text.slice(sliceStart, sliceEnd) }
    }

    const savedCursor = cursor
    const slicedChildren: HtmlNode[] = []
    for (const child of node.children) {
      const result = sliceNode(child)
      if (result !== null) slicedChildren.push(result)
    }

    if (slicedChildren.length === 0 && cursor === savedCursor) return null
    if (slicedChildren.length === 0) return null

    return { ...node, children: slicedChildren }
  }

  return nodes.flatMap((node) => {
    const result = sliceNode(node)
    return result ? [result] : []
  })
}

// ---------------------------------------------------------------------------
// StackLineOnLine sub-component
// ---------------------------------------------------------------------------

interface StackLineProps {
  blocks: BlockNode[]
  textAlign: 'left' | 'center' | 'right'
  scrollProgress: number
  revealProgressEnd: number
  textColor: string
  ctaAlignClassName?: string
  onLineCount?: (count: number) => void
}

interface VisualLineSlice {
  blockIndex: number
  nodes: HtmlNode[]
}

function StackLineOnLine({
  blocks,
  textAlign,
  scrollProgress,
  revealProgressEnd,
  ctaAlignClassName,
  onLineCount,
}: StackLineProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<HTMLDivElement>(null)
  const [visualLineSlices, setVisualLineSlices] = useState<VisualLineSlice[]>([])

  const renderPlainNodes = useMemo(
    () => createNodeRenderer({ splitWords: false, ctaClassName: 'mt-4', ctaAlignClassName }),
    [ctaAlignClassName],
  )
  const [isMeasured, setIsMeasured] = useState(false)

  const hasText = useCallback((nodes: HtmlNode[]): boolean => {
    return nodes.some((n) => {
      if (n.type === 'text') return n.text.trim().length > 0
      return hasText(n.children)
    })
  }, [])

  const measure = useCallback(() => {
    if (!measureRef.current) return

    const slices: VisualLineSlice[] = []

    // One slice per block (paragraph/heading) — wrapped lines animate together as a unit.
    measureRef.current.querySelectorAll<HTMLElement>('.measure-block').forEach((_, blockIndex) => {
      const blockChildren = blocks[blockIndex].children
      if (blockChildren.length > 0) slices.push({ blockIndex, nodes: blockChildren })
    })

    if (slices.length > 0) {
      setVisualLineSlices(slices)
      setIsMeasured(true)
      onLineCount?.(slices.length)
    }
  }, [blocks, hasText, onLineCount])

  useEffect(() => {
    const id = setTimeout(measure, 0)
    return () => clearTimeout(id)
  }, [measure])

  useEffect(() => {
    if (!measureRef.current) return
    const ro = new ResizeObserver(() => {
      const id = setTimeout(measure, 0)
      return () => clearTimeout(id)
    })
    ro.observe(measureRef.current)
    return () => ro.disconnect()
  }, [measure])

  const applyGsap = useCallback(() => {
    if (!animRef.current) return

    const lineElements = animRef.current.querySelectorAll<HTMLElement>('.stack-visual-line')
    const totalLines = lineElements.length
    if (totalLines === 0) return

    // Line 0 is always visible at rest. Each subsequent line gets an equal slice of the
    // reveal window sized by the parent (revealProgressEnd), matching the one-swipe-per-line
    // pacing used by line-by-line / paragraph-by-paragraph / line-by-line-no-fade.
    const segmentSize = revealProgressEnd / totalLines

    lineElements.forEach((line, i) => {
      const start = i * segmentSize

      if (scrollProgress >= start) {
        gsap.to(line, {
          opacity: 1,
          y: 0,
          scale: 1,
        })
      } else {
        gsap.set(line, {
          opacity: 0,
          y: 20,
          scale: 0.95,
        })
      }
    })
  }, [scrollProgress, revealProgressEnd])

  useEffect(() => {
    applyGsap()
  }, [applyGsap, visualLineSlices])

  const alignClass = cn(
    textAlign === 'center' && 'text-center',
    textAlign === 'right' && 'text-right',
    textAlign === 'left' && 'text-left',
  )

  return (
    <>
      <div
        ref={measureRef}
        aria-hidden
        className={cn('w-full pointer-events-none select-none', alignClass)}
        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, zIndex: -1 }}
      >
        {blocks.map((block, i) => {
          const Tag = block.tag as keyof JSX.IntrinsicElements
          const props = attrsToProps(block.attrs)
          return (
            <Tag key={i} {...props} className={cn('measure-block', props.className)}>
              {renderPlainNodes(block.children)}
            </Tag>
          )
        })}
      </div>

      <div
        ref={animRef}
        className={cn('w-full space-y-3', alignClass)}
        style={{ opacity: isMeasured ? 1 : 0 }}
      >
        {visualLineSlices.map((slice, i) => {
          const sourceBlock = blocks[slice.blockIndex]
          const Tag = sourceBlock.tag as keyof JSX.IntrinsicElements
          const props = attrsToProps(sourceBlock.attrs)
          return (
            <div
              key={i}
              className="stack-visual-line"
              style={{
                opacity: i === 0 ? 1 : 0,
                transform: 'translateY(0px) scale(1)',
                willChange: 'opacity, transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <Tag {...props}>{renderPlainNodes(slice.nodes)}</Tag>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface TextIngredientProps {
  content: string
  background: 'none' | 'color' | 'image' | 'video'
  backgroundImageDesktop?: string
  backgroundImageMobile?: string
  backgroundVideoDesktop?: string
  backgroundVideoMobile?: string
  backgroundColor?: string
  backgroundOverlayOpacity?: number
  verticalAlign?: 'top' | 'center'
  textColor?: string
  textAlign?: 'left' | 'center' | 'right'
  animationType?: string
  scrollProgress?: number
  revealProgressEnd?: number
  teleprompterLineWindow?: number
  showProgressBar?: boolean
  className?: string
  desktopAspectRatio?: '16:9' | '4:3'
  mobileAspectRatio?: '4:5' | '9:16'
  isMobileView?: boolean
  onVisualLineCount?: (count: number) => void
}

export function TextIngredient({
  content,
  background,
  backgroundImageDesktop,
  backgroundImageMobile,
  backgroundVideoDesktop,
  backgroundVideoMobile,
  backgroundColor = '#1a1a1a',
  backgroundOverlayOpacity = 0.3,
  verticalAlign = 'center',
  textColor = '#d1d5db',
  textAlign = 'left',
  animationType = 'none',
  scrollProgress = 0,
  revealProgressEnd = 0.7,
  teleprompterLineWindow = 3,
  showProgressBar = true,
  className,
  desktopAspectRatio = '16:9',
  mobileAspectRatio = '4:5',
  isMobileView = false,
  onVisualLineCount,
}: TextIngredientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const reportedLineCountRef = useRef<number>(0)

  const blockHasCta = useCallback((nodes: HtmlNode[]): boolean => {
    return nodes.some((n) => {
      if (n.type === 'element') {
        if (n.tag === 'span' && n.attrs['data-cta-inline']) return true
        return blockHasCta(n.children)
      }
      return false
    })
  }, [])

  const { blocks } = useMemo(() => {
    const nodes = parseHtmlToNodes(content)
    let blockList = buildBlocks(nodes)

    if (blockList.length === 0) {
      const plainText = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (plainText) {
        blockList = [
          {
            tag: 'p',
            attrs: {},
            children: [{ type: 'text', text: plainText }],
          },
        ]
      }
    }

    return { blocks: blockList }
  }, [content])

  // Measure actual visual line count and report to parent so the scroll
  // distance matches exactly — no dead scroll, no skipped lines.
  useEffect(() => {
    if (!contentRef.current || animationType === 'none' || !onVisualLineCount) return

    const measure = () => {
      if (!contentRef.current) return

      let lineCount = blocks.length // fallback: one segment per block

      if (
        animationType === 'line-by-line' ||
        animationType === 'line-by-line-no-fade' ||
        animationType === 'paragraph-by-paragraph'
      ) {
        // Count unique top-positions among the block elements to get visual line count
        const blockEls = contentRef.current.querySelectorAll<HTMLElement>('.line, .paragraph-chunk')
        if (blockEls.length > 0) {
          lineCount = blockEls.length
        }
      } else if (animationType === 'word-by-word') {
        const wordEls = contentRef.current.querySelectorAll<HTMLElement>('.word')
        lineCount = Math.max(wordEls.length, 1)
      }

      if (lineCount !== reportedLineCountRef.current) {
        reportedLineCountRef.current = lineCount
        onVisualLineCount(lineCount)
      }
    }

    // Measure after paint so DOM is laid out
    const id = requestAnimationFrame(measure)

    const ro = new ResizeObserver(() => requestAnimationFrame(measure))
    if (contentRef.current) ro.observe(contentRef.current)

    return () => {
      cancelAnimationFrame(id)
      ro.disconnect()
    }
  }, [animationType, blocks, onVisualLineCount])

  // Synchronous effect for line-by-line — direct DOM writes, no rAF, no tween queue
  useEffect(() => {
    if (!contentRef.current || animationType !== 'line-by-line') return

    const lineElements = contentRef.current.querySelectorAll<HTMLElement>('.line')
    const totalLines = lineElements.length
    if (totalLines === 0) return

    // Discrete reveal: each line owns one equal slice of the reveal window. The
    // reveal window width (revealProgressEnd) is sized by the parent so one swipe
    // of scroll equals exactly one line, independent of content length.
    const progress = Math.min(scrollProgress / revealProgressEnd, 1)
    let activeIndex = Math.floor(progress * totalLines)

    if (activeIndex >= totalLines) {
      activeIndex = totalLines - 1
    }

    lineElements.forEach((line, i) => {
      gsap.set(line, {
        opacity: i === activeIndex ? 1 : 0,
        scale: i === activeIndex ? 1 : 0.95,
        overwrite: true,
      })
    })
  }, [animationType, scrollProgress, revealProgressEnd])

  useEffect(() => {
    if (!contentRef.current || animationType === 'none' || animationType === 'line-by-line') return

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!contentRef.current) return

      if (animationType === 'word-by-word') {
        const wordElements = contentRef.current.querySelectorAll<HTMLElement>('.word')
        const totalWords = wordElements.length
        const wordsToShow = Math.max(1, Math.floor(scrollProgress * (totalWords + 1)))

        wordElements.forEach((word, i) => {
          const isVisible = parseFloat(word.style.opacity) === 1
          if (i < wordsToShow) {
            if (!isVisible) {
              gsap.to(word, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power3.out',
                overwrite: 'auto',
              })
            }
          } else {
            if (isVisible) {
              gsap.to(word, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                ease: 'power2.in',
                overwrite: 'auto',
              })
            }
          }
        })
      } else if (animationType === 'paragraph-by-paragraph') {
        const paragraphElements =
          contentRef.current.querySelectorAll<HTMLElement>('.paragraph-chunk')
        const totalParagraphs = paragraphElements.length
        if (totalParagraphs === 0) return

        // Discrete reveal: each paragraph owns one equal slice of the reveal
        // window. Parent sizes the window so one swipe reveals one paragraph.
        const progress = Math.min(scrollProgress / revealProgressEnd, 1)
        let activeIndex = Math.floor(progress * totalParagraphs)

        if (activeIndex >= totalParagraphs) {
          activeIndex = totalParagraphs - 1
        }

        paragraphElements.forEach((paragraph, i) => {
          gsap.set(paragraph, {
            opacity: i === activeIndex ? 1 : 0,
            scale: i === activeIndex ? 1 : 0.95,
            overwrite: true,
          })
        })
      } else if (animationType === 'line-by-line-no-fade') {
        const lineElements = contentRef.current.querySelectorAll<HTMLElement>('.line')
        const totalLines = lineElements.length
        if (totalLines === 0) return

        // Discrete reveal: each line owns one equal slice of the reveal window.
        // Parent sizes the window so one swipe reveals one line.
        const progress = Math.min(scrollProgress / revealProgressEnd, 1)
        let activeIndex = Math.floor(progress * totalLines)

        if (activeIndex >= totalLines) {
          activeIndex = totalLines - 1
        }

        lineElements.forEach((line, i) => {
          gsap.set(line, {
            opacity: i === activeIndex ? 1 : 0,
            scale: i === activeIndex ? 1 : 0.95,
            overwrite: true,
          })
        })
      }
      // NOTE: stack-line-on-line is self-contained inside <StackLineOnLine>
    })

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [animationType, scrollProgress, revealProgressEnd, content])

  const ctaAlignClassName =
    textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : undefined

  const renderPlainNodes = useMemo(
    () => createNodeRenderer({ splitWords: false, ctaClassName: 'mt-4', ctaAlignClassName }),
    [ctaAlignClassName],
  )
  const renderNoneNodes = useMemo(
    () => createNodeRenderer({ splitWords: false, ctaClassName: 'mt-4', ctaAlignClassName }),
    [ctaAlignClassName],
  )

  const renderContent = () => {
    if (animationType === 'word-by-word') {
      const renderWordNodes = createNodeRenderer({
        splitWords: true,
        wordClassName: 'word inline-block opacity-0',
        ctaAlignClassName,
        wordStyle: { transform: 'translateY(10px)', willChange: 'opacity, transform' },
      })

      return (
        <div className="space-y-4 w-full">
          {blocks.map((block, blockIndex) => {
            const Tag = block.tag as keyof JSX.IntrinsicElements
            const props = attrsToProps(block.attrs)
            return (
              <div
                key={blockIndex}
                className={cn(
                  textAlign === 'center' && 'text-center',
                  textAlign === 'right' && 'text-right',
                  textAlign === 'left' && 'text-left',
                )}
              >
                <Tag {...props}>{renderWordNodes(block.children)}</Tag>
              </div>
            )
          })}
        </div>
      )
    }

    if (animationType === 'line-by-line' || animationType === 'line-by-line-no-fade') {
      return (
        <div className="relative w-full" style={{ minHeight: '140px' }}>
          {blocks.map((block, i) => {
            const Tag = block.tag as keyof JSX.IntrinsicElements
            const props = attrsToProps(block.attrs)
            const hasCta = blockHasCta(block.children)

            return (
              <div
                key={i}
                className={cn(
                  'line absolute inset-0 flex items-center opacity-0',
                  textAlign === 'center' && 'justify-center text-center',
                  textAlign === 'right' && 'justify-end text-right',
                  textAlign === 'left' && 'justify-start text-left',
                )}
                style={{
                  transform: 'scale(0.95)',
                  willChange: 'opacity, transform',
                  backfaceVisibility: 'hidden',
                }}
                data-persistent={hasCta ? 'true' : undefined}
              >
                <Tag {...props}>{renderPlainNodes(block.children)}</Tag>
              </div>
            )
          })}
        </div>
      )
    }

    if (animationType === 'paragraph-by-paragraph') {
      return (
        <div className="relative w-full" style={{ minHeight: '200px' }}>
          {blocks.map((block, i) => {
            const Tag = block.tag as keyof JSX.IntrinsicElements
            const props = attrsToProps(block.attrs)
            const hasCta = blockHasCta(block.children)

            return (
              <div
                key={i}
                className={cn(
                  'paragraph-chunk absolute inset-0 flex items-center opacity-0',
                  textAlign === 'center' && 'justify-center text-center',
                  textAlign === 'right' && 'justify-end text-right',
                  textAlign === 'left' && 'justify-start text-left',
                )}
                style={{
                  willChange: 'opacity',
                  backfaceVisibility: 'hidden',
                }}
                data-persistent={hasCta ? 'true' : undefined}
              >
                <Tag {...props}>{renderPlainNodes(block.children)}</Tag>
              </div>
            )
          })}
        </div>
      )
    }

    if (animationType === 'stack-line-on-line') {
      return (
        <div className="relative w-full">
          <StackLineOnLine
            blocks={blocks}
            textAlign={textAlign}
            scrollProgress={scrollProgress}
            revealProgressEnd={revealProgressEnd}
            textColor={textColor}
            ctaAlignClassName={ctaAlignClassName}
            onLineCount={onVisualLineCount}
          />
        </div>
      )
    }

    if (animationType === 'teleprompter') {
      const totalLines = blocks.length
      // Compress reveal into the first 70% of scroll so the last line has a
      // 30% hold period fully visible before the section snaps away.
      const ANIM_END = 0.7
      const animProgress = Math.min(scrollProgress / ANIM_END, 1)
      const linesToReveal =
        totalLines > 0 ? Math.max(1, Math.floor(animProgress * (totalLines + 1))) : 0
      const windowSize = teleprompterLineWindow
      const startLine = Math.max(0, linesToReveal - windowSize)
      const visibleLines = blocks.slice(startLine, linesToReveal)

      return (
        <div
          className="flex-1 flex flex-col justify-end overflow-hidden w-full"
          style={{ minHeight: `${windowSize * 48}px` }}
        >
          {visibleLines.map((line, i) => {
            const Tag = line.tag as keyof JSX.IntrinsicElements
            const props = attrsToProps(line.attrs)
            return (
              <div
                key={`line-${startLine + i}`}
                className="tp-line animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ marginBottom: i < visibleLines.length - 1 ? '0.75rem' : '0' }}
              >
                <Tag {...props}>{renderPlainNodes(line.children)}</Tag>
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div className="w-full">
        {blocks.map((block, blockIndex) => {
          const Tag = block.tag as keyof JSX.IntrinsicElements
          const props = attrsToProps(block.attrs)
          return (
            <Tag key={blockIndex} {...props}>
              {renderNoneNodes(block.children)}
            </Tag>
          )
        })}
      </div>
    )
  }

  const renderProgressBar = () => {
    if (!showProgressBar || animationType === 'none') return null
    // Remap scrollProgress so the bar fills as lines animate in (0→ANIM_END → 0→100%).
    const ANIM_END = 0.5 // keep in sync with applyGsap ANIM_END
    const animProgress = Math.min(scrollProgress / ANIM_END, 1)
    return (
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 w-1 bg-gray-700 rounded-full overflow-hidden"
        style={{ height: '120px' }}
      >
        <div
          className="absolute top-0 left-0 right-0 bg-[#feda00] rounded-full transition-all duration-150"
          style={{ height: `${animProgress * 100}%` }}
        />
      </div>
    )
  }

  const getAspectRatioClass = () => {
    if (isMobileView) {
      return mobileAspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[4/5]'
    }
    return desktopAspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-[16/16]'
  }

  const containerBgStyle = background === 'color' ? { backgroundColor } : {}
  const overlayOpacity = Math.min(Math.max(backgroundOverlayOpacity, 0), 1)

  return (
    <div
      ref={containerRef}
      className={cn(
        'px-12 flex justify-center w-full max-w-3xl mx-auto absolute inset-0 top-1/2 -translate-y-[50%]',
        getAspectRatioClass(),
        verticalAlign === 'center' ? 'items-center' : 'items-start',
        verticalAlign === 'top' && 'pt-12 lg:pt-20',
        background === 'none' && 'bg-transparent',
        className,
      )}
      style={{ ...containerBgStyle }}
    >
      {/* Full-width background layer — fills the parent section regardless of content max-width */}
      {(background === 'image' || background === 'video') && (
        <>
          <div className="absolute inset-0 overflow-hidden">
            {/* Responsive image backgrounds */}
            {background === 'image' && backgroundImageDesktop && (
              <div
                className="absolute inset-0 bg-cover bg-center hidden md:block"
                style={{ backgroundImage: `url(${backgroundImageDesktop})` }}
              />
            )}
            {background === 'image' && backgroundImageMobile && (
              <div
                className="absolute inset-0 bg-cover bg-center md:hidden"
                style={{ backgroundImage: `url(${backgroundImageMobile})` }}
              />
            )}
            {/* Responsive video backgrounds */}
            {background === 'video' && backgroundVideoDesktop && (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover hidden md:block"
              >
                <source src={backgroundVideoDesktop} type="video/mp4" />
              </video>
            )}
            {background === 'video' && backgroundVideoMobile && (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover md:hidden"
              >
                <source src={backgroundVideoMobile} type="video/mp4" />
              </video>
            )}
          </div>
          <div
            className="absolute h-[calc(100%-(-10px))] -top-1 -bottom-1 w-full inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.4)_30%,rgba(0,0,0,0)_50%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,1)_100%)] md:bg-[linear-gradient(#000,#0006_14%,#0000_28%,#0006_84%,#000)]"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          />
        </>
      )}

      {/* Content container — max-w-3xl centered over the full-width background */}
      <div
        ref={containerRef}
        className={cn(
          'px-12 flex justify-center w-full max-w-3xl mx-auto absolute inset-0 top-1/2 -translate-y-[50%]',
          getAspectRatioClass(),
          verticalAlign === 'center' ? 'items-center' : 'items-start',
          verticalAlign === 'top' && 'pt-12 lg:pt-20',
          background === 'none' && 'bg-transparent',
          className,
        )}
        style={containerBgStyle}
      >
        {renderProgressBar()}
        <div
          ref={contentRef}
          className={cn(
            'relative max-w-3xl mx-auto w-full',
            animationType !== 'none' && 'prose-p:m-0 prose-headings:m-0',
            textAlign === 'center' && 'text-center prose-headings:text-center',
            textAlign === 'right' && 'text-right prose-headings:text-right',
          )}
          style={{ color: textColor }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

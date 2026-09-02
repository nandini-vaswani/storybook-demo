'use client'

import { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { primaryYellowStyle } from '@/lib/design-tokens'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/accordion'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Ported from apps/web/src/components/payload/faqs-block.tsx (hgu-platform) — the real
// component accepts either a plain string answer or Payload's rich-text
// SerializedEditorState, rendered via @payloadcms/richtext-lexical's <RichText>. That
// dependency is Payload/CMS-specific and irrelevant to what this sandbox is testing, so
// only the string-answer path is ported; every story here passes plain strings anyway.

interface FAQItem {
  question: string
  answer: string
}

export interface FAQsBlockProps {
  faqs?: FAQItem[]
  questions?: FAQItem[]
  className?: string
  heading?: string
  disableAnimation?: boolean
  /** GTM: fire accordion_open when user opens an item */
  onAccordionOpen?: () => void
}

export function FAQsBlock({
  faqs,
  questions,
  className,
  heading,
  disableAnimation = false,
  onAccordionOpen,
}: FAQsBlockProps) {
  const items = faqs || questions || []

  const containerRef = useRef<HTMLDivElement>(null)
  const [openValue, setOpenValue] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (disableAnimation || !containerRef.current || items.length === 0) return
    const ctx = gsap.context(() => {
      gsap.from('.faq-item', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [disableAnimation, items.length])

  const handleValueChange = (value: string) => {
    const isOpening = value !== '' && value !== openValue
    if (isOpening) onAccordionOpen?.()
    setOpenValue(value === '' ? undefined : value)
  }

  if (!items || items.length === 0) {
    return null
  }

  return (
    <section ref={containerRef} className={cn(className)} style={primaryYellowStyle}>
      <div className="mx-auto w-full max-w-3xl px-6">
        <h2 className="mb-8 text-center text-2xl font-light text-white md:text-3xl">{heading}</h2>
        <Accordion type="single" collapsible value={openValue} onValueChange={handleValueChange}>
          {items.map((item, index) => (
            <AccordionItem key={index} value={String(index)}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="max-w-full px-6 pb-6 text-gray-400">{item.answer}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

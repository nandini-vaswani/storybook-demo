'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildJourneyHref } from '@/lib/journey-url'
import { useModal } from '@/contexts/ModalContext'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Ported from apps/web/src/components/payload/card-carousel-block.tsx (hgu-platform) —
// next/image swapped for a plain <img>; the `analytics` field (GTM-only, never read
// inside this component) is dropped along with its Payload-adjacent
// AnalyticsJourneyContext type.

export interface CarouselCard {
  image?: { url: string }
  video?: { url: string }
  title?: string
  link?: {
    type?: 'none' | 'journey' | 'external' | 'modal'
    journey?: string | { id: string; slug: string }
    url?: string
    modalId?: string
  }
}

interface CardCarouselBlockProps {
  header?: string
  slideOnScroll?: boolean
  cards: CarouselCard[]
  desktopAspectRatio?: '4:5' | '9:16'
  mobileAspectRatio?: '4:5' | '9:16'
  /** GTM: fire carousel_swipe when user changes slide */
  onSwipe?: () => void
  /** GTM: fire ingredient_cta when a card is activated */
  onCardClick?: (card: CarouselCard) => void
  className?: string
}

export function CardCarouselBlock({
  header,
  slideOnScroll = false,
  cards = [],
  desktopAspectRatio = '4:5',
  mobileAspectRatio = '4:5',
  onSwipe,
  onCardClick,
  className,
}: CardCarouselBlockProps) {
  const { getModal, openModal: openIngredientModal } = useModal()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const previousIndexRef = useRef<number | null>(null)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  const getAspectRatioClass = (isMobile = false) => {
    if (isMobile) return mobileAspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[4/5]'
    return desktopAspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[4/5]'
  }

  const renderMedia = (card: CarouselCard) => {
    if (card.video?.url) {
      return (
        <video
          src={card.video.url}
          className="absolute inset-0 h-full w-full object-cover object-top"
          loop
          muted
          autoPlay
          playsInline
        />
      )
    }
    if (card.image?.url) {
      return (
        <img
          src={card.image.url}
          alt={card.title || 'Card image'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-400">
        No media available
      </div>
    )
  }

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    dragFree: false,
    loop: false,
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const idx = emblaApi.selectedScrollSnap()
    if (previousIndexRef.current !== null && previousIndexRef.current !== idx && onSwipe) {
      onSwipe()
    }
    previousIndexRef.current = idx
    setSelectedIndex(idx)
  }, [emblaApi, onSwipe])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!slideOnScroll || !containerRef.current || !emblaApi || cards.length <= 1) return

    const snapCount = emblaApi.scrollSnapList().length

    const ctx = gsap.context(() => {
      const scrollDistance = window.innerHeight * 3
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: false,
        pinSpacing: false,
        refreshPriority: -1,
        anticipatePin: 1,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress
          const targetIndex = Math.min(Math.round(progress * (snapCount - 1)), snapCount - 1)
          if (emblaApi.selectedScrollSnap() !== targetIndex) {
            emblaApi.scrollTo(targetIndex, false)
          }
        },
      })
    }, containerRef)

    return () => {
      ctx.revert()
      scrollTriggerRef.current?.kill()
    }
  }, [slideOnScroll, emblaApi, cards.length])

  const handleCardClick = (card: CarouselCard) => {
    onCardClick?.(card)

    const linkType = card.link?.type || 'none'

    if (linkType === 'journey' && card.link?.journey) {
      let journeySlug: string | undefined

      if (typeof card.link.journey === 'string') {
        journeySlug = card.link.journey
      } else if (card.link.journey && 'slug' in card.link.journey) {
        journeySlug = card.link.journey.slug
      }

      if (journeySlug) {
        const url = buildJourneyHref(journeySlug, window.location.search)
        window.open(url, '_blank', 'noopener,noreferrer')
      }
      return
    }

    if (linkType === 'external' && card.link?.url) {
      window.open(card.link.url, '_blank', 'noopener,noreferrer')
      return
    }

    if (linkType === 'modal' && card.link?.modalId) {
      const data = getModal(card.link.modalId)
      if (data) openIngredientModal(data)
      return
    }
  }

  if (cards.length === 0) return null

  return (
    <div className={cn(``, slideOnScroll && 'pin-spacer sticky top-0')}>
      <section
        ref={containerRef}
        className={cn(
          'relative',
          slideOnScroll &&
            'relative overflow-hidden w-full min-h-screen flex items-center justify-center',
          className,
        )}
      >
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          {header && (
            <h2 className=" text-2xl font-light text-white mb-6 px-6 text-center">{header}</h2>
          )}
          <div className="relative">
            <div className="absolute -left-0.5 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            <div className="absolute -right-0.5 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            <div className="overflow-hidden pl-4" ref={emblaRef}>
              <div className="flex">
                {cards.map((card, i) => (
                  <div key={i} className="flex-shrink-0 basis-[85%] md:basis-[48%] px-2">
                    {(() => {
                      const linkType = card.link?.type || 'none'
                      const isClickable =
                        (linkType === 'journey' && !!card.link?.journey) ||
                        (linkType === 'external' && !!card.link?.url) ||
                        (linkType === 'modal' && !!card.link?.modalId)
                      const inner = (
                        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                          <div className={cn('relative', getAspectRatioClass(false))}>
                            {renderMedia(card)}
                          </div>
                        </div>
                      )
                      return isClickable ? (
                        <button onClick={() => handleCardClick(card)} className="w-full text-left group">
                          {inner}
                        </button>
                      ) : (
                        <div className="w-full">{inner}</div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {cards.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 shrink-0 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#feda00] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      i === selectedIndex ? 'bg-[#feda00] w-6' : 'bg-white/30 w-2',
                    )}
                  />
                ))}
              </div>
              <button
                onClick={scrollNext}
                className="w-10 h-10 shrink-0 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#feda00] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

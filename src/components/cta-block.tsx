'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  getHeightControlClasses,
  getHeightControlStyles,
  getHeightControlClassName,
  type HeightControlData,
} from '@/lib/height-control-utils'
import { Button, type CtaItem } from '@/components/button'

// Ported from apps/web/src/components/payload/cta-block.tsx (hgu-platform) — next/image
// swapped for a plain <img> (fill emulated via absolute inset-0 + object-cover).

export interface CTABlockProps extends HeightControlData {
  ctas?: CtaItem[]
  message?: string
  showTitle?: boolean
  backgroundType?: 'none' | 'color' | 'image' | 'video'
  backgroundColor?: string
  backgroundImageDesktop?: string | null
  backgroundImageMobile?: string | null
  backgroundVideoDesktop?: string | null
  backgroundVideoMobile?: string | null
  paddingMobile?: 'py-0' | 'py-8' | 'py-12' | 'py-16' | 'py-20' | 'custom'
  paddingMobileCustom?: number
  paddingDesktop?: 'lg:py-0' | 'lg:py-12' | 'lg:py-16' | 'lg:py-24' | 'lg:py-32' | 'custom'
  paddingDesktopCustom?: number
  onCtaClick?: () => void
  className?: string
}

export function CTABlock({
  ctas,
  message,
  showTitle = true,
  backgroundType = 'none',
  backgroundColor,
  backgroundImageDesktop,
  backgroundImageMobile,
  backgroundVideoDesktop,
  backgroundVideoMobile,
  paddingMobile = 'py-16',
  paddingMobileCustom,
  paddingDesktop = 'lg:py-24',
  paddingDesktopCustom,
  onCtaClick,
  className,
  ...heightControlData
}: CTABlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const heightClasses = getHeightControlClasses(heightControlData)
  const heightStyles = getHeightControlStyles(heightControlData)
  const customHeightClass = getHeightControlClassName(heightControlData)

  const isAutoHeight =
    (heightControlData.heightDesktopPreset === 'auto' ||
      heightControlData.heightDesktopPreset === undefined) &&
    (heightControlData.heightMobilePreset === 'auto' ||
      heightControlData.heightMobilePreset === undefined)

  const mobilePaddingClass =
    paddingMobile === 'custom' && typeof paddingMobileCustom === 'number'
      ? `[padding-top:${paddingMobileCustom}px] [padding-bottom:${paddingMobileCustom}px]`
      : paddingMobile

  const desktopPaddingClass =
    paddingDesktop === 'custom' && typeof paddingDesktopCustom === 'number'
      ? `lg:[padding-top:${paddingDesktopCustom}px] lg:[padding-bottom:${paddingDesktopCustom}px]`
      : paddingDesktop

  const containerClasses = cn(
    'relative flex items-center justify-center px-8',
    heightClasses,
    customHeightClass,
    isAutoHeight && mobilePaddingClass,
    isAutoHeight && desktopPaddingClass,
    className,
  )

  return (
    <section className="mx-auto w-full max-w-3xl px-4 md:px-6">
      <div
        ref={containerRef}
        className={containerClasses}
        style={{
          ...heightStyles,
          backgroundColor: backgroundType === 'color' ? backgroundColor || '#1a1a1a' : undefined,
        }}
      >
        {backgroundType === 'image' && backgroundImageDesktop && (
          <div className="absolute inset-0 hidden md:block">
            <img
              src={backgroundImageDesktop}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
        {backgroundType === 'image' && backgroundImageMobile && (
          <div className="absolute inset-0 md:hidden">
            <img
              src={backgroundImageMobile}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
        {backgroundType === 'image' && (backgroundImageDesktop || backgroundImageMobile) && (
          <div className="absolute inset-0 bg-black/40" />
        )}

        {backgroundType === 'video' && backgroundVideoDesktop && (
          <video
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
            src={backgroundVideoDesktop}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        {backgroundType === 'video' && backgroundVideoMobile && (
          <video
            className="absolute inset-0 h-full w-full object-cover md:hidden"
            src={backgroundVideoMobile}
            autoPlay
            loop
            muted
            playsInline
          />
        )}

        <div className="relative mx-auto max-w-[800px] text-center">
          {message && showTitle && (
            <p className="mb-8 text-xl leading-relaxed text-white lg:text-2xl">{message}</p>
          )}
          {ctas && ctas.length > 0 && (
            <div className="flex flex-row flex-wrap justify-center gap-3">
              {ctas.map((item, i) => (
                <Button
                  key={i}
                  label={item.label}
                  size={item.size ?? 'M'}
                  prominence={item.prominence ?? 'primary'}
                  theme={item.theme ?? 'light'}
                  icon={item.icon ?? 'arrowRight'}
                  customIcon={item.customIcon}
                  iconPosition={item.iconPosition ?? 'right'}
                  linkType={item.linkType ?? 'internal'}
                  externalLink={item.externalLink}
                  internalLink={item.internalLink}
                  modalId={item.modalId}
                  onClick={onCtaClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

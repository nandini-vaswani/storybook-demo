'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useModal } from '@/contexts/ModalContext'
import { JOURNEY_URL_CHANGE_EVENT, mergeJourneyHrefWithCurrentSearch } from '@/lib/journey-url'

// Ported from apps/web/src/components/ui/button.tsx (hgu-platform) — the only change is
// swapping next/link for a plain <a>, since this sandbox has no Next.js router.

export type CtaSize = 'S' | 'M' | 'L' | 'XL'
export type CtaProminence = 'primary' | 'secondary' | 'tertiary' | 'text' | 'outline'
export type CtaTheme = 'light' | 'dark'
export type CtaLinkType = 'internal' | 'external' | 'openModal' | 'button'
export type CtaIcon = 'none' | 'arrowRight' | 'arrowLeft' | 'search' | 'custom'
export type CtaIconPosition = 'left' | 'right'

export interface CtaItem {
  label: string
  size?: CtaSize | null
  prominence?: CtaProminence | null
  theme?: CtaTheme | null
  icon?: CtaIcon | null
  customIcon?: string | React.ReactNode | null
  iconPosition?: CtaIconPosition | null
  linkType?: CtaLinkType | null
  externalLink?: string | null
  internalLink?: string | null
  modalId?: string | null
}

export interface CtaButtonProps {
  label: string
  ariaLabel?: string
  size?: CtaSize
  prominence?: CtaProminence
  theme?: CtaTheme
  icon?: CtaIcon
  customIcon?: string | React.ReactNode | null
  iconPosition?: CtaIconPosition
  linkType?: CtaLinkType
  externalLink?: string | null
  internalLink?: string | null
  modalId?: string | null
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const sizeStyles: Record<CtaSize, string> = {
  S: 'text-sm font-normal  min-h-8  gap-2   rounded-2xl',
  M: 'text-sm font-normal  min-h-10 gap-1   rounded-full',
  L: 'text-base font-medium min-h-11 gap-1.5 rounded-full',
  XL: 'text-xl  font-medium min-h-12 gap-2   rounded-[48px]',
}

const basePadding: Record<CtaSize, string> = {
  S: 'py-2 px-4',
  M: 'py-[10px] px-[14px]',
  L: 'py-[10px] px-4',
  XL: 'py-2 px-8',
}

const iconLeftPadding: Record<CtaSize, string> = {
  S: 'py-2 pr-4 pl-2',
  M: 'py-[10px] px-[14px]',
  L: 'py-[10px] px-4',
  XL: 'py-2 pr-8 pl-4',
}

const iconRightPadding: Record<CtaSize, string> = {
  S: 'py-2 pl-4 pr-2',
  M: 'py-[10px] px-[14px]',
  L: 'py-[10px] px-4',
  XL: 'py-2 pl-8 pr-4',
}

const insetShadow =
  '[box-shadow:0px_1px_2px_rgba(10,13,18,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)]'

const focusWithInset =
  'focus-visible:outline-none focus-visible:[box-shadow:0px_1px_2px_rgba(10,13,18,0.05),0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#fff42e,inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)]'

const focusRingOnly =
  'focus-visible:outline-none focus-visible:[box-shadow:0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#fff42e]'

const dis =
  'disabled:bg-[#F5F5F5] disabled:border-[#E9EAEB] disabled:text-[#A4A7AE] disabled:shadow-none disabled:pointer-events-none'

const prominenceStyles: Record<CtaProminence, Record<CtaTheme, string>> = {
  primary: {
    light: `bg-[#22c55e] text-black border border-primary-600 ${insetShadow} hover:bg-primary-700 active:bg-[#C2A300] ${focusWithInset} ${dis}`,
    dark: `bg-black text-[#F5F6F6] border border-[#4E5050] hover:bg-[#444546] ${focusRingOnly} ${dis}`,
  },
  secondary: {
    light: `bg-white text-[#414651] border border-[#D5D7DA] ${insetShadow} hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:[box-shadow:0px_1px_2px_rgba(10,13,18,0.05),0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#d5d7da,inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] ${dis}`,
    dark: `bg-[#444546] text-[#F5F6F6] border border-[#4E5050] ${insetShadow} hover:bg-[#555758] focus-visible:outline-none focus-visible:[box-shadow:0px_1px_2px_rgba(10,13,18,0.05),0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#4e5050,inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] ${dis}`,
  },
  tertiary: {
    light: `bg-transparent text-[#535862] border-none hover:bg-[#FAFAFA] ${focusRingOnly} disabled:text-[#A4A7AE] disabled:pointer-events-none`,
    dark: `bg-transparent text-[#F5F6F6] border-none hover:bg-[#444546] ${focusRingOnly} disabled:text-[#A4A7AE] disabled:pointer-events-none`,
  },
  text: {
    light:
      'bg-transparent text-primary-700 border-none hover:underline hover:text-[#A77B0C] focus-visible:outline-none focus-visible:[box-shadow:0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#fff42e] focus-visible:rounded-[4px] disabled:text-[#A4A7AE] disabled:pointer-events-none px-0 py-0',
    dark: 'bg-transparent text-[#535862] border-none hover:underline hover:text-[#414651] focus-visible:outline-none focus-visible:[box-shadow:0px_0px_0px_2px_#ffffff,0px_0px_0px_4px_#fff42e] focus-visible:rounded-[4px] disabled:text-[#A4A7AE] disabled:pointer-events-none px-0 py-0',
  },
  outline: {
    light:
      'group bg-transparent text-white border border-gray-500 rounded-full hover:border-white disabled:opacity-50 disabled:cursor-not-allowed',
    dark: 'group bg-transparent text-white border border-gray-500 rounded-full hover:border-white disabled:opacity-50 disabled:cursor-not-allowed',
  },
}

const iconSizeClass: Record<CtaSize, string> = {
  S: 'w-4 h-4',
  M: 'w-5 h-5',
  L: 'w-5 h-5',
  XL: 'w-8 h-8',
}

function IconEl({
  icon,
  size,
  customIcon,
}: {
  icon: CtaIcon
  size: CtaSize
  customIcon?: string | React.ReactNode | null
}) {
  const cls = cn('flex items-center ', iconSizeClass[size])

  if (icon === 'arrowRight')
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    )

  if (icon === 'arrowLeft')
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    )

  if (icon === 'search')
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    )

  if (icon === 'custom' && customIcon) {
    if (typeof customIcon !== 'string')
      return (
        <span className={cls} aria-hidden="true">
          {customIcon}
        </span>
      )
    return null
  }

  return null
}

export function Button({
  label,
  ariaLabel,
  size = 'M',
  prominence = 'primary',
  theme = 'light',
  icon = 'none',
  customIcon,
  iconPosition = 'right',
  linkType = 'internal',
  externalLink,
  internalLink,
  modalId,
  className,
  onClick,
  type = 'button',
  disabled,
}: CtaButtonProps) {
  const { getModal, openModal } = useModal()
  const [currentSearch, setCurrentSearch] = useState('')

  const hasIcon = icon !== 'none'
  const padding = hasIcon
    ? iconPosition === 'left'
      ? iconLeftPadding[size]
      : iconRightPadding[size]
    : basePadding[size]

  const base = cn(
    'inline-flex items-center justify-center uppercase tracking-normal transition-colors duration-300',
    !hasIcon && 'text-center',
    sizeStyles[size],
    padding,
    prominenceStyles[prominence][theme],
    className,
  )

  const iconEl = hasIcon ? <IconEl icon={icon} size={size} customIcon={customIcon} /> : null

  const content = (
    <>
      {iconPosition === 'left' && iconEl}
      {label}
      {iconPosition === 'right' && iconEl}
    </>
  )

  const computedAriaLabel = ariaLabel ?? label
  const resolvedInternalLink = useMemo(
    () => mergeJourneyHrefWithCurrentSearch(internalLink || '#', currentSearch),
    [currentSearch, internalLink],
  )

  useEffect(() => {
    const syncCurrentSearch = () => {
      setCurrentSearch(window.location.search)
    }

    syncCurrentSearch()
    window.addEventListener('popstate', syncCurrentSearch)
    window.addEventListener(JOURNEY_URL_CHANGE_EVENT, syncCurrentSearch)

    return () => {
      window.removeEventListener('popstate', syncCurrentSearch)
      window.removeEventListener(JOURNEY_URL_CHANGE_EVENT, syncCurrentSearch)
    }
  }, [])

  if (linkType === 'openModal') {
    return (
      <button
        className={base}
        aria-label={computedAriaLabel}
        onClick={() => {
          if (modalId) {
            const data = getModal(modalId)
            if (data) openModal(data)
          }
          onClick?.()
        }}
      >
        {content}
      </button>
    )
  }
  if (linkType === 'button') {
    return (
      <button
        type={type}
        disabled={disabled}
        className={base}
        aria-label={computedAriaLabel}
        onClick={() => {
          onClick?.()
        }}
      >
        {content}
      </button>
    )
  }

  if (linkType === 'external' && externalLink) {
    return (
      <a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label={computedAriaLabel}
        onClick={onClick}
      >
        {content}
      </a>
    )
  }

  return (
    <a href={resolvedInternalLink} className={base} aria-label={computedAriaLabel} onClick={onClick}>
      {content}
    </a>
  )
}

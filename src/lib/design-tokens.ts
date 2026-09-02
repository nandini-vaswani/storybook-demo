import type { CSSProperties } from 'react'

// Trimmed from apps/web/src/lib/design-tokens.ts (hgu-platform) — just the piece
// FAQsBlock actually uses.
export const primaryYellowVars = {
  '--primary-yellow': '#FFDB00',
  '--primary-yellow-hover': '#FFDF1A',
} as const

export const primaryYellowStyle = primaryYellowVars as CSSProperties

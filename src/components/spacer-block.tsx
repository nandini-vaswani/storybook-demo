import { cn } from '@/lib/utils'

export interface SpacerBlockProps {
  variant?: 'visible' | 'invisible'
  height?: number
  className?: string
  /** Dashed outline around the gap, for spotting spacer placement while editing a layout. */
  border?: boolean
}

/**
 * Ported as-is from apps/web/src/components/payload/spacer-block.tsx (hgu-platform).
 */
export function SpacerBlock({
  variant = 'visible',
  height = 32,
  className,
  border = false,
}: SpacerBlockProps) {
  if (variant === 'invisible') {
    return null
  }

  return (
    <div
      aria-hidden
      style={{ height: `${height}px` }}
      className={cn(border && 'border border-dashed border-sky-500', className)}
    />
  )
}

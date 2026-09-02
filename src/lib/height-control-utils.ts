import { cn } from '@/lib/utils'

export interface HeightControlData {
  heightDesktopPreset?: 'auto' | 'full-screen' | 'tall' | 'aspect-ratio' | 'custom'
  heightDesktopAspectRatio?: '16:9' | '4:3' | '4:5' | '9:16'
  heightDesktopCustom?: number
  heightMobilePreset?: 'auto' | 'full-screen' | 'tall' | 'aspect-ratio' | 'custom'
  heightMobileAspectRatio?: '16:9' | '4:3' | '4:5' | '9:16'
  heightMobileCustom?: number
}

const aspectRatioClassMap = {
  '16:9': 'aspect-[16/9]',
  '4:3': 'aspect-[4/3]',
  '4:5': 'aspect-[4/5]',
  '9:16': 'aspect-[9/16]',
}

export function getHeightControlClasses(data: HeightControlData): string {
  const classes: string[] = []

  const mobilePreset = data.heightMobilePreset ?? 'auto'
  switch (mobilePreset) {
    case 'auto':
      classes.push('h-auto')
      break
    case 'full-screen':
      classes.push('h-screen')
      break
    case 'tall':
      classes.push('min-h-screen')
      break
    case 'aspect-ratio':
      if (data.heightMobileAspectRatio) {
        classes.push(aspectRatioClassMap[data.heightMobileAspectRatio])
      }
      break
    case 'custom':
      break
  }

  const desktopPreset = data.heightDesktopPreset ?? 'auto'
  switch (desktopPreset) {
    case 'auto':
      classes.push('md:h-auto')
      break
    case 'full-screen':
      classes.push('md:h-screen')
      break
    case 'tall':
      classes.push('md:min-h-screen')
      break
    case 'aspect-ratio':
      if (data.heightDesktopAspectRatio) {
        classes.push(`md:${aspectRatioClassMap[data.heightDesktopAspectRatio]}`)
      }
      break
    case 'custom':
      break
  }

  return cn(...classes)
}

export function getHeightControlStyles(data: HeightControlData): React.CSSProperties {
  const styles: Record<string, any> = {}

  if (data.heightMobilePreset === 'custom' && data.heightMobileCustom) {
    styles['--height-mobile-custom'] = `${data.heightMobileCustom}px`
  }

  if (data.heightDesktopPreset === 'custom' && data.heightDesktopCustom) {
    styles['--height-desktop-custom'] = `${data.heightDesktopCustom}px`
  }

  return styles as React.CSSProperties
}

export function getHeightControlClassName(data: HeightControlData): string {
  const classes: string[] = []

  if (data.heightMobilePreset === 'custom' && data.heightMobileCustom) {
    classes.push('[height:var(--height-mobile-custom)]')
  }

  if (data.heightDesktopPreset === 'custom' && data.heightDesktopCustom) {
    classes.push('md:[height:var(--height-desktop-custom)]')
  }

  return cn(...classes)
}

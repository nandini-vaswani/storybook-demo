import type { Meta, StoryObj } from '@storybook/react-vite'
import { CTABlock } from '@/components/cta-block'
import type { CtaItem } from '@/components/button'

// Matches apps/storybook/src/stories/cta-block.stories.tsx (hgu-platform), with
// seedAsset(...) (this repo's real seed images) swapped for a placeholder URL.

const meta: Meta<typeof CTABlock> = {
  title: 'Blocks/CTABlock',
  component: CTABlock,
}
export default meta

type Story = StoryObj<typeof CTABlock>

const ctas: CtaItem[] = [
  { label: 'Start the journey', linkType: 'internal', internalLink: '/journeys/compassion' },
]

export const Default: Story = {
  args: {
    message: 'Ready to see where this leads?',
    ctas,
  },
}

export const TwoButtons: Story = {
  args: {
    message: 'Not sure where to start?',
    ctas: [
      { label: 'Take the quiz', linkType: 'internal', internalLink: '/quiz', prominence: 'primary' },
      {
        label: 'Browse journeys',
        linkType: 'internal',
        internalLink: '/journeys',
        prominence: 'secondary',
      },
    ],
  },
}

export const ColorBackground: Story = {
  args: {
    message: 'Ready to see where this leads?',
    ctas,
    backgroundType: 'color',
    backgroundColor: '#1a1a1a',
    heightDesktopPreset: 'tall',
    heightMobilePreset: 'tall',
  },
}

export const ImageBackground: Story = {
  args: {
    message: 'Ready to see where this leads?',
    ctas,
    backgroundType: 'image',
    backgroundImageDesktop: 'https://picsum.photos/seed/cta-bg/1600/900',
    backgroundImageMobile: 'https://picsum.photos/seed/cta-bg/800/1200',
    heightDesktopPreset: 'tall',
    heightMobilePreset: 'tall',
  },
}

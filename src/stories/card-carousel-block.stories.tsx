import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardCarouselBlock, type CarouselCard } from '@/components/card-carousel-block'

// Matches apps/storybook/src/stories/card-carousel-block.stories.tsx (hgu-platform),
// with seedAsset(...) (this repo's real seed images) swapped for picsum.photos URLs.

const meta: Meta<typeof CardCarouselBlock> = {
  title: 'Blocks/CardCarouselBlock',
  component: CardCarouselBlock,
}
export default meta

type Story = StoryObj<typeof CardCarouselBlock>

const pillarCards: CarouselCard[] = [
  {
    title: 'Compassion',
    image: { url: 'https://picsum.photos/seed/compassion-card-1/600/750' },
    link: { type: 'journey', journey: 'compassion' },
  },
  {
    title: 'Stillness',
    image: { url: 'https://picsum.photos/seed/stillness-card-1/600/750' },
    link: { type: 'journey', journey: 'stillness' },
  },
  {
    title: 'Presence',
    image: { url: 'https://picsum.photos/seed/presence-card-1/600/750' },
    link: { type: 'journey', journey: 'presence' },
  },
]

export const Default: Story = {
  args: { header: 'Explore', cards: pillarCards },
}

export const WithVideo: Story = {
  args: {
    header: 'Explore',
    cards: [
      {
        title: 'Compassion',
        video: { url: 'https://picsum.photos/seed/compassion-video/600/750' },
        link: { type: 'journey', journey: 'compassion' },
      },
      ...pillarCards.slice(1),
    ],
  },
}

export const TallAspectRatio: Story = {
  args: {
    header: 'Explore',
    cards: pillarCards,
    desktopAspectRatio: '9:16',
    mobileAspectRatio: '9:16',
  },
}

export const NoMedia: Story = {
  args: { header: 'Explore', cards: [{ title: 'Untitled card' }] },
  parameters: {
    docs: {
      description: { story: 'Falls back to a placeholder when a card has no image or video.' },
    },
  },
}

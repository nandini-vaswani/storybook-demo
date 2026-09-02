import type { Meta, StoryObj } from '@storybook/react-vite'
import { CardCarouselBlock } from '@/components/card-carousel-block'

const meta: Meta<typeof CardCarouselBlock> = {
  title: 'Blocks/CardCarouselBlock',
  component: CardCarouselBlock,
  args: {
    header: 'Explore',
    cards: [
      { title: 'One', image: { url: 'https://picsum.photos/seed/one/600/750' } },
      { title: 'Two', image: { url: 'https://picsum.photos/seed/two/600/750' } },
      { title: 'Three', image: { url: 'https://picsum.photos/seed/three/600/750' } },
    ],
  },
}
export default meta

type Story = StoryObj<typeof CardCarouselBlock>

export const Default: Story = {}

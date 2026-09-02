import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextIngredient } from '@/components/text-ingredient'

// Matches apps/storybook/src/stories/text-ingredient.stories.tsx (hgu-platform), with
// seedAsset(...) (this repo's real seed images) swapped for a placeholder URL.

const meta: Meta<typeof TextIngredient> = {
  title: 'Blocks/TextIngredient',
  component: TextIngredient,
  parameters: { layout: 'fullscreen' },
  args: { animationType: 'none' },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '60vh', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof TextIngredient>

export const Default: Story = {
  args: {
    content: '<p>Compassion is noticing, and then choosing to act.</p>',
    background: 'none',
    textColor: '#d1d5db',
  },
}

export const OverImage: Story = {
  args: {
    content: '<p>Carry this with you.</p>',
    background: 'image',
    backgroundImageDesktop: 'https://picsum.photos/seed/pause-bg/1600/900',
    backgroundImageMobile: 'https://picsum.photos/seed/pause-bg/800/1200',
    textColor: '#ffffff',
  },
}

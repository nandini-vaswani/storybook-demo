import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextIngredient } from '@/components/text-ingredient'

const meta: Meta<typeof TextIngredient> = {
  title: 'Blocks/TextIngredient',
  component: TextIngredient,
  args: {
    content: '<p>Stillness is not the absence of noise, but the presence of peace.</p>',
    background: 'none',
    textColor: '#ffffff',
  },
  decorators: [
    (Story) => (
      <div className="relative h-[400px] w-full">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof TextIngredient>

export const Default: Story = {}

export const CenterAligned: Story = {
  args: { textAlign: 'center' },
}

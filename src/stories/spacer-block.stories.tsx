import type { Meta, StoryObj } from '@storybook/react-vite'
import { SpacerBlock } from '@/components/spacer-block'

const meta: Meta<typeof SpacerBlock> = {
  title: 'Blocks/SpacerBlock',
  component: SpacerBlock,
  decorators: [
    (Story) => (
      <div className="border border-dashed border-neutral-700">
        <div className="bg-neutral-800 px-3 py-1 text-xs text-neutral-400">above</div>
        <Story />
        <div className="bg-neutral-800 px-3 py-1 text-xs text-neutral-400">below</div>
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof SpacerBlock>

export const Default: Story = {
  args: { variant: 'visible', height: 32 },
}

export const WithBorder: Story = {
  args: { variant: 'visible', height: 120, border: true },
}

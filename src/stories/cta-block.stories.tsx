import type { Meta, StoryObj } from '@storybook/react-vite'
import { CTABlock } from '@/components/cta-block'

const meta: Meta<typeof CTABlock> = {
  title: 'Blocks/CTABlock',
  component: CTABlock,
  args: {
    message: 'Ready to find your community?',
    showTitle: true,
    ctas: [{ label: 'Get started', linkType: 'button' }],
  },
}
export default meta

type Story = StoryObj<typeof CTABlock>

export const Default: Story = {}

export const WithColorBackground: Story = {
  args: { backgroundType: 'color', backgroundColor: '#1a1a1a' },
}

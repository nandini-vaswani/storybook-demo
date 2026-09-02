import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '@/components/badge'

const meta: Meta<typeof Badge> = {
  title: 'Blocks/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { children: 'Badge', variant: 'default', size: 'sm' },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = {}

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      {(['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const).map(
        (variant) => (
          <Badge key={variant} {...args} variant={variant}>
            {variant}
          </Badge>
        ),
      )}
    </div>
  ),
}

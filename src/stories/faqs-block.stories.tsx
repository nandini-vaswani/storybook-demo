import type { Meta, StoryObj } from '@storybook/react-vite'
import { FAQsBlock } from '@/components/faqs-block'

const meta: Meta<typeof FAQsBlock> = {
  title: 'Blocks/FAQsBlock',
  component: FAQsBlock,
  args: {
    heading: 'Frequently asked questions',
    disableAnimation: true,
    faqs: [
      { question: 'What is this?', answer: 'A minimal sandbox testing Chromatic.' },
      { question: 'Why does it exist?', answer: 'To connect a Chromatic project without waiting on org approval.' },
      { question: 'Is this the real app?', answer: 'No — just two real blocks, ported standalone.' },
    ],
  },
}
export default meta

type Story = StoryObj<typeof FAQsBlock>

export const Default: Story = {}

export const Empty: Story = {
  args: { faqs: [] },
}

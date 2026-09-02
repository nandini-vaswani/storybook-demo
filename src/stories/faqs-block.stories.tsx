import type { Meta, StoryObj } from '@storybook/react-vite'
import { FAQsBlock } from '@/components/faqs-block'

// Matches apps/storybook/src/stories/faqs-block.stories.tsx (hgu-platform), except the
// second answer there uses richText(...) (a Lexical rich-text fixture) — this sandbox's
// FAQsBlock only supports plain-string answers (see faqs-block.tsx), so it's a string
// here instead.

const meta: Meta<typeof FAQsBlock> = {
  title: 'Blocks/FAQsBlock',
  component: FAQsBlock,
}
export default meta

type Story = StoryObj<typeof FAQsBlock>

export const Default: Story = {
  args: {
    heading: 'Common questions',
    faqs: [
      {
        question: 'What is He Gets Us?',
        answer: 'A project inviting people to consider the person of Jesus.',
      },
      {
        question: 'Do I need to sign up for anything?',
        answer: 'No — everything here is free to explore, with no account required.',
      },
      {
        question: 'How long does a journey take?',
        answer: 'Most run about a week, a few minutes a day.',
      },
    ],
  },
}

export const Empty: Story = {
  args: { heading: 'Common questions', faqs: [] },
}

import type { Preview } from '@storybook/react-vite'
import React from 'react'

import '../src/globals.css'
import { ModalProvider } from '@/contexts/ModalContext'

// Matches hgu-platform's real setup: the product is dark-only, apps/web puts
// `className="dark"` on <html> in its root layout, which this preview has no
// equivalent of — so it's done here instead.
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark')
}

const preview: Preview = {
  parameters: {
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#000000' }] },
  },
  // Button (used by CTABlock, TextIngredient) and CardCarouselBlock call useModal()
  // unconditionally, so every story needs a ModalProvider ancestor even if it never
  // opens a modal.
  decorators: [
    (Story) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
}

export default preview

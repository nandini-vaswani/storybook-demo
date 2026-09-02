import type { Preview } from '@storybook/react-vite'

import '../src/globals.css'

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
}

export default preview

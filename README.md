# chromatic-sandbox

Minimal Storybook with five blocks ported from `hgu-platform` (`SpacerBlock`,
`CTABlock`, `FAQsBlock`, `CardCarouselBlock`, `TextIngredient`) — no Next.js, no
Payload, no monorepo. Exists purely to test connecting Chromatic (sign-in, project
linking, running a visual test) under a personal GitHub account, while access to run
it against the real `hgu-platform` repo is pending org approval.

Ported as faithfully as possible given the missing Next.js/Payload context:
`next/image`/`next/link` become plain `<img>`/`<a>`, and `FAQsBlock` drops the
`@payloadcms/richtext-lexical` rich-text branch (Payload-specific, and every story
here only ever passes plain string answers anyway).

```bash
npm install
npm run dev   # Storybook at http://localhost:6006
```

Once running, open any story, click the "Visual tests" tab, and follow Chromatic's
own sign-in flow from there.

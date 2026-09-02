# chromatic-sandbox

Minimal Storybook with two blocks ported as-is from `hgu-platform` (`SpacerBlock`,
`Badge`) — no Next.js, no Payload, no monorepo. Exists purely to test connecting
Chromatic (sign-in, project linking, running a visual test) under a personal GitHub
account, while access to run it against the real `hgu-platform` repo is pending org
approval.

```bash
npm install
npm run dev   # Storybook at http://localhost:6006
```

Once running, open any story, click the "Visual tests" tab, and follow Chromatic's
own sign-in flow from there.

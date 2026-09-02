export const JOURNEY_URL_CHANGE_EVENT = 'journey-url-change'
export const JOURNEYS_PATH = '/journeys'

const PRESERVED_JOURNEY_PARAM_KEYS = new Set([
  'dclid',
  'fbclid',
  'gad_source',
  'gbraid',
  'gclid',
  'gclsrc',
  'li_fat_id',
  'msclkid',
  'ttclid',
  'twclid',
  'wbraid',
  'rdt_cid',
  'sccid',
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_source_platform',
  'utm_term',
  'utm_content',
  'utm_creative_format',
  'utm_marketing_tactic',
])

function toSearchParams(search?: string | URLSearchParams): URLSearchParams {
  if (!search) return new URLSearchParams()

  const raw = typeof search === 'string' ? search.replace(/^\?/, '') : search.toString()

  return new URLSearchParams(raw)
}

function filterPreservedJourneyParams(search?: string | URLSearchParams): URLSearchParams {
  const params = toSearchParams(search)
  const filtered = new URLSearchParams()

  params.forEach((value, key) => {
    const normalizedKey = key.toLowerCase()

    if (normalizedKey.startsWith('utm_') || PRESERVED_JOURNEY_PARAM_KEYS.has(normalizedKey)) {
      filtered.append(key, value)
    }
  })

  return filtered
}

export function buildJourneyHref(
  journeySlug: string,
  currentSearch?: string | URLSearchParams,
): string {
  const params = filterPreservedJourneyParams(currentSearch)

  params.set('journey', journeySlug)

  const query = params.toString()

  return query ? `${JOURNEYS_PATH}?${query}` : '/'
}

export function mergeJourneyHrefWithCurrentSearch(
  href: string,
  currentSearch?: string | URLSearchParams,
): string {
  const targetUrl = new URL(href, 'https://hegetsus.local')

  if (targetUrl.pathname !== JOURNEYS_PATH || !targetUrl.searchParams.has('journey')) {
    return href
  }

  const params = filterPreservedJourneyParams(currentSearch)

  targetUrl.searchParams.forEach((value, key) => {
    params.set(key, value)
  })

  const query = params.toString()
  const mergedHref = query ? `${targetUrl.pathname}?${query}` : targetUrl.pathname

  return targetUrl.hash ? `${mergedHref}${targetUrl.hash}` : mergedHref
}

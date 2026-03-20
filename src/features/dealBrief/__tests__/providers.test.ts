import { afterEach, describe, expect, it, vi } from 'vitest'
import { computePortfolioStats } from '../stats'
import { heuristicProvider } from '../providers/heuristic'
import { resolveDealBriefProvider } from '../providers'
import type { DealBriefProvider, DealBriefRequest } from '../types'
import { RentalPropertyStatus, type RentalProperty } from '@/types/rentalTypes'

/**
 * No test here makes a network call. The model provider is exercised through a
 * stubbed `fetch`, and the registry is exercised with hand-built providers —
 * the real one is unavailable in this environment anyway, because
 * VITE_AI_PROXY_URL is unset.
 */

const properties: RentalProperty[] = [
  {
    batch_id: 3,
    property_zillow_link: 'https://example.com/a',
    property_status: RentalPropertyStatus.Approved,
    location: 'Austin, TX',
    rent: 2000,
    adr: 210,
    occupancy_rate: 0.72,
    monthly_estimated_profit: 1850,
  },
  {
    batch_id: 3,
    property_zillow_link: 'https://example.com/b',
    property_status: RentalPropertyStatus.Rejected,
    location: 'Denver, CO',
    rent: 3000,
    adr: 180,
    occupancy_rate: 0.5,
    monthly_estimated_profit: -400,
  },
]

const request = (rows: RentalProperty[] = properties): DealBriefRequest => ({
  properties: rows,
  stats: computePortfolioStats(rows),
  filterSummary: 'batch 3',
})

const stubProvider = (
  id: string,
  available: boolean,
  generate: DealBriefProvider['generate'] = async () => ({
    headline: id,
    findings: [],
    actions: [],
    source: 'model',
  })
): DealBriefProvider => ({
  id,
  label: id,
  isAvailable: () => available,
  generate,
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('heuristicProvider', () => {
  it('is always available, so the feature never depends on configuration', () => {
    expect(heuristicProvider.isAvailable()).toBe(true)
  })

  it('reports the headline figures and marks itself as computed', async () => {
    const brief = await heuristicProvider.generate(request())

    expect(brief.source).toBe('heuristic')
    expect(brief.headline).toContain('2 properties')
    expect(brief.headline).toContain('batch 3')
    expect(brief.findings.join(' ')).toContain('Austin, TX')
  })

  it('calls out loss-making listings and suggests excluding them', async () => {
    const brief = await heuristicProvider.generate(request())

    expect(brief.findings.join(' ')).toMatch(/below break-even/i)
    expect(brief.actions.join(' ')).toMatch(/loss-making/i)
  })

  it('flags unpriced rows rather than pretending they are worth nothing', async () => {
    const brief = await heuristicProvider.generate(
      request([...properties, { ...properties[0], monthly_estimated_profit: null }])
    )

    expect(brief.findings.join(' ')).toMatch(/no profit figure/i)
  })

  it('says so plainly when nothing matches', async () => {
    const brief = await heuristicProvider.generate(request([]))

    expect(brief.headline).toMatch(/no properties match/i)
    expect(brief.findings).toHaveLength(0)
    expect(brief.actions).toHaveLength(1)
  })
})

describe('resolveDealBriefProvider', () => {
  it('picks the first available provider', () => {
    const provider = resolveDealBriefProvider([
      stubProvider('unconfigured', false),
      stubProvider('configured', true),
    ])

    expect(provider.id).toBe('configured')
  })

  it('falls back to the heuristic provider when none are available', () => {
    const provider = resolveDealBriefProvider([stubProvider('unconfigured', false)])

    expect(provider.id).toBe('heuristic')
  })

  it('selects the heuristic provider in this build, because no proxy is configured', () => {
    // VITE_AI_PROXY_URL is deliberately unset in development and in the
    // Docker image, so the AI feature degrades to computed output.
    expect(resolveDealBriefProvider().id).toBe('heuristic')
  })
})

describe('a provider that fails', () => {
  it('surfaces the failure to the caller so the hook can degrade', async () => {
    const failing = stubProvider('flaky', true, async () => {
      throw new Error('proxy responded 503')
    })

    await expect(failing.generate(request())).rejects.toThrow('proxy responded 503')
    // The heuristic provider still answers for the same request.
    await expect(heuristicProvider.generate(request())).resolves.toMatchObject({
      source: 'heuristic',
    })
  })
})

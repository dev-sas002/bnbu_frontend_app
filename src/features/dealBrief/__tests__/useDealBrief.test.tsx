import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { computePortfolioStats } from '../stats'
import { useDealBrief } from '../useDealBrief'
import type { DealBriefProvider } from '../types'
import { RentalPropertyStatus, type RentalProperty } from '@/types/rentalTypes'

const properties: RentalProperty[] = [
  {
    batch_id: 1,
    property_zillow_link: 'https://example.com/a',
    property_status: RentalPropertyStatus.Approved,
    location: 'Austin, TX',
    rent: 2000,
    monthly_estimated_profit: 1200,
  },
]

const buildRequest = () => ({
  properties,
  stats: computePortfolioStats(properties),
  filterSummary: 'every priced listing',
})

const provider = (
  generate: DealBriefProvider['generate'],
  label = 'test-model'
): DealBriefProvider => ({
  id: 'test',
  label,
  isAvailable: () => true,
  generate,
})

describe('useDealBrief', () => {
  it('generates nothing until asked', () => {
    const generate = vi.fn()
    const { result } = renderHook(() => useDealBrief(buildRequest, provider(generate)))

    // On demand only: with a model provider configured, generating on mount
    // would fire a paid call on every filter change and every poll tick.
    expect(generate).not.toHaveBeenCalled()
    expect(result.current.brief).toBeNull()
  })

  it('stores the brief the provider returns', async () => {
    const { result } = renderHook(() =>
      useDealBrief(
        buildRequest,
        provider(async () => ({
          headline: 'A strong batch',
          findings: ['One listing clears $1,200'],
          actions: ['Export it'],
          source: 'model',
          model: 'test-model',
        }))
      )
    )

    act(() => result.current.generate())

    await waitFor(() => expect(result.current.brief).not.toBeNull())
    expect(result.current.brief?.headline).toBe('A strong batch')
    expect(result.current.brief?.source).toBe('model')
    expect(result.current.error).toBeNull()
  })

  it('falls back to the computed brief when the provider fails', async () => {
    const { result } = renderHook(() =>
      useDealBrief(
        buildRequest,
        provider(async () => {
          throw new Error('proxy responded 503')
        })
      )
    )

    act(() => result.current.generate())

    await waitFor(() => expect(result.current.brief).not.toBeNull())
    // The user still gets a usable summary, and is told where it came from.
    expect(result.current.brief?.source).toBe('heuristic')
    expect(result.current.error).toContain('503')
    expect(result.current.isGenerating).toBe(false)
  })

  it('clears the brief on reset', async () => {
    const { result } = renderHook(() =>
      useDealBrief(
        buildRequest,
        provider(async () => ({
          headline: 'A strong batch',
          findings: [],
          actions: [],
          source: 'model',
        }))
      )
    )

    act(() => result.current.generate())
    await waitFor(() => expect(result.current.brief).not.toBeNull())

    act(() => result.current.reset())
    expect(result.current.brief).toBeNull()
    expect(result.current.error).toBeNull()
  })
})

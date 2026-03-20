import { describe, expect, it } from 'vitest'
import { computePortfolioStats } from '../stats'
import { RentalPropertyStatus, type RentalProperty } from '@/types/rentalTypes'

const property = (overrides: Partial<RentalProperty> = {}): RentalProperty => ({
  batch_id: 1,
  property_zillow_link: 'https://example.com/listing',
  property_status: RentalPropertyStatus.Approved,
  location: 'Austin, TX',
  rent: 2000,
  adr: 200,
  occupancy_rate: 0.7,
  monthly_estimated_profit: 1000,
  ...overrides,
})

describe('computePortfolioStats', () => {
  it('returns an empty, non-throwing shape for no properties', () => {
    const stats = computePortfolioStats([])

    expect(stats.total).toBe(0)
    expect(stats.medianProfit).toBeNull()
    expect(stats.approvalRate).toBeNull()
    expect(stats.bestDeal).toBeNull()
    expect(stats.buckets.every((bucket) => bucket.count === 0)).toBe(true)
  })

  it('takes the middle value as the median for an odd count', () => {
    const stats = computePortfolioStats([
      property({ monthly_estimated_profit: 300 }),
      property({ monthly_estimated_profit: 1500 }),
      property({ monthly_estimated_profit: 900 }),
    ])

    expect(stats.medianProfit).toBe(900)
    expect(stats.totalMonthlyProfit).toBe(2700)
  })

  it('averages the two middle values for an even count', () => {
    const stats = computePortfolioStats([
      property({ monthly_estimated_profit: 100 }),
      property({ monthly_estimated_profit: 200 }),
      property({ monthly_estimated_profit: 300 }),
      property({ monthly_estimated_profit: 400 }),
    ])

    expect(stats.medianProfit).toBe(250)
  })

  it('counts unpriced rows separately instead of treating them as zero', () => {
    const stats = computePortfolioStats([
      property({ monthly_estimated_profit: 1000 }),
      property({ monthly_estimated_profit: null }),
      property({ monthly_estimated_profit: null }),
    ])

    expect(stats.total).toBe(3)
    expect(stats.priced).toBe(1)
    expect(stats.unpriced).toBe(2)
    // A null must not drag the median toward zero.
    expect(stats.medianProfit).toBe(1000)
  })

  it('reports the approval rate over every row, priced or not', () => {
    const stats = computePortfolioStats([
      property({ property_status: RentalPropertyStatus.Approved }),
      property({ property_status: RentalPropertyStatus.Approved }),
      property({ property_status: RentalPropertyStatus.Rejected }),
      property({ property_status: RentalPropertyStatus.Error }),
    ])

    expect(stats.approved).toBe(2)
    expect(stats.rejected).toBe(1)
    expect(stats.approvalRate).toBe(0.5)
  })

  it('picks the best and worst priced listing', () => {
    const stats = computePortfolioStats([
      property({ location: 'Middle', monthly_estimated_profit: 900 }),
      property({ location: 'Best', monthly_estimated_profit: 2400 }),
      property({ location: 'Worst', monthly_estimated_profit: -200 }),
    ])

    expect(stats.bestDeal?.location).toBe('Best')
    expect(stats.worstDeal?.location).toBe('Worst')
  })

  it('leaves the worst deal unset when there is only one priced listing', () => {
    const stats = computePortfolioStats([property({ monthly_estimated_profit: 900 })])

    expect(stats.bestDeal?.monthly_estimated_profit).toBe(900)
    expect(stats.worstDeal).toBeNull()
  })

  it('bins profits, with losses in their own bucket', () => {
    const stats = computePortfolioStats([
      property({ monthly_estimated_profit: -500 }),
      property({ monthly_estimated_profit: 250 }),
      property({ monthly_estimated_profit: 1200 }),
      property({ monthly_estimated_profit: 9000 }),
    ])

    const byLabel = Object.fromEntries(stats.buckets.map((bucket) => [bucket.label, bucket.count]))
    expect(byLabel.Loss).toBe(1)
    expect(byLabel['$0–500']).toBe(1)
    expect(byLabel['$1k–2k']).toBe(1)
    expect(byLabel['$3.5k+']).toBe(1)
  })

  it('normalises occupancy given either as a fraction or a percentage', () => {
    const stats = computePortfolioStats([
      property({ occupancy_rate: 0.6 }),
      property({ occupancy_rate: 80 }),
    ])

    // 0.6 and 80% average to 0.7.
    expect(stats.meanOccupancy).toBeCloseTo(0.7, 5)
  })
})

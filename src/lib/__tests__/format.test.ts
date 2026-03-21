import { describe, expect, it } from 'vitest'
import {
  EMPTY,
  formatAddress,
  formatCurrency,
  formatDate,
  formatNumber,
  formatOccupancy,
  plainTextPreview,
  initialFromEmail,
  toApiDate,
  toLongApiDate,
} from '../format'

describe('formatCurrency', () => {
  it('formats whole dollars by default', () => {
    expect(formatCurrency(1850)).toBe('$1,850')
  })

  it('keeps cents when asked', () => {
    expect(formatCurrency(1850.5, { precise: true })).toBe('$1,850.50')
  })

  it('renders an em dash for an absent value rather than $0', () => {
    // $0 is a real figure; a missing one must not be shown as if it were.
    expect(formatCurrency(null)).toBe(EMPTY)
    expect(formatCurrency(undefined)).toBe(EMPTY)
    expect(formatCurrency(Number.NaN)).toBe(EMPTY)
    expect(formatCurrency(0)).toBe('$0')
  })

  it('formats a negative figure', () => {
    expect(formatCurrency(-400)).toBe('-$400')
  })
})

describe('formatOccupancy', () => {
  it('scales a fraction to a percentage', () => {
    expect(formatOccupancy(0.72)).toBe('72%')
  })

  it('leaves a value already expressed as a percentage alone', () => {
    expect(formatOccupancy(72)).toBe('72%')
  })

  it('treats 1 as 100%, not 1%', () => {
    expect(formatOccupancy(1)).toBe('100%')
  })

  it('renders an em dash for an absent value', () => {
    expect(formatOccupancy(null)).toBe(EMPTY)
  })
})

describe('toApiDate', () => {
  it('formats the local calendar date, not a UTC-shifted one', () => {
    // 1 March at 23:00 local is 2 March in UTC east of the meridian; the
    // search endpoints parse %Y-%m-%d and must see the day the user picked.
    const date = new Date(2024, 2, 1, 23, 0, 0)
    expect(toApiDate(date)).toBe('2024-03-01')
  })

  it('pads single-digit months and days', () => {
    expect(toApiDate(new Date(2024, 0, 5))).toBe('2024-01-05')
  })
})

describe('toLongApiDate', () => {
  it('uses the long form the rental endpoints parse', () => {
    // The rental views parse %B %d, %Y; the lease and regulation views do not.
    expect(toLongApiDate(new Date(2024, 2, 3))).toBe('March 3, 2024')
  })
})

describe('formatDate', () => {
  it('formats an ISO date', () => {
    expect(formatDate('2024-03-01')).toBe('1 Mar 2024')
  })

  it('renders an em dash for a null or unparseable value', () => {
    expect(formatDate(null)).toBe(EMPTY)
    expect(formatDate('not a date')).toBe(EMPTY)
  })
})

describe('formatAddress', () => {
  it('joins both lines when the second is present', () => {
    expect(formatAddress({ address1: '1200 Pine St', address2: 'Apt 4B' })).toBe(
      '1200 Pine St, Apt 4B'
    )
  })

  it('drops an empty or null second line', () => {
    expect(formatAddress({ address1: '1200 Pine St', address2: null })).toBe('1200 Pine St')
    expect(formatAddress({ address1: '1200 Pine St', address2: '' })).toBe('1200 Pine St')
  })

  it('renders an em dash when there is no address at all', () => {
    expect(formatAddress(null)).toBe(EMPTY)
    expect(formatAddress({})).toBe(EMPTY)
  })
})

describe('formatNumber and initialFromEmail', () => {
  it('groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('takes the first letter of the local part, upper-cased', () => {
    expect(initialFromEmail('ada@example.com')).toBe('A')
    expect(initialFromEmail(null)).toBe('?')
  })
})

describe('plainTextPreview', () => {
  it('strips the bold markers that used to render raw in the table', () => {
    expect(plainTextPreview('**SHORT-TERM RENTALS ALLOWED WITH RESTRICTIONS**')).toBe(
      'SHORT-TERM RENTALS ALLOWED WITH RESTRICTIONS'
    )
  })

  it('takes the first non-empty line and drops heading and bullet markers', () => {
    expect(plainTextPreview('\n\n## Summary\n\nmore text')).toBe('Summary')
    expect(plainTextPreview('- Permitted with a permit')).toBe('Permitted with a permit')
    expect(plainTextPreview('> Quoted answer')).toBe('Quoted answer')
  })

  it('unwraps links, inline code and italics', () => {
    expect(plainTextPreview('See [the ordinance](https://example.com/x) for detail')).toBe(
      'See the ordinance for detail'
    )
    expect(plainTextPreview('Use `permit_type` here')).toBe('Use permit_type here')
    expect(plainTextPreview('_Allowed_ with conditions')).toBe('Allowed with conditions')
  })

  it('collapses whitespace and handles nothing at all', () => {
    expect(plainTextPreview('  a    b  ')).toBe('a b')
    expect(plainTextPreview(null)).toBe('')
    expect(plainTextPreview('')).toBe('')
  })
})

import { describe, expect, it } from 'vitest'
import { buildQuery, compact } from '../queryString'

describe('buildQuery', () => {
  it('joins the supplied parameters', () => {
    expect(buildQuery('api/leases/search/', { page: 2, status: 'Draft' })).toBe(
      'api/leases/search/?page=2&status=Draft'
    )
  })

  it('drops undefined, null and empty values', () => {
    expect(
      buildQuery('api/leases/search/', {
        address: 'Elm',
        status: '',
        start_date: undefined,
        end_date: null,
      })
    ).toBe('api/leases/search/?address=Elm')
  })

  it('never leaves a trailing separator', () => {
    // The hand-rolled versions of this sliced a stray '&' off the end, and one
    // of the three copies got the slice wrong.
    const url = buildQuery('api/leases/search/', { address: 'Elm', status: undefined })
    expect(url.endsWith('&')).toBe(false)
  })

  it('keeps the question mark when nothing is supplied', () => {
    expect(buildQuery('api/leases/search/', {})).toBe('api/leases/search/?')
  })

  it('percent-encodes rather than plus-encoding spaces', () => {
    // URLSearchParams would send `12+Main+St`; the Django views read these
    // with request.GET and the working behaviour has always been %20.
    expect(buildQuery('api/leases/search/', { address: '12 Main St' })).toContain(
      'address=12%20Main%20St'
    )
    expect(buildQuery('api/regulations/search/', { query: 'Austin, TX' })).toContain(
      'query=Austin%2C%20TX'
    )
  })

  it('keeps a zero, which is a real filter value', () => {
    expect(buildQuery('api/x/', { min_profit: 0 })).toBe('api/x/?min_profit=0')
  })
})

describe('compact', () => {
  it('removes undefined keys but keeps falsy ones', () => {
    expect(compact({ a: 1, b: undefined, c: 0, d: '', e: null })).toEqual({
      a: 1,
      c: 0,
      d: '',
      e: null,
    })
  })
})

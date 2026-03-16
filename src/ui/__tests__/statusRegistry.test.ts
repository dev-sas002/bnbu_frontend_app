import { describe, expect, it } from 'vitest'
import {
  DOCUMENT_STATUSES,
  LEASE_STATUSES,
  REGULATION_STATUSES,
  RENTAL_STATUSES,
  TONE_CLASSES,
  TONE_DOT_CLASSES,
  describeStatus,
} from '../statusRegistry'

describe('describeStatus', () => {
  it('resolves a known status to its tone', () => {
    expect(describeStatus(LEASE_STATUSES, 'Approved')).toMatchObject({
      label: 'Approved',
      tone: 'positive',
    })
  })

  it('falls back to a neutral badge showing the raw value', () => {
    // Lease status is a free-text column on the Django side, so a value the
    // frontend has never heard of has to render as itself, not as blank.
    expect(describeStatus(LEASE_STATUSES, 'Escalated')).toMatchObject({
      label: 'Escalated',
      tone: 'neutral',
    })
  })

  it('handles null and undefined', () => {
    expect(describeStatus(LEASE_STATUSES, null).label).toBe('Unknown')
    expect(describeStatus(LEASE_STATUSES, undefined).tone).toBe('neutral')
  })

  it('relabels a status whose API spelling is not what a user should read', () => {
    // The regulations model defaults to the lowercase 'pending', which is not
    // even in its own STATUS_CHOICES.
    expect(describeStatus(REGULATION_STATUSES, 'pending')).toMatchObject({
      label: 'Researching',
      tone: 'info',
    })
  })
})

describe('the vocabularies', () => {
  it('covers every lease and document status the API can send', () => {
    ['Draft', 'Approved', 'Rejected', 'Pending'].forEach((status) => {
      expect(describeStatus(LEASE_STATUSES, status).tone).not.toBe('neutral')
    })
    expect(DOCUMENT_STATUSES).toBe(LEASE_STATUSES)
  })

  it('covers every regulation status in STATUS_CHOICES plus the real default', () => {
    [
      'STR Allowed',
      'STR Not Allowed',
      'STR Allowed with Restrictions',
      'STR Pending Approval',
      'pending',
    ].forEach((status) => {
      expect(describeStatus(REGULATION_STATUSES, status).tone).not.toBe('neutral')
    })
  })

  it('covers every rental property status', () => {
    ['Approved', 'Rejected', 'Pending'].forEach((status) => {
      expect(describeStatus(RENTAL_STATUSES, status).tone).not.toBe('neutral')
    })
    // "Error" is deliberately neutral: it is an absence of data, not a verdict.
    expect(describeStatus(RENTAL_STATUSES, 'Error').tone).toBe('neutral')
  })

  it('has a class for every tone it can return', () => {
    const tones = new Set(
      [LEASE_STATUSES, REGULATION_STATUSES, RENTAL_STATUSES]
        .flatMap((vocabulary) => Object.values(vocabulary))
        .map((descriptor) => descriptor.tone)
    )

    tones.forEach((tone) => {
      expect(TONE_CLASSES[tone]).toBeTruthy()
      expect(TONE_DOT_CLASSES[tone]).toBeTruthy()
    })
  })
})

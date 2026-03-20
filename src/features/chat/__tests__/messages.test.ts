import { describe, expect, it } from 'vitest'
import { mapChatHistory } from '../messages'

describe('mapChatHistory', () => {
  it('maps roles onto senders', () => {
    const messages = mapChatHistory([
      { role: 'user', content: 'question', timestamp: '2024-03-01T10:00:00Z' },
      { role: 'assistant', content: 'answer', timestamp: '2024-03-01T10:00:05Z' },
    ])

    expect(messages.map((message) => message.sender)).toEqual(['user', 'assistant'])
    expect(messages.map((message) => message.text)).toEqual(['question', 'answer'])
  })

  it('drops rows with no content instead of rendering an empty bubble', () => {
    const messages = mapChatHistory([
      { role: 'user', content: 'kept', timestamp: '2024-03-01T10:00:00Z' },
      { role: 'assistant', timestamp: '2024-03-01T10:00:05Z' },
      { role: 'assistant', content: '', timestamp: '2024-03-01T10:00:06Z' },
    ])

    expect(messages).toHaveLength(1)
    expect(messages[0].text).toBe('kept')
  })

  it('leaves the timestamp blank rather than labelling an old message "now"', () => {
    const [message] = mapChatHistory([{ role: 'user', content: 'hello' }])

    expect(message.timestamp).toBe('')
    expect(message.rawTimestamp).toBe('')
  })

  it('treats any non-user role as the assistant', () => {
    const [message] = mapChatHistory([{ role: 'system' as 'user', content: 'note' }])
    expect(message.sender).toBe('assistant')
  })

  it('returns an empty list for anything that is not an array', () => {
    expect(mapChatHistory(undefined)).toEqual([])
    expect(mapChatHistory(null as never)).toEqual([])
  })
})

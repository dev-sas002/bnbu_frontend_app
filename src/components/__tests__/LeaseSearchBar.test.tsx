import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LeaseSearchBar from '../LeaseSearchBar'

// Every control is labelled now, so the tests address them by label rather
// than by placeholder text.
const addressInput = () => screen.getByLabelText(/address/i)
const dateInput = () => screen.getByLabelText(/uploaded between/i)
const statusSelect = () => screen.getByLabelText(/status/i)
const search = () => fireEvent.click(screen.getByRole('button', { name: /^search$/i }))

const openDatePicker = () => fireEvent.focus(dateInput())

describe('LeaseSearchBar', () => {
  it('emits the typed address and selected status', () => {
    const onSearch = vi.fn()
    render(<LeaseSearchBar onSearch={onSearch} />)

    fireEvent.change(addressInput(), { target: { value: '12 Main St' } })
    fireEvent.change(statusSelect(), { target: { value: 'Approved' } })
    search()

    expect(onSearch).toHaveBeenCalledWith({
      address: '12 Main St',
      status: 'Approved',
      startDate: undefined,
      endDate: undefined,
    })
  })

  it('leaves the dates undefined when none were picked', () => {
    const onSearch = vi.fn()
    render(<LeaseSearchBar onSearch={onSearch} />)

    search()

    const filters = onSearch.mock.calls[0][0]
    expect(filters.startDate).toBeUndefined()
    expect(filters.endDate).toBeUndefined()
  })

  it('sends the calendar date that was picked, not a UTC-shifted one', () => {
    const onSearch = vi.fn()
    render(<LeaseSearchBar onSearch={onSearch} />)

    openDatePicker()
    // Two clicks: react-datepicker's range mode takes a start then an end.
    const days = screen.getAllByRole('option')
    const start = days[10]
    const end = days[14]
    fireEvent.click(start)
    openDatePicker()
    fireEvent.click(end)
    search()

    const filters = onSearch.mock.calls[onSearch.mock.calls.length - 1][0]
    expect(filters.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(filters.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    // The day-of-month in the emitted string has to be the one on the button
    // that was clicked. The previous implementation added 86399999ms before
    // calling toISOString(), which rolled it forward a day west of UTC.
    const startDay = Number(start.textContent)
    expect(Number(filters.startDate.split('-')[2])).toBe(startDay)
    expect(filters.startDate <= filters.endDate).toBe(true)
  })

  it('sends only a start date while the range is half-picked', () => {
    const onSearch = vi.fn()
    render(<LeaseSearchBar onSearch={onSearch} />)

    openDatePicker()
    fireEvent.click(screen.getAllByRole('option')[8])
    search()

    const filters = onSearch.mock.calls[0][0]
    expect(filters.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(filters.endDate).toBeUndefined()
  })

  it('clears every control and emits empty filters', () => {
    const onSearch = vi.fn()
    render(<LeaseSearchBar onSearch={onSearch} />)

    fireEvent.change(addressInput(), { target: { value: '12 Main St' } })
    fireEvent.change(statusSelect(), { target: { value: 'Approved' } })
    fireEvent.click(screen.getByRole('button', { name: /clear/i }))

    expect(addressInput()).toHaveValue('')
    expect(statusSelect()).toHaveValue('')
    expect(onSearch).toHaveBeenCalledWith({ address: '', status: '' })
  })

  it.each(['Draft', 'Rejected', 'Approved'])('offers the %s status', (status) => {
    render(<LeaseSearchBar onSearch={vi.fn()} />)
    expect(screen.getByRole('option', { name: status })).toBeInTheDocument()
  })
})

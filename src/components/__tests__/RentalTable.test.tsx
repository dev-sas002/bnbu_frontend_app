import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RentalTable from '../RentalTable'
import { RentalPropertyStatus, type RentalProperty } from '../../types/rentalTypes'

const rentals: RentalProperty[] = [
  {
    batch_id: 1,
    created_at_formatted: 'March 3, 2024',
    location: 'Boulder, CO',
    rent: 2400,
    no_of_bedrooms: 3,
    monthly_estimated_profit: 900,
    property_zillow_link: 'https://example.com/a',
    property_status: RentalPropertyStatus.Approved,
  },
  {
    batch_id: 1,
    created_at_formatted: 'March 1, 2024',
    location: 'Austin, TX',
    rent: 1800,
    no_of_bedrooms: 2,
    monthly_estimated_profit: 1500,
    property_zillow_link: 'https://example.com/b',
    property_status: RentalPropertyStatus.Rejected,
  },
  {
    batch_id: 2,
    created_at_formatted: 'March 2, 2024',
    location: 'Denver, CO',
    rent: 3000,
    no_of_bedrooms: 4,
    monthly_estimated_profit: 300,
    property_zillow_link: 'https://example.com/c',
    property_status: RentalPropertyStatus.Pending,
  },
]

const locationColumn = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[1].textContent)

// Sortable headers carry a button, so the sort is keyboard-reachable; the
// click target is that button rather than the cell.
const clickHeader = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }))

describe('RentalTable', () => {
  it('renders a placeholder row when there is nothing to show', () => {
    render(<RentalTable rentals={[]} />)
    expect(screen.getByText('No rental properties available')).toBeInTheDocument()
  })

  it('tolerates being given no rentals at all', () => {
    expect(() =>
      render(<RentalTable rentals={undefined as unknown as RentalProperty[]} />)
    ).not.toThrow()
  })

  it('keeps the source order until a column is chosen', () => {
    render(<RentalTable rentals={rentals} />)
    expect(locationColumn()).toEqual(['Boulder, CO', 'Austin, TX', 'Denver, CO'])
  })

  it('sorts a numeric column ascending, then descending, then back to source order', () => {
    render(<RentalTable rentals={rentals} />)

    clickHeader(/estimated profit/i)
    expect(locationColumn()).toEqual(['Denver, CO', 'Boulder, CO', 'Austin, TX'])

    clickHeader(/estimated profit/i)
    expect(locationColumn()).toEqual(['Austin, TX', 'Boulder, CO', 'Denver, CO'])

    clickHeader(/estimated profit/i)
    expect(locationColumn()).toEqual(['Boulder, CO', 'Austin, TX', 'Denver, CO'])
  })

  it('sorts a string column alphabetically', () => {
    render(<RentalTable rentals={rentals} />)

    clickHeader(/location/i)
    expect(locationColumn()).toEqual(['Austin, TX', 'Boulder, CO', 'Denver, CO'])
  })

  it('restarts at ascending when a different column is picked', () => {
    render(<RentalTable rentals={rentals} />)

    clickHeader(/rent/i)
    clickHeader(/rent/i) // now descending on rent
    clickHeader(/bedrooms/i)

    expect(locationColumn()).toEqual(['Austin, TX', 'Boulder, CO', 'Denver, CO'])
  })

  it('opens the details modal for the clicked row and closes it again', () => {
    render(<RentalTable rentals={rentals} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Austin, TX'))

    // The dialog is titled with the property's location, so the same text is
    // now on screen twice: once in the row, once as the dialog heading.
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Austin, TX' })).toBeInTheDocument()
    expect(within(dialog).getByText('Monthly profit')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DataTable, { type Column } from '../DataTable'

interface Row {
  id: number
  name: string
  /** Deliberately a string: Django serialises DecimalFields this way. */
  amount: string
}

const rows: Row[] = [
  { id: 1, name: 'Boulder', amount: '900.00' },
  { id: 2, name: 'Austin', amount: '1850.00' },
  { id: 3, name: 'Denver', amount: '300.00' },
]

const columns: Array<Column<Row>> = [
  { key: 'name', header: 'Name', sortValue: (row) => row.name, render: (row) => row.name },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    // The accessor parses, so the sort is numeric even though the cell shows
    // the raw string. This is the bug the old table had: "900.00" compared
    // lexicographically sorts above "1850.00".
    sortValue: (row) => Number(row.amount),
    render: (row) => row.amount,
  },
  { key: 'static', header: 'Static', render: () => 'x' },
]

const renderTable = (props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) =>
  render(
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      {...(props as object)}
    />
  )

const nameColumn = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent)

describe('DataTable sorting', () => {
  it('keeps the source order until a column is chosen', () => {
    renderTable()
    expect(nameColumn()).toEqual(['Boulder', 'Austin', 'Denver'])
  })

  it('sorts a numeric accessor numerically, not lexicographically', () => {
    renderTable()

    fireEvent.click(screen.getByRole('button', { name: /amount/i }))

    // Lexicographically this would be 1850.00, 300.00, 900.00.
    expect(nameColumn()).toEqual(['Denver', 'Boulder', 'Austin'])
  })

  it('cycles ascending, descending, then back to the source order', () => {
    renderTable()
    const header = () => screen.getByRole('button', { name: /amount/i })

    fireEvent.click(header())
    expect(nameColumn()).toEqual(['Denver', 'Boulder', 'Austin'])

    fireEvent.click(header())
    expect(nameColumn()).toEqual(['Austin', 'Boulder', 'Denver'])

    fireEvent.click(header())
    expect(nameColumn()).toEqual(['Boulder', 'Austin', 'Denver'])
  })

  it('restarts at ascending when a different column is picked', () => {
    renderTable()

    fireEvent.click(screen.getByRole('button', { name: /amount/i }))
    fireEvent.click(screen.getByRole('button', { name: /amount/i })) // descending
    fireEvent.click(screen.getByRole('button', { name: /name/i }))

    expect(nameColumn()).toEqual(['Austin', 'Boulder', 'Denver'])
  })

  it('exposes the sort direction to assistive technology', () => {
    renderTable()

    fireEvent.click(screen.getByRole('button', { name: /name/i }))
    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute(
      'aria-sort',
      'ascending'
    )
  })

  it('gives a column with no accessor no sort control at all', () => {
    renderTable()
    expect(screen.queryByRole('button', { name: /static/i })).not.toBeInTheDocument()
  })

  it('sorts rows with a missing value to the end in both directions', () => {
    const withGap: Row[] = [
      { id: 1, name: 'Has value', amount: '100.00' },
      { id: 2, name: 'No value', amount: '' },
      { id: 3, name: 'Also has value', amount: '200.00' },
    ]
    render(
      <DataTable
        columns={[
          { key: 'name', header: 'Name', render: (row: Row) => row.name },
          {
            key: 'amount',
            header: 'Amount',
            sortValue: (row: Row) => (row.amount === '' ? null : Number(row.amount)),
            render: (row: Row) => row.amount,
          },
        ]}
        rows={withGap}
        rowKey={(row) => row.id}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /amount/i }))
    expect(nameColumn()).toEqual(['Has value', 'Also has value', 'No value'])

    fireEvent.click(screen.getByRole('button', { name: /amount/i }))
    expect(nameColumn()).toEqual(['Also has value', 'Has value', 'No value'])
  })
})

describe('DataTable states', () => {
  it('renders a skeleton while loading rather than an empty table', () => {
    renderTable({ loading: true })
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders the error state with a retry', () => {
    const onRetry = vi.fn()
    renderTable({ error: true, onRetry })

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders the empty state with its action', () => {
    const onClick = vi.fn()
    renderTable({
      rows: [],
      emptyTitle: 'Nothing yet',
      emptyAction: { label: 'Add one', onClick },
    })

    expect(screen.getByText('Nothing yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add one' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('tolerates being handed no rows at all', () => {
    expect(() =>
      renderTable({ rows: undefined as unknown as Row[] })
    ).not.toThrow()
  })
})

describe('DataTable windowing', () => {
  const manyRows: Row[] = Array.from({ length: 400 }, (_, index) => ({
    id: index,
    name: `Row ${index}`,
    amount: String(index),
  }))

  it('renders every row when below the threshold', () => {
    render(
      <DataTable
        columns={columns}
        rows={manyRows.slice(0, 40)}
        rowKey={(row) => row.id}
        virtualizeAfter={100}
      />
    )

    expect(screen.getAllByRole('row')).toHaveLength(41) // header + 40
  })

  it('renders only a window of rows once past the threshold', () => {
    render(
      <DataTable
        columns={columns}
        rows={manyRows}
        rowKey={(row) => row.id}
        virtualizeAfter={100}
        rowHeight={48}
        maxBodyHeight={480}
      />
    )

    // Header, a leading spacer is absent at scrollTop 0, ~10 visible rows plus
    // overscan, and one trailing spacer — far fewer than 400.
    const rendered = screen.getAllByRole('row').length
    expect(rendered).toBeGreaterThan(5)
    expect(rendered).toBeLessThan(40)
    expect(screen.getByText('Row 0')).toBeInTheDocument()
    expect(screen.queryByText('Row 399')).not.toBeInTheDocument()
  })
})

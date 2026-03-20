import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import UserList, { type User, type UserPage } from '../UserList'

const users: User[] = [
  {
    id: 1,
    email: 'ada@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    user_type: 'admin',
    is_active: true,
  },
  {
    id: 2,
    email: 'grace@example.com',
    first_name: 'Grace',
    last_name: 'Hopper',
    user_type: 'customer',
    is_active: false,
  },
]

const page = (overrides: Partial<UserPage> = {}): UserPage => ({
  results: users,
  next: null,
  ...overrides,
})

const renderList = (props: Partial<React.ComponentProps<typeof UserList>> = {}) => {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  const setCurrentPage = vi.fn()
  render(
    <UserList
      users={page()}
      onEdit={onEdit}
      onDelete={onDelete}
      currentPage={1}
      setCurrentPage={setCurrentPage}
      {...props}
    />
  )
  return { onEdit, onDelete, setCurrentPage }
}

describe('UserList', () => {
  it('renders a row per user with the status spelled out', () => {
    renderList()

    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('grace@example.com')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2)
  })

  it('renders an empty table rather than throwing when the page has not arrived', () => {
    // AdminDashboard hands this straight through from RTK Query, which is
    // undefined on the very first render and while a refetch is in flight.
    expect(() => renderList({ users: undefined })).not.toThrow()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('tolerates a page object with no results array', () => {
    expect(() => renderList({ users: { next: null } })).not.toThrow()
  })

  it('passes the clicked user to onEdit and the id to onDelete', () => {
    const { onEdit, onDelete } = renderList()

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1])
    expect(onEdit).toHaveBeenCalledWith(users[1])

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('disables Previous on the first page and Next without a next link', () => {
    renderList()

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('advances and retreats without dropping below page 1', () => {
    const { setCurrentPage } = renderList({
      users: page({ next: 'http://api/account/users/?page=3' }),
      currentPage: 2,
    })

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(setCurrentPage).toHaveBeenCalledWith(3)

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(setCurrentPage).toHaveBeenCalledWith(1)
  })
})

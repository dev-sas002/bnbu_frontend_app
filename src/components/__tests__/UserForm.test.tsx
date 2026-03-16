import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import UserForm, { UserFormValues } from '../UserForm'

const existingUser: UserFormValues = {
  id: 12,
  email: 'existing@example.com',
  first_name: 'Ada',
  last_name: 'Lovelace',
  user_type: 'admin',
  is_active: false,
}

const fill = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const submit = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }))

describe('UserForm in create mode', () => {
  it('defaults to an active customer with empty details', () => {
    render(<UserForm onSubmit={vi.fn()} initialData={null} />)

    expect(screen.getByLabelText(/email/i)).toHaveValue('')
    expect(screen.getByLabelText(/user type/i)).toHaveValue('customer')
    expect(screen.getByLabelText(/^active$/i)).toHaveValue('true')
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument()
  })

  it('blocks submission and reports every required field', async () => {
    const onSubmit = vi.fn()
    render(<UserForm onSubmit={onSubmit} initialData={null} />)

    submit(/create user/i)

    await waitFor(() => {
      expect(screen.getAllByText('Required')).toHaveLength(3)
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a malformed email address', async () => {
    const onSubmit = vi.fn()
    render(<UserForm onSubmit={onSubmit} initialData={null} />)

    fill(/email/i, 'not-an-email')
    // Blur rather than submit: the input is type="email", so the browser's own
    // constraint validation would stop the submit event before Yup ever ran.
    fireEvent.blur(screen.getByLabelText(/email/i))
    fill(/first name/i, 'Grace')
    fill(/last name/i, 'Hopper')

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })

    submit(/create user/i)
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the collected values and then resets the form', async () => {
    const onSubmit = vi.fn()
    render(<UserForm onSubmit={onSubmit} initialData={null} />)

    fill(/email/i, 'grace@example.com')
    fill(/first name/i, 'Grace')
    fill(/last name/i, 'Hopper')
    fireEvent.change(screen.getByLabelText(/user type/i), { target: { value: 'research' } })
    submit(/create user/i)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'grace@example.com',
        first_name: 'Grace',
        last_name: 'Hopper',
        user_type: 'research',
        is_active: true,
      })
    )
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveValue('')
    })
  })

  it('maps the Active select back to a boolean', async () => {
    const onSubmit = vi.fn()
    render(<UserForm onSubmit={onSubmit} initialData={null} />)

    fill(/email/i, 'grace@example.com')
    fill(/first name/i, 'Grace')
    fill(/last name/i, 'Hopper')
    fireEvent.change(screen.getByLabelText(/^active$/i), { target: { value: 'false' } })
    submit(/create user/i)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }))
    })
  })
})

describe('UserForm in edit mode', () => {
  it('prefills from initialData and keeps the id on submit', async () => {
    const onSubmit = vi.fn()
    render(<UserForm onSubmit={onSubmit} initialData={existingUser} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveValue('existing@example.com')
    })
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Ada')
    expect(screen.getByLabelText(/^active$/i)).toHaveValue('false')

    fill(/first name/i, 'Augusta')
    submit(/update user/i)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 12, first_name: 'Augusta' })
      )
    })
  })

  it('does not reset the form after an update', async () => {
    render(<UserForm onSubmit={vi.fn()} initialData={existingUser} />)

    submit(/update user/i)

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toHaveValue('existing@example.com')
    })
  })

  it('renders a cancel button only when a handler is supplied', () => {
    const onCancel = vi.fn()
    const { rerender } = render(<UserForm onSubmit={vi.fn()} initialData={null} />)
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()

    rerender(<UserForm onSubmit={vi.fn()} initialData={null} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})

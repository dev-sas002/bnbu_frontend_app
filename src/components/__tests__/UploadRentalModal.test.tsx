import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import UploadRentalModal from '../UploadRentalModal'

const renderModal = () => {
  const onUpload = vi.fn()
  render(<UploadRentalModal isOpen onClose={vi.fn()} onUpload={onUpload} submitting={false} />)
  return { onUpload, input: document.getElementById('rental-upload') as HTMLInputElement }
}

const choose = (input: HTMLInputElement, file: File) =>
  fireEvent.change(input, { target: { files: [file] } })

describe('UploadRentalModal', () => {
  it('offers only .xlsx and .csv in the file picker', () => {
    const { input } = renderModal()
    const accept = input.getAttribute('accept') ?? ''

    expect(accept).toContain('.xlsx')
    expect(accept).toContain('.csv')
    expect(accept).not.toMatch(/\.xls(,|$)/)
    expect(accept).not.toContain('application/vnd.ms-excel')
  })

  it('refuses a legacy .xls workbook and says why', async () => {
    const { input, onUpload } = renderModal()
    choose(input, new File(['x'], 'listings.xls', { type: 'application/vnd.ms-excel' }))

    expect(await screen.findByText(/listings\.xls was not added: only \.xlsx, \.csv/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /start pricing/i }))
    expect(screen.getByText('Choose a spreadsheet to upload.')).toBeInTheDocument()
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('uploads an accepted .xlsx as the "file" field', async () => {
    const { input, onUpload } = renderModal()
    const sheet = new File(['x'], 'listings.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    choose(input, sheet)

    await screen.findByText('listings.xlsx')
    fireEvent.click(screen.getByRole('button', { name: /start pricing/i }))

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1))
    expect((onUpload.mock.calls[0][0] as FormData).get('file')).toBe(sheet)
  })
})

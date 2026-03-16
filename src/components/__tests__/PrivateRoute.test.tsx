import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PrivateRoute from '../PrivateRoute'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../store/slices/authSlice'

const renderWithStore = (token: string | null) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        token,
      },
    } as any,
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>Protected content</div>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('PrivateRoute', () => {
  it('redirects to login when no token is present', () => {
    renderWithStore(null)
    expect(screen.getByText(/login page/i)).toBeInTheDocument()
  })

  it('renders protected content when token exists', () => {
    renderWithStore('fake-token')
    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
  })
})


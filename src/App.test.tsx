import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

// The Provider was missing here. Login calls useDispatch, so this render threw
// "could not find react-redux context value" -- the test could never have
// passed, which matched the fact that the suite had never been runnable:
// jsdom and @testing-library/jest-dom were both absent from package.json.
describe('App routing', () => {
  it('renders the login page on initial route', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </Provider>
    )

    // "Log in" is the heading; the submit control reads "Sign in".
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})

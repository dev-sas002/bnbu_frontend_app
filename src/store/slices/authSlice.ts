// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  user: User | null
  token: string | null
  refreshDocuments: boolean
}

export interface User {
  id: number
  email: string
  user_type: string
  first_name?: string
  last_name?: string  
  is_active?: boolean  
  is_first_login: boolean
}

// Fetch token from localStorage on initialization if needed
const token = localStorage.getItem('token')
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null

const initialState: AuthState = {
  user: user,
  token: token,
  refreshDocuments: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      // Store token and user in localStorage
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      // Store token in localStorage
      localStorage.setItem('token', action.payload)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      // Remove token and user from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    // Action to toggle the state
    toggleRefreshDocuments: (state) => {
      state.refreshDocuments = !state.refreshDocuments
    },
    // Action to set the state
    setRefreshDocuments: (state, action: PayloadAction<boolean>) => {
      state.refreshDocuments = action.payload
    },
  },
})

export const { setCredentials, setToken, logout, toggleRefreshDocuments, setRefreshDocuments } = authSlice.actions
export default authSlice.reducer

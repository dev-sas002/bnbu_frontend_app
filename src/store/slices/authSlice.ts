import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/services/baseApi';

export interface User {
  id: number;
  email: string;
  user_type: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_first_login: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  /**
   * Set when a refresh attempt fails. `PrivateRoute` reads it to show the
   * "your session ended" notice instead of silently bouncing to the login
   * form, which is what happened when a JWT expired before.
   */
  sessionExpired: boolean;
}

// Read the persisted session once, at module load. A malformed 'user' entry
// used to throw here, at module-evaluation time, which took the whole app down
// before React ever mounted. Treat it as "no user".
const readStoredUser = (): User | null => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const initialState: AuthState = {
  user: readStoredUser(),
  token: localStorage.getItem(ACCESS_TOKEN_KEY),
  sessionExpired: false,
};

const clearPersistedSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.sessionExpired = false;
      localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },

    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.sessionExpired = false;
      localStorage.setItem(ACCESS_TOKEN_KEY, action.payload);
    },

    /**
     * Store the whole pair returned by `api/token/`. The refresh token is what
     * lets `baseQueryWithReauth` replay a request that 401'd instead of
     * dumping the user back at the login form mid-task.
     */
    setSession: (state, action: PayloadAction<{ access: string; refresh?: string }>) => {
      state.token = action.payload.access;
      state.sessionExpired = false;
      localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.access);
      if (action.payload.refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, action.payload.refresh);
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.sessionExpired = false;
      clearPersistedSession();
    },

    /** Dispatched by the base query when a refresh fails. */
    sessionExpired: (state) => {
      state.user = null;
      state.token = null;
      state.sessionExpired = true;
      clearPersistedSession();
    },

    /** Cleared once the login page has shown the notice. */
    acknowledgeSessionExpiry: (state) => {
      state.sessionExpired = false;
    },
  },
});

export const {
  setCredentials,
  setToken,
  setSession,
  logout,
  sessionExpired,
  acknowledgeSessionExpiry,
} = authSlice.actions;

export default authSlice.reducer;

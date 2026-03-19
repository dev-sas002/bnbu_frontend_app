/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the BnBu API. Must end in `/`. */
  readonly VITE_API_URL?: string;
  /** Label only — nothing in `src/` branches on it. */
  readonly VITE_ENV?: string;
  /**
   * Optional. URL of a server-side proxy that talks to a language model on
   * the app's behalf. Unset means the Deal Brief falls back to its computed
   * provider. Never put an API key in a `VITE_*` variable: Vite inlines them
   * into the bundle.
   */
  readonly VITE_AI_PROXY_URL?: string;
  /** Model name passed through to the proxy. */
  readonly VITE_AI_MODEL?: string;
  /**
   * `'true'` answers every request from `src/demo/fixtures.ts` instead of the
   * network, so the app is fully populated with no backend running. This is
   * what `docker compose up` sets.
   */
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * The API surface, assembled.
 *
 * This file used to be a 500-line `createApi` call holding every endpoint in
 * the product with no response types and no cache tags. It is now a barrel:
 * `baseApi` owns transport and tags, each file under `endpoints/` owns one
 * domain, and everything is re-exported here so call sites keep importing
 * from a single place.
 */
import { baseApi } from './baseApi';
import { authApi } from './endpoints/auth';
import { usersApi } from './endpoints/users';
import { leasesApi } from './endpoints/leases';
import { documentsApi } from './endpoints/documents';
import { regulationsApi } from './endpoints/regulations';
import { rentalsApi } from './endpoints/rentals';

export { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './baseApi';

/**
 * Every domain injects into the same `baseApi` instance, so at runtime this is
 * one object. Only `endpoints` is widened: `reducer`, `middleware` and `util`
 * keep `baseApi`'s own types, because intersecting six copies of the middleware
 * type produces something `configureStore` will not accept.
 */
type AllEndpoints = typeof authApi.endpoints &
  typeof usersApi.endpoints &
  typeof leasesApi.endpoints &
  typeof documentsApi.endpoints &
  typeof regulationsApi.endpoints &
  typeof rentalsApi.endpoints;

export const api = baseApi as typeof baseApi & { endpoints: AllEndpoints };

export * from './endpoints/auth';
export * from './endpoints/users';
export * from './endpoints/leases';
export * from './endpoints/documents';
export * from './endpoints/regulations';
export * from './endpoints/rentals';

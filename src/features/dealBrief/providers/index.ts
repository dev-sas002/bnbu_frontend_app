import type { DealBriefProvider } from '../types';
import { heuristicProvider } from './heuristic';
import { modelProvider } from './model';

/**
 * The provider registry.
 *
 * Order matters: the first available provider wins. To add one — a different
 * vendor, an on-prem model, a canned brief for a demo — write the file and put
 * it in this list. Nothing else in the app knows a provider exists.
 */
export const DEAL_BRIEF_PROVIDERS: DealBriefProvider[] = [modelProvider, heuristicProvider];

/** Never returns undefined: the heuristic provider is always available. */
export const resolveDealBriefProvider = (
  providers: DealBriefProvider[] = DEAL_BRIEF_PROVIDERS
): DealBriefProvider => providers.find((provider) => provider.isAvailable()) ?? heuristicProvider;

export { heuristicProvider, modelProvider };

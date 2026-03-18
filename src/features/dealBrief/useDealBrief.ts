import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveDealBriefProvider } from './providers';
import { heuristicProvider } from './providers/heuristic';
import type { DealBrief, DealBriefProvider, DealBriefRequest } from './types';

export interface UseDealBriefResult {
  brief: DealBrief | null;
  isGenerating: boolean;
  error: string | null;
  provider: DealBriefProvider;
  generate: () => void;
  reset: () => void;
}

/**
 * Generates a brief on demand, never on mount.
 *
 * On demand matters: with a model provider configured, an automatic call would
 * fire on every filter change and every poll tick. The panel shows a button
 * and the user decides.
 *
 * If the chosen provider throws — proxy down, bad payload, network — the
 * heuristic provider is used instead and the panel says so, rather than
 * showing an error where a useful summary could have been.
 */
export const useDealBrief = (
  buildRequest: () => DealBriefRequest,
  provider: DealBriefProvider = resolveDealBriefProvider()
): UseDealBriefResult => {
  const [brief, setBrief] = useState<DealBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const generate = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setError(null);
    const request = buildRequest();

    provider
      .generate(request, controller.signal)
      .catch(async (cause: unknown) => {
        if (controller.signal.aborted) throw cause;
        // Degrade rather than fail: a computed brief beats an error banner.
        setError(
          cause instanceof Error
            ? `${provider.label} was unavailable (${cause.message}); showing the computed summary.`
            : `${provider.label} was unavailable; showing the computed summary.`
        );
        return heuristicProvider.generate(request);
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        setBrief(result);
      })
      .catch(() => {
        // Only reachable when the request was aborted.
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsGenerating(false);
      });
  }, [buildRequest, provider]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setBrief(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return { brief, isGenerating, error, provider, generate, reset };
};

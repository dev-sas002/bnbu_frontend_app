import { useEffect, useState } from 'react';

/**
 * Whether the tab is currently visible.
 *
 * RTK Query 1.x has no `skipPollingIfUnfocused` (it arrived in 2.0, and
 * upgrading a major version was out of scope here), so the polling hooks gate
 * their interval on this instead. A background tab is the common case for a
 * long-running analysis — the user starts it and goes to do something else —
 * and it is exactly when polling is least useful.
 */
const isVisible = (): boolean =>
  typeof document === 'undefined' || document.visibilityState !== 'hidden';

const useDocumentVisible = (): boolean => {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    const handleChange = () => setVisible(isVisible());
    document.addEventListener('visibilitychange', handleChange);
    return () => document.removeEventListener('visibilitychange', handleChange);
  }, []);

  return visible;
};

export default useDocumentVisible;

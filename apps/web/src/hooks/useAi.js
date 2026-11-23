import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAiSettings } from '../api/aiApi';
import { getErrorMessage } from '../api/client';
import { aiSessionSummary } from '../lib/aiSession';
import { setAiSettings, setError, setLoading, setSession } from '../redux/features/aiSlice';

/** Loads the AI settings once and says whether AI features can be used right now. */
export function useAi() {
  const dispatch = useDispatch();
  const isDemo = useSelector((state) => Boolean(state.auth.user?.isDemo));
  const { providers, saved, session, loaded, loading, error } = useSelector((state) => state.ai);

  useEffect(() => {
    if (loaded || loading) return;
    const load = async () => {
      try {
        dispatch(setLoading());
        dispatch(setAiSettings(await fetchAiSettings()));
        dispatch(setSession(aiSessionSummary()));
      } catch (err) {
        dispatch(setError(getErrorMessage(err)));
      }
    };
    load();
  }, [dispatch, loaded, loading]);

  const active = isDemo ? session : saved;
  const providerLabel = (id) => providers.find((provider) => provider.id === id)?.label ?? id;
  return { providers, saved, session, active, ready: Boolean(active), loaded, error, isDemo, providerLabel };
}

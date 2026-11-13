import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../api/financeApi';
import { getErrorMessage } from '../api/client';
import { setCategories, setError, setLoading } from '../redux/features/categorySlice';

/** Categories rarely change, so one fetch serves every form that needs them. */
export function useCategories() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.category);
  const isEmpty = items.length === 0;

  useEffect(() => {
    if (!isEmpty) return;
    const load = async () => {
      try {
        dispatch(setLoading());
        dispatch(setCategories(await fetchCategories()));
      } catch (err) {
        dispatch(setError(getErrorMessage(err)));
      }
    };
    load();
  }, [dispatch, isEmpty]);

  return { categories: items, loading, error };
}

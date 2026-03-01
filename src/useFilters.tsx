import * as React from 'react';
import history from 'history/browser';

export type FilterValue = string | number | boolean | undefined | null;
export type FiltersRecord = Record<string, FilterValue>;

export type UseFiltersOptions<T extends FiltersRecord> = {
  initialFilters: T;
  syncWithUrl?: boolean;
  onSubmit?: (filters: T) => void;
  onReset?: (filters: T) => void;
};

export type UseFiltersReturn<T extends FiltersRecord> = {
  filters: T;
  changeFilters: (name: keyof T, value: FilterValue) => void;
  setMultipleFilters: (partialFilters: Partial<T>) => void;
  resetFilters: () => void;
  submitFilters: () => void;
  getActiveFilterCount: () => number;
  hasActiveFilters: boolean;
};

function useFilters<T extends FiltersRecord>({
  initialFilters,
  syncWithUrl = true,
  onSubmit,
  onReset,
}: UseFiltersOptions<T>): UseFiltersReturn<T> {
  const [filters, setFilters] = React.useState<T>(() => {
    if (!syncWithUrl) return initialFilters;
    const search = history.location.search;
    if (!search) return initialFilters;
    const params = new URLSearchParams(search);
    const parsed: Partial<T> = {};
    params.forEach((value, key) => {
      if (key in initialFilters) {
        parsed[key as keyof T] = value as T[keyof T];
      }
    });
    return { ...initialFilters, ...parsed };
  });

  const initialFiltersRef = React.useRef(initialFilters);
  const filtersRef = React.useRef(filters);
  filtersRef.current = filters;

  const changeFilters = React.useCallback(
    (name: keyof T, value: FilterValue) => {
      setFilters(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const setMultipleFilters = React.useCallback(
    (partialFilters: Partial<T>) => {
      setFilters(prev => ({ ...prev, ...partialFilters }));
    },
    []
  );

  const resetFilters = React.useCallback(() => {
    const initial = initialFiltersRef.current;
    setFilters(initial);
    if (syncWithUrl) {
      history.push({ search: '' });
    }
    onReset?.(initial);
  }, [syncWithUrl, onReset]);

  const submitFilters = React.useCallback(() => {
    const current = filtersRef.current;
    if (syncWithUrl) {
      const searchParams = new URLSearchParams();
      Object.entries(current).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      history.push({ search: searchParams.toString() });
    }
    onSubmit?.(current);
  }, [syncWithUrl, onSubmit]);

  const getActiveFilterCount = React.useCallback(() => {
    return Object.values(filtersRef.current).filter(
      value => value !== undefined && value !== null && value !== ''
    ).length;
  }, []);

  const hasActiveFilters = React.useMemo(() => {
    return Object.values(filters).some(
      value => value !== undefined && value !== null && value !== ''
    );
  }, [filters]);

  return {
    filters,
    changeFilters,
    setMultipleFilters,
    resetFilters,
    submitFilters,
    getActiveFilterCount,
    hasActiveFilters,
  };
}

export default useFilters;

const mockPush = jest.fn();
let mockSearch = '';

jest.mock('history/browser', () => ({
  __esModule: true,
  default: {
    get location() {
      return { search: mockSearch };
    },
    push: (loc: { search?: string }) => {
      mockSearch = loc.search ?? '';
      mockPush(loc);
    },
  },
}));

import { renderHook, act } from '@testing-library/react-hooks';
import useFilters from '../src';

const initialFilters = { name: '', age: '', gender: '' };

describe('useFilters', () => {
  beforeEach(() => {
    mockSearch = '';
    mockPush.mockClear();
  });

  describe('initialization', () => {
    it('initializes with default filters when no search params', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      expect(result.current.filters).toEqual(initialFilters);
    });

    it('initializes from URL search params when syncWithUrl is true', () => {
      mockSearch = '?name=John&age=30';
      const { result } = renderHook(() => useFilters({ initialFilters }));
      expect(result.current.filters.name).toBe('John');
      expect(result.current.filters.age).toBe('30');
      expect(result.current.filters.gender).toBe('');
    });

    it('ignores URL params for keys not in initialFilters', () => {
      mockSearch = '?name=John&unknown=value';
      const { result } = renderHook(() => useFilters({ initialFilters }));
      expect(result.current.filters.name).toBe('John');
      expect((result.current.filters as any).unknown).toBeUndefined();
    });

    it('ignores URL params when syncWithUrl is false', () => {
      mockSearch = '?name=John&age=30';
      const { result } = renderHook(() =>
        useFilters({ initialFilters, syncWithUrl: false })
      );
      expect(result.current.filters).toEqual(initialFilters);
    });
  });

  describe('changeFilters', () => {
    it('updates a single filter value', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('name', 'Alice');
      });
      expect(result.current.filters.name).toBe('Alice');
      expect(result.current.filters.age).toBe('');
    });

    it('does not affect other filters when changing one', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('name', 'Alice');
        result.current.changeFilters('age', '25');
      });
      expect(result.current.filters.name).toBe('Alice');
      expect(result.current.filters.age).toBe('25');
      expect(result.current.filters.gender).toBe('');
    });
  });

  describe('setMultipleFilters', () => {
    it('updates multiple filters at once', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.setMultipleFilters({ name: 'Bob', age: '25' });
      });
      expect(result.current.filters.name).toBe('Bob');
      expect(result.current.filters.age).toBe('25');
      expect(result.current.filters.gender).toBe('');
    });

    it('merges partial updates with existing filter state', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('gender', 'female');
      });
      act(() => {
        result.current.setMultipleFilters({ name: 'Carol' });
      });
      expect(result.current.filters.gender).toBe('female');
      expect(result.current.filters.name).toBe('Carol');
    });
  });

  describe('resetFilters', () => {
    it('resets filters to initial values', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('name', 'Alice');
        result.current.changeFilters('age', '30');
      });
      act(() => {
        result.current.resetFilters();
      });
      expect(result.current.filters).toEqual(initialFilters);
    });

    it('clears URL search params when syncWithUrl is true', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.resetFilters();
      });
      expect(mockPush).toHaveBeenCalledWith({ search: '' });
    });

    it('does not push to history when syncWithUrl is false', () => {
      const { result } = renderHook(() =>
        useFilters({ initialFilters, syncWithUrl: false })
      );
      act(() => {
        result.current.resetFilters();
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('calls onReset callback with initial filters', () => {
      const onReset = jest.fn();
      const { result } = renderHook(() =>
        useFilters({ initialFilters, onReset })
      );
      act(() => {
        result.current.changeFilters('name', 'Alice');
      });
      act(() => {
        result.current.resetFilters();
      });
      expect(onReset).toHaveBeenCalledWith(initialFilters);
    });
  });

  describe('submitFilters', () => {
    it('pushes active filters to URL as search params', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('name', 'Alice');
        result.current.changeFilters('gender', 'female');
      });
      act(() => {
        result.current.submitFilters();
      });
      expect(mockPush).toHaveBeenCalled();
      const params = new URLSearchParams(mockPush.mock.calls[0][0].search);
      expect(params.get('name')).toBe('Alice');
      expect(params.get('gender')).toBe('female');
    });

    it('excludes empty, null, and undefined values from URL', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.submitFilters();
      });
      const params = new URLSearchParams(mockPush.mock.calls[0][0].search);
      expect(params.has('name')).toBe(false);
      expect(params.has('age')).toBe(false);
      expect(params.has('gender')).toBe(false);
    });

    it('does not push to history when syncWithUrl is false', () => {
      const { result } = renderHook(() =>
        useFilters({ initialFilters, syncWithUrl: false })
      );
      act(() => {
        result.current.changeFilters('name', 'Alice');
      });
      act(() => {
        result.current.submitFilters();
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('calls onSubmit callback with current filters', () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() =>
        useFilters({ initialFilters, onSubmit })
      );
      act(() => {
        result.current.changeFilters('name', 'Alice');
      });
      act(() => {
        result.current.submitFilters();
      });
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice' })
      );
    });
  });

  describe('getActiveFilterCount', () => {
    it('returns 0 when no filters are active', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      expect(result.current.getActiveFilterCount()).toBe(0);
    });

    it('returns correct count as filters are applied', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('name', 'Alice');
      });
      expect(result.current.getActiveFilterCount()).toBe(1);
      act(() => {
        result.current.changeFilters('age', '25');
      });
      expect(result.current.getActiveFilterCount()).toBe(2);
    });

    it('decreases count when a filter is cleared', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('name', 'Alice');
        result.current.changeFilters('age', '25');
      });
      act(() => {
        result.current.changeFilters('name', '');
      });
      expect(result.current.getActiveFilterCount()).toBe(1);
    });
  });

  describe('hasActiveFilters', () => {
    it('is false when all filters are empty', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('is true when at least one filter has a value', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('name', 'Alice');
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('returns to false after resetFilters', () => {
      const { result } = renderHook(() => useFilters({ initialFilters }));
      act(() => {
        result.current.changeFilters('name', 'Alice');
      });
      act(() => {
        result.current.resetFilters();
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('stable references', () => {
    it('provides stable function references across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useFilters({ initialFilters })
      );
      const {
        changeFilters,
        setMultipleFilters,
        resetFilters,
        submitFilters,
        getActiveFilterCount,
      } = result.current;
      rerender();
      expect(result.current.changeFilters).toBe(changeFilters);
      expect(result.current.setMultipleFilters).toBe(setMultipleFilters);
      expect(result.current.resetFilters).toBe(resetFilters);
      expect(result.current.submitFilters).toBe(submitFilters);
      expect(result.current.getActiveFilterCount).toBe(getActiveFilterCount);
    });
  });
});

# react-hook-filters

A headless React hook for managing filter state in dashboards and data tables. Handles the common pattern of filter forms above tables — submit, reset, and optionally sync the filter state with URL search parameters so users get the same results after a page refresh.

## Features

- **Headless** — no UI, just state and handlers you wire up yourself
- **URL sync** — persist filters in the URL so page refresh restores them (optional)
- **Type-safe** — fully generic TypeScript types inferred from your filter shape
- **Stable references** — all returned functions are memoized with `useCallback`
- **Callbacks** — `onSubmit` and `onReset` hooks for triggering data fetches
- **Lightweight** — no dependencies beyond `history`

## Installation

```bash
npm install react-hook-filters
# or
yarn add react-hook-filters
```

## Quick Start

```tsx
import useFilters from 'react-hook-filters';

const initialFilters = { name: '', age: '', gender: '' };

function UsersTable() {
  const {
    filters,
    changeFilters,
    resetFilters,
    submitFilters,
    hasActiveFilters,
    getActiveFilterCount,
  } = useFilters({
    initialFilters,
    onSubmit: (filters) => fetchUsers(filters), // called on submitFilters()
    onReset: () => fetchUsers({}),              // called on resetFilters()
  });

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); submitFilters(); }}>
        <input
          placeholder="Name"
          value={filters.name}
          onChange={(e) => changeFilters('name', e.target.value)}
        />
        <select onChange={(e) => changeFilters('gender', e.target.value)}>
          <option value="">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          placeholder="Age"
          value={filters.age}
          type="number"
          onChange={(e) => changeFilters('age', e.target.value)}
        />

        <button type="submit">Apply filters</button>
        {hasActiveFilters && (
          <button type="button" onClick={resetFilters}>
            Reset ({getActiveFilterCount()})
          </button>
        )}
      </form>

      {/* your table here */}
    </div>
  );
}
```

## API

### `useFilters(options)`

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `initialFilters` | `T` | required | Object defining the filter shape and default values |
| `syncWithUrl` | `boolean` | `true` | Sync filter state with URL search params |
| `onSubmit` | `(filters: T) => void` | — | Called when `submitFilters()` is invoked |
| `onReset` | `(filters: T) => void` | — | Called when `resetFilters()` is invoked |

#### Returns

| Property | Type | Description |
|---|---|---|
| `filters` | `T` | Current filter values |
| `changeFilters` | `(name: keyof T, value) => void` | Update a single filter |
| `setMultipleFilters` | `(partial: Partial<T>) => void` | Update multiple filters at once |
| `submitFilters` | `() => void` | Apply filters — updates URL and calls `onSubmit` |
| `resetFilters` | `() => void` | Reset to initial values — clears URL and calls `onReset` |
| `getActiveFilterCount` | `() => number` | Count of filters with non-empty values |
| `hasActiveFilters` | `boolean` | `true` if any filter has a non-empty value |

### URL Sync

When `syncWithUrl` is `true` (the default):

- On mount, filter state is initialized from URL search params if present — keys not in `initialFilters` are ignored
- `submitFilters()` writes non-empty filters to the URL
- `resetFilters()` clears the URL search params

This means if a user bookmarks `https://example.com/users?name=Alice&gender=female` and reopens it, the filter form will be pre-populated and the table will show filtered results (if you call `onSubmit` or fetch data on mount).

Disable URL sync when you don't want filters in the URL:

```tsx
useFilters({ initialFilters, syncWithUrl: false });
```

### TypeScript

Types are inferred automatically from `initialFilters`:

```tsx
const initialFilters = { status: '', search: '', page: 1 };

// filters is typed as { status: string; search: string; page: number }
const { filters, changeFilters } = useFilters({ initialFilters });

// TypeScript error: 'unknown' is not a key of initialFilters
changeFilters('unknown', 'value');
```

You can also import the types:

```tsx
import useFilters, { UseFiltersReturn, UseFiltersOptions } from 'react-hook-filters';
```

## License

[MIT](./LICENSE)

# react-hook-filters

react custom hook to handle filters in web apps (set, get) data from search params and more..

## Installation

### npm

```bash
npm install react-hook-filters
```

### yarn

```bash
yarn add react-hook-filters
```

## Usage

```jsx
import useFilters from 'react-hook-filter';

const initialFilters = { name: '', age: '', gender: '' };

const Home = ({ ...props }) => {
  const { filters, changeFilters, resetFilters, submitFilters } = useFilters({
    initialFilters,
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    submitFilters(); //this will append filters to search params
  };
  return (
    <div className={styles.Home}>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="name"
          value={filters.name}
          type="text"
          onChange={e => changeFilters('name', e.target.value)}
        />
        <select onChange={e => changeFilters('gender', e.target.value)}>
          <option value="male">male</option>
          <option value="female">female</option>
        </select>
        <input
          placeholder="age"
          value={filters.age}
          type="number"
          onChange={e => changeFilters('age', e.target.value)}
        />

        <button type="submit">submit</button>
        <button onClick={resetFilters}>reset</button>
      </form>
    </div>
  );
};

export default Home;
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

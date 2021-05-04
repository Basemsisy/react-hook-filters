import * as React from 'react';
import history from 'history/browser';
import qs from 'query-string';

type ReturnType = {
  filters: any;
  changeFilters: (name: string, value: any) => void;
  resetFilters: () => void;
  submitFilters: () => void;
}

const useFilters = ({ initialFilters }: { initialFilters: any }): ReturnType => {

  const searchParams = new URLSearchParams();

  const { search } = history.location;

  const [filters, setFilters] = React.useState(search ? qs.parse(search) : initialFilters);


  const changeFilters = (name: keyof typeof initialFilters, value: any) => {
    setFilters((prevFilters: any) => ({ ...prevFilters, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    history.push({ search: undefined });
  };

  const submitFilters = () => {
    Object.keys(filters).map(key => {
      if (filters[key]) searchParams.append(key, filters[key]);
    });
    history.push({ search: searchParams.toString() });
  };

  return {
    filters,
    changeFilters,
    resetFilters,
    submitFilters,
  }
};

export default useFilters;

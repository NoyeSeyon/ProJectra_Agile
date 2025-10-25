import { useMemo, useCallback, useRef } from 'react';

// Custom hook for memoizing expensive calculations
export const useMemoizedValue = (factory, deps) => {
  return useMemo(factory, deps);
};

// Custom hook for memoizing callbacks
export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// Custom hook for memoizing objects
export const useMemoizedObject = (object, deps) => {
  return useMemo(() => object, deps);
};

// Custom hook for memoizing arrays
export const useMemoizedArray = (array, deps) => {
  return useMemo(() => array, deps);
};

// Custom hook for memoizing functions with stable references
export const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback((...args) => callbackRef.current(...args), []);
};

// Custom hook for memoizing expensive computations
export const useExpensiveComputation = (compute, deps) => {
  return useMemo(() => {
    console.log('Computing expensive value...');
    return compute();
  }, deps);
};

// Custom hook for memoizing API responses
export const useMemoizedAPI = (apiCall, deps) => {
  return useMemo(async () => {
    console.log('Fetching API data...');
    return await apiCall();
  }, deps);
};

// Custom hook for memoizing filtered data
export const useMemoizedFilter = (data, filterFn, deps) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter(filterFn);
  }, [data, filterFn, ...deps]);
};

// Custom hook for memoizing sorted data
export const useMemoizedSort = (data, sortFn, deps) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return [...data].sort(sortFn);
  }, [data, sortFn, ...deps]);
};

// Custom hook for memoizing grouped data
export const useMemoizedGroup = (data, groupFn, deps) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    return data.reduce((groups, item) => {
      const key = groupFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [data, groupFn, ...deps]);
};

// Custom hook for memoizing paginated data
export const useMemoizedPagination = (data, page, pageSize, deps) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return { items: [], total: 0, pages: 0 };
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = data.slice(start, end);
    const total = data.length;
    const pages = Math.ceil(total / pageSize);
    
    return { items, total, pages };
  }, [data, page, pageSize, ...deps]);
};

// Custom hook for memoizing search results
export const useMemoizedSearch = (data, searchTerm, searchFn, deps) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchTerm) return data;
    return data.filter(item => searchFn(item, searchTerm));
  }, [data, searchTerm, searchFn, ...deps]);
};

// Custom hook for memoizing chart data
export const useMemoizedChartData = (data, transformFn, deps) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(transformFn);
  }, [data, transformFn, ...deps]);
};

// Custom hook for memoizing statistics
export const useMemoizedStats = (data, statsFn, deps) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    return statsFn(data);
  }, [data, statsFn, ...deps]);
};

// Custom hook for memoizing form validation
export const useMemoizedValidation = (formData, validationRules, deps) => {
  return useMemo(() => {
    const errors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = formData[field];
      
      rules.forEach(rule => {
        if (rule.required && (!value || value.trim() === '')) {
          errors[field] = rule.message || `${field} is required`;
        } else if (rule.minLength && value && value.length < rule.minLength) {
          errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
        } else if (rule.maxLength && value && value.length > rule.maxLength) {
          errors[field] = rule.message || `${field} must be no more than ${rule.maxLength} characters`;
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
          errors[field] = rule.message || `${field} format is invalid`;
        }
      });
    });
    
    return errors;
  }, [formData, validationRules, ...deps]);
};

// Custom hook for memoizing API cache
export const useAPICache = (key, apiCall, deps) => {
  const cacheRef = useRef(new Map());
  
  return useMemo(async () => {
    if (cacheRef.current.has(key)) {
      console.log(`Cache hit for key: ${key}`);
      return cacheRef.current.get(key);
    }
    
    console.log(`Cache miss for key: ${key}`);
    const result = await apiCall();
    cacheRef.current.set(key, result);
    return result;
  }, [key, ...deps]);
};

// Custom hook for memoizing debounced values
export const useDebouncedMemo = (value, delay, deps) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, ...deps]);
  
  return debouncedValue;
};

// Custom hook for memoizing throttled values
export const useThrottledMemo = (value, delay, deps) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdateRef = useRef(0);
  
  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= delay) {
      setThrottledValue(value);
      lastUpdateRef.current = now;
    }
  }, [value, delay, ...deps]);
  
  return throttledValue;
};


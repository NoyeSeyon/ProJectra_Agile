import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Performance monitoring hook
export const usePerformance = (componentName) => {
  const startTime = useRef(performance.now());
  const [renderTime, setRenderTime] = useState(0);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    setRenderTime(duration);
    setIsSlow(duration > 16); // 60fps threshold

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
    }
  });

  return { renderTime, isSlow };
};

// Debounced value hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled value hook
export const useThrottle = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdate = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdate.current >= delay) {
      setThrottledValue(value);
      lastUpdate.current = now;
    }
  }, [value, delay]);

  return throttledValue;
};

// Memoized callback hook
export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// Memoized value hook
export const useMemoizedValue = (factory, deps) => {
  return useMemo(factory, deps);
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { ref, isIntersecting, hasIntersected };
};

// Virtual scrolling hook
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    containerRef: setContainerRef,
    visibleItems,
    totalHeight,
    handleScroll
  };
};

// Image lazy loading hook
export const useLazyImage = (src, placeholder) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver();

  useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setIsError(true);
      };
      img.src = src;
    }
  }, [isIntersecting, src]);

  return { ref, imageSrc, isLoaded, isError };
};

// API caching hook
export const useAPICache = (key, apiCall, ttl = 300000) => { // 5 minutes default
  const cache = useRef(new Map());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const cached = cache.current.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      cache.current.set(key, {
        data: result,
        timestamp: now
      });
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key, apiCall, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    cache.current.delete(key);
  }, [key]);

  const clearAllCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache,
    clearAllCache
  };
};

// Form optimization hook
export const useFormOptimization = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setTouchedField = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleChange = useCallback((name, value) => {
    setValue(name, value);
    if (errors[name]) {
      setError(name, null);
    }
  }, [errors, setValue, setError]);

  const handleBlur = useCallback((name) => {
    setTouchedField(name);
  }, [setTouchedField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && Object.values(errors).every(error => !error);
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    setTouchedField,
    handleChange,
    handleBlur,
    reset,
    setIsSubmitting
  };
};

// Search optimization hook
export const useSearchOptimization = (items, searchFields, options = {}) => {
  const {
    debounceDelay = 300,
    minSearchLength = 2,
    caseSensitive = false
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  const searchItems = useCallback((term, items, fields) => {
    if (!term || term.length < minSearchLength) {
      return items;
    }

    const searchValue = caseSensitive ? term : term.toLowerCase();

    return items.filter(item => {
      return fields.some(field => {
        const fieldValue = caseSensitive ? item[field] : item[field]?.toLowerCase();
        return fieldValue?.includes(searchValue);
      });
    });
  }, [minSearchLength, caseSensitive]);

  useEffect(() => {
    const filtered = searchItems(debouncedSearchTerm, items, searchFields);
    setFilteredItems(filtered);
  }, [debouncedSearchTerm, items, searchFields, searchItems]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    clearSearch,
    isSearching: searchTerm.length > 0
  };
};

// Pagination optimization hook
export const usePaginationOptimization = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  useEffect(() => {
    setTotalPages(Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

// Memory usage monitoring hook
export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    if ('memory' in performance) {
      const updateMemoryInfo = () => {
        setMemoryInfo({
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
};

// Component performance monitoring
export const useComponentPerformance = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current
  };
};

export default {
  usePerformance,
  useDebounce,
  useThrottle,
  useMemoizedCallback,
  useMemoizedValue,
  useIntersectionObserver,
  useVirtualScrolling,
  useLazyImage,
  useAPICache,
  useFormOptimization,
  useSearchOptimization,
  usePaginationOptimization,
  useMemoryMonitoring,
  useComponentPerformance
};

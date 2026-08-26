import { useCallback, useEffect, useState } from 'react';

interface UseLoadMoreOptions {
  itemCount: number;
  pageSize?: number;
  resetKeys?: readonly unknown[];
}

export function useLoadMore({
  itemCount,
  pageSize = 50,
  resetKeys = [],
}: UseLoadMoreOptions) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const hasMore = visibleCount < itemCount;
  const resetToken = JSON.stringify(resetKeys);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => setVisibleCount(pageSize), 0);
    return () => window.clearTimeout(resetTimer);
  }, [pageSize, resetToken]);

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, itemCount));
  }, [itemCount, pageSize]);

  return {
    visibleCount,
    hasMore,
    loadMore,
  };
}

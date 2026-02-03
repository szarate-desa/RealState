import { useEffect, useRef } from 'react';
import type { Property } from '../types/types';

interface UseInfinitePropertiesParams {
  properties: Property[];
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
  selectedPropertyId: number | null;
  enableScrollToSelected: boolean;
  viewMode: 'map' | 'list' | 'split';
}

interface UseInfinitePropertiesResult {
  getRefCallback: (id: Property['id']) => (el: HTMLDivElement | null) => void;
}

export function useInfiniteProperties({
  properties,
  hasMore,
  isFetchingMore,
  loadMore,
  selectedPropertyId,
  enableScrollToSelected,
  viewMode,
}: UseInfinitePropertiesParams): UseInfinitePropertiesResult {
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const observer = useRef<IntersectionObserver | null>(null);

  const toNum = (id: Property['id']): number => {
    const n = typeof id === 'number' ? id : Number(id);
    return Number.isFinite(n) ? n : -1;
  };

  // Scroll into view for selected property when appropriate
  useEffect(() => {
    if (!enableScrollToSelected) return;
    if (viewMode !== 'list' && viewMode !== 'split') return;
    if (selectedPropertyId == null) return;
    const ref = itemRefs.current[selectedPropertyId];
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedPropertyId, enableScrollToSelected, viewMode]);

  // Intersection observer for infinite loading
  useEffect(() => {
    if (!hasMore) {
      if (observer.current) observer.current.disconnect();
      return;
    }
    if (isFetchingMore) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
        loadMore();
      }
    }, { threshold: 1.0 });

    const lastRaw = properties[properties.length - 1]?.id;
    const lastId = lastRaw !== undefined ? toNum(lastRaw) : -1;
    if (lastId !== -1 && itemRefs.current[lastId]) {
      observer.current.observe(itemRefs.current[lastId]!);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [properties, hasMore, isFetchingMore, loadMore]);

  const getRefCallback = (id: Property['id']) => (el: HTMLDivElement | null) => {
    if (!el) return;
    const numId = toNum(id);
    if (numId === -1) return;
    itemRefs.current[numId] = el;
  };

  return { getRefCallback };
}

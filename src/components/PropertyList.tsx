import React, { useEffect, useRef } from 'react';
import { Grid, CircularProgress, Typography } from '@mui/material';
import PropertyCard from './PropertyCard';
import type { Property } from '../types/types';

interface PropertyListProps {
  properties: Property[];
  onPropertyHover: (propertyId: string | null) => void;
  onLocateClick: (propertyId: string) => void;
  hoveredPropertyId: string | null;
  selectedPropertyId: string | null;
  viewMode: 'map' | 'list' | 'split';
  isListView: boolean;
  loadMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, onPropertyHover, onLocateClick, hoveredPropertyId, selectedPropertyId, viewMode, isListView, loadMore, hasMore, isFetchingMore }) => {
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (selectedPropertyId !== null && itemRefs.current[selectedPropertyId]) {
      itemRefs.current[selectedPropertyId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    if (isFetchingMore || !hasMore) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
        loadMore();
      }
    }, { threshold: 1.0 });

    if (properties.length > 0) {
        const lastItem = itemRefs.current[properties[properties.length - 1]?.id];
        if (lastItem) {
          observer.current.observe(lastItem);
        }
    }


    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [properties, loadMore, hasMore, isFetchingMore]);

  const getGridItemSize = () => {
    if (viewMode === 'split' || isListView) { // If in split view or list view, always full width
      return { xs: 12 };
    }
    return { xs: 12, sm: 6, md: 4 }; // Default responsive sizing
  };

  return (
    <Grid container spacing={3}>
      {properties.map((property) => {
        const gridSizes = getGridItemSize();
        return (
          <Grid
            item
            key={property.id}
            xs={gridSizes.xs}
            sm={gridSizes.sm}
            md={gridSizes.md}
            ref={(el: HTMLDivElement | null) => {
              if (el) {
                itemRefs.current[property.id] = el;
              }
            }}
          >
            <PropertyCard
              property={property}
              onMouseEnter={() => onPropertyHover(property.id)}
              onMouseLeave={() => onPropertyHover(null)}
              onLocateClick={() => onLocateClick(property.id)}
              isHovered={hoveredPropertyId === property.id || selectedPropertyId === property.id}
            />
          </Grid>
        );
      })}
      {isFetchingMore && (
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Grid>
      )}
      {!hasMore && properties.length > 0 && (
        <Grid item xs={12} sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">No hay más propiedades para cargar.</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default PropertyList;

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import PropertyCard from './PropertyCard';
import type { Property } from '../types/types';
import { useInfiniteProperties } from '../hooks/useInfiniteProperties';

interface PropertyListProps {
  properties: Property[];
  onPropertyHover: (propertyId: number | null) => void;
  onLocateClick: (propertyId: number) => void;
  hoveredPropertyId: number | null;
  selectedPropertyId: number | null;
  viewMode: 'map' | 'list' | 'split';
  loadMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, onPropertyHover, onLocateClick, hoveredPropertyId, selectedPropertyId, viewMode, loadMore, hasMore, isFetchingMore }) => {
  const { getRefCallback } = useInfiniteProperties({
    properties,
    hasMore,
    isFetchingMore,
    loadMore,
    selectedPropertyId,
    enableScrollToSelected: true,
    viewMode,
  });

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        maxWidth: viewMode === 'list' ? 1400 : '100%',
        mx: viewMode === 'list' ? 'auto' : 0,
        gridTemplateColumns: {
          xs: '1fr',
          sm: viewMode === 'list' ? '1fr' : 'repeat(2, 1fr)',
          md: viewMode === 'list' ? 'repeat(2, 1fr)' : viewMode === 'split' ? '1fr' : 'repeat(3, 1fr)'
        }
      }}
    >
      {properties.map((property) => (
        <Box
          key={property.id}
          ref={getRefCallback(property.id)}
        >
          <PropertyCard
            property={property}
            onMouseEnter={() => onPropertyHover(Number(property.id))}
            onMouseLeave={() => onPropertyHover(null)}
            onLocateClick={onLocateClick}
            isHovered={hoveredPropertyId === Number(property.id) || selectedPropertyId === Number(property.id)}
            compact={viewMode === 'split'}
          />
        </Box>
      ))}
      {isFetchingMore && (
        <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {!hasMore && properties.length > 0 && (
        <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">Fin de resultados.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default PropertyList;

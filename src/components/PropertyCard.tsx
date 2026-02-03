import { Card, CardContent, CardMedia, Typography, Box, Button, Chip } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import type { Property } from '../types/types';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../utils/imageHelper';

interface PropertyCardProps {
  property: Property;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onLocateClick: (propertyId: number) => void;
  isHovered: boolean;
  compact?: boolean;
}

const PropertyCardComponent = ({ property, onMouseEnter, onMouseLeave, onLocateClick, isHovered, compact = false }: PropertyCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <Card
      sx={{
        height: compact ? 320 : 400,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: isHovered ? 8 : 2,
        borderColor: isHovered ? 'primary.main' : 'transparent',
        borderWidth: '2px',
        borderStyle: 'solid',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 10,
        },
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleCardClick} // Navigate on main card click
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={compact ? '180' : '220'}
          image={getImageUrl(property.imagen_principal)}
          alt={property.titulo}
          sx={{ objectFit: 'cover' }}
        />
        {/* Badge de precio dominante */}
        <Box sx={{ position: 'absolute', left: 12, bottom: 12, px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(0,0,0,0.6)' }}>
          <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ fontWeight: 800, color: 'white' }}>
            {formatPrice(property.precio)}
          </Typography>
        </Box>
        {/* Chip de tipo de transacción */}
        <Chip
          label={property.tipo_transaccion}
          color={property.tipo_transaccion === 'Venta' ? 'error' : 'primary'}
          size={compact ? 'small' : 'medium'}
          sx={{ position: 'absolute', right: 12, top: 12, fontWeight: 600 }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant={compact ? 'subtitle1' : 'h6'} component="div" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1, // Limit title to 1 line
          WebkitBoxOrient: 'vertical',
          height: '1.5em' // Approximate height for 1 line
        }}>
          {property.titulo}
        </Typography>
        {/* La ubicación es secundaria */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <LocationOn color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {property.barrio}, {property.ciudad}
          </Typography>
        </Box>
        {!compact && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {property.descripcion}
          </Typography>
        )}
        {compact && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {property.numero_habitaciones} hab · {property.numero_banos} baños · {property.superficie_total} m²
          </Typography>
        )}
        <Box sx={{ mt: 'auto' }} />
      </CardContent>
      <Button
        variant="contained"
        size="small"
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          zIndex: 1,
          boxShadow: 3,
          fontWeight: 700
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click from firing
          const numericId = typeof property.id === 'number' ? property.id : Number(property.id);
          if (Number.isFinite(numericId)) onLocateClick(numericId);
        }}
      >
        Ver en mapa
      </Button>
    </Card>
  );
};
// Memoized to avoid unnecessary re-renders when hover/selection changes unrelated properties
const PropertyCard = React.memo(PropertyCardComponent, (prev, next) => {
  return (
    prev.property.id === next.property.id &&
    prev.isHovered === next.isHovered
  );
});

export default PropertyCard;
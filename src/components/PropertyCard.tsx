import { Card, CardContent, CardMedia, Typography, Box, Button } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import type { Property } from '../types/types';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onLocateClick: (propertyId: string) => void;
  isHovered: boolean;
}

const PropertyCard = ({ property, onMouseEnter, onMouseLeave, onLocateClick, isHovered }: PropertyCardProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <Card
      sx={{
        maxWidth: 345,
        height: 380, // Fixed height for consistent proportion
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? 6 : 1,
        borderColor: isHovered ? 'primary.main' : 'transparent',
        borderWidth: '2px',
        borderStyle: 'solid',
        position: 'relative', // Needed for absolute positioning of the button
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleCardClick} // Navigate on main card click
    >
      <CardMedia
        component="img"
        height="180" // Fixed height for the image
        image={`http://localhost:3000${property.imagen_principal || 'https://via.placeholder.com/200x150?text=Sin+Imagen'}`}
        alt={property.titulo}
        sx={{ objectFit: 'cover' }} // Ensure image covers the area
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1, // Limit title to 1 line
          WebkitBoxOrient: 'vertical',
          height: '1.5em' // Approximate height for 1 line
        }}>
          {property.titulo}
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          {formatPrice(property.precio)}
        </Typography>
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
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1,   overflow: 'hidden',  textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {property.descripcion}
        </Typography>
      </CardContent>
      <Button
        variant="contained"
        size="small"
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          zIndex: 1,
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click from firing
          onLocateClick(property.id);
        }}
      >
        Ubicar
      </Button>
    </Card>
  );
};

export default PropertyCard;
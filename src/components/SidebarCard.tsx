import React from 'react';
import { Drawer, Box, Typography, IconButton, CardMedia, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KingBedIcon from '@mui/icons-material/KingBed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import ConstructionIcon from '@mui/icons-material/Construction';
import type { Property } from '../types/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

interface SidebarCardProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const SidebarCard: React.FC<SidebarCardProps> = ({ property, isOpen, onClose }) => {
  if (!property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 2 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          Detalles de la Propiedad
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={10}
          slidesPerView={1}
          style={{ borderRadius: '8px', overflow: 'hidden' }}
        >
          {property.imagenes && property.imagenes.length > 0 ? (
            property.imagenes.map((image, idx) => (
              <SwiperSlide key={idx}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:3000${image}`}
                  alt={`${property.titulo} - ${idx + 1}`}
                  sx={{ objectFit: 'cover' }}
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/400x200?text=Sin+Imagen"
                alt="Sin Imagen"
                sx={{ objectFit: 'cover' }}
              />
            </SwiperSlide>
          )}
        </Swiper>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{property.titulo}</Typography>
      <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
        {formatPrice(property.precio)}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <List dense disablePadding>
        <ListItem disableGutters>
          <ListItemIcon><LocationOnIcon /></ListItemIcon>
          <ListItemText primary={`${property.direccion}, ${property.barrio}, ${property.ciudad}`} />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary={`Tipo: ${property.tipo_propiedad}`} />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon><SquareFootIcon /></ListItemIcon>
          <ListItemText primary={`${property.superficie_total} m²`} />
        </ListItem>
        {property.numero_habitaciones > 0 && (
          <ListItem disableGutters>
            <ListItemIcon><KingBedIcon /></ListItemIcon>
            <ListItemText primary={`${property.numero_habitaciones} Habitaciones`} />
          </ListItem>
        )}
        {property.numero_banos > 0 && (
          <ListItem disableGutters>
            <ListItemIcon><BathtubIcon /></ListItemIcon>
            <ListItemText primary={`${property.numero_banos} Baños`} />
          </ListItem>
        )}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2" paragraph>{property.descripcion}</Typography>

      {property.amenities && property.amenities.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Amenidades:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {property.amenities.map((amenity, idx) => (
              <Chip key={idx} label={amenity} size="small" icon={<ConstructionIcon fontSize='small' />} />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #eee' }}>
        <Button variant="contained" fullWidth href={`/property/${property.id}`}>
          Ver Detalles Completos
        </Button>
      </Box>
    </Drawer>
  );
};

export default SidebarCard;

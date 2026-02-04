import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Chip, Divider, Button } from '@mui/material';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KingBedIcon from '@mui/icons-material/KingBed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';

import type { Property } from '../types/types';
import { useAuth } from '../context/AuthContext.tsx';
import api from './api';
import { getImageUrls } from '../utils/imageHelper';

const mapContainerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '8px',
};

const libraries: ('places')[] = ['places'];

const ImageGalleryPreview: React.FC<{ images: string[]; title: string }> = ({ images, title }) => (
  <Box sx={{ position: 'relative', mb: 2 }}>
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true, dynamicBullets: true }}
      spaceBetween={10}
      slidesPerView={1}
      style={{ borderRadius: '8px', overflow: 'hidden' }}
    >
      {getImageUrls(images).map((imageUrl, idx) => (
        <SwiperSlide key={idx}>
          <Box
            component="img"
            src={imageUrl}
            alt={`${title} - ${idx + 1}`}
            sx={{ width: '100%', height: '650px', objectFit: 'cover' }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  </Box>
);

const KeyDetails: React.FC<{ property: Property }> = ({ property }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2, justifyContent: 'center' }}>
        <Chip icon={<HomeIcon />} label={`Tipo: ${property.tipo_propiedad}`} />
        <Chip icon={<SquareFootIcon />} label={`${property.superficie_total} m²`} />
        {property.numero_habitaciones > 0 && <Chip icon={<KingBedIcon />} label={`${property.numero_habitaciones} hab.`} />}
        {property.numero_banos > 0 && <Chip icon={<BathtubIcon />} label={`${property.numero_banos} baños`} />}
    </Box>
);

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const { isLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<any>(`/propiedades/${id}`);
        // Ensure latitud and longitud are numbers
        const fetchedProperty: Property = {
          ...response.data,
          latitud: parseFloat(response.data.latitud),
          longitud: parseFloat(response.data.longitud),
        };
        setProperty(fetchedProperty);
      } catch (err) {
        setError('No se pudo cargar la propiedad. Inténtalo de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando propiedad...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!property) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontró la propiedad.</Alert>
      </Box>
    );
  }

  if (mapLoadError) return <div>Error cargando mapas</div>;

  const center = property.latitud && property.longitud ? { lat: property.latitud, lng: property.longitud } : undefined;

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', m: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        {property.titulo || 'Sin Título'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
        <LocationOnIcon sx={{ mr: 1 }} />
        <Typography variant="body1">
          {`${property.direccion}, ${property.barrio}, ${property.ciudad}`}
        </Typography>
      </Box>
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Esta vista es de solo lectura para visitantes. Inicia sesión para guardar propiedades en favoritos, contactar al anunciante o programar una visita.
        </Alert>
      )}

      <ImageGalleryPreview images={property.imagenes || []} title={property.titulo || ''} />

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 58%' }, minWidth: 0 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Detalles de la Propiedad
            </Typography>
          
            <KeyDetails property={property} />
            <Divider sx={{ my: 3 }} />
            
            {/* Renderizar descripción con formato HTML */}
            <Box 
              sx={{ 
                '& h3': { 
                  fontSize: '1.25rem', 
                  fontWeight: 600, 
                  mt: 3, 
                  mb: 1.5,
                  color: 'primary.main'
                },
                '& p': { 
                  mb: 2, 
                  lineHeight: 1.7,
                  color: 'text.secondary'
                },
                '& ul': { 
                  pl: 2, 
                  mb: 2 
                },
                '& li': { 
                  mb: 1,
                  lineHeight: 1.6
                },
                '& strong': {
                  color: 'text.primary',
                  fontWeight: 600
                }
              }}
              dangerouslySetInnerHTML={{ 
                __html: property.descripcion || '<p>Sin descripción.</p>' 
              }}
            />

            {property.amenities && property.amenities.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>🎯 Amenidades</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {property.amenities.map((amenity: string, idx) => (
                            <Chip key={idx} label={amenity} variant="outlined" color="primary" />
                        ))}
                    </Box>
                </Box>
            )}
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 38%' }, minWidth: 0 }}>
            <Box sx={{ position: 'sticky', top: '20px' }}>
                {/* Precio destacado */}
                <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', mb: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Precio</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        ${property.precio.toLocaleString()}
                    </Typography>
                    <Chip label="Oportunidad" size="small" sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold' }} />
                </Paper>

                {/* CTAs principales */}
                <Paper elevation={2} sx={{ p: 2, borderRadius: '8px', mb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          size="large"
                          startIcon={<PhoneIcon />}
                          sx={{ py: 1.5, fontWeight: 'bold' }}
                        >
                          Contactar
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button 
                              variant="outlined" 
                              fullWidth
                              startIcon={<EventIcon />}
                            >
                              Agendar Visita
                            </Button>
                            <Button 
                              variant="outlined" 
                              fullWidth
                              startIcon={<FavoriteIcon />}
                            >
                              Guardar
                            </Button>
                        </Box>
                        <Button 
                          variant="text" 
                          fullWidth
                          startIcon={<ShareIcon />}
                          size="small"
                        >
                          Compartir Propiedad
                        </Button>
                    </Box>
                </Paper>

                {/* Mapa con contexto */}
                {isLoaded && center ? (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>📍 Ubicación Privilegiada</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      En el corazón de {property.barrio}, a pasos de todo
                    </Typography>
                    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={15} options={{ disableDefaultUI: true }}>
                      <Marker position={center} />
                    </GoogleMap>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      component="a"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver indicaciones en Google Maps
                    </Button>
                  </Box>
                ) : <CircularProgress />}
            </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default PropertyDetails;

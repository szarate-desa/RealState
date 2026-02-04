import React from 'react';
import { Box, Typography, Chip, CircularProgress, Paper, Button, IconButton, Divider } from '@mui/material';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';

interface StepRevisionProps {
  onBack: (step?: number) => void;
  onSubmit: (data: any) => void;
  initialData: any;
  loading: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '8px',
};

const libraries: ('places')[] = ['places'];

const ImageGalleryPreview: React.FC<{ images: any[]; onEdit: () => void }> = ({ images, onEdit }) => (
  <Box sx={{ position: 'relative', mb: 2 }}>
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true, dynamicBullets: true }}
      spaceBetween={10}
      slidesPerView={1}
      style={{ borderRadius: '8px', overflow: 'hidden' }}
    >
      {images.map((item, idx) => {
        const src = typeof item === 'string' ? item : URL.createObjectURL(item);
        return (
          <SwiperSlide key={idx}>
            <Box
              component="img"
              src={src}
              alt={`Propiedad ${idx + 1}`}
              sx={{ width: '100%', height: '650px', objectFit: 'cover' }}
            />
          </SwiperSlide>
        );
      })}
      {images.length === 0 && (
        <SwiperSlide>
            <Box sx={{ width: '100%', height: '350px', background: '#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Typography>No hay imágenes</Typography>
            </Box>
        </SwiperSlide>
      )}
    </Swiper>
    <IconButton size="small" onClick={onEdit} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'rgba(255,255,255,0.7)' }}>
      <EditIcon />
    </IconButton>
  </Box>
);

const KeyDetails: React.FC<{ data: any }> = ({ data }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2, justifyContent: 'center' }}>
        <Chip icon={<HomeIcon />} label={`Tipo: ${data.tipo_nombre || 'No especificado'}`} />
    </Box>
);

const StepRevision: React.FC<StepRevisionProps> = ({ onBack, onSubmit, initialData, loading }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const center = initialData.latitud && initialData.longitud ? { lat: parseFloat(initialData.latitud), lng: parseFloat(initialData.longitud) } : undefined;

  if (loadError) return <div>Error cargando mapas</div>;

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        {initialData.titulo || 'Sin Título'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
        <LocationOnIcon sx={{ mr: 1 }} />
        <Typography variant="body1">
          {`${initialData.direccion}, ${initialData.barrio}, ${initialData.ciudadNombre}, ${initialData.departamentoNombre}`}
        </Typography>
      </Box>

      <ImageGalleryPreview images={initialData.images} onEdit={() => onBack(3)} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 58%' }, minWidth: 0 }}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Detalles de la Propiedad
                </Typography>
                <IconButton size="small" onClick={() => onBack(2)} sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                  <EditIcon fontSize="small" />
                </IconButton>
            </Box>
          
            <KeyDetails data={initialData} />
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
                __html: initialData.descripcion || '<p>Sin descripción.</p>' 
              }}
            />
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 38%' }, minWidth: 0 }}>
            <Box sx={{ position: 'sticky', top: '20px' }}>
                {/* Precio destacado */}
                <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', mb: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Precio</Typography>
                    {parseFloat(initialData.precio_venta || 0) > 0 && (
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        ${parseFloat(initialData.precio_venta).toLocaleString()}
                      </Typography>
                    )}
                    {parseFloat(initialData.precio_alquiler || 0) > 0 && (
                      <>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          ${parseFloat(initialData.precio_alquiler).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>por mes</Typography>
                      </>
                    )}
                    <Box sx={{ mt: 1 }}>
                      <Chip label="Vista Previa" size="small" sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold' }} />
                    </Box>
                </Paper>

                {/* CTAs de ejemplo (no funcionales en preview) */}
                <Paper elevation={2} sx={{ p: 2, borderRadius: '8px', mb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          size="large"
                          startIcon={<PhoneIcon />}
                          sx={{ py: 1.5, fontWeight: 'bold' }}
                          disabled
                        >
                          Contactar
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button 
                              variant="outlined" 
                              fullWidth
                              startIcon={<EventIcon />}
                              disabled
                            >
                              Agendar Visita
                            </Button>
                            <Button 
                              variant="outlined" 
                              fullWidth
                              startIcon={<FavoriteIcon />}
                              disabled
                            >
                              Guardar
                            </Button>
                        </Box>
                        <Button 
                          variant="text" 
                          fullWidth
                          startIcon={<ShareIcon />}
                          size="small"
                          disabled
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
                      En el corazón de {initialData.barrio}, a pasos de todo
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

      <Divider sx={{ my: 4 }} />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 2}}>
            Al hacer clic en Publicar, usted confirma que toda la información es correcta.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" onClick={() => onBack()}>Volver</Button>
            <Button
              variant="contained"
              onClick={() => onSubmit(initialData)}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Publicando...' : 'Publicar Propiedad'}
            </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default StepRevision;


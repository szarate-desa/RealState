import React from 'react';
import { Box, Grid, Typography, Chip, CircularProgress, Paper, List, ListItem, ListItemIcon, ListItemText, Button, IconButton, Divider } from '@mui/material';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

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
import ConstructionIcon from '@mui/icons-material/Construction';
import EditIcon from '@mui/icons-material/Edit';

interface StepRevisionProps {
  onBack: (step?: number) => void;
  onSubmit: (data: any) => void;
  initialData: any;
  loading: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '250px',
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
              sx={{ width: '100%', height: '350px', objectFit: 'cover' }}
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
        <Chip icon={<HomeIcon />} label={`Tipo: ${data.id_inmueble_tipo}`} />
        <Chip icon={<SquareFootIcon />} label={`${data.superficie_total} m²`} />
        {parseInt(data.numero_habitaciones, 10) > 0 && <Chip icon={<KingBedIcon />} label={`${data.numero_habitaciones} hab.`} />}
        {parseInt(data.numero_banos, 10) > 0 && <Chip icon={<BathtubIcon />} label={`${data.numero_banos} baños`} />}
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

      <Grid container spacing={4}>
        <Grid xs={12} md={7}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Detalles de la Propiedad
                </Typography>
                <IconButton size="small" onClick={() => onBack(2)}><EditIcon /></IconButton>
            </Box>
          
            <KeyDetails data={initialData} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph>
                {initialData.descripcion || 'Sin descripción.'}
            </Typography>

            {initialData.amenities && initialData.amenities.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Amenidades</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {initialData.amenities.map((amenity: string) => (
                            <Chip key={amenity} label={amenity} variant="outlined" />
                        ))}
                    </Box>
                </Box>
            )}
        </Grid>

        <Grid xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: '20px' }}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: '8px', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1}}>Condiciones Comerciales</Typography>
                    {parseFloat(initialData.precio_venta) > 0 && 
                        <Typography variant="h6"><AttachMoneyIcon sx={{verticalAlign: 'middle'}}/> Venta: ${parseFloat(initialData.precio_venta).toLocaleString()}</Typography>}
                    {parseFloat(initialData.precio_alquiler) > 0 && 
                        <Typography variant="h6"><AttachMoneyIcon sx={{verticalAlign: 'middle'}}/> Alquiler: ${parseFloat(initialData.precio_alquiler).toLocaleString()} /mes</Typography>}
                </Paper>

                {isLoaded && center ? (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Ubicación</Typography>
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={15} options={{ disableDefaultUI: true }}>
                            <Marker position={center} />
                        </GoogleMap>
                    </Box>
                ) : <CircularProgress />}
            </Box>
        </Grid>
      </Grid>

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


import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  PlayArrow,
  Pause,
  BarChart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { PropertyStatusChip } from '../components/PropertyStatusChip';
import { PropertyStatsCard } from '../components/PropertyStatsCard';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../utils/imageHelper';

type PropertyStatus = 'activa' | 'pausada' | 'borrador' | 'archivada';

interface Property {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  tipo_transaccion: string;
  superficie_total: number;
  estado_publicacion: PropertyStatus;
  visitas: number;
  destacada: boolean;
  fecha_creacion: string;
  tipo_inmueble: string;
  ciudad: string;
  departamento: string;
  imagen_principal: string;
  total_favoritos: number;
}

interface PropertyStats {
  visitas: number;
  favoritos: number;
  diasPublicada: number;
  promedioVistasDiarias: string | number;
  imagenes: number;
}

const MyProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedStats, setSelectedStats] = useState<PropertyStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchMyProperties();
  }, [estadoFilter, tipoFilter]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      
      if (estadoFilter !== 'all') params.estado = estadoFilter;
      if (tipoFilter !== 'all') params.tipo = tipoFilter;

      const response = await api.get('/propiedades/mis-propiedades', { params });
      setProperties(response.data.properties);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar las propiedades');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, property: Property) => {
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProperty(null);
  };

  const handleChangeStatus = async (newStatus: PropertyStatus) => {
    if (!selectedProperty) return;

    try {
      await api.patch(`/propiedades/${selectedProperty.id}/estado`, { estado: newStatus });
      
      // Actualizar localmente
      setProperties(properties.map(p => 
        p.id === selectedProperty.id 
          ? { ...p, estado_publicacion: newStatus }
          : p
      ));

      handleMenuClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al cambiar el estado');
    }
  };

  const handleViewStats = async (property: Property) => {
    setSelectedProperty(property);
    setStatsDialogOpen(true);
    setLoadingStats(true);

    try {
      const response = await api.get(`/propiedades/${property.id}/estadisticas`);
      setSelectedStats(response.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al cargar estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleEdit = (property: Property) => {
    handleMenuClose();
    navigate(`/edit-property/${property.id}`);
  };

  const handleDelete = async (property: Property) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${property.titulo}"?`)) {
      return;
    }

    try {
      await api.delete(`/propiedades/${property.id}`);
      setProperties(properties.filter(p => p.id !== property.id));
      handleMenuClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar la propiedad');
    }
  };

  const handleEstadoFilterChange = (event: SelectChangeEvent) => {
    setEstadoFilter(event.target.value);
  };

  const handleTipoFilterChange = (event: SelectChangeEvent) => {
    setTipoFilter(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Mis Propiedades
        </Typography>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate('/create-property')}
        >
          Nueva Propiedad
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={estadoFilter} label="Estado" onChange={handleEstadoFilterChange}>
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="activa">Activa</MenuItem>
            <MenuItem value="pausada">Pausada</MenuItem>
            <MenuItem value="borrador">Borrador</MenuItem>
            <MenuItem value="archivada">Archivada</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={tipoFilter} label="Tipo" onChange={handleTipoFilterChange}>
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="Casa">Casa</MenuItem>
            <MenuItem value="Departamento">Departamento</MenuItem>
            <MenuItem value="Terreno">Terreno</MenuItem>
            <MenuItem value="Local">Local Comercial</MenuItem>
            <MenuItem value="Oficina">Oficina</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Lista de propiedades */}
      <Grid container spacing={3} sx={{ maxWidth: 1400, mx: 'auto' }}>
        {properties.length === 0 ? (
          <Grid size={12}>
            <Alert severity="info">
              No tienes propiedades publicadas. ¡Crea tu primera propiedad!
            </Alert>
          </Grid>
        ) : (
          properties.map((property) => (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={property.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 400, mx: 'auto' }}>
                <CardMedia
                  component="img"
                  height="240"
                  image={getImageUrl(property.imagen_principal)}
                  alt={property.titulo}
                  sx={{ 
                    cursor: 'pointer',
                    objectFit: 'cover'
                  }}
                  onClick={() => navigate(`/property/${property.id}`)}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {property.titulo}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, property)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <PropertyStatusChip status={property.estado_publicacion} />

                  <Typography variant="h5" color="primary" sx={{ mt: 2, mb: 1 }}>
                    {formatPrice(property.precio)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {property.tipo_inmueble} • {property.superficie_total}m²
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    📍 {property.ciudad}, {property.departamento}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip 
                      icon={<Visibility />} 
                      label={`${property.visitas || 0} vistas`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<Visibility />} 
                      label={`${property.total_favoritos || 0} favoritos`} 
                      size="small" 
                      variant="outlined"
                      color="error"
                    />
                  </Box>
                </CardContent>

                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<BarChart />}
                    onClick={() => handleViewStats(property)}
                  >
                    Estadísticas
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<Edit />}
                    onClick={() => handleEdit(property)}
                  >
                    Editar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedProperty?.estado_publicacion === 'pausada' && (
          <MenuItem onClick={() => handleChangeStatus('activa')}>
            <PlayArrow sx={{ mr: 1 }} /> Activar
          </MenuItem>
        )}
        {selectedProperty?.estado_publicacion === 'activa' && (
          <MenuItem onClick={() => handleChangeStatus('pausada')}>
            <Pause sx={{ mr: 1 }} /> Pausar
          </MenuItem>
        )}
        <MenuItem onClick={() => selectedProperty && handleEdit(selectedProperty)}>
          <Edit sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={() => handleChangeStatus('archivada')}>
          <Delete sx={{ mr: 1 }} /> Archivar
        </MenuItem>
        <MenuItem 
          onClick={() => selectedProperty && handleDelete(selectedProperty)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog de estadísticas */}
      <Dialog 
        open={statsDialogOpen} 
        onClose={() => setStatsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Estadísticas - {selectedProperty?.titulo}
        </DialogTitle>
        <DialogContent>
          {loadingStats ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : selectedStats ? (
            <PropertyStatsCard stats={selectedStats} />
          ) : (
            <Alert severity="error">No se pudieron cargar las estadísticas</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProperties;

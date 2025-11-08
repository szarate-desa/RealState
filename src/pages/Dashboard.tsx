import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Paper,
  Chip,
  Drawer,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Fab,
  Tooltip,
  Collapse,
  Stack,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  Map as MapIcon,
  Tune as TuneIcon,
  Clear as ClearIcon,
  Layers as LayersIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import type { Property } from '../types/types';
import PropertyList from '../components/PropertyList';
import SidebarCard from '../components/SidebarCard';
import api from './api';

interface Filters {
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  minBedrooms: string;
  minBathrooms: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const libraries: ('places')[] = ['places'];

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<number | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('map');
  const [isListView, setIsListView] = useState(false); // New state for list view toggle
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPropertyForSidebar, setSelectedPropertyForSidebar] = useState<Property | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    propertyType: 'all',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    minBedrooms: '',
    minBathrooms: ''
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const fetchProperties = useCallback(async (pageNumber: number, append = false) => {
    try {
      append ? setIsFetchingMore(true) : setLoading(true);
      setError(null);
      const limit = 10; // Number of properties to fetch per page
      const response = await api.get<any[]>('/propiedades', {
        params: { page: pageNumber, limit, ...filters, searchQuery }
      });
      const newProperties = response.data.map(p => ({
        ...p,
        latitud: parseFloat(p.latitud),
        longitud: parseFloat(p.longitud),
        isFavorite: false
      }));

      if (append) {
        setProperties(prev => [...prev, ...newProperties] as Property[]);
        setFilteredProperties(prev => [...prev, ...newProperties] as Property[]);
      } else {
        setProperties(newProperties as Property[]);
        setFilteredProperties(newProperties as Property[]);
      }
      setHasMore(newProperties.length === limit);
    } catch (err) {
      setError('No se pudieron cargar las propiedades. Inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      append ? setIsFetchingMore(false) : setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    setPage(1); // Reset page when filters or search query change
    setHasMore(true);
    fetchProperties(1);
  }, [fetchProperties]);


  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const typesResponse = await api.get('/cat-inmueble-tipo');
        setPropertyTypes(typesResponse.data);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);
  
  useEffect(() => {
    let count = 0;
    if (filters.propertyType !== 'all') count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.minArea) count++;
    if (filters.maxArea) count++;
    if (filters.minBedrooms) count++;
    if (filters.minBathrooms) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    if (filteredProperties.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredProperties.forEach(property => {
        bounds.extend({ lat: property.latitud, lng: property.longitud });
      });
      mapInstance.fitBounds(bounds);
    }
  }, [filteredProperties]);

  const applyFilters = useCallback(() => {
    let filtered = [...properties];

    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(p => p.tipo_propiedad === filters.propertyType);
    }
    // ... (rest of the filtering logic is the same)

    setFilteredProperties(filtered);
    if (isMobile) setShowFilters(false);
  }, [filters, searchQuery, properties, isMobile]);

  const resetFilters = () => {
    setFilters({
      propertyType: 'all',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      minBedrooms: '',
      minBathrooms: ''
    });
    setSearchQuery('');
    setFilteredProperties(properties);
  };

  const centerMapOnLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(pos);
        map.setZoom(14);
      });
    }
  };

  const FilterPanel = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon /> Filtros
            {activeFiltersCount > 0 && (
              <Chip label={activeFiltersCount} size="small" color="primary" />
            )}
          </Typography>
          {isMobile && (
            <IconButton onClick={() => setShowFilters(false)} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={resetFilters}
            sx={{ mb: 1 }}
          >
            Limpiar todo
          </Button>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de propiedad</InputLabel>
            <Select
              value={filters.propertyType}
              label="Tipo de propiedad"
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
            >
              <MenuItem value="all">Todos los tipos</MenuItem>
              {propertyTypes.map((type) => (
                <MenuItem key={type.id} value={type.nombre}>{type.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              💰 Rango de precio
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Desde"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />
              <TextField
                size="small"
                placeholder="Hasta"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                fullWidth
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              📐 Superficie (m²)
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Mín"
                type="number"
                value={filters.minArea}
                onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                fullWidth
              />
              <TextField
                size="small"
                placeholder="Máx"
                type="number"
                value={filters.maxArea}
                onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                fullWidth
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              🛏️ Habitaciones mínimas
            </Typography>
            <Stack direction="row" spacing={1}>
              {[1, 2, 3, 4, 5].map(num => (
                <Chip
                  key={num}
                  label={num}
                  onClick={() => setFilters({ ...filters, minBedrooms: num.toString() })}
                  color={filters.minBedrooms === num.toString() ? 'primary' : 'default'}
                  sx={{ flex: 1 }}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
              🚿 Baños mínimos
            </Typography>
            <Stack direction="row" spacing={1}>
              {[1, 2, 3, 4].map(num => (
                <Chip
                  key={num}
                  label={num}
                  onClick={() => setFilters({ ...filters, minBathrooms: num.toString() })}
                  color={filters.minBathrooms === num.toString() ? 'primary' : 'default'}
                  sx={{ flex: 1 }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="contained"
          onClick={applyFilters}
          fullWidth
          size="large"
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          Aplicar Filtros
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando propiedades...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }
  
  if (loadError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error al cargar el mapa. Por favor, revisa la configuración de la API de Google Maps.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
      {/* Barra de búsqueda superior */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          zIndex: 1100,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por título, ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 300 } }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>

            {!isMobile && (
              <>
                <Tooltip title="Vista de mapa">
                  <IconButton
                    color={viewMode === 'map' ? 'primary' : 'default'}
                    onClick={() => setViewMode('map')}
                  >
                    <MapIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vista de lista">
                  <IconButton
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vista dividida">
                  <IconButton
                    color={viewMode === 'split' ? 'primary' : 'default'}
                    onClick={() => setViewMode('split')}
                  >
                    <LayersIcon />
                  </IconButton>
                </Tooltip>
                <ToggleButtonGroup
                  value={isListView ? 'list' : 'grid'}
                  exclusive
                  onChange={(event, newView) => {
                    if (newView !== null) {
                      setIsListView(newView === 'list');
                    }
                  }}
                  aria-label="layout view"
                  size="small"
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <ViewListIcon />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListIcon sx={{ transform: 'rotate(90deg)' }} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </>
            )}
          </Stack>

          <Chip
            label={`${filteredProperties.length} ${filteredProperties.length === 1 ? 'propiedad' : 'propiedades'}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {isMobile ? (
          <Drawer
            anchor="left"
            open={showFilters}
            onClose={() => setShowFilters(false)}
            PaperProps={{
              sx: { width: 320 },
            }}
          >
            <FilterPanel />
          </Drawer>
        ) : (
          <Collapse in={showFilters} orientation="horizontal">
            <Paper
              elevation={3}
              sx={{
                width: 320,
                height: '100%',
                borderRadius: 0,
                overflow: 'hidden',
              }}
            >
              <FilterPanel />
            </Paper>
          </Collapse>
        )}


        <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
          {(viewMode === 'map' || viewMode === 'split') && (
            <Box
              sx={{
                flex: viewMode === 'split' ? 0.4 : undefined, // 40% for map in split view
                width: viewMode === 'map' ? '100%' : undefined,
                position: 'relative',
              }}
            >
              {!isLoaded ? (
                <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{ lat: -25.2637, lng: -57.5759 }}
                  zoom={12}
                  onLoad={onMapLoad}
                  options={{
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                  }}
                >
                  {filteredProperties.map(property => (
                    <Marker
                      key={property.id}
                      position={{ lat: property.latitud, lng: property.longitud }}
                      onClick={() => {
                        const clickedProperty = filteredProperties.find(p => p.id === property.id);
                        if (clickedProperty) {
                          setSelectedPropertyForSidebar(clickedProperty);
                          setIsSidebarOpen(true);
                        }
                      }}
                      icon={{
                        url: `data:image/svg+xml;utf-8,<svg width="40" height="28" viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="40" height="28" rx="5" ry="5" fill="${hoveredPropertyId === property.id ? '#FF0000' : '#667eea'}" stroke="#fff" stroke-width="2"/><text x="20" y="18" font-family="Arial" font-size="12" fill="#fff" text-anchor="middle">${property.precio.toLocaleString()}</text></svg>`,
                        scaledSize: new window.google.maps.Size(40, 28),
                        anchor: new window.google.maps.Point(20, 28),
                      }}
                    />
                  ))}

                  {selectedPropertyId !== null && (
                    <InfoWindow
                      position={{
                        lat: filteredProperties.find(p => p.id === selectedPropertyId)!.latitud,
                        lng: filteredProperties.find(p => p.id === selectedPropertyId)!.longitud
                      }}
                      onCloseClick={() => setSelectedPropertyId(null)}
                    >
                      <Box sx={{ p: 1, maxWidth: 200 }}>
                        <img
                          src={`http://localhost:3000${filteredProperties.find(p => p.id === selectedPropertyId)!.imagen_principal || 'https://via.placeholder.com/200x150?text=Sin+Imagen'}`}
                          alt={filteredProperties.find(p => p.id === selectedPropertyId)!.titulo}
                          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {filteredProperties.find(p => p.id === selectedPropertyId)!.titulo}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                          ${filteredProperties.find(p => p.id === selectedPropertyId)!.precio.toLocaleString()}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() => {
                            const property = filteredProperties.find(p => p.id === selectedPropertyId);
                            if (property) {
                              setSelectedPropertyForSidebar(property);
                              setIsSidebarOpen(true);
                              setSelectedPropertyId(null); // Close InfoWindow
                            }
                          }}
                        >
                          Ver Detalles
                        </Button>
                      </Box>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
              
              <Tooltip title="Mi ubicación">
                <Fab
                  size="small"
                  color="primary"
                  sx={{ position: 'absolute', top: 24, right: 24, zIndex: 1 }}
                  onClick={centerMapOnLocation}
                >
                  <MyLocationIcon />
                </Fab>
              </Tooltip>
            </Box>
          )}

          {(viewMode === 'list' || viewMode === 'split') && (
            <Box
              sx={{
                flex: viewMode === 'split' ? 0.6 : undefined, // 60% for list in split view
                width: viewMode === 'list' ? '100%' : undefined,
                bgcolor: 'background.default',
                borderLeft: viewMode === 'split' ? '1px solid' : 'none',
                borderColor: 'divider',
                overflowY: 'auto'
              }}
            >
              {filteredProperties.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No se encontraron propiedades
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Intenta ajustar los filtros de búsqueda
                  </Typography>
                  <Button variant="outlined" onClick={resetFilters}>
                    Limpiar Filtros
                  </Button>
                </Box>
              ) : <PropertyList
                properties={filteredProperties}
                onPropertyHover={setHoveredPropertyId}
                onLocateClick={setSelectedPropertyId}
                hoveredPropertyId={hoveredPropertyId}
                selectedPropertyId={selectedPropertyId}
                viewMode={viewMode}
                isListView={isListView}
                loadMore={() => setPage(prevPage => prevPage + 1)}
                hasMore={hasMore}
                isFetchingMore={isFetchingMore}
              />}
            </Box>
          )}

        </Box>
      </Box>
      <SidebarCard
        property={selectedPropertyForSidebar}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </Box>
  );
};

export default Dashboard;
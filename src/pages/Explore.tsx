import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Fab,
  Tooltip,
  Stack,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  Map as MapIcon,
  Layers as LayersIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import type { Property } from '../types/types';
import PropertyList from '../components/PropertyList';
import SidebarCard from '../components/SidebarCard';
import AISearchBar from '../components/AISearchBar';
import MainLayout from '../layouts/MainLayout';
import api from './api';
import { getImageUrl } from '../utils/imageHelper';
import { MAP_CONFIG } from '../config/constants';



const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const libraries: ('places')[] = ['places'];

const Explore = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'split'>('map');
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPropertyForSidebar, setSelectedPropertyForSidebar] = useState<Property | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  // Estados para búsqueda IA
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<any>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Controles de vista para el toolbar
  const toolbarControls = (
    <Stack direction="row" spacing={1} alignItems="center">
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
      {/* Vista dividida solo en desktop */}
      <Tooltip title="Vista dividida">
        <IconButton
          color={viewMode === 'split' ? 'primary' : 'default'}
          onClick={() => setViewMode('split')}
          sx={{ display: { xs: 'none', md: 'inline-flex' } }}
        >
          <LayersIcon />
        </IconButton>
      </Tooltip>
    
      <Chip
        label={`${filteredProperties.length} ${filteredProperties.length === 1 ? 'propiedad' : 'propiedades'}`}
        color="primary"
        variant="outlined"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    </Stack>
  );

  // Cargar más resultados cuando cambia la página (para evitar warning y habilitar paginación)
  useEffect(() => {
    // Si ya hay propiedades, intenta traer más al cambiar la página
    if (page > 1) {
      fetchProperties(page, true).catch(() => {});
    }
  }, [page]);

  const fetchProperties = useCallback(async (pageNumber: number, append = false) => {
    try {
      append ? setIsFetchingMore(true) : setLoading(true);
      setError(null);
      const limit = 10;
      const response = await api.get<any[]>('/propiedades', {
        params: { page: pageNumber, limit }
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
  }, []);

  useEffect(() => {
    setPage(1); // Reset page when filters or search query change
    setHasMore(true);
    fetchProperties(1);
  }, [fetchProperties]);



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

  // Center map when a property is located via "Ubicar" button
  useEffect(() => {
    if (!map || !isLoaded) return;
    if (selectedPropertyId !== null) {
      const property = filteredProperties.find(p => Number(p.id) === selectedPropertyId);
      if (property && property.latitud && property.longitud) {
        // Small timeout to ensure map is fully ready
        setTimeout(() => {
          map.panTo({ lat: property.latitud, lng: property.longitud });
          map.setZoom(17);
        }, 100);
      }
    }
  }, [selectedPropertyId, map, isLoaded, filteredProperties]);

  const resetFilters = () => {
    setFilteredProperties(properties);
    setAiSearchActive(false);
    setAiSearchResults(null);
  };

  const handleAISearch = (results: any) => {
    console.log('Resultados de búsqueda IA recibidos:', results);
    
    // Verificar que results tenga la estructura esperada
    if (!results || !results.results || !Array.isArray(results.results)) {
      console.error('Estructura inesperada de resultados IA:', results);
      setError('Error al procesar resultados de búsqueda');
      return;
    }

    try {
      // Mapear propiedades para asegurar tipos correctos y datos válidos
      const mappedResults = results.results.map((p: any) => {
        // Log individual para debugging
        console.log('Mapeando propiedad:', {
          id: p.id,
          titulo: p.titulo,
          latitud: p.latitud,
          longitud: p.longitud,
          precio: p.precio,
        });

        return {
          id: String(p.id),
          titulo: p.titulo || 'Sin título',
          descripcion: p.descripcion || '',
          precio: Number(p.precio) || 0,
          tipo_transaccion: p.tipo_transaccion || 'Alquiler',
          latitud: parseFloat(p.latitud || 0),
          longitud: parseFloat(p.longitud || 0),
          direccion: p.direccion || '',
          barrio: p.barrio || '',
          ciudad: p.ciudad || '',
          imagen_principal: p.imagen_principal || '',
          imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
          numero_habitaciones: p.numero_habitaciones || 0,
          numero_banos: p.numero_banos || 0,
          superficie_total: Number(p.superficie_total) || 0,
          tipo_propiedad: p.tipo_propiedad || '',
          isFavorite: false
        };
      });

      console.log('Propiedades mapeadas exitosamente:', mappedResults.length);
      setFilteredProperties(mappedResults);
      setAiSearchResults(results);
      setAiSearchActive(true);
      setError(null); // Limpiar cualquier error previo
    } catch (error) {
      console.error('Error al procesar resultados IA:', error);
      setError(`Error al procesar propiedades: ${error}`);
    }
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
    <MainLayout toolbarContent={toolbarControls}>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden', 
        position: 'relative',
        minHeight: 0 // Importante para permitir que los hijos con overflow funcionen correctamente
      }}>
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          position: 'relative',
          flexDirection: { xs: viewMode === 'split' ? 'column' : 'row', md: 'row' },
          minHeight: 0 // Importante para permitir que los hijos con overflow funcionen correctamente
        }}>
          {(viewMode === 'map' || viewMode === 'split') && (
            <Box
              sx={{
                flex: { xs: undefined, md: viewMode === 'split' ? 0.5 : undefined }, // 50% para mapa en split view en desktop
                width: viewMode === 'map' ? '100%' : undefined,
                height: { xs: viewMode === 'split' ? '40vh' : '100%', md: '100%' }, // En móvil split, altura fija para el mapa
                position: 'relative',
              }}
            >
              {!isLoaded ? (
                <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={MAP_CONFIG.defaultCenter}
                  zoom={MAP_CONFIG.defaultZoom}
                  onLoad={onMapLoad}
                  options={{
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                  }}
                >
                  {/* Overlay de feedback y conteo en el mapa */}
                  <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                    <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`${filteredProperties.length} ${filteredProperties.length === 1 ? 'propiedad' : 'propiedades'}`} color="primary" size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {filteredProperties.length > 0 ? 'Explora el mapa para descubrir propiedades' : 'No hay resultados aquí, mueve el mapa'}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Box>

                  {/* Énfasis suave en el área activa (centroide) */}
                  {filteredProperties.length > 1 && (
                    <Circle
                      center={{
                        lat: filteredProperties.reduce((acc, p) => acc + p.latitud, 0) / filteredProperties.length,
                        lng: filteredProperties.reduce((acc, p) => acc + p.longitud, 0) / filteredProperties.length,
                      }}
                      radius={Math.max(300, 1200 - filteredProperties.length * 30)}
                      options={{
                        strokeColor: '#667eea',
                        strokeOpacity: 0.3,
                        strokeWeight: 1,
                        fillColor: '#667eea',
                        fillOpacity: 0.08,
                      }}
                    />
                  )}
                  {filteredProperties.map(property => {
                    const isHover = hoveredPropertyId === Number(property.id);
                    const isVenta = property.tipo_transaccion === 'Venta';
                    const baseColor = isVenta ? '#ff6b6b' : '#667eea';
                    const fillColor = isHover ? '#ff3366' : baseColor;
                    const priceText = `${property.precio.toLocaleString()}`;
                    const tipoAbbrev = isVenta ? 'Venta' : 'Alquiler';

                    // Crear elemento SVG como contenido para Marker
                    const svgContent = `<svg width="64" height="32" viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="64" height="32" rx="6" ry="6" fill="${fillColor}" stroke="#fff" stroke-width="2"/><text x="32" y="13" font-family="Arial" font-size="10" fill="#fff" text-anchor="middle">${tipoAbbrev}</text><text x="32" y="24" font-family="Arial" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">$${priceText}</text></svg>`;
                    
                    return (
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
                        onMouseOver={() => setHoveredPropertyId(Number(property.id))}
                        onMouseOut={() => setHoveredPropertyId(null)}
                        icon={{
                          url: `data:image/svg+xml;utf-8,${encodeURIComponent(svgContent)}`,
                          scaledSize: new window.google.maps.Size(64, 32),
                          anchor: new window.google.maps.Point(32, 32),
                        }}
                      />
                    );
                  })}

                  {selectedPropertyId !== null && (() => {
                    const selectedProp = filteredProperties.find(p => Number(p.id) === selectedPropertyId);
                    if (!selectedProp) return null;
                    return (
                      <InfoWindow
                        position={{
                          lat: selectedProp.latitud,
                          lng: selectedProp.longitud
                        }}
                        onCloseClick={() => setSelectedPropertyId(null)}
                      >
                        <Box sx={{ p: 1, maxWidth: 200 }}>
                          <img
                            src={getImageUrl(selectedProp.imagen_principal)}
                            alt={selectedProp.titulo}
                            style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {selectedProp.titulo}
                          </Typography>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                            ${selectedProp.precio.toLocaleString()}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => {
                              setSelectedPropertyForSidebar(selectedProp);
                              setIsSidebarOpen(true);
                              setSelectedPropertyId(null);
                            }}
                          >
                            Ver Detalles
                          </Button>
                        </Box>
                      </InfoWindow>
                    );
                  })()}
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
                flex: { xs: 1, md: viewMode === 'split' ? 0.5 : undefined }, // 50% para lista en split view en desktop
                width: viewMode === 'list' ? '100%' : undefined,
                minHeight: { xs: viewMode === 'split' ? 0 : undefined, md: 0 }, // Permite que el contenedor se encoja
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                borderLeft: { xs: 'none', md: viewMode === 'split' ? '1px solid' : 'none' },
                borderTop: { xs: viewMode === 'split' ? '1px solid' : 'none', md: 'none' },
                borderColor: 'divider',
                overflow: 'hidden' // El padre no hace scroll, solo el hijo
              }}
            >
              <Box sx={{ 
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: '#ccc',
                  borderRadius: '4px',
                  '&:hover': {
                    bgcolor: '#999',
                  },
                },
              }}>
              {/* Búsqueda Inteligente por IA - Ahora dentro del scroll */}
              <Box sx={{ mb: 2 }}>
                <AISearchBar 
                  onSearch={handleAISearch}
                  onError={(error) => setError(error)}
                  onLoadingChange={(loading) => setLoading(loading)}
                />
                
                {/* Mostrar info si está usando búsqueda IA */}
                {aiSearchActive && aiSearchResults && (
                  <Alert 
                    severity="success" 
                    onClose={() => {
                      setAiSearchActive(false);
                      setAiSearchResults(null);
                      setFilteredProperties(properties);
                    }}
                    sx={{ mt: 2 }}
                  >
                    Se encontraron <strong>{aiSearchResults.count} propiedades</strong> para: 
                    "<strong>{aiSearchResults.appliedFilters.original_query}</strong>"
                  </Alert>
                )}
              </Box>

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
              ) : (
                <Box sx={{ width: '100%' }}>
                  <PropertyList
                    properties={filteredProperties}
                    onPropertyHover={setHoveredPropertyId}
                    onLocateClick={setSelectedPropertyId}
                    hoveredPropertyId={hoveredPropertyId}
                    selectedPropertyId={selectedPropertyId}
                    viewMode={viewMode}
                    loadMore={() => setPage(prevPage => prevPage + 1)}
                    hasMore={hasMore}
                    isFetchingMore={isFetchingMore}
                  />
                </Box>
              )}
              </Box>
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
    </MainLayout>
  );
};

export default Explore;
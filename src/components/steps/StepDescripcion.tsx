import React, { useState, useEffect } from 'react';
import { Box, IconButton, TextField, Typography, Select, MenuItem, InputLabel, FormControl, ToggleButtonGroup, ToggleButton, FormGroup, FormControlLabel, Checkbox, FormLabel, Button, Paper, Divider } from '@mui/material';
import api from '../../pages/api';
import { useAuth } from '../../context/AuthContext';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';

interface StepDescripcionProps {
  onNext: (data: Partial<any>) => void;
  onBack: () => void;
  tipos?: any[];
  propertyData: any;
}

const StepDescripcion: React.FC<StepDescripcionProps> = ({ onNext, onBack, tipos = [], propertyData }) => {
  const { token } = useAuth();
  const [titulo, setTitulo] = useState(propertyData.titulo || '');
  const [descripcion, setDescripcion] = useState(propertyData.descripcion || '');
  const [idInmuebleTipo, setIdInmuebleTipo] = useState(propertyData.id_inmueble_tipo || '');
  const [numeroHabitaciones, setNumeroHabitaciones] = useState(propertyData.numero_habitaciones || '0');
  const [numeroBanos, setNumeroBanos] = useState(propertyData.numero_banos || '0');
  const [precioVenta, setPrecioVenta] = useState(propertyData.precio_venta || '');
  const [precioAlquiler, setPrecioAlquiler] = useState(propertyData.precio_alquiler || '');
  const [superficieTotal, setSuperficieTotal] = useState(propertyData.superficie_total || '');
  const [transactionType, setTransactionType] = useState('venta');
  
  // Campos adicionales para generar descripción con IA
  const [antiguedad, setAntiguedad] = useState(propertyData.antiguedad || '');
  const [estadoPropiedad, setEstadoPropiedad] = useState(propertyData.estado_propiedad || '');
  const [caracteristicasDestacadas, setCaracteristicasDestacadas] = useState(propertyData.caracteristicas_destacadas || '');
  const [zonaCercana, setZonaCercana] = useState(propertyData.zona_cercana || '');
  const [generatingIA, setGeneratingIA] = useState(false);
  const [loadingPOI, setLoadingPOI] = useState(false);

  useEffect(() => {
    setTitulo(propertyData.titulo || '');
    setDescripcion(propertyData.descripcion || '');
    setIdInmuebleTipo(propertyData.id_inmueble_tipo || '');
    setNumeroHabitaciones(propertyData.numero_habitaciones || '0');
    setNumeroBanos(propertyData.numero_banos || '0');
    setPrecioVenta(propertyData.precio_venta || '');
    setPrecioAlquiler(propertyData.precio_alquiler || '');
    setSuperficieTotal(propertyData.superficie_total || '');
    setAntiguedad(propertyData.antiguedad || '');
    setEstadoPropiedad(propertyData.estado_propiedad || '');
    setCaracteristicasDestacadas(propertyData.caracteristicas_destacadas || '');
    setZonaCercana(propertyData.zona_cercana || '');
    // Infer transaction type from initial data
    if (propertyData.precio_venta && propertyData.precio_alquiler) {
      setTransactionType('ambos');
    } else if (propertyData.precio_alquiler) {
      setTransactionType('alquiler');
    } else {
      setTransactionType('venta');
    }
  }, [propertyData]);

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(String(parseInt(value || '0', 10) + 1));
  };

  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const num = parseInt(value || '0', 10);
    if (num > 0) {
      setter(String(num - 1));
    }
  };

  const handleTransactionChange = (event: React.MouseEvent<HTMLElement>, newTransaction: string) => {
    if (newTransaction !== null) {
      setTransactionType(newTransaction);
    }
  };

  const selectedTipo = tipos.find(t => t.id === idInmuebleTipo);
  const showDetails = selectedTipo && selectedTipo.nombre !== 'Terreno';

  const handleNext = () => {
    onNext({
      titulo,
      descripcion,
      id_inmueble_tipo: idInmuebleTipo,
      superficie_total: superficieTotal,
      numero_habitaciones: showDetails ? numeroHabitaciones : '0',
      numero_banos: showDetails ? numeroBanos : '0',
      precio_venta: ['venta', 'ambos'].includes(transactionType) ? precioVenta : '',
      precio_alquiler: ['alquiler', 'ambos'].includes(transactionType) ? precioAlquiler : '',
      antiguedad,
      estado_propiedad: estadoPropiedad,
      caracteristicas_destacadas: caracteristicasDestacadas,
      zona_cercana: zonaCercana,
    });
  };

  const handleGenerateWithIA = async () => {
    if (!propertyData.latitud || !propertyData.longitud) {
      alert('No hay coordenadas de ubicación disponibles para generar la descripción.');
      return;
    }
    if (!token) {
      alert('Debes iniciar sesión para generar la descripción con IA.');
      return;
    }

    setGeneratingIA(true);
    try {
      const descripcionBase = [
        `Tipo: ${tipos.find(t => t.id === idInmuebleTipo)?.nombre || 'No especificado'}`,
        `Superficie: ${superficieTotal || 'No especificada'} m²`,
        `Habitaciones: ${numeroHabitaciones || 'No especificado'}`,
        `Baños: ${numeroBanos || 'No especificado'}`,
        `Antigüedad: ${antiguedad || 'No especificada'}`,
        `Estado: ${estadoPropiedad || 'No especificado'}`,
        `Características destacadas: ${caracteristicasDestacadas || 'Ninguna'}`,
        `Puntos de interés cercanos: ${zonaCercana || 'No especificada'}`,
        `Precio: ${precioVenta ? `Venta $${precioVenta}` : ''} ${precioAlquiler ? `Alquiler $${precioAlquiler}` : ''}`.trim(),
      ].filter(Boolean).join('. ');

      const response = await api.post(
        '/ai-generate/generate-description',
        {
          descripcion: descripcionBase,
          latitud: propertyData.latitud,
          longitud: propertyData.longitud,
          ciudadNombre: propertyData.ciudadNombre,
          departamentoNombre: propertyData.departamentoNombre,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { titulo_generado, descripcion_generada } = response.data || {};
      if (!titulo_generado || !descripcion_generada) {
        throw new Error('La respuesta de IA no es válida.');
      }

      setTitulo(titulo_generado);
      setDescripcion(descripcion_generada);
    } catch (error) {
      console.error('Error generando con IA:', error);
      alert('Error al generar descripción con IA');
    } finally {
      setGeneratingIA(false);
    }
  };

  const fetchNearbyPlaces = async () => {
    if (!propertyData.latitud || !propertyData.longitud) {
      alert('No hay coordenadas de ubicación disponibles');
      return;
    }

    setLoadingPOI(true);
    try {
      const lat = parseFloat(propertyData.latitud);
      const lng = parseFloat(propertyData.longitud);
      
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        throw new Error('Google Maps no está cargado');
      }

      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const location = new window.google.maps.LatLng(lat, lng);

      // Buscar diferentes tipos de lugares
      const types = ['school', 'hospital', 'shopping_mall', 'supermarket', 'park', 'restaurant', 'transit_station'];
      const allPlaces: any[] = [];

      for (const type of types) {
        await new Promise<void>((resolve) => {
          service.nearbySearch(
            {
              location: location,
              radius: 1000, // 1km de radio
              type: type,
            },
            (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                // Tomar los 2 más cercanos de cada tipo
                allPlaces.push(...results.slice(0, 2).map(p => ({ 
                  name: p.name, 
                  type: type,
                  distance: p.vicinity 
                })));
              }
              resolve();
            }
          );
        });
      }

      // Formatear con IA (simulación - reemplazar con llamada real)
      const placesByType: any = {};
      allPlaces.forEach(place => {
        const typeName = getPlaceTypeName(place.type);
        if (!placesByType[typeName]) placesByType[typeName] = [];
        placesByType[typeName].push(place.name);
      });

      const formatted = Object.entries(placesByType)
        .map(([type, names]: [string, any]) => `${type}: ${names.join(', ')}`)
        .join('. ');

      setZonaCercana(formatted || 'Zona residencial tranquila');
      
    } catch (error) {
      console.error('Error obteniendo lugares cercanos:', error);
      setZonaCercana('Zona con servicios cercanos');
    } finally {
      setLoadingPOI(false);
    }
  };

  const getPlaceTypeName = (type: string): string => {
    const typeMap: any = {
      school: 'Escuelas',
      hospital: 'Centros de salud',
      shopping_mall: 'Centros comerciales',
      supermarket: 'Supermercados',
      park: 'Parques',
      restaurant: 'Restaurantes',
      transit_station: 'Transporte público',
    };
    return typeMap[type] || type;
  };

  // Cargar puntos de interés automáticamente cuando se monta el componente
  useEffect(() => {
    if (propertyData.latitud && propertyData.longitud && !zonaCercana) {
      fetchNearbyPlaces();
    }
  }, [propertyData.latitud, propertyData.longitud]);

  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <h2>Step 2: Descripción</h2>

      <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Información Principal</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
            <InputLabel>Tipo de Propiedad</InputLabel>
            <Select
              value={idInmuebleTipo}
              label="Tipo de Propiedad"
              onChange={(e) => setIdInmuebleTipo(e.target.value)}
            >
              <MenuItem value="">-- Seleccione un tipo --</MenuItem>
              {tipos.map((t: any) => (
                <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Antigüedad (años)"
            type="number"
            fullWidth
            value={antiguedad}
            onChange={(e) => setAntiguedad(e.target.value)}
            placeholder="Ej: 5"
            helperText="¿Cuántos años tiene la propiedad?"
          />
          <FormControl fullWidth>
            <InputLabel>Estado de la Propiedad</InputLabel>
            <Select
              value={estadoPropiedad}
              label="Estado de la Propiedad"
              onChange={(e) => setEstadoPropiedad(e.target.value)}
            >
              <MenuItem value="">-- Seleccione --</MenuItem>
              <MenuItem value="A estrenar">A estrenar</MenuItem>
              <MenuItem value="Excelente">Excelente</MenuItem>
              <MenuItem value="Muy bueno">Muy bueno</MenuItem>
              <MenuItem value="Bueno">Bueno</MenuItem>
              <MenuItem value="A refaccionar">A refaccionar</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Características Destacadas"
            fullWidth
            multiline
            rows={2}
            value={caracteristicasDestacadas}
            onChange={(e) => setCaracteristicasDestacadas(e.target.value)}
            placeholder="Ej: Amplios ventanales, cocina integrada, pisos de madera"
            helperText="Menciona los aspectos más atractivos de la propiedad"
          />
          <TextField
            label="Puntos de Interés Cercanos"
            fullWidth
            multiline
            rows={2}
            value={zonaCercana}
            InputProps={{ readOnly: true }}
            placeholder="Detectando automáticamente..."
            helperText={loadingPOI ? "🔄 Buscando lugares cercanos con Google Maps..." : "Generado automáticamente con Google Maps y potenciado por IA"}
          />
        </Box>
      </Box>

      <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Condiciones Comerciales</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
          <ToggleButtonGroup
            value={transactionType}
            exclusive
            onChange={handleTransactionChange}
            aria-label="Tipo de Operación"
          >
            <ToggleButton value="venta" aria-label="venta">Venta</ToggleButton>
            <ToggleButton value="alquiler" aria-label="alquiler">Alquiler</ToggleButton>
            <ToggleButton value="ambos" aria-label="ambos">Ambos</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            {(transactionType === 'venta' || transactionType === 'ambos') && (
              <TextField
                label="Precio de Venta"
                type="number"
                fullWidth
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
              />
            )}
            {(transactionType === 'alquiler' || transactionType === 'ambos') && (
              <TextField
                label="Precio de Alquiler"
                type="number"
                fullWidth
                value={precioAlquiler}
                onChange={(e) => setPrecioAlquiler(e.target.value)}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Generación con IA</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            color="secondary" 
            fullWidth
            onClick={handleGenerateWithIA}
            disabled={generatingIA || !idInmuebleTipo || !superficieTotal}
          >
            {generatingIA ? 'Generando...' : '✨ Generar Título y Descripción con IA'}
          </Button>

          <TextField
            label="Título"
            fullWidth
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            helperText="Generado automáticamente o editable manualmente"
          />
          
          {/* Vista previa de la descripción generada */}
          {descripcion ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  📄 Descripción de la Propiedad
                </Typography>
                <Button 
                  size="small" 
                  onClick={handleGenerateWithIA}
                  disabled={generatingIA || !idInmuebleTipo || !superficieTotal}
                  sx={{ textTransform: 'none' }}
                >
                  🔄 Regenerar
                </Button>
              </Box>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'primary.light',
                  borderRadius: 2,
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
              >
                <Box 
                  sx={{ 
                    '& h3': { 
                      fontSize: '1.1rem', 
                      fontWeight: 600, 
                      mt: 2, 
                      mb: 1,
                      color: 'primary.main',
                      '&:first-of-type': { mt: 0 }
                    },
                    '& p': { 
                      mb: 1.5, 
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    },
                    '& ul': { 
                      pl: 2, 
                      mb: 1.5 
                    },
                    '& li': { 
                      mb: 0.5,
                      lineHeight: 1.5
                    },
                    '& strong': {
                      color: 'text.primary',
                      fontWeight: 600
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: descripcion }}
                />
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                💡 Así se verá tu propiedad publicada. Usa "Regenerar" si deseas crear una nueva versión.
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', my: 2 }}>
              Haz clic en "✨ Generar Título y Descripción con IA" para crear una descripción atractiva automáticamente
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={onBack} type="button">
          Atrás
        </Button>
        <Button variant="contained" onClick={handleNext} type="button">
          Siguiente
        </Button>
      </Box>
    </Box>
  );
}

export default StepDescripcion;

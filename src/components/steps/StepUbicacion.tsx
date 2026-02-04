import React, { useState } from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Box, TextField, Typography, Button, CircularProgress } from '@mui/material';

interface StepUbicacionProps {
  onNext: (data: {
    latitud: string;
    longitud: string;
    direccion: string;
    id_departamento: string;
    id_ciudad: string;
    barrio: string;
    paisNombre: string;
    departamentoNombre: string;
    ciudadNombre: string;
  }) => void;
  onBack?: () => void;
  initialData: any;
  departamentos: any[];
  ciudades: any[];
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '4px',
};
const defaultCenter = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires por defecto
const libraries: ('places')[] = ['places'];

const StepUbicacion: React.FC<StepUbicacionProps> = ({ onNext, onBack, initialData, departamentos, ciudades }) => {
  const [latitud, setLatitud] = useState(initialData.latitud || '');
  const [longitud, setLongitud] = useState(initialData.longitud || '');
  const [direccion, setDireccion] = useState(initialData.direccion || '');
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialData.latitud && initialData.longitud
      ? { lat: parseFloat(initialData.latitud), lng: parseFloat(initialData.longitud) }
      : null
  );
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [idDepartamento, setIdDepartamento] = useState(initialData.id_departamento || '');
  const [idCiudad, setIdCiudad] = useState(initialData.id_ciudad || '');
  const [barrio, setBarrio] = useState(initialData.barrio || '');
  // Nombres detectados por Google
  const [paisNombre, setPaisNombre] = useState(initialData.paisNombre || '');
  const [departamentoNombre, setDepartamentoNombre] = useState(initialData.departamentoNombre || '');
  const [ciudadNombre, setCiudadNombre] = useState(initialData.ciudadNombre || '');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Actualizar todos los estados cuando cambie initialData (ej: al volver atrás)
  React.useEffect(() => {
    setLatitud(initialData.latitud || '');
    setLongitud(initialData.longitud || '');
    setDireccion(initialData.direccion || '');
    setIdDepartamento(initialData.id_departamento || '');
    setIdCiudad(initialData.id_ciudad || '');
    setBarrio(initialData.barrio || '');
    setPaisNombre(initialData.paisNombre || '');
    setDepartamentoNombre(initialData.departamentoNombre || '');
    setCiudadNombre(initialData.ciudadNombre || '');
    
    if (initialData.latitud && initialData.longitud) {
      setMarkerPosition({ lat: parseFloat(initialData.latitud), lng: parseFloat(initialData.longitud) });
    } else {
      setMarkerPosition(null);
    }
  }, [initialData]);

  // Estado de carga para geocodificación
  const [loadingGeo, setLoadingGeo] = useState(false);
  // Geocoding para autocompletar departamento, ciudad y barrio
  const geocodeLatLng = (lat: number, lng: number) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      setLoadingGeo(false);
      return;
    }
    setLoadingGeo(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        let depName = '';
        let cityName = '';
        let neighborhood = '';
        let countryName = '';
        
        // Actualizar la dirección formateada
        setDireccion(results[0].formatted_address || '');
        
        for (const comp of results[0].address_components) {
          if (comp.types.includes('country')) countryName = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) depName = comp.long_name;
          if (comp.types.includes('locality')) cityName = comp.long_name;
          
          // Búsqueda más exhaustiva de barrio/vecindario
          if (!neighborhood) {
            if (comp.types.includes('neighborhood') || 
                comp.types.includes('sublocality') ||
                comp.types.includes('sublocality_level_1') ||
                comp.types.includes('sublocality_level_2') ||
                comp.types.includes('sublocality_level_3')) {
              neighborhood = comp.long_name;
            }
          }
        }
        
        setPaisNombre(countryName);
        setDepartamentoNombre(depName);
        setCiudadNombre(cityName);
        const foundDept = departamentos.find(d => d.nombre.toLowerCase() === depName.toLowerCase());
        if (foundDept) {
          setIdDepartamento(foundDept.id);
          // Una vez que encontramos el departamento, buscamos la ciudad dentro de los datos filtrados
          const foundCity = ciudades.find(c => c.id_departamento === foundDept.id && c.nombre.toLowerCase() === cityName.toLowerCase());
          if (foundCity) {
            setIdCiudad(foundCity.id);
          } else {
            setIdCiudad(''); // Resetea la ciudad si no se encuentra en ese departamento
          }
        } else {
          // Si no se encuentra el departamento, reseteamos ambos
          setIdDepartamento('');
          setIdCiudad('');
        }
        setBarrio(neighborhood);
      }
      setLoadingGeo(false);
    });
  };

  // Cuando cambia el marcador, autocompleta los campos
  React.useEffect(() => {
    if (!markerPosition) return;
    if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.Geocoder) return;
    geocodeLatLng(markerPosition.lat, markerPosition.lng);
  }, [markerPosition, isLoaded]);

  const onMapClick = (e: any) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      setLatitud(lat.toString());
      setLongitud(lng.toString());
      // geocodeLatLng se llama por useEffect
    }
  };

  const onMarkerDragEnd = (e: any) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      setLatitud(lat.toString());
      setLongitud(lng.toString());
      // geocodeLatLng se llama por useEffect
    }
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        setLatitud(lat.toString());
        setLongitud(lng.toString());
        setDireccion(place.formatted_address || '');
        // geocodeLatLng se llama por useEffect
      }
    }
  };

  if (!isLoaded) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>;

  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>Step 1: Ubicación</Typography>

      {/* Mapa */}
      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPosition || defaultCenter}
          zoom={markerPosition ? 16 : 12}
          onClick={onMapClick}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable
              onDragEnd={onMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </Box>

      {/* Campos de entrada */}
      <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Información de Ubicación</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {/* Búsqueda de dirección con autocomplete */}
          <Autocomplete
            onLoad={setAutocomplete}
            onPlaceChanged={onPlaceChanged}
          >
            <TextField
              label="Buscar dirección"
              placeholder="Ingrese la dirección"
              fullWidth
              variant="outlined"
              size="small"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
            />
          </Autocomplete>

          {/* Dirección completa */}
          <TextField
            label="Dirección"
            fullWidth
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            variant="outlined"
            size="small"
          />

          {/* Latitud y Longitud */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Latitud"
              type="number"
              fullWidth
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{ step: '0.0001' }}
            />
            <TextField
              label="Longitud"
              type="number"
              fullWidth
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              variant="outlined"
              size="small"
              inputProps={{ step: '0.0001' }}
            />
          </Box>

          {/* Campos de ubicación detectados automáticamente */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="País"
              fullWidth
              value={paisNombre}
              onChange={(e) => setPaisNombre(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              label="Departamento"
              fullWidth
              value={departamentoNombre}
              onChange={(e) => setDepartamentoNombre(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Ciudad"
              fullWidth
              value={ciudadNombre}
              onChange={(e) => setCiudadNombre(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              label="Barrio"
              fullWidth
              value={barrio}
              onChange={e => setBarrio(e.target.value)}
              placeholder="Ej: Centro (opcional)"
              variant="outlined"
              size="small"
            />
          </Box>

          {/* Indicador de carga */}
          {loadingGeo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2' }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Detectando ubicación...</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Botones de navegación */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
        {onBack && (
          <Button variant="outlined" onClick={onBack} type="button">
            Atrás
          </Button>
        )}
        <Button
          variant="contained"
          type="button"
          onClick={() => onNext({
            latitud,
            longitud,
            direccion,
            id_departamento: idDepartamento,
            id_ciudad: idCiudad,
            barrio: barrio || 'Sin especificar',
            paisNombre,
            departamentoNombre,
            ciudadNombre
          })}
          disabled={loadingGeo || !latitud || !longitud || !direccion}
        >
          Siguiente
        </Button>
      </Box>
    </Box>
  );
};

export default StepUbicacion;

import React, { useState } from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';

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
  initialData: any;
  departamentos: any[];
  ciudades: any[];
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};
const defaultCenter = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires por defecto
const libraries: ('places')[] = ['places'];

const StepUbicacion: React.FC<StepUbicacionProps> = ({ onNext, initialData, departamentos, ciudades }) => {
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

  React.useEffect(() => {
    if (initialData.latitud && initialData.longitud) {
      setMarkerPosition({ lat: parseFloat(initialData.latitud), lng: parseFloat(initialData.longitud) });
    }
  }, [initialData]);

  // Estado de carga para geocodificación
  const [loadingGeo, setLoadingGeo] = useState(false);
  // Geocoding para autocompletar departamento, ciudad y barrio
  const geocodeLatLng = (lat: number, lng: number) => {
    setLoadingGeo(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        let depName = '';
        let cityName = '';
        let neighborhood = '';
        let countryName = '';
        for (const comp of results[0].address_components) {
          if (comp.types.includes('country')) countryName = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) depName = comp.long_name;
          if (comp.types.includes('locality')) cityName = comp.long_name;
          if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) neighborhood = comp.long_name;
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
    if (markerPosition) {
      geocodeLatLng(markerPosition.lat, markerPosition.lng);
    }
  }, [markerPosition]);

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

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div>
      <h2>Step 1: Ubicación</h2>
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
        {/* Columna Izquierda */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            {/* TODO: Migrar a PlaceAutocompleteElement de Google, ya que el componente Autocomplete está obsoleto. 
                Ver: https://developers.google.com/maps/documentation/javascript/places-migration-overview */}
            <Autocomplete
              onLoad={setAutocomplete}
              onPlaceChanged={onPlaceChanged}
            >
              <input
                type="text"
                placeholder="Buscar dirección"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
                style={{ width: '100%', padding: 8 }}
              />
            </Autocomplete>
          </div>
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
        </div>

        {/* Columna Derecha */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label>Dirección:</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Latitud:</label>
              <input
                type="number"
                value={latitud}
                onChange={(e) => setLatitud(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Longitud:</label>
              <input
                type="number"
                value={longitud}
                onChange={(e) => setLongitud(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label>Departamento:</label>
              <select
                value={idDepartamento}
                onChange={e => setIdDepartamento(e.target.value)}
                style={{ width: '100%' }}
                disabled={loadingGeo}
              >
                <option value="">Seleccione un departamento</option>
                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Ciudad:</label>
              <select
                value={idCiudad}
                onChange={e => setIdCiudad(e.target.value)}
                style={{ width: '100%' }}
                disabled={loadingGeo}
              >
                <option value="">Seleccione una ciudad</option>
                {ciudades.filter(c => c.id_departamento === idDepartamento).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            {loadingGeo && <div style={{ marginLeft: 8 }}><span role="status" aria-live="polite">🔄 Cargando...</span></div>}
          </div>
          <div>
            <label>Barrio:</label>
            <input
              type="text"
              value={barrio}
              onChange={e => setBarrio(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onNext({
            latitud,
            longitud,
            direccion,
            id_departamento: idDepartamento,
            id_ciudad: idCiudad,
            barrio,
            paisNombre,
            departamentoNombre,
            ciudadNombre
          })}
          disabled={loadingGeo || !latitud || !longitud || !direccion}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default StepUbicacion;

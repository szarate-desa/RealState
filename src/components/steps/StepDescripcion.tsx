import React, { useState, useEffect } from 'react';
import { Box, IconButton, TextField, Typography, Select, MenuItem, InputLabel, FormControl, ToggleButtonGroup, ToggleButton, FormGroup, FormControlLabel, Checkbox, FormLabel } from '@mui/material';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';

interface StepDescripcionProps {
  onNext: (data: Partial<any>) => void;
  onBack: () => void;
  tipos?: any[];
  propertyData: any;
}

const allAmenities = [
  'Piscina', 'Garaje', 'Gimnasio', 'Balcón', 'Seguridad 24hs', 'Aire Acondicionado', 'Calefacción', 'Jardín', 'Terraza', 'Ascensor'
];

const StepDescripcion: React.FC<StepDescripcionProps> = ({ onNext, onBack, tipos = [], propertyData }) => {
  const [titulo, setTitulo] = useState(propertyData.titulo || '');
  const [descripcion, setDescripcion] = useState(propertyData.descripcion || '');
  const [idInmuebleTipo, setIdInmuebleTipo] = useState(propertyData.id_inmueble_tipo || '');
  const [numeroHabitaciones, setNumeroHabitaciones] = useState(propertyData.numero_habitaciones || '0');
  const [numeroBanos, setNumeroBanos] = useState(propertyData.numero_banos || '0');
  const [precioVenta, setPrecioVenta] = useState(propertyData.precio_venta || '');
  const [precioAlquiler, setPrecioAlquiler] = useState(propertyData.precio_alquiler || '');
  const [superficieTotal, setSuperficieTotal] = useState(propertyData.superficie_total || '');
  const [transactionType, setTransactionType] = useState('venta');
  const [amenities, setAmenities] = useState<string[]>(propertyData.amenities || []);

  useEffect(() => {
    setTitulo(propertyData.titulo || '');
    setDescripcion(propertyData.descripcion || '');
    setIdInmuebleTipo(propertyData.id_inmueble_tipo || '');
    setNumeroHabitaciones(propertyData.numero_habitaciones || '0');
    setNumeroBanos(propertyData.numero_banos || '0');
    setPrecioVenta(propertyData.precio_venta || '');
    setPrecioAlquiler(propertyData.precio_alquiler || '');
    setSuperficieTotal(propertyData.superficie_total || '');
    setAmenities(propertyData.amenities || []);
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

  const handleAmenityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setAmenities(prev =>
      checked ? [...prev, name] : prev.filter(amenity => amenity !== name)
    );
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
      amenities,
    });
  };

  return (
    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <h2>Step 2: Descripción</h2>

      <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Información Principal</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Título"
            fullWidth
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </Box>
      </Box>

      <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Características Principales</Typography>
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
            label="Superficie Total (m²)"
            type="number"
            fullWidth
            value={superficieTotal}
            onChange={(e) => setSuperficieTotal(e.target.value)}
            InputProps={{ inputProps: { min: 1 } }}
          />
          {showDetails && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="label">Habitaciones</Typography>
                <Box display="flex" alignItems="center">
                  <IconButton onClick={() => handleDecrement(setNumeroHabitaciones, numeroHabitaciones)}>
                    <RemoveCircleOutline />
                  </IconButton>
                  <Typography sx={{ width: '40px', textAlign: 'center' }}>{numeroHabitaciones}</Typography>
                  <IconButton onClick={() => handleIncrement(setNumeroHabitaciones, numeroHabitaciones)}>
                    <AddCircleOutline />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="label">Baños</Typography>
                <Box display="flex" alignItems="center">
                  <IconButton onClick={() => handleDecrement(setNumeroBanos, numeroBanos)}>
                    <RemoveCircleOutline />
                  </IconButton>
                  <Typography sx={{ width: '40px', textAlign: 'center' }}>{numeroBanos}</Typography>
                  <IconButton onClick={() => handleIncrement(setNumeroBanos, numeroBanos)}>
                    <AddCircleOutline />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">Amenidades</FormLabel>
          <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {allAmenities.map(amenity => (
              <FormControlLabel
                key={amenity}
                control={<Checkbox checked={amenities.includes(amenity)} onChange={handleAmenityChange} name={amenity} />}
                label={amenity}
                sx={{ flexBasis: '30%' }}
              />
            ))}
          </FormGroup>
        </FormControl>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <button onClick={onBack}>Back</button>
        <button onClick={handleNext}>Next</button>
      </Box>
    </Box>
  );
}

export default StepDescripcion;

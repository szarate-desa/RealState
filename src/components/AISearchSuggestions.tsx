import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Icon,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

/**
 * Componente que muestra sugerencias de búsquedas populares y trending
 * Mejora la experiencia del usuario cuando llega a la página Explore
 */
export const AISearchSuggestions = ({
  onSelectSuggestion,
}: {
  onSelectSuggestion: (query: string) => void;
}) => {
  // Ejemplos de búsquedas que la IA puede manejar muy bien
  const suggestedSearches = [
    {
      icon: '🏠',
      title: 'Casa con jardín',
      description: 'Buscar casas con jardín en venta',
      query: 'Casa grande con jardín y piscina para venta',
    },
    {
      icon: '🏢',
      title: 'Departamento céntrico',
      description: 'Apartamento moderno en el centro de la ciudad',
      query: 'Departamento 2 habitaciones centro ciudad máximo 600 USD',
    },
    {
      icon: '🏪',
      title: 'Local comercial',
      description: 'Espacio para negocios en zona concurrida',
      query: 'Local comercial en avenida principal con estacionamiento',
    },
    {
      icon: '🏘️',
      title: 'Zona residencial',
      description: 'Viviendas en zonas tranquilas',
      query: 'Casa 3 habitaciones zona residencial tranquila',
    },
  ];

  // Búsquedas trending (basadas en análisis de uso)
  const trendingSearches = [
    'Departamento con balcón bajo 400 USD',
    'Casa cerca de colegio con piscina',
    'Oficina pequeña centro comercial',
    'Estudio amueblado para alquiler',
  ];

  // Ejemplos de filtros que la IA puede extraer
  const aiCapabilities = [
    { label: '💵 Precio', example: '"menos de 500 USD"' },
    { label: '🛏️ Habitaciones', example: '"3 cuartos"' },
    { label: '📐 Tamaño', example: '"más de 100 m²"' },
    { label: '📍 Ubicación', example: '"cerca de universidad"' },
    { label: '✨ Amenities', example: '"con piscina"' },
    { label: '🏷️ Tipo', example: '"Venta o Alquiler"' },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Sección de Capacidades de IA */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
        elevation={0}
      >
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ✨ ¿Qué puede entender nuestra IA?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Escribe búsquedas naturales combinando cualquiera de estos elementos:
          </Typography>

          <Grid container spacing={1}>
            {aiCapabilities.map((cap, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Chip
                  label={cap.label}
                  variant="outlined"
                  sx={{
                    fontWeight: 500,
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                  }}
                  title={`Ejemplo: ${cap.example}`}
                />
              </Grid>
            ))}
          </Grid>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            💡 Tip: Combina múltiples filtros para búsquedas más específicas
          </Typography>
        </Stack>
      </Paper>

      {/* Sección de Sugerencias */}
      <Stack spacing={2} mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          🎯 Búsquedas Sugeridas
        </Typography>

        <Grid container spacing={2}>
          {suggestedSearches.map((search, idx) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={idx}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={() => onSelectSuggestion(search.query)}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      fontSize: 32,
                      mb: 1,
                    }}
                  >
                    {search.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {search.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {search.description}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    fullWidth
                    size="small"
                    endIcon={<SearchIcon />}
                    onClick={() => onSelectSuggestion(search.query)}
                  >
                    Buscar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {/* Sección de Trending */}
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TrendingIcon sx={{ color: '#ff6b6b' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            🔥 Tendencias
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Búsquedas populares en tu zona:
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {trendingSearches.map((query, idx) => (
            <Chip
              key={idx}
              label={query}
              onClick={() => onSelectSuggestion(query)}
              variant="filled"
              color="primary"
              icon={<TrendingIcon />}
              sx={{
                cursor: 'pointer',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Sección de Tips */}
      <Paper
        sx={{
          p: 2,
          mt: 3,
          backgroundColor: '#f0f7ff',
          border: '1px solid #e0f2ff',
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            💡 Tips para mejores resultados:
          </Typography>
          <Typography variant="caption" component="div" sx={{ pl: 2 }}>
            • Sé específico: "2 habitaciones" vs "muchas habitaciones"
          </Typography>
          <Typography variant="caption" component="div" sx={{ pl: 2 }}>
            • Menciona ubicación: "cerca de estación" o "zona residencial"
          </Typography>
          <Typography variant="caption" component="div" sx={{ pl: 2 }}>
            • Incluye presupuesto: "menos de 500 USD" o "entre 400 y 600"
          </Typography>
          <Typography variant="caption" component="div" sx={{ pl: 2 }}>
            • Especifica tipo: "departamento", "casa", "oficina", etc.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AISearchSuggestions;

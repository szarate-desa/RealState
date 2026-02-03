import {
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Stack,
  Typography,
  Alert,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { useAISearch } from '../hooks/useAISearch';

interface AISearchBarProps {
  onSearch: (results: any) => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: string | null) => void;
}

/**
 * Componente de búsqueda inteligente por lenguaje natural
 * Permite escribir consultas naturales como:
 * "departamento con balcón cerca de la universidad, menos de 400 USD"
 */
export const AISearchBar = ({
  onSearch,
  onLoadingChange,
  onError,
}: AISearchBarProps) => {
  const [query, setQuery] = useState('');
  const { searchByNaturalLanguage, loading, error } = useAISearch();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      onError?.('Por favor escribe una búsqueda');
      return;
    }

    try {
      onLoadingChange?.(true);
      const results = await searchByNaturalLanguage(query);
      onSearch(results);
    } catch (err: any) {
      const errorMsg = err?.message || 'Error en la búsqueda';
      onError?.(errorMsg);
    } finally {
      onLoadingChange?.(false);
    }
  }, [query, searchByNaturalLanguage, onSearch, onError, onLoadingChange]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
      elevation={3}
    >
      <Stack spacing={2}>
        {/* Título y descripción */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <AutoAwesomeIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Búsqueda Inteligente por IA
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{ opacity: 0.9, fontSize: '0.85rem' }}
          >
            Describe lo que buscas de forma natural. Ejemplo: "departamento con
            balcón cerca de la universidad, menos de 400 USD"
          </Typography>
        </Box>

        {/* Campo de búsqueda */}
        <TextField
          fullWidth
          placeholder="Escribe tu búsqueda aquí..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              color: 'text.primary',
            },
            '& .MuiOutlinedInput-input::placeholder': {
              opacity: 0.7,
            },
          }}
          InputProps={{
            endAdornment: query && (
              <InputAdornment position="end">
                <Tooltip title="Limpiar búsqueda">
                  <CloseIcon
                    onClick={handleClear}
                    sx={{
                      cursor: 'pointer',
                      color: 'action.active',
                      '&:hover': { opacity: 0.7 },
                    }}
                  />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />

        {/* Botones de acción */}
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            sx={{
              backgroundColor: 'white',
              color: '#667eea',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </Stack>

        {/* Mensajes de error y estado */}
        {error && (
          <Alert
            severity="error"
            onClose={() => {}}
            sx={{
              backgroundColor: 'rgba(255, 77, 77, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            }}
          >
            {error}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default AISearchBar;

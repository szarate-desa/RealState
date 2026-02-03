import { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  MenuItem,
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from '../context/AuthContext.tsx';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) errors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (formData.telefono && !/^\+?[\d\s\-()]+$/.test(formData.telefono)) {
      errors.telefono = 'Teléfono inválido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Crear el usuario
      const registerData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        genero: formData.genero || null,
      };

      await api.post('/usuarios', registerData);

      // Hacer login automáticamente después del registro
      const loginRes = await api.post('/usuarios/login', {
        email: formData.email,
        password: formData.password,
      });

      const loginData = loginRes.data;
      if (loginData?.token) {
        login(loginData.token, loginData.refreshToken);
      } else {
        // Si el login falla, redirigir a la página de login
        navigate('/login');
      }
    } catch (err: any) {
      if (err?.response) {
        const server = err.response.data;
        setError(server?.error || 'Error al registrar usuario.');
      } else {
        setError('No se pudo conectar al servidor.');
      }
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Crear Cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Regístrate para publicar y gestionar tus propiedades
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="nombre"
                  label="Nombre"
                  name="nombre"
                  autoComplete="given-name"
                  autoFocus
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!validationErrors.nombre}
                  helperText={validationErrors.nombre}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="apellido"
                  label="Apellido"
                  name="apellido"
                  autoComplete="family-name"
                  value={formData.apellido}
                  onChange={handleChange}
                  error={!!validationErrors.apellido}
                  helperText={validationErrors.apellido}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="telefono"
                  label="Teléfono (opcional)"
                  name="telefono"
                  autoComplete="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  error={!!validationErrors.telefono}
                  helperText={validationErrors.telefono}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="fecha_nacimiento"
                  label="Fecha de nacimiento (opcional)"
                  name="fecha_nacimiento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="genero"
                  label="Género (opcional)"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                >
                  <MenuItem value="">Prefiero no decir</MenuItem>
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Femenino</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password || 'Mínimo 6 caracteres'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!validationErrors.confirmPassword}
                  helperText={validationErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Crear Cuenta'
              )}
            </Button>

            {/* Botones secundarios */}
            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Ya tengo cuenta
              </Button>
              <Button
                fullWidth
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/explore')}
                disabled={loading}
                sx={{ color: 'text.secondary' }}
              >
                Volver a explorar
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;

import { createContext, useState, useContext, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { ReactNode } from 'react';
import api from '../pages/api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        // No token: ensure auth header removed and finish quickly
        delete api.defaults.headers.common['Authorization'];
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await api.get('/usuarios/verify');
      } catch (error: any) {
        // If token invalid/expired, clear it silently for visitor UX
        const status = error?.response?.status;
        if (status === 401) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setSessionExpired(true);
        } else {
          console.error('Error verifying auth:', error);
        }
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  // Auto-refresh token before expiry (refresh 1 min before expiration)
  useEffect(() => {
    if (!token || !refreshToken) return;

    // Decode token to get expiry time (JWT format: header.payload.signature)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilRefresh = expiresAt - now - 60000; // Refresh 1 min before expiry

      if (timeUntilRefresh > 0) {
        const refreshTimer = setTimeout(async () => {
          try {
            const response = await api.post('/usuarios/refresh', { refreshToken });
            const newToken = response.data.token;
            localStorage.setItem('token', newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            setToken(newToken);
          } catch (error) {
            console.error('Error al refrescar token:', error);
            logout(); // If refresh fails, log out
            setSessionExpired(true);
          }
        }, timeUntilRefresh);

        return () => clearTimeout(refreshTimer);
      }
    } catch (error) {
      console.error('Error al decodificar token:', error);
    }
  }, [token, refreshToken]);

  const login = (newToken: string, newRefreshToken?: string) => {
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
      setRefreshToken(newRefreshToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setRefreshToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
      <Snackbar
        open={sessionExpired}
        autoHideDuration={5000}
        onClose={() => setSessionExpired(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setSessionExpired(false)} sx={{ width: '100%' }}>
          Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

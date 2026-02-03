import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../pages/api';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Badge,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Business,
  Person,
  ExitToApp,
  Search,
  Notifications,
  Add,
  LocationOn,
  Settings,
  KeyboardArrowDown,
} from '@mui/icons-material';

const drawerWidth = 280;

interface MainLayoutProps {
  children: React.ReactNode;
  toolbarContent?: React.ReactNode; // Contenido personalizado para el toolbar
}

import { useAuth } from '../context/AuthContext.tsx';

const MainLayout = ({ children, toolbarContent }: MainLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [myPropertiesCount, setMyPropertiesCount] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();

  // Obtener contadores dinámicos
  useEffect(() => {
    if (!isAuthenticated) return; // Solo obtener estadísticas si el usuario está autenticado
    
    const fetchUserStats = async () => {
      try {
        const response = await api.get('/usuarios/stats/counts');
        setMyPropertiesCount(response.data.myPropertiesCount || 0);
      } catch (error: any) {
        // 401 Unauthorized: probablemente el token no está configurado aún
        // 403 Forbidden: usuario no tiene permiso
        // Otros errores se ignoran silenciosamente para no interrumpir UX
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.debug('Usuario no autenticado para obtener estadísticas');
        }
        // No hacer nada - mantener valores por defecto de 0
      }
    };
    
    fetchUserStats();
  }, [isAuthenticated]);

  const menuItems = isAuthenticated
    ? [
        { text: 'Explorar', icon: <Search />, path: '/explore', badge: null },
        { text: 'Mis Propiedades', icon: <Business />, path: '/properties', badge: myPropertiesCount || null },
      ]
    : [
        { text: 'Explorar', icon: <Search />, path: '/explore', badge: null },
        { text: 'Iniciar Sesión', icon: <Person />, path: '/login', badge: null },
      ];

  const notifications = [
    { id: 1, text: 'Nueva propiedad disponible en tu zona', time: '5m', unread: true },
    { id: 2, text: 'Tu oferta fue aceptada', time: '1h', unread: true },
    { id: 3, text: 'Recordatorio: Visita programada mañana', time: '2h', unread: false },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      {/* Logo y Brand */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <LocationOn sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
            Real Estate
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Tu hogar ideal
          </Typography>
        </Box>
      </Box>

      {/* User Profile Card */}
      <Box sx={{ p: 2 }}>
        {isAuthenticated ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
              }}
            >
              US
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                Usuario Autenticado
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Sesión activa
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ color: 'text.secondary' }} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 2,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Bienvenido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inicia sesión para publicar y gestionar propiedades.
            </Typography>
            <Box>
              <ListItemButton
                onClick={() => navigate('/login')}
                sx={{
                  mt: 1,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><Person /></ListItemIcon>
                <ListItemText primary="Iniciar Sesión" />
              </ListItemButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* Main Navigation */}
      <List sx={{ px: 2, flex: 1, overflow: 'auto' }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: isActive(item.path) ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'white' : 'text.secondary',
                  minWidth: 40,
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: isActive(item.path) ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Bottom Actions */}
      {isAuthenticated && (
        <Box sx={{ p: 2 }}>
          <ListItemButton
            onClick={() => handleNavigate('/settings')}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              mb: 1,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItemButton>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: 'error.main',
              border: '1px solid',
              borderColor: 'error.light',
              '&:hover': {
                bgcolor: 'error.light',
                borderColor: 'error.main',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
              {menuItems.find(item => isActive(item.path))?.text || 'Real Estate App'}
            </Typography>
          </Box>

          {/* Contenido personalizado del toolbar (controles de vista desde Explore) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {toolbarContent}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, minWidth: 200 },
        }}
      >
        <MenuItem onClick={() => { handleNavigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={() => { handleNavigate('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon><ExitToApp fontSize="small" color="error" /></ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, width: 320, maxHeight: 400 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notificaciones
          </Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            sx={{
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: notification.unread ? 'action.hover' : 'transparent',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {notification.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                hace {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer', fontWeight: 600 }}
            onClick={handleNotificationsClose}
          >
            Ver todas
          </Typography>
        </Box>
      </Menu>

      {/* Drawer Navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
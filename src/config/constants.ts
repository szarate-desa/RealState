// Central configuration file for application constants
// Uses environment variables with fallbacks

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const MAP_CONFIG = {
  defaultCenter: {
    lat: parseFloat(import.meta.env.VITE_DEFAULT_MAP_CENTER_LAT || '-25.2637'),
    lng: parseFloat(import.meta.env.VITE_DEFAULT_MAP_CENTER_LNG || '-57.5759'),
  },
  defaultZoom: parseInt(import.meta.env.VITE_DEFAULT_MAP_ZOOM || '12', 10),
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
};

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 50,
};

export const IMAGE_PLACEHOLDERS = {
  property: 'https://via.placeholder.com/400x300?text=Sin+Imagen',
  avatar: 'https://via.placeholder.com/100x100?text=User',
};

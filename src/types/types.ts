export interface Property {
  id: string;
  titulo: string;
  descripcion: string;
  
  // Precio unificado para simplificar la UI
  precio: number; 
  
  // Para saber si es venta o alquiler
  tipo_transaccion: 'Venta' | 'Alquiler'; 
  
  // Datos de ubicación
  latitud: number;
  longitud: number;
  direccion: string;
  barrio: string;
  ciudad: string;

  // Datos de imágenes
  imagen_principal: string; // URL de la imagen de portada
  imagenes: string[];       // Array de URLs para imágenes adicionales

  // Características
  numero_habitaciones: number;
  numero_banos: number;
  superficie_total: number;
  tipo_propiedad: string;
  amenities?: string[]; // Lista opcional de amenidades

  // Estado manejado en el frontend
  isFavorite?: boolean;
}


export interface User {
    email: string;
    name: string;
}

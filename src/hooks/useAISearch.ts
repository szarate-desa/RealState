import { useState, useCallback } from 'react';
import type { Property } from '../types/types';
import api from '../pages/api';

interface AISearchFilters {
  original_query?: string;
  extracted_filters?: {
    tipo_propiedad?: string;
    amenities?: string[];
    precio_max?: number;
    precio_min?: number;
    superficie_min?: number;
    superficie_max?: number;
    habitaciones_min?: number;
    banos_min?: number;
    tipo_transaccion?: 'Venta' | 'Alquiler';
    ubicacion_palabra_clave?: string;
    query?: string;
  };
}

interface AISearchResponse {
  success: boolean;
  appliedFilters: AISearchFilters;
  results: Property[];
  count: number;
  offset: number;
  limit: number;
}

export const useAISearch = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<AISearchFilters | null>(null);

  /**
   * Ejecuta búsqueda inteligente por lenguaje natural
   */
  const searchByNaturalLanguage = useCallback(
    async (query: string, limit = 20, offset = 0) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<AISearchResponse>('/ai-search', {
          query,
          limit,
          offset,
        });

        setProperties(response.data.results);
        setAppliedFilters(response.data.appliedFilters);

        return response.data;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error ||
          err?.message ||
          'Error al realizar la búsqueda inteligente';
        setError(errorMessage);
        setProperties([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Obtiene explicación de qué filtros se extrajeron sin hacer búsqueda
   */
  const explainQuery = useCallback(async (query: string) => {
    try {
      const response = await api.post('/ai-search/explain', { query });
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || 'Error al procesar la consulta';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Limpia los resultados de búsqueda
   */
  const clearSearch = useCallback(() => {
    setProperties([]);
    setAppliedFilters(null);
    setError(null);
  }, []);

  return {
    properties,
    loading,
    error,
    appliedFilters,
    searchByNaturalLanguage,
    explainQuery,
    clearSearch,
  };
};

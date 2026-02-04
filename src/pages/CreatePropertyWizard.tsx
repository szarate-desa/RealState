import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api';

// Importa los componentes de los pasos (a crear)
import StepUbicacion from '../components/steps/StepUbicacion';
import StepDescripcion from '../components/steps/StepDescripcion';
// import StepProcesamiento from '../components/steps/StepProcesamiento';
import StepRevision from '../components/steps/StepRevision';
import StepImages from '../components/steps/StepImages';

// Estado inicial de la propiedad
interface PropertyData {
  titulo: string;
  descripcion: string;
  id_inmueble_tipo: string;
  id_ciudad: string;
  precio_venta: string;
  precio_alquiler: string;
  direccion: string;
  barrio: string;
  codigo_postal: string;
  numero_habitaciones: string;
  numero_banos: string;
  superficie_total: string;
  latitud: string;
  longitud: string;
  id_departamento: string;
  departamentoNombre: string;
  paisNombre: string;
  ciudadNombre: string;
  id_ubicacion?: number;
  audioUri: any;
  images: any[];
}

const initialPropertyData: PropertyData = {
  titulo: '',
  descripcion: '',
  id_inmueble_tipo: '',
  id_ciudad: '',
  precio_venta: '',
  precio_alquiler: '',
  direccion: '',
  barrio: '',
  codigo_postal: '',
  numero_habitaciones: '0',
  numero_banos: '0',
  superficie_total: '0',
  latitud: '',
  longitud: '',
  id_departamento: '',
  departamentoNombre: '',
  paisNombre: '',
  ciudadNombre: '',
  id_ubicacion: undefined,
  audioUri: null,
  images: [],
};

const CustomProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;
  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', marginBottom: '10px' }}>
      <div
        style={{
          width: `${progressPercentage}%`,
          backgroundColor: '#007bff',
          height: '10px',
          borderRadius: '5px',
        }}
      ></div>
    </div>
  );
};

export default function CreatePropertyWizard() {
  const { id } = useParams<{ id: string }>(); // ID de propiedad para edición
  const isEditMode = Boolean(id);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [loading, setLoading] = useState(false);
  
  // Estados para datos de la UI (selectores, etc.)
  const [tipos, setTipos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  // Cargar propiedad existente si es modo edición
  useEffect(() => {
    if (isEditMode && id) {
      const loadProperty = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/propiedades/${id}`);
          const property = response.data;
          
          // Mapear datos de la propiedad al formato del wizard
          setPropertyData({
            titulo: property.titulo || '',
            descripcion: property.descripcion || '',
            id_inmueble_tipo: property.id_inmueble_tipo || '',
            id_ciudad: property.id_ciudad || '',
            precio_venta: property.precio_venta?.toString() || '',
            precio_alquiler: property.precio_alquiler?.toString() || '',
            direccion: property.direccion || '',
            barrio: property.barrio || '',
            codigo_postal: property.codigo_postal || '',
            numero_habitaciones: property.numero_habitaciones?.toString() || '0',
            numero_banos: property.numero_banos?.toString() || '0',
            superficie_total: property.superficie_total?.toString() || '0',
            latitud: property.latitud?.toString() || '',
            longitud: property.longitud?.toString() || '',
            id_departamento: property.id_departamento || '',
            departamentoNombre: property.departamento || '',
            paisNombre: property.pais || '',
            ciudadNombre: property.ciudad || '',
            id_ubicacion: property.id_ubicacion,
            audioUri: null,
            images: property.imagenes || [],
          });
        } catch (error) {
          console.error('Error al cargar la propiedad:', error);
          alert('Error al cargar los datos de la propiedad');
        } finally {
          setLoading(false);
        }
      };
      loadProperty();
    }
  }, [isEditMode, id]);

  // Cargar datos para los selectores al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiposRes, departamentosRes, ciudadesRes] = await Promise.all([
          api.get('/cat-inmueble-tipo'),
          api.get('/cat-departamentos'),
          api.get('/cat-ciudades'),
        ]);
        setTipos(tiposRes.data || []);
        setDepartamentos(departamentosRes.data || []);
        setCiudades(ciudadesRes.data || []);
      } catch (e) {
        console.error('No se pudieron cargar los datos para los selectores.', e);
      }
    };
    fetchData();
  }, []);

  const handleNextStep = async (data: Partial<typeof initialPropertyData>) => {
    console.log('[Wizard] handleNextStep - Paso actual:', currentStep, 'Datos recibidos:', data);

    // Paso 1: Ubicación, crear ubicación en backend y obtener id_ubicacion
    if (currentStep === 1) {
      if (!data.latitud || !data.longitud || !data.direccion || !data.paisNombre || !data.departamentoNombre || !data.ciudadNombre) {
        alert('Debe completar todos los campos de ubicación antes de continuar.');
        return;
      }
      try {
        const resp = await api.post('/propiedad_ubicacion', {
          paisNombre: data.paisNombre,
          departamentoNombre: data.departamentoNombre,
          ciudadNombre: data.ciudadNombre,
          direccion: data.direccion,
          barrio: data.barrio,
          latitud: data.latitud,
          longitud: data.longitud,
          codigo_postal: data.codigo_postal || null
        });
        if (!resp.data || !resp.data.id_ubicacion) {
          alert('No se pudo crear la ubicación.');
          return;
        }
        setPropertyData((prev) => {
          const merged = { ...prev, ...data, id_ubicacion: resp.data.id_ubicacion };
          console.log('[Wizard] Estado global actualizado (ubicación creada):', merged);
          return merged;
        });
        setCurrentStep((prev) => prev + 1);
      } catch (err) {
        console.error('Error creando ubicación:', err);
        alert('No se pudo crear la ubicación.');
      }
      return;
    }

    // Paso 2 y siguientes: solo guardar y avanzar
    setPropertyData((prev) => {
      const merged = { ...prev, ...data };
      console.log('[Wizard] Estado global actualizado:', merged);
      return merged;
    });

    // Validaciones para los siguientes pasos
    switch (currentStep) {
      case 2:
        if (!data.titulo || !data.descripcion || !data.id_inmueble_tipo || !data.superficie_total) {
          alert('Debe completar todos los campos de detalles antes de continuar.');
          return;
        }
        break;
      case 3:
        if (!data.images || data.images.length === 0) {
          alert('Debe subir al menos una imagen antes de continuar.');
          return;
        }
        break;
      default:
        break;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const steps = ['Ubicación', 'Detalles del Inmueble', 'Imágenes', 'Vista Previa y Publicación'];

  const handlePrevStep = (targetStep?: number) => {
    setCurrentStep((prev) => {
      const next = typeof targetStep === 'number' ? targetStep : prev - 1;
      return Math.max(1, Math.min(steps.length, next));
    });
  };

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (finalData: typeof initialPropertyData) => {
    console.log('[Wizard] handleSubmit - Datos finales:', finalData);
    const fullData = finalData;
    const { images: rawImages } = fullData;

    // Validaciones
    if (!fullData.titulo) {
      alert('Debe proporcionar un título para la propiedad.');
      return;
    }
    if (!fullData.descripcion) {
      alert('Debe proporcionar una descripción para la propiedad.');
      return;
    }
    if (!fullData.id_ubicacion) {
      alert('No se ha creado la ubicación.');
      return;
    }
    if (rawImages.length === 0) {
      alert('Debe subir al menos una imagen.');
      return;
    }
    if (!fullData.precio_venta && !fullData.precio_alquiler) {
      alert('Debe proporcionar un precio de venta o alquiler.');
      return;
    }
    if (!fullData.superficie_total || parseFloat(fullData.superficie_total) <= 0) {
      alert('La superficie total debe ser un número positivo.');
      return;
    }

    // Solo enviar id_ubicacion y los datos relevantes
    const plainPayload = {
      id_ubicacion: fullData.id_ubicacion,
      id_inmueble_tipo: fullData.id_inmueble_tipo,
      titulo: fullData.titulo,
      descripcion: fullData.descripcion,
      numero_habitaciones: (fullData.numero_habitaciones === '' || fullData.numero_habitaciones === undefined) ? null : parseInt(fullData.numero_habitaciones, 10),
      numero_banos: (fullData.numero_banos === '' || fullData.numero_banos === undefined) ? null : parseInt(fullData.numero_banos, 10),
      superficie_total: parseInt(fullData.superficie_total, 10),
      precio_venta: (fullData.precio_venta === '' || fullData.precio_venta === undefined) ? null : parseFloat(fullData.precio_venta),
      precio_alquiler: (fullData.precio_alquiler === '' || fullData.precio_alquiler === undefined) ? null : parseFloat(fullData.precio_alquiler),
    };

    try {
      console.log('[Wizard] Enviando payload a backend:', plainPayload);
      
      let propertyId: string;
      
      if (isEditMode && id) {
        // Modo edición: actualizar propiedad existente
        const response = await api.put(`/propiedades/${id}`, plainPayload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const responseData = response.data;
        console.log('[Wizard] Respuesta backend actualización propiedad:', responseData);
        if (!response.status.toString().startsWith('2')) throw new Error(responseData.error || 'Error al actualizar la propiedad.');

        propertyId = id;
      } else {
        // Modo creación: crear nueva propiedad
        const response = await api.post('/propiedades', plainPayload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const responseData = response.data;
        console.log('[Wizard] Respuesta backend creación propiedad:', responseData);
        if (!response.status.toString().startsWith('2')) throw new Error(responseData.error || 'Error al crear la propiedad.');

        propertyId = responseData.id;
      }

      // 2. Subir imágenes (solo si hay imágenes nuevas de tipo File)
      if (rawImages && rawImages.length > 0 && rawImages[0] instanceof File) {
        try {
          const formData = new FormData();
          (rawImages as File[]).forEach((f) => formData.append('files', f));
          console.log('[Wizard] Subiendo imágenes:', rawImages);

          const uploadResp = await api.post(`/propiedades/${propertyId}/imagenes`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });

          const uploadData = uploadResp.data;
          console.log('[Wizard] Respuesta backend subida imágenes:', uploadData);
          if (!uploadResp.status.toString().startsWith('2')) throw new Error(uploadData.error || 'Error subiendo imágenes.');

        } catch (upErr: any) {
          console.error('[Wizard] Error subiendo imágenes a la propiedad:', upErr);
          alert(`La propiedad fue ${isEditMode ? 'actualizada' : 'creada'} pero hubo un problema subiendo las imágenes.`);
        }
      }

      alert(`Propiedad ${isEditMode ? 'actualizada' : 'creada'} correctamente.`);
      navigate(isEditMode ? '/properties' : '/explore');

    } catch (err: any) {
      console.error('[Wizard] Error en handleSubmit:', err);
      alert(err.message || `Error desconocido al ${isEditMode ? 'actualizar' : 'crear'} la propiedad.`);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return <StepUbicacion onNext={handleNextStep} onBack={currentStep > 1 ? handlePrevStep : undefined} initialData={propertyData} departamentos={departamentos} ciudades={ciudades} />;
      case 2:
        if (!tipos || tipos.length === 0) {
          return <div>Cargando tipos de propiedad...</div>;
        }
        return <StepDescripcion onNext={handleNextStep} onBack={handlePrevStep} tipos={tipos} propertyData={propertyData} />;
      case 3:
        return <StepImages onNext={handleNextStep} onBack={handlePrevStep} initialData={propertyData} />;
      case 4:
        return <StepRevision onBack={handlePrevStep} onSubmit={handleSubmit} initialData={propertyData} loading={false} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando datos de la propiedad...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{isEditMode ? 'Editar Propiedad' : 'Publicar Propiedad'}</h1>
      <CustomProgressBar currentStep={currentStep} totalSteps={steps.length} />
      <div>{renderStepContent(currentStep)}</div>
    </div>
  );
}

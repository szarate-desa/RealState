import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface StepImagesProps {
  onNext: (data: { images: (File | string)[] }) => void;
  onBack: () => void;
  initialData: { images: (File | string)[] };
}

const MAX_FILE_SIZE = Infinity; // sin límite de tamaño
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGES = 20;

const StepImages: React.FC<StepImagesProps> = ({ onNext, onBack, initialData }) => {
  const [files, setFiles] = useState<(File | string)[]>(initialData.images || []);
  const [previews, setPreviews] = useState<string[]>(
    (initialData.images || []).map(f => 
      typeof f === 'string' ? f : URL.createObjectURL(f)
    )
  );
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    setFiles(initialData.images || []);
    setPreviews((initialData.images || []).map(f => 
      typeof f === 'string' ? f : URL.createObjectURL(f)
    ));
  }, [initialData]);

  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: File[] = [];
    const currentTotalFiles = files.length;

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];

      // Validate max number of images
      if (currentTotalFiles + validFiles.length >= MAX_IMAGES) {
        alert(`Se ha alcanzado el número máximo de ${MAX_IMAGES} imágenes.`);
        break; // Stop processing further files
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(`El archivo ${file.name} no es un tipo de imagen permitido (JPG, PNG, WEBP).`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`El archivo ${file.name} excede el tamaño máximo permitido de ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Cleanup object URLs for File objects only
    if (previews[index] && typeof files[index] !== 'string') {
      URL.revokeObjectURL(previews[index]);
    }
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const makePrimary = (index: number) => {
    if (index === 0) return; // Already primary
    const newFiles = [...files];
    const newPreviews = [...previews];

    // Move the selected item to the beginning
    const [movedFile] = newFiles.splice(index, 1);
    newFiles.unshift(movedFile);
    const [movedPreview] = newPreviews.splice(index, 1);
    newPreviews.unshift(movedPreview);

    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleNext = () => {
    onNext({ images: files });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <h2>Step 3: Imágenes</h2>
      <Box
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.400',
          borderRadius: 1,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragging ? 'primary.light' : 'transparent',
          transition: 'background-color 0.3s ease',
        }}
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <CloudUploadIcon sx={{ fontSize: 60, color: 'grey.500' }} />
          <Typography variant="h6">Arrastra y suelta tus imágenes aquí</Typography>
          <Typography variant="body2" color="text.secondary">o haz clic para seleccionar archivos</Typography>
          <Button variant="contained" sx={{ mt: 2 }}>Seleccionar Archivos</Button>
        </label>
      </Box>

      {previews.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {previews.map((p, idx) => (
            <Box key={idx} sx={{ position: 'relative', width: 120, height: 80, border: '1px solid #ddd' }}>
              <img src={p} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => removeFile(idx)}
                sx={{ position: 'absolute', top: 0, right: 0, minWidth: 'unset', width: 24, height: 24, p: 0, zIndex: 1 }}
              >
                x
              </Button>
              {idx !== 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => makePrimary(idx)}
                  sx={{ position: 'absolute', bottom: 0, left: 0, minWidth: 'unset', width: 24, height: 24, p: 0, zIndex: 1 }}
                >
                  ★
                </Button>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <button onClick={onBack}>Back</button>
        <button onClick={handleNext} disabled={files.length === 0}>Next</button>
      </Box>
    </Box>
  );
};

export default StepImages;

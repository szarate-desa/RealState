import { Chip } from '@mui/material';
import { 
  CheckCircle, 
  Pause, 
  Edit, 
  Archive 
} from '@mui/icons-material';

type PropertyStatus = 'activa' | 'pausada' | 'borrador' | 'archivada';

interface PropertyStatusChipProps {
  status: PropertyStatus;
  size?: 'small' | 'medium';
}

const statusConfig: Record<PropertyStatus, {
  label: string;
  color: 'success' | 'warning' | 'info' | 'default';
  icon: React.ReactElement;
}> = {
  activa: {
    label: 'Activa',
    color: 'success',
    icon: <CheckCircle fontSize="small" />
  },
  pausada: {
    label: 'Pausada',
    color: 'warning',
    icon: <Pause fontSize="small" />
  },
  borrador: {
    label: 'Borrador',
    color: 'info',
    icon: <Edit fontSize="small" />
  },
  archivada: {
    label: 'Archivada',
    color: 'default',
    icon: <Archive fontSize="small" />
  }
};

export function PropertyStatusChip({ status, size = 'small' }: PropertyStatusChipProps) {
  const config = statusConfig[status] || statusConfig.activa;

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          fontSize: '1rem'
        }
      }}
    />
  );
}

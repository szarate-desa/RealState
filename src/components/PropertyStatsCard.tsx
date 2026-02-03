import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { 
  Visibility, 
  Favorite, 
  CalendarToday,
  TrendingUp 
} from '@mui/icons-material';

interface PropertyStats {
  visitas: number;
  favoritos: number;
  diasPublicada: number;
  promedioVistasDiarias: string | number;
}

interface PropertyStatsCardProps {
  stats: PropertyStats;
}

const StatItem = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactElement; 
  label: string; 
  value: string | number;
  color: string;
}) => (
  <Grid size={{ xs: 6, sm: 3 }}>
    <Box 
      sx={{ 
        textAlign: 'center',
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.default'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 1,
          color
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Grid>
);

export function PropertyStatsCard({ stats }: PropertyStatsCardProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Estadísticas
        </Typography>
        <Grid container spacing={2}>
          <StatItem
            icon={<Visibility fontSize="large" />}
            label="Vistas totales"
            value={stats.visitas || 0}
            color="primary.main"
          />
          <StatItem
            icon={<Favorite fontSize="large" />}
            label="Favoritos"
            value={stats.favoritos || 0}
            color="error.main"
          />
          <StatItem
            icon={<CalendarToday fontSize="large" />}
            label="Días publicada"
            value={stats.diasPublicada || 0}
            color="info.main"
          />
          <StatItem
            icon={<TrendingUp fontSize="large" />}
            label="Vistas/día"
            value={stats.promedioVistasDiarias || 0}
            color="success.main"
          />
        </Grid>
      </CardContent>
    </Card>
  );
}

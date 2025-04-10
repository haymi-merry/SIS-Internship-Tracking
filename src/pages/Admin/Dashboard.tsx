import { Container } from '@mui/material';
import { DashboardStats } from './DashboardStats';

export const AdminDashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <DashboardStats />
    </Container>
  );
};
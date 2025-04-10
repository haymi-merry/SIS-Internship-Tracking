import { Container, Box, Typography, Button, Stack, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ActionCards } from './ActionCards';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { StudentTable } from './StudentTable';
import { api, StudentsResponse } from '../../../InternApi/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { TelegramBotDialog } from '../../../TelegramBot/TelegeramBotDialog';
import { Send as SendIcon } from '@mui/icons-material';

export const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState<StudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getStudents();
        
        if (response.error) {
          throw new Error(response.error);
        }
    
        // Make sure the response data matches the expected structure
        if (response.data && Array.isArray(response.data.students)) {
          setData(response.data);
        } else {
          throw new Error('Invalid data structure received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await api.getStudents();
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      navigate('/advisor/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
          {error}
          <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>No data available</Typography>
      </Box>
    );
  }

  const pendingApprovalsCount = data.students.filter(
    student => student.offer_letter?.status === 'pending'
  ).length;

  const reportsToReviewCount = data.students.reduce(
    (count, student) => count + (student.internship_reports?.filter(
      report => report.status === 'pending_review'
    ).length || 0),
    0
  );

  const ongoingStudentsCount = data.students.filter(
    student => student.status === 'Ongoing'
  ).length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Advisor Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            onClick={() => setTelegramDialogOpen(true)}
            sx={{ backgroundColor: '#0088cc' }}
          >
            Telegram Bot
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Stack>

      <Box mb={4}>
        <ActionCards 
          pendingApprovals={pendingApprovalsCount}
          reportsToReview={reportsToReviewCount}
          ongoingStudents={ongoingStudentsCount}
          onPendingApprovalsClick={() => document.getElementById('approval-workflow')?.scrollIntoView({ behavior: 'smooth' })}
          onReportsToReviewClick={() => document.getElementById('approval-workflow')?.scrollIntoView({ behavior: 'smooth' })}
          onOngoingStudentsClick={() => navigate('/advisor/students?status=Ongoing')}
        />
      </Box>

      <Grid container spacing={4} id="approval-workflow">
        <Grid item xs={12} md={6}>
          <ApprovalWorkflow 
            students={data.students}
            onUpdate={handleUpdate}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StudentTable 
            students={data.students.filter(s => s.status === 'Ongoing')}
            onStudentClick={(studentId) => navigate(`/advisor/students/${studentId}`)}
          />
        </Grid>
      </Grid>

      <TelegramBotDialog 
        open={telegramDialogOpen}
        onClose={() => setTelegramDialogOpen(false)}
        students={data.students}
      />
    </Container>
  );
};
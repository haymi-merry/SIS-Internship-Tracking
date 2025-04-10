import { Box, Button, Container, Grid, Typography, useTheme } from '@mui/material';
import { Description, Chat, CheckCircle, School, SupervisorAccount, Business } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const Home = () => {
  const theme = useTheme();

  return (
    <Box>
      
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        py: 12
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Internship Tracking System
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            A comprehensive platform for managing internships in the School of Information Science at Addis Ababa University
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/advisor/dashboard"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
              mr: 2
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

     
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Who uses InternTrack?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 4, 
              bgcolor: 'primary.light',
              borderRadius: 2,
              height: '100%'
            }}>
              <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Students
              </Typography>
              <Typography>
                Track applications, submit documents, and communicate with supervisors.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 4, 
              bgcolor: 'success.light',
              borderRadius: 2,
              height: '100%'
            }}>
              <SupervisorAccount sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Supervisors
              </Typography>
              <Typography>
                Manage student internships, evaluate progress, and provide guidance.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 4, 
              bgcolor: 'secondary.light',
              borderRadius: 2,
              height: '100%'
            }}>
              <Business sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Companies
              </Typography>
              <Typography>
                Post opportunities, review applications, and communicate with interns.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

     
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Key Features
          </Typography>
          <Typography textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Our platform streamlines the internship process with powerful tools for all stakeholders.
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Description sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Document Management
                </Typography>
                <Typography color="text.secondary">
                  Securely upload, store, and share documents. Track approval status in real-time.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Chat sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Real-time Communication
                </Typography>
                <Typography color="text.secondary">
                  Chat directly with supervisors, students, and companies all within the platform.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Progress Tracking
                </Typography>
                <Typography color="text.secondary">
                  Monitor internship progress with customizable milestones and evaluations.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

    
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography sx={{ mb: 4 }}>
            Join our platform today and simplify your internship management process.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/admin/dashboard"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              }
            }}
          >
            Log In Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};
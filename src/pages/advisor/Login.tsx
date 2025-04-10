import { useState } from 'react';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Link,
  Alert
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { api } from '../../InternApi/api';

export const AdvisorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data, error } = await api.login(formData);
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        navigate('/advisor/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Advisor Login
          </Typography>
          <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Access your advisor dashboard
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              Log In
            </Button>
            
            <Typography textAlign="center" sx={{ mt: 2 }}>
              Don't have an account?{' '}
              <Link component={RouterLink} to="/advisor/signup">
                Sign up here
              </Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
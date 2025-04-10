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

export const AdvisorSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { error } = await api.register(formData);
      
      if (error) {
        throw new Error(error);
      }

      navigate('/advisor/login');
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
            Advisor Registration
          </Typography>
          <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Create your advisor account
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
              label="First Name"
              margin="normal"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
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
              Register
            </Button>
            
            <Typography textAlign="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/advisor/login">
                Login here
              </Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};
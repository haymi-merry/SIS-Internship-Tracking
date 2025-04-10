import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Alert,
  AlertTitle,
  CircularProgress,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { 
  Save as SaveIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { api } from '../../InternApi/api';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await api.getProfile();
        
        if (error) {
          throw new Error(error);
        }

        if (data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone_number: data.phone_number || '',
            email: data.email || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setError(null);
    setIsSaving(true);
    
    try {
      const { data, error } = await api.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
      });
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        setProfile({
          ...profile,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/login');
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardHeader
          title="My Profile"
          titleTypographyProps={{ variant: 'h4' }}
        />
        
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Email"
              value={profile.email}
              disabled
              fullWidth
            />
            
            <TextField
              label="First Name"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              disabled={!isEditing || isSaving}
              fullWidth
            />
            
            <TextField
              label="Last Name"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              disabled={!isEditing || isSaving}
              fullWidth
            />
            
            <TextField
              label="Phone Number"
              value={profile.phone_number}
              onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
              disabled={!isEditing || isSaving}
              fullWidth
            />
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          {isEditing ? (
            <Box>
              <Button
                variant="contained"
                onClick={handleUpdateProfile}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ mr: 2 }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              startIcon={<EditIcon />}
            >
              Edit Profile
            </Button>
          )}
          
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
};

export default Profile;
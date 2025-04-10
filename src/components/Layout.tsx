import { AppBar, Box, Container, IconButton, Toolbar, Typography, Button, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme as useAppTheme } from '@its/shared-hooks';
import { Link } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" color="transparent" sx={{ bgcolor: 'background.default' }}>
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ 
            flexGrow: 1, 
            textDecoration: 'none',
            color: 'text.primary'
          }}>
            InternTrack - School of Information Science
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button component={Link} to="/advisor/login" color="inherit">
              Advisor Login
            </Button>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Box component="footer" sx={{ py: 3, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} InternTrack - School of Information Science, AAU
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link to="/about" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
                About
              </Link>
              <Link to="/privacy" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
                Privacy
              </Link>
              <Link to="/terms" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
                Terms
              </Link>
              <Link to="/contact" style={{ color: theme.palette.text.secondary, textDecoration: 'none' }}>
                Contact
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
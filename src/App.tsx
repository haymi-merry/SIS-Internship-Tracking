import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import { useTheme } from '@its/shared-hooks';
import { Layout } from './components/Layout';
import { Routes } from './routes';

function App() {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes />
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
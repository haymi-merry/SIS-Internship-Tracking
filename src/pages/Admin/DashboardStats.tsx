import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  Paper
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { api } from '../../InternApi/api';

export const DashboardStats = () => {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    ongoingStudents: 0,
    completedStudents: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsResponse, advisorsResponse] = await Promise.all([
          api.getAdminStudents(),
          api.getAdvisors()
        ]);

        if (studentsResponse.error || advisorsResponse.error) {
          throw new Error(studentsResponse.error || advisorsResponse.error);
        }

        const studentsData = studentsResponse.data || [];
        setStudents(studentsData);
        setAdvisors(advisorsResponse.data || []);

      
        setStats({
          totalStudents: studentsData.length,
          pendingStudents: studentsData.filter(s => s.status === 'Pending').length,
          ongoingStudents: studentsData.filter(s => s.status === 'Ongoing').length,
          completedStudents: studentsData.filter(s => s.status === 'Completed').length
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const [manualUsername, setManualUsername] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);


const handleAssignAdvisor = async () => {
  if (!selectedStudent) {
    setError('Please select a student');
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    let usernameToUse = '';
    if (useManualInput) {
      if (!manualUsername.trim()) {
        throw new Error('Please enter an advisor username');
      }
      // Capitalize first letter of manual input
      usernameToUse = manualUsername.trim().charAt(0).toUpperCase() + 
                     manualUsername.trim().slice(1).toLowerCase();
    } else {
      if (!selectedAdvisor) {
        throw new Error('Please select an advisor');
      }
      const advisor = advisors.find(a => a.id === selectedAdvisor);
      if (!advisor) {
        throw new Error('Selected advisor not found');
      }
      // Ensure first letter is capitalized (exact match to backend)
      usernameToUse = advisor.first_name.charAt(0).toUpperCase() + 
                     advisor.first_name.slice(1).toLowerCase();
    }

    console.log('Attempting to assign advisor with username:', usernameToUse);
    
    const response = await api.assignAdvisor(selectedStudent, usernameToUse);
    
    if (response.error) {
      throw new Error(response.error);
    }

    // Show success
    alert(`Success! ${response.data?.message || 'Advisor assigned'}`);
    
    // Reset form
    setManualUsername('');
    setSelectedStudent(null);
    setSelectedAdvisor(null);
    
    // Refresh data
    const studentsResponse = await api.getAdminStudents();
    setStudents(studentsResponse.data || []);
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Assignment failed';
    setError(errorMessage);
    
    // Enhanced error message for username mismatch
    if (errorMessage.includes('No Advisor matches')) {
      setError(`${errorMessage}. Valid advisor usernames are: ${
        advisors.map(a => 
          a.first_name.charAt(0).toUpperCase() + a.first_name.slice(1).toLowerCase()
        ).join(', ')
      }`);
    }
  } finally {
    setLoading(false);
  }
};

  const filteredStudents = students.filter(student => {
    const searchTerm = searchText.toLowerCase();
    return (
      student.full_name.toLowerCase().includes(searchTerm) ||
      student.university_id.toLowerCase().includes(searchTerm) ||
      student.institutional_email.toLowerCase().includes(searchTerm)
    );
  });

  const studentColumns: GridColDef[] = [
    { 
      field: 'full_name', 
      headerName: 'Student', 
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.row.full_name.charAt(0)}
          </Avatar>
          <Typography>{params.value}</Typography>
        </Stack>
      )
    },
    { 
      field: 'university_id', 
      headerName: 'ID', 
      width: 150 
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => {
        const status = params.value;
        const icon = {
          'Pending': <WarningIcon color="warning" />,
          'Ongoing': <CheckCircleIcon color="success" />,
          'Completed': <CheckCircleIcon color="info" />,
          'Behind Schedule': <WarningIcon color="error" />
        }[status];

        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon}
            <Typography>{status}</Typography>
          </Stack>
        );
      }
    },
    {
      field: 'assigned_advisor',
      headerName: 'Advisor', 
      width: 200,
      renderCell: (params) => {
        const advisor = advisors.find(a => a.id === params.value);
        return advisor ? (
          <Chip
            avatar={<Avatar>{advisor.first_name.charAt(0)}</Avatar>}
            label={`${advisor.first_name} ${advisor.last_name}`}
            variant="outlined"
          />
        ) : (
          <Chip label="Not assigned" color="default" variant="outlined" />
        );
      }
    },
    { 
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setSelectedStudent(params.row.university_id)}
          disabled={selectedStudent === params.row.university_id}
        >
          {selectedStudent === params.row.university_id ? 'Selected' : 'Select'}
        </Button>
      )
    }
  ];

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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<SchoolIcon fontSize="large" />}
            title="Total Students"
            value={stats.totalStudents}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<WarningIcon fontSize="large" />}
            title="Pending"
            value={stats.pendingStudents}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<AssignmentIcon fontSize="large" />}
            title="Ongoing"
            value={stats.ongoingStudents}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<CheckCircleIcon fontSize="large" />}
            title="Completed"
            value={stats.completedStudents}
            color="info.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Students Table */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Students Management
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Search students..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ height: 500 }}>
                <DataGrid
                  rows={filteredStudents}
                  columns={studentColumns}
                  getRowId={(row) => row.university_id}
                  pageSize={7}
                  rowsPerPageOptions={[7]}
                  onRowClick={(params) => setSelectedStudent(params.row.university_id)}
                  sx={{
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer'
                    },
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Advisor Assignment Panel */}
      <Grid item xs={12} md={4}>
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Assign Advisor
      </Typography>

      {selectedStudent && (
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Selected Student:
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {students.find(s => s.university_id === selectedStudent)?.full_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedStudent}
          </Typography>
        </Paper>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useManualInput}
              onChange={(e) => setUseManualInput(e.target.checked)}
            />
          }
          label="Enter username manually"
        />
      </FormControl>

      {useManualInput ? (
        <TextField
          fullWidth
          label="Advisor Username"
          value={manualUsername}
          onChange={(e) => setManualUsername(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />
      ) : (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Advisor</InputLabel>
          <Select
            value={selectedAdvisor || ''}
            onChange={(e) => setSelectedAdvisor(Number(e.target.value))}
            label="Select Advisor"
            variant="outlined"
          >
            {advisors.map(advisor => (
              <MenuItem key={advisor.id} value={advisor.id}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {advisor.first_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography>
                      {advisor.first_name} {advisor.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Username: {advisor.first_name.toLowerCase()}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Button
        variant="contained"
        size="large"
        disabled={loading || !selectedStudent || (!useManualInput && !selectedAdvisor) || (useManualInput && !manualUsername)}
        onClick={handleAssignAdvisor}
        fullWidth
        sx={{ py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Assign Advisor'}
      </Button>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
  Advisors List (Usernames)
</Typography>
<List dense sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
  {advisors.map(advisor => (
    <ListItem 
      key={advisor.id}
      sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {advisor.first_name.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography fontWeight="medium">
              {advisor.first_name} {advisor.last_name}
            </Typography>
            <Chip 
              label={`Username: ${advisor.first_name.toLowerCase()}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        }
        secondary={`Phone: ${advisor.phone_number}`}
      />
      <Chip 
        label={`${students.filter(s => s.assigned_advisor === advisor.id).length} students`}
        size="small"
        color="secondary"
      />
    </ListItem>
  ))}
</List>
    </CardContent>
  </Card>
</Grid>

      </Grid>
    </Container>
  );
};

// StatCard Component
const StatCard = ({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: color, color: 'white' }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);
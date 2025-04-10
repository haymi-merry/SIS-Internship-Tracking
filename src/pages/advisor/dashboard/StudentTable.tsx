import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  Button, 
  Box, 
  TextField, 
  InputAdornment,
  Chip,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Student } from '../../../InternApi/api';

const formatIdForUrl = (id: string): string => {
  // Convert "UGR102517" to "UGR/1025/17"
  if (/^[A-Z]+\d+$/.test(id)) {
    const prefix = id.match(/^[A-Z]+/)?.[0] || '';
    const numbers = id.slice(prefix.length);
    if (numbers.length >= 4) {
      const firstPart = numbers.slice(0, numbers.length - 2);
      const secondPart = numbers.slice(-2);
      return `${prefix}/${firstPart}/${secondPart}`;
    }
  }
  return id;
};

interface StudentTableProps {
  students: Student[];
  onStudentClick?: (studentId: string) => void;
}

export const StudentTable = ({ students = [], onStudentClick }: StudentTableProps) => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

 // In StudentTable.tsx
 const handleStudentClick = (studentId: string) => {
  if (onStudentClick) {
    onStudentClick(studentId);
  } else {
    try {
      // Convert UGR216915 to UGR/2169/15 for URL
      const prefix = studentId.match(/^[A-Z]+/)?.[0] || '';
      const numbers = studentId.slice(prefix.length);
      
      if (numbers.length < 4) {
        throw new Error('Invalid student ID format');
      }
      
      const firstPart = numbers.slice(0, numbers.length - 2);
      const secondPart = numbers.slice(-2);
      const urlFriendlyId = `${prefix}/${firstPart}/${secondPart}`;
      
      navigate(`/advisor/students/${urlFriendlyId}`);
    } catch (err) {
      console.error('Navigation error:', err);
      // Fallback to encoded ID if formatting fails
      navigate(`/advisor/students/${encodeURIComponent(studentId)}`);
    }
  }
};

  const columns: GridColDef[] = [
    { 
      field: 'full_name', 
      headerName: 'Student', 
      width: 200,
      renderCell: (params) => (
        <Button 
          onClick={() => handleStudentClick(params.row.university_id)}
          sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
        >
          {params.value}
        </Button>
      )
    },
    { 
      field: 'institutional_email', 
      headerName: 'Email', 
      width: 250,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          color={
            params.value === 'Ongoing' ? 'success' :
            params.value === 'Pending' ? 'warning' :
            params.value === 'Behind Schedule' ? 'error' : 'default'
          }
          variant="outlined"
          size="small"
        />
      )
    },
    { 
      field: 'company_name', 
      headerName: 'Company', 
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => handleStudentClick(params.row.university_id)}
          sx={{ textTransform: 'none' }}
        >
          View Details
        </Button>
      )
    }
  ];

  const filteredStudents = students.filter(student => {
    const searchTerm = searchText.toLowerCase();
    return (
      student.full_name.toLowerCase().includes(searchTerm) ||
      student.university_id.toLowerCase().includes(searchTerm) ||
      (student.company_name && student.company_name.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Assigned Students"
        action={
          <TextField
            size="small"
            placeholder="Search students..."
            value={searchText}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 300, mr: 2 }}
          />
        }
        sx={{ pb: 0 }}
      />
      <Box sx={{ height: 500, flexGrow: 1, p: 2 }}>
        {filteredStudents.length > 0 ? (
          <DataGrid
            rows={filteredStudents}
            columns={columns}
            getRowId={(row) => row.university_id}
            pageSize={7}
            rowsPerPageOptions={[7]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none',
              },
            }}
          />
        ) : (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
            flexDirection="column"
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No students found
            </Typography>
            {searchText && (
              <Button onClick={() => setSearchText('')} variant="text">
                Clear search
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
};
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  Stack,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Download, Visibility, ArrowBack, CheckCircle, Cancel } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Student } from '../../../InternApi/api';

export const StudentDetailView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected' | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // Convert any URL format to API format (UGR216915)
  const getNormalizedId = (): string => {
    // Handle /UGR103417 format
    if (params.universityId) {
      return params.universityId.replace(/\//g, '');
    }
    // Handle /UGR/1034/17 format
    if (params.prefix && params.middle && params.suffix) {
      return `${params.prefix}${params.middle}${params.suffix}`;
    }
    return '';
  };

  // Format ID for display (UGR103417 → UGR/1034/17)
  const formatDisplayId = (id: string): string => {
    const prefix = id.match(/^[A-Z]+/)?.[0] || '';
    const numbers = id.slice(prefix.length);
    if (numbers.length >= 4) {
      return `${prefix}/${numbers.slice(0,4)}/${numbers.slice(4)}`;
    }
    return id;
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const normalizedId = getNormalizedId();
        if (!normalizedId) {
          throw new Error('Invalid student ID format');
        }

        const response = await api.getStudentDetail(normalizedId);
        
        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.data) {
          throw new Error('Student data not found');
        }

        setStudent(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load student data';
        setError(errorMessage);
        console.error('Fetch error:', {
          error: err,
          params,
          normalizedId: getNormalizedId()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params]);

  const handleFileAction = (documentPath: string, action: 'view' | 'download') => {
    try {
      if (!documentPath) {
        throw new Error('Document path is missing');
      }

      const fullUrl = `${import.meta.env.VITE_API_BASE_URL || ''}${documentPath}`;
      const fileName = documentPath.split('/').pop() || 'document';

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const errorMessage = `Failed to ${action} document: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleOfferLetterAction = async (status: 'approved' | 'rejected') => {
    try {
      setApprovalLoading(true);
      setApprovalError(null);
      
      const normalizedId = getNormalizedId();
      if (!normalizedId) {
        throw new Error('Invalid student ID');
      }

      const response = await api.approveOfferLetter({
        university_id: normalizedId,
        status: status === 'approved' ? 'Approved' : 'Rejected'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh student data
      const studentResponse = await api.getStudentDetail(normalizedId);
      setStudent(studentResponse.data);
      
      // Show success message
      setSnackbarOpen(true);
      setError(null);
      setApprovalDialogOpen(false);
    } catch (err) {
      setApprovalError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Alert 
          severity="error" 
          sx={{ width: '100%', maxWidth: 600 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate(-1)}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
          }
        >
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2">
            URL Parameters: {JSON.stringify(params)}
          </Typography>
          <Typography variant="caption" display="block">
            Normalized ID: {getNormalizedId() || 'Invalid format'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography>No student data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Students
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {student.full_name}
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
            <Chip 
              label={student.status} 
              color={
                student.status === 'Ongoing' ? 'success' : 
                student.status === 'Pending' ? 'warning' : 
                student.status === 'Behind Schedule' ? 'error' : 'info'
              } 
            />
            <Typography>ID: {formatDisplayId(student.university_id)}</Typography>
            <Typography>Email: {student.institutional_email}</Typography>
            <Typography>Phone: {student.phone_number}</Typography>
          </Stack>

          {student.start_date && student.end_date && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Internship Period: {new Date(student.start_date).toLocaleDateString()} -{' '}
              {new Date(student.end_date).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      {student.internship_offer_letter && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Internship Offer Letter
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="body2">Status:</Typography>
              {student.internship_offer_letter.advisor_approved ? (
                <Chip label="Approved" color="success" size="small" />
              ) : student.internship_offer_letter.approval_date ? (
                <Chip label="Rejected" color="error" size="small" />
              ) : (
                <Chip label="Pending Approval" color="warning" size="small" />
              )}
            </Box>

            <Typography variant="body2" sx={{ mt: 1 }}>
              Submitted: {new Date(student.internship_offer_letter.submission_date).toLocaleString()}
            </Typography>

            {student.internship_offer_letter.approval_date && (
              <Typography variant="body2">
                {student.internship_offer_letter.advisor_approved ? "Approved" : "Rejected"}:{' '}
                {new Date(student.internship_offer_letter.approval_date).toLocaleString()}
              </Typography>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => handleFileAction(student.internship_offer_letter.document, 'view')}
              >
                View
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleFileAction(student.internship_offer_letter.document, 'download')}
              >
                Download
              </Button>
            </Stack>

            {!student.internship_offer_letter.advisor_approved && (
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => {
                    setApprovalStatus('approved');
                    setApprovalDialogOpen(true);
                  }}
                >
                  Approve Offer
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => {
                    setApprovalStatus('rejected');
                    setApprovalDialogOpen(true);
                  }}
                >
                  Reject Offer
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Internship Reports ({student.internship_reports?.length || 0})
          </Typography>
          
          {(!student.internship_reports || student.internship_reports.length === 0) ? (
            <Typography variant="body2" color="text.secondary">
              No reports submitted yet
            </Typography>
          ) : (
            <List>
              {student.internship_reports.map((report, index) => (
                <div key={report.id}>
                  <ListItem>
                    <ListItemText
                      primary={`Report #${index + 1}`}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" display="block">
                            Submitted: {new Date(report.submission_date).toLocaleString()}
                          </Typography>
                          {report.grade > 0 && (
                            <Typography variant="body2" component="span" display="block">
                              Grade: {report.grade}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleFileAction(report.document, 'view')}
                        variant="outlined"
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleFileAction(report.document, 'download')}
                        variant="outlined"
                      >
                        Download
                      </Button>
                    </Stack>
                  </ListItem>
                  {index < student.internship_reports.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)}>
        <DialogTitle>
          Confirm {approvalStatus === 'approved' ? 'Approval' : 'Rejection'}
        </DialogTitle>
        <DialogContent>
          {approvalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {approvalError}
            </Alert>
          )}
          <Typography>
            Are you sure you want to {approvalStatus === 'approved' ? 'approve' : 'reject'} the offer letter for {student?.full_name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setApprovalDialogOpen(false)}
            disabled={approvalLoading}
          >
            Cancel
          </Button>
          <Button
            color={approvalStatus === 'approved' ? 'success' : 'error'}
            variant="contained"
            onClick={() => approvalStatus && handleOfferLetterAction(approvalStatus)}
            disabled={approvalLoading}
            startIcon={approvalLoading ? <CircularProgress size={20} /> : 
              approvalStatus === 'approved' ? <CheckCircle /> : <Cancel />}
          >
            {approvalLoading ? 'Processing...' : 
             approvalStatus === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          severity="success" 
          onClose={handleCloseSnackbar}
        >
          Offer letter {approvalStatus === 'approved' ? 'approved' : 'rejected'} successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};
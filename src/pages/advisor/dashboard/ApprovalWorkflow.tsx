import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  Stack, 
  Button,
  Box,
  Typography,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { api } from '../../../InternApi/api';

interface Student {
  id: number;
  university_id: string;
  full_name: string;
  status: string;
  company_name: string;
  offer_letter: {
    company: string;
    document: string;
    advisor_approved?: boolean;
    approval_date?: string | null;
  } | null;
  internship_reports: {
    report_number: number;
    document: string;
    advisor_approved?: boolean;
  }[];
}

interface ApprovalWorkflowProps {
  students: Student[];
  onUpdate: () => void;
}

export const ApprovalWorkflow = ({ students, onUpdate }: ApprovalWorkflowProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter students with pending offer letters
  const studentsWithOfferLetters = students.filter(student => 
    student.offer_letter && !student.offer_letter.advisor_approved
  );

  // Filter reports with pending approval
  const studentsWithReports = students.flatMap(student => 
    student.internship_reports
      .filter(report => !report.advisor_approved)
      .map(report => ({ ...report, student }))
  );

  // Convert ID format for API (UGR/1034/17 → UGR103417)
  const convertToApiId = (id: string): string => {
    return id.replace(/\//g, '');
  };

  const handleFileAction = (documentPath: string, action: 'view' | 'download') => {
    try {
      if (!documentPath) {
        throw new Error('No document available');
      }

      const fullUrl = `https://aau-intern-b.vercel.app${documentPath}`;
      
      if (action === 'download') {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = documentPath.split('/').pop() || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(fullUrl, '_blank');
      }
    } catch (err) {
      setError(`Failed to ${action} document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleApproveOffer = async (universityId: string) => {
    try {
      setLoadingId(universityId);
      const apiFormattedId = convertToApiId(universityId);
      
      const response = await api.approveOfferLetter({
        university_id: apiFormattedId,
        status: 'Approved'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      onUpdate(); // Refresh the data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve offer letter');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectOffer = async (universityId: string) => {
    try {
      setLoadingId(universityId);
      const apiFormattedId = convertToApiId(universityId);
      
      const response = await api.approveOfferLetter({
        university_id: apiFormattedId,
        status: 'Rejected'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      onUpdate(); // Refresh the data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject offer letter');
    } finally {
      setLoadingId(null);
    }
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

  return (
    <Card>
      <CardHeader title="Approval Workflow" subheader="Review submissions" />
      <Tabs value={tabValue} onChange={(_, newVal) => setTabValue(newVal)}>
        <Tab label={`Pending Offers (${studentsWithOfferLetters.length})`} />
        <Tab label={`Pending Reports (${studentsWithReports.length})`} />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {tabValue === 0 ? (
          <List>
            {studentsWithOfferLetters.length === 0 ? (
              <Typography variant="body1" sx={{ p: 2 }}>No pending offer letters</Typography>
            ) : (
              studentsWithOfferLetters.map(student => (
                <ListItem key={student.university_id}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{student.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.company_name}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      ID: {formatDisplayId(student.university_id)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleFileAction(student.offer_letter?.document || '', 'view')}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleFileAction(student.offer_letter?.document || '', 'download')}
                      >
                        Download
                      </Button>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={
                        loadingId === student.university_id ? 
                        <CircularProgress size={20} /> : 
                        <ApproveIcon />
                      }
                      onClick={() => handleApproveOffer(student.university_id)}
                      disabled={!!loadingId}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={
                        loadingId === student.university_id ? 
                        <CircularProgress size={20} /> : 
                        <RejectIcon />
                      }
                      onClick={() => handleRejectOffer(student.university_id)}
                      disabled={!!loadingId}
                    >
                      Reject
                    </Button>
                  </Stack>
                </ListItem>
              ))
            )}
          </List>
        ) : (
          <List>
            {studentsWithReports.length === 0 ? (
              <Typography variant="body1" sx={{ p: 2 }}>No pending reports</Typography>
            ) : (
              studentsWithReports.map(({ student, ...report }) => (
                <ListItem key={`${student.university_id}-${report.report_number}`}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {student.full_name} - Report #{report.report_number}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      ID: {formatDisplayId(student.university_id)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleFileAction(report.document, 'view')}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleFileAction(report.document, 'download')}
                      >
                        Download
                      </Button>
                    </Stack>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        )}
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
};
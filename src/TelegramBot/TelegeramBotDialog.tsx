import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import { api } from '../InternApi/api';

interface Student {
  id: number;
  university_id: string;
  full_name: string;
  institutional_email: string;
}

interface TelegramBotDialogProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
}

export const TelegramBotDialog = ({ open, onClose, students }: TelegramBotDialogProps) => {
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isBroadcast, setIsBroadcast] = useState(true);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setSendStatus({ success: false, message: 'Message cannot be empty' });
      return;
    }

    try {
      setIsSending(true);
      setSendStatus(null);

      const payload = {
        message: message.trim(),
        student_ids: isBroadcast ? null : selectedStudents.map(s => s.university_id)
      };

      const response = await api.sendTelegramMessage(payload);

      if (response.error) {
        throw new Error(response.error);
      }

      setSendStatus({ 
        success: true, 
        message: isBroadcast 
          ? `Message broadcasted to all students` 
          : `Message sent to ${selectedStudents.length} student(s)`
      });
      setMessage('');
      setSelectedStudents([]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setSendStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send message'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Send Telegram Message</Typography>
          <Button onClick={onClose} color="inherit">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box mb={3}>
          <FormControlLabel
            control={
              <Switch
                checked={isBroadcast}
                onChange={(e) => {
                  setIsBroadcast(e.target.checked);
                  if (e.target.checked) setSelectedStudents([]);
                }}
                color="primary"
              />
            }
            label={isBroadcast ? "Broadcast to all students" : "Send to selected students"}
          />
        </Box>

        {!isBroadcast && (
          <Box mb={3}>
            <Autocomplete
              multiple
              options={students}
              getOptionLabel={(option) => `${option.full_name} (${option.university_id})`}
              value={selectedStudents}
              onChange={(_, newValue) => setSelectedStudents(newValue)}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select students"
                  variant="outlined"
                  fullWidth
                  placeholder="Search students..."
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.university_id}
                    label={option.full_name}
                    size="small"
                  />
                ))
              }
            />
          </Box>
        )}

        <TextField
          label="Your message"
          multiline
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder={`Type your ${isBroadcast ? 'broadcast' : ''} message here...`}
          inputProps={{ maxLength: 4096 }}
          helperText={`${message.length}/4096 characters`}
        />

        {sendStatus && (
          <Box mt={2}>
            <Alert severity={sendStatus.success ? "success" : "error"}>
              {sendStatus.message}
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose} 
          color="secondary"
          startIcon={<CloseIcon />}
          disabled={isSending}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSendMessage} 
          color="primary"
          variant="contained"
          startIcon={<SendIcon />}
          disabled={isSending || !message.trim() || (!isBroadcast && selectedStudents.length === 0)}
        >
          {isSending ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Sending...
            </>
          ) : (
            `Send ${isBroadcast ? 'Broadcast' : 'Message'}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
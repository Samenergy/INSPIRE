import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  TextField,
  Alert,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import partnerFinderService, { AutoFindPartnersResponse } from '../../services/partnerFinderService';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface PartnerFinderModalProps {
  open: boolean;
  onClose: () => void;
  onPartnersFound: () => void; // Callback to refresh company list
}

const PartnerFinderModal: React.FC<PartnerFinderModalProps> = ({
  open,
  onClose,
  onPartnersFound,
}) => {
  const theme = useMuiTheme();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<AutoFindPartnersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'generating' | 'searching' | 'extracting' | 'saving' | 'complete'>('idle');

  const handleFindPartners = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStep('generating');

    try {
      // Simulate progress steps
      setTimeout(() => setStep('searching'), 1000);
      setTimeout(() => setStep('extracting'), 3000);
      setTimeout(() => setStep('saving'), 5000);

      const response = await partnerFinderService.autoFindPartners(
        location || undefined
      );

      setResult(response);
      setStep('complete');

      // Store analysis job IDs in localStorage so polling can resume when companies are loaded
      if (response.success && response.data?.analysis_jobs) {
        try {
          const activeAnalyses = JSON.parse(localStorage.getItem('active_analyses') || '{}');
          response.data.analysis_jobs.forEach((job: any) => {
            if (job.company_id && job.job_id) {
              activeAnalyses[job.company_id] = job.job_id;
              console.log(`[PartnerFinder] Stored analysis job ${job.job_id} for company ${job.company_id}`);
            }
          });
          localStorage.setItem('active_analyses', JSON.stringify(activeAnalyses));
        } catch (error) {
          console.error('Failed to store analysis job IDs:', error);
        }
      }

      // Refresh company list after a short delay to show new companies
      // The companies will automatically start analyzing in the background
      if (response.success && response.data?.partners_saved) {
        setTimeout(() => {
          onPartnersFound();
        }, 2000);
      }
    } catch (err: any) {
      // Handle 429 (Too Many Requests) with a specific message
      if (err.status === 429 || err.message?.includes('already in progress') || err.message?.includes('wait')) {
        setError(err.message || 'A partner search is already in progress. Please wait for it to complete before starting a new search.');
      } else {
        setError(err.message || 'Failed to find partners. Please try again.');
      }
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setResult(null);
      setError(null);
      setStep('idle');
      setLocation('');
      onClose();
    }
  };

  const getStepMessage = () => {
    switch (step) {
      case 'generating':
        return 'Generating optimized search queries...';
      case 'searching':
        return 'Searching Google Local for businesses...';
      case 'extracting':
        return 'Analyzing and extracting relevant partners...';
      case 'saving':
        return 'Saving partners to your company list...';
      case 'complete':
        return 'Partners found successfully!';
      default:
        return '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" component="span">
            AI-Powered Partner Finder
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!result && !error && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Our AI will analyze your business description and automatically find
              potential partners using Google Local search. Found partners will be
              saved to your company list.
            </Typography>

            <TextField
              fullWidth
              label="Location (optional)"
              placeholder="e.g., Rwanda, Kigali"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
              helperText="Leave empty to search in Rwanda by default"
            />

            {loading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {getStepMessage()}
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorIcon />}>
            {error}
          </Alert>
        )}

        {result && result.success && result.data && (
          <Box>
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" fontWeight="bold">
                {result.data.partners_saved} partners saved to your company list!
              </Typography>
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Found:</strong> {result.data.partners_found} potential partners
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Saved:</strong> {result.data.partners_saved} new companies
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Total businesses analyzed:</strong>{' '}
                {result.data.total_businesses_found}
              </Typography>
            </Box>

            {result.data.search_queries_used && result.data.search_queries_used.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Search queries used:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                  {result.data.search_queries_used.map((query, idx) => (
                    <Typography
                      key={idx}
                      component="li"
                      variant="caption"
                      color="text.secondary"
                    >
                      {query}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!result && (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleFindPartners}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
            >
              {loading ? 'Finding Partners...' : 'Find Partners'}
            </Button>
          </>
        )}
        {result && (
          <Button onClick={handleClose} variant="contained" color="primary">
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PartnerFinderModal;


import React from 'react';
import { 
  Dialog as MuiDialog, 
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  styled
} from '@mui/material';
import { BORDER_RADIUS, TRANSITIONS, SHADOWS } from './constants';
import { useTheme } from '../../../context/ThemeContext';
import { CloseIcon } from '../../icons/FallbackIcons';

// Extended dialog props
export interface DialogProps extends MuiDialogProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

// Styled dialog component
const StyledDialog = styled(MuiDialog)(({ theme }) => {
  const mode = theme.palette.mode;

  return {
    '& .MuiDialog-paper': {
      borderRadius: BORDER_RADIUS.md,
      boxShadow: mode === 'dark' ? SHADOWS.lg.dark : SHADOWS.lg.light,
      backgroundImage: 'none',
      overflow: 'hidden',
    },
  };
});

// Styled dialog title
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: '16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

// Styled dialog content
const StyledDialogContent = styled(DialogContent)(() => ({
  padding: '24px',
}));

// Styled dialog actions
const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 24px',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

// Dialog component with enhanced props
export const Dialog: React.FC<DialogProps> = ({
  children,
  title,
  actions,
  onClose,
  maxWidth = 'sm',
  fullWidth = true,
  ...props
}) => {
  // We don't need to use mode directly in this component
  // The theme will be passed down through the MUI ThemeProvider

  return (
    <StyledDialog
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      onClose={onClose}
      {...props}
    >
      {title && (
        <StyledDialogTitle>
          {typeof title === 'string' ? (
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
          ) : (
            title
          )}
          {onClose && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                transition: TRANSITIONS.fast,
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <CloseIcon size={20} color="inherit" />
            </IconButton>
          )}
        </StyledDialogTitle>
      )}
      <StyledDialogContent>
        {children}
      </StyledDialogContent>
      {actions && (
        <StyledDialogActions>
          {actions}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

export default Dialog;
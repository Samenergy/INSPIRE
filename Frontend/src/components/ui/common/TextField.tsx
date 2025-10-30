import React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps, styled } from '@mui/material';
import { BORDER_RADIUS, TRANSITIONS } from './constants';
import { useTheme } from '../../../context/ThemeContext';

// Extended text field props
export interface TextFieldProps extends MuiTextFieldProps {
  rounded?: 'xs' | 'sm' | 'md' | 'lg';
}

// Styled text field component
const StyledTextField = styled(MuiTextField)<TextFieldProps>(({ 
  theme, 
  rounded = 'md',
}) => {
  const { mode } = theme.palette;
  
  // Determine border radius
  let borderRadius;
  switch (rounded) {
    case 'xs': borderRadius = BORDER_RADIUS.xs; break;
    case 'sm': borderRadius = BORDER_RADIUS.sm; break;
    case 'md': borderRadius = BORDER_RADIUS.md; break;
    case 'lg': borderRadius = BORDER_RADIUS.lg; break;
    default: borderRadius = BORDER_RADIUS.md;
  }
  
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius,
      transition: TRANSITIONS.medium,
      
      '& fieldset': {
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
        transition: 'border-color 0.2s ease-in-out',
      },
      
      '&:hover fieldset': {
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      },
      
      '&.Mui-focused fieldset': {
        borderColor: mode === 'dark' ? '#64b5f6' : '#1976d2',
        borderWidth: '2px',
      },
      
      '&.Mui-focused': {
        boxShadow: mode === 'dark'
          ? '0 0 0 2px rgba(33, 150, 243, 0.2)'
          : '0 0 0 2px rgba(25, 118, 210, 0.2)',
      },
    },
    
    '& .MuiInputBase-input': {
      padding: '14px 16px',
      fontSize: '0.9375rem',
    },
    
    '& .MuiInputLabel-root': {
      fontSize: '0.9375rem',
    },
    
    '& .MuiInputAdornment-root': {
      '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
      },
    },
  };
});

// TextField component with enhanced props
export const TextField: React.FC<TextFieldProps> = (props) => {
  const { mode } = useTheme();
  
  return (
    <StyledTextField
      theme={{ palette: { mode } }}
      {...props}
    />
  );
};

export default TextField;
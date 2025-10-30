import React from 'react';
import { Paper as MuiPaper, PaperProps as MuiPaperProps, styled } from '@mui/material';
import { BORDER_RADIUS, TRANSITIONS, SHADOWS } from './constants';
import { useTheme } from '../../../context/ThemeContext';

// Extended paper props
export interface PaperProps extends MuiPaperProps {
  rounded?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  interactive?: boolean;
}

// Styled paper component
const StyledPaper = styled(MuiPaper)<PaperProps>(({ 
  theme, 
  rounded = 'md', 
  elevation = 'sm',
  hoverable = false,
  interactive = false,
}) => {
  const { mode } = theme.palette;
  
  // Determine border radius
  let borderRadius;
  switch (rounded) {
    case 'xs': borderRadius = BORDER_RADIUS.xs; break;
    case 'sm': borderRadius = BORDER_RADIUS.sm; break;
    case 'md': borderRadius = BORDER_RADIUS.md; break;
    case 'lg': borderRadius = BORDER_RADIUS.lg; break;
    case 'xl': borderRadius = BORDER_RADIUS.xl; break;
    default: borderRadius = BORDER_RADIUS.md;
  }
  
  // Determine shadow
  let boxShadow = 'none';
  if (elevation !== 'none') {
    switch (elevation) {
      case 'sm': boxShadow = mode === 'dark' ? SHADOWS.sm.dark : SHADOWS.sm.light; break;
      case 'md': boxShadow = mode === 'dark' ? SHADOWS.md.dark : SHADOWS.md.light; break;
      case 'lg': boxShadow = mode === 'dark' ? SHADOWS.lg.dark : SHADOWS.lg.light; break;
      default: boxShadow = mode === 'dark' ? SHADOWS.sm.dark : SHADOWS.sm.light;
    }
  }
  
  return {
    borderRadius,
    boxShadow,
    transition: TRANSITIONS.medium,
    backgroundImage: 'none',
    
    ...(hoverable && {
      '&:hover': {
        boxShadow: mode === 'dark' ? SHADOWS.hover.dark : SHADOWS.hover.light,
        transform: 'translateY(-2px)',
      },
    }),
    
    ...(interactive && {
      cursor: 'pointer',
      '&:hover': {
        boxShadow: mode === 'dark' ? SHADOWS.hover.dark : SHADOWS.hover.light,
        transform: 'translateY(-2px)',
        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    }),
  };
});

// Paper component with enhanced props
export const Paper: React.FC<PaperProps> = (props) => {
  const { mode } = useTheme();
  
  return (
    <StyledPaper
      theme={{ palette: { mode } }}
      {...props}
    />
  );
};

export default Paper;
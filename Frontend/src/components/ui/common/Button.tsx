import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled } from '@mui/material';
import { BORDER_RADIUS, TRANSITIONS, SHADOWS, ANIMATIONS } from './constants';
import { useTheme } from '../../../context/ThemeContext';

// Extended button props
export interface ButtonProps extends MuiButtonProps {
  rounded?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pill';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  animation?: 'none' | 'hover' | 'scale' | 'both';
}

// Styled button component
const StyledButton = styled(MuiButton)<ButtonProps>(({ 
  theme, 
  rounded = 'md', 
  elevation = 'sm',
  animation = 'hover',
  variant = 'contained',
  color = 'primary'
}) => {
  const { mode } = theme.palette;
  const isContained = variant === 'contained';
  const isOutlined = variant === 'outlined';
  
  // Determine border radius
  let borderRadius;
  switch (rounded) {
    case 'xs': borderRadius = BORDER_RADIUS.xs; break;
    case 'sm': borderRadius = BORDER_RADIUS.sm; break;
    case 'md': borderRadius = BORDER_RADIUS.md; break;
    case 'lg': borderRadius = BORDER_RADIUS.lg; break;
    case 'xl': borderRadius = BORDER_RADIUS.xl; break;
    case 'pill': borderRadius = BORDER_RADIUS.pill; break;
    default: borderRadius = BORDER_RADIUS.md;
  }
  
  // Determine shadow
  let boxShadow = 'none';
  if (isContained && elevation !== 'none') {
    switch (elevation) {
      case 'sm': boxShadow = mode === 'dark' ? SHADOWS.sm.dark : SHADOWS.sm.light; break;
      case 'md': boxShadow = mode === 'dark' ? SHADOWS.md.dark : SHADOWS.md.light; break;
      case 'lg': boxShadow = mode === 'dark' ? SHADOWS.lg.dark : SHADOWS.lg.light; break;
      default: boxShadow = mode === 'dark' ? SHADOWS.sm.dark : SHADOWS.sm.light;
    }
  }
  
  // Determine hover effects
  const hoverEffects: any = {};
  
  if (animation !== 'none') {
    if (animation === 'hover' || animation === 'both') {
      hoverEffects.transform = ANIMATIONS.hover.transform;
    }
    if (animation === 'scale' || animation === 'both') {
      hoverEffects.transform = ANIMATIONS.scale.transform;
    }
    
    if (isContained && elevation !== 'none') {
      hoverEffects.boxShadow = mode === 'dark' ? SHADOWS.hover.dark : SHADOWS.hover.light;
    }
  }
  
  return {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius,
    boxShadow,
    transition: TRANSITIONS.medium,
    padding: '8px 16px',
    
    // Outlined button specific styles
    ...(isOutlined && {
      borderWidth: '1.5px',
      '&:hover': {
        borderWidth: '1.5px',
        ...hoverEffects,
      },
    }),
    
    // Contained button specific styles
    ...(isContained && {
      '&:hover': {
        ...hoverEffects,
      },
    }),
    
    // Text button specific styles
    ...(!isContained && !isOutlined && {
      '&:hover': {
        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        ...hoverEffects,
      },
    }),
  };
});

// Button component with enhanced props
export const Button: React.FC<ButtonProps> = (props) => {
  const { mode } = useTheme();
  
  return (
    <StyledButton
      theme={{ palette: { mode } }}
      {...props}
    />
  );
};

export default Button;
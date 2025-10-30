import React from 'react';
import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps, styled } from '@mui/material';
import { BORDER_RADIUS, TRANSITIONS, ANIMATIONS } from './constants';
import { useTheme } from '../../../context/ThemeContext';

// Extended icon button props
export interface IconButtonProps extends MuiIconButtonProps {
  rounded?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'round';
  animation?: 'none' | 'hover' | 'scale' | 'both';
  active?: boolean;
}

// Styled icon button component
const StyledIconButton = styled(MuiIconButton)<IconButtonProps>(({ 
  theme, 
  rounded = 'sm', 
  animation = 'hover',
  active = false,
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
    case 'round': borderRadius = BORDER_RADIUS.round; break;
    default: borderRadius = BORDER_RADIUS.sm;
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
  }
  
  return {
    borderRadius,
    transition: TRANSITIONS.medium,
    backgroundColor: active
      ? mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
      : 'transparent',
    color: active
      ? mode === 'dark' ? '#ffffff' : '#000000'
      : 'inherit',
    
    '&:hover': {
      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      ...hoverEffects,
    },
    
    '& svg': {
      transition: TRANSITIONS.fast,
    },
    
    '&:hover svg': {
      transform: 'scale(1.1)',
    },
  };
});

// Icon button component with enhanced props
export const IconButton: React.FC<IconButtonProps> = (props) => {
  const { mode } = useTheme();
  
  return (
    <StyledIconButton
      theme={{ palette: { mode } }}
      {...props}
    />
  );
};

export default IconButton;
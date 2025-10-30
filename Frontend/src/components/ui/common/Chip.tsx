import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps, styled } from '@mui/material';
import { BORDER_RADIUS, TRANSITIONS, ANIMATIONS } from './constants';
import { useTheme } from '../../../context/ThemeContext';

// Extended chip props
export interface ChipProps extends MuiChipProps {
  rounded?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'pill';
  animation?: 'none' | 'hover' | 'scale';
  customColor?: string;
}

// Styled chip component
const StyledChip = styled(MuiChip)<ChipProps>(({ 
  theme, 
  rounded = 'pill', 
  animation = 'scale',
  customColor,
  variant = 'filled',
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
    case 'pill': borderRadius = BORDER_RADIUS.pill; break;
    default: borderRadius = BORDER_RADIUS.pill;
  }
  
  // Determine hover effects
  const hoverEffects: any = {};
  
  if (animation !== 'none') {
    if (animation === 'hover') {
      hoverEffects.transform = ANIMATIONS.hover.transform;
    }
    if (animation === 'scale') {
      hoverEffects.transform = ANIMATIONS.scale.transform;
    }
  }
  
  return {
    borderRadius,
    transition: TRANSITIONS.fast,
    fontWeight: 600,
    backgroundColor: customColor 
      ? mode === 'dark' ? `${customColor}20` : `${customColor}10`
      : mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    color: customColor || 'inherit',
    
    ...(variant === 'outlined' && {
      borderWidth: '1.5px',
      borderColor: customColor || 'inherit',
    }),
    
    '&:hover': {
      ...hoverEffects,
    },
    
    '& .MuiChip-label': {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  };
});

// Chip component with enhanced props
export const Chip: React.FC<ChipProps> = (props) => {
  const { mode } = useTheme();
  
  return (
    <StyledChip
      theme={{ palette: { mode } }}
      {...props}
    />
  );
};

export default Chip;
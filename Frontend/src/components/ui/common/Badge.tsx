import React from 'react';
import { Box, BoxProps, styled, keyframes } from '@mui/material';
import { BORDER_RADIUS } from './constants';
import { useTheme } from '../../../context/ThemeContext';

// Define the pulse animation
const pulseAnimation = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(244, 67, 54, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
`;

// Badge props
export interface BadgeProps extends BoxProps {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  dot?: boolean;
}

// Styled badge component
const StyledBadge = styled(Box)<BadgeProps>(({ 
  theme, 
  color = 'error',
  size = 'sm',
  pulse = false,
  dot = true,
}) => {
  const { mode } = theme.palette;
  
  // Determine size
  let width, height;
  switch (size) {
    case 'xs': width = '6px'; height = '6px'; break;
    case 'sm': width = '10px'; height = '10px'; break;
    case 'md': width = '14px'; height = '14px'; break;
    default: width = '10px'; height = '10px';
  }
  
  // Determine color
  let bgColor;
  switch (color) {
    case 'primary': bgColor = theme.palette.primary.main; break;
    case 'secondary': bgColor = theme.palette.secondary.main; break;
    case 'error': bgColor = theme.palette.error.main; break;
    case 'warning': bgColor = theme.palette.warning.main; break;
    case 'info': bgColor = theme.palette.info.main; break;
    case 'success': bgColor = theme.palette.success.main; break;
    default: bgColor = theme.palette.error.main;
  }
  
  return {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: dot ? width : 'auto',
    height,
    minWidth: dot ? 'auto' : '18px',
    padding: dot ? 0 : '0 6px',
    borderRadius: dot ? BORDER_RADIUS.round : BORDER_RADIUS.pill,
    backgroundColor: bgColor,
    boxShadow: `0 0 0 2px ${mode === 'dark' ? '#1a1a1a' : '#ffffff'}`,
    display: dot ? 'block' : 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#ffffff',
    zIndex: 2,
    
    ...(pulse && {
      animation: `${pulseAnimation} 2s infinite`,
    }),
  };
});

// Badge component with enhanced props
export const Badge: React.FC<BadgeProps> = (props) => {
  const { mode } = useTheme();
  
  return (
    <StyledBadge
      theme={{ palette: { mode } }}
      {...props}
    />
  );
};

export default Badge;
import React from 'react';
import { IconButton, Tooltip, Box, styled } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '../icons/FallbackIcons';

interface ThemeToggleProps {
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Tooltip placement */
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
}

// Styled icon button with enhanced visual effects
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '3px',
  padding: theme.spacing(1.5),
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(33, 150, 243, 0.15)'
    : 'rgba(25, 118, 210, 0.08)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle, transparent 1%, transparent 1%) center/15000%',
    opacity: 0,
    transition: 'opacity 0.5s ease, background-size 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px) rotate(5deg)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 8px rgba(0, 0, 0, 0.3)'
      : '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(33, 150, 243, 0.2)'
      : 'rgba(25, 118, 210, 0.12)',
    '&::before': {
      opacity: 0.3,
      backgroundSize: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-1px) rotate(0deg)',
    transition: 'transform 0.1s ease-in-out',
    '&::before': {
      opacity: 0.5,
      backgroundSize: '100%',
      transition: 'all 0s',
    },
  },
}));

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  tooltipPlacement = 'bottom'
}) => {
  const { mode, toggleColorMode } = useTheme();

  return (
    <Tooltip
      title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      placement={tooltipPlacement}
      arrow
    >
      <StyledIconButton
        onClick={toggleColorMode}
        aria-label="toggle theme"
        size={size}
        className="hover:animate-pulse-slow"
      >
        {mode === 'light' ? (
          <MoonIcon
            size={24}
            color="currentColor"
            animate={true}
            animationVariant="pulse"
          />
        ) : (
          <SunIcon
            size={24}
            color="currentColor"
            animate={true}
            animationVariant="spin"
          />
        )}
      </StyledIconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
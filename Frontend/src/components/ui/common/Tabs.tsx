import React from 'react';
import { Tabs as MuiTabs, TabsProps as MuiTabsProps, Tab as MuiTab, TabProps as MuiTabProps, styled } from '@mui/material';
import { BORDER_RADIUS, TRANSITIONS } from './constants';
import { useTheme } from '../../../context/ThemeContext';

// Extended tabs props
export interface TabsProps extends MuiTabsProps {
  indicatorHeight?: 'xs' | 'sm' | 'md';
  indicatorRounded?: boolean;
}

// Extended tab props
export interface TabProps extends MuiTabProps {
  rounded?: 'xs' | 'sm' | 'md';
}

// Styled tabs component
const StyledTabs = styled(MuiTabs)<TabsProps>(({ 
  theme, 
  indicatorHeight = 'sm',
  indicatorRounded = true,
}) => {
  // Determine indicator height
  let height;
  switch (indicatorHeight) {
    case 'xs': height = 2; break;
    case 'sm': height = 3; break;
    case 'md': height = 4; break;
    default: height = 3;
  }
  
  return {
    '& .MuiTabs-indicator': {
      height,
      borderRadius: indicatorRounded ? `${BORDER_RADIUS.sm} ${BORDER_RADIUS.sm} 0 0` : 0,
      transition: TRANSITIONS.medium,
    },
  };
});

// Styled tab component
const StyledTab = styled(MuiTab)<TabProps>(({ 
  theme, 
  rounded = 'sm',
}) => {
  const { mode } = theme.palette;
  
  // Determine border radius
  let borderRadius;
  switch (rounded) {
    case 'xs': borderRadius = BORDER_RADIUS.xs; break;
    case 'sm': borderRadius = BORDER_RADIUS.sm; break;
    case 'md': borderRadius = BORDER_RADIUS.md; break;
    default: borderRadius = BORDER_RADIUS.sm;
  }
  
  return {
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    minWidth: 100,
    borderRadius,
    transition: TRANSITIONS.fast,
    
    '&:hover': {
      color: theme.palette.primary.main,
      opacity: 1,
      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    },
  };
});

// Tabs component with enhanced props
export const Tabs: React.FC<TabsProps> = (props) => {
  const { mode } = useTheme();
  
  return (
    <StyledTabs
      theme={{ palette: { mode } }}
      {...props}
    />
  );
};

// Tab component with enhanced props
export const Tab: React.FC<TabProps> = (props) => {
  const { mode } = useTheme();
  
  return (
    <StyledTab
      theme={{ palette: { mode } }}
      {...props}
    />
  );
};

export default { Tabs, Tab };
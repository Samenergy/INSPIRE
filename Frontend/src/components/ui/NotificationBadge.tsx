import React from 'react';
import { Box, styled } from '@mui/material';

interface NotificationBadgeProps {
  count?: number;
  showPulse?: boolean;
  size?: 'small' | 'medium';
}

const BadgeContainer = styled(Box)<{ showPulse: boolean; size: 'small' | 'medium' }>(({ theme, showPulse, size }) => ({
  position: 'absolute',
  top: size === 'small' ? '-4px' : '-6px',
  right: size === 'small' ? '-4px' : '-6px',
  minWidth: size === 'small' ? '16px' : '20px',
  height: size === 'small' ? '16px' : '20px',
  borderRadius: '50%',
  backgroundColor: '#f44336',
  color: 'white',
  fontSize: size === 'small' ? '0.6rem' : '0.75rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  animation: showPulse ? 'notificationPulse 2s infinite' : 'none',
  '@keyframes notificationPulse': {
    '0%': {
      transform: 'scale(1)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    '50%': {
      transform: 'scale(1.1)',
      boxShadow: '0 4px 8px rgba(244, 67, 54, 0.4)',
    },
    '100%': {
      transform: 'scale(1)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }
  }
}));

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  showPulse = true, 
  size = 'medium' 
}) => {
  return (
    <BadgeContainer showPulse={showPulse} size={size}>
      {count && count > 0 ? (count > 99 ? '99+' : count.toString()) : ''}
    </BadgeContainer>
  );
};

export default NotificationBadge;











import React, { useState } from 'react';
import {
  Box,
  IconButton,
  styled,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import CampaignNotificationBadge from '../ui/NotificationBadge';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  BellIcon
} from '../icons/FallbackIcons';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import HelpIcon from '@mui/icons-material/Help';

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '80px',
  minWidth: '80px',
  flexShrink: 0,
  height: '100%',
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRight: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  padding: theme.spacing(3, 0),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 0 15px rgba(0, 0, 0, 0.3)'
    : '0 0 15px rgba(0, 0, 0, 0.05)',
  position: 'sticky',
  top: 0,
  left: 0,
  zIndex: 10,
  transition: 'all 0.3s ease-in-out',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  marginBottom: '36px',
  width: '48px',
  height: '48px',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: 'transparent',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 8px rgba(0, 0, 0, 0.3)'
    : '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1) translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 16px rgba(0, 0, 0, 0.4)'
      : '0 8px 16px rgba(0, 0, 0, 0.15)',
  },
}));

const NavButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'active'
})<{ active?: boolean }>(({ theme, active }) => ({
  margin: theme.spacing(1.2, 0),
  padding: theme.spacing(1.5),
  color: active ? (theme.palette.mode === 'dark' ? '#ffffff' : '#000000') : theme.palette.text.secondary,
  backgroundColor: active ?
    (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)') :
    'transparent',
  position: 'relative',
  borderRadius: '3px',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(0, 0, 0, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    left: '-18px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '24px',
    backgroundColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    borderRadius: '0 4px 4px 0',
  } : {},
  '& svg': {
    fontSize: '1.5rem',
    transition: 'transform 0.2s ease-in-out',
  },
  '&:hover svg': {
    transform: 'scale(1.1)',
  },
}));

const AvatarContainer = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  marginBottom: theme.spacing(2),
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f7fa',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 3px 6px rgba(0, 0, 0, 0.25)'
    : '0 3px 6px rgba(0, 0, 0, 0.1)',
  border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1) translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 12px rgba(0, 0, 0, 0.35)'
      : '0 6px 12px rgba(0, 0, 0, 0.15)',
    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.5)' : 'rgba(25, 118, 210, 0.3)'}`,
  },
}));

// Notification badge indicator with improved animation
const NotificationBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '4px',
  right: '4px',
  width: '10px',
  height: '10px',
  backgroundColor: theme.palette.error.main,
  borderRadius: '50%',
  boxShadow: `0 0 0 2px ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff'}`,
  animation: 'pulse 2s infinite',
  zIndex: 2,
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.95)',
      boxShadow: `0 0 0 0 ${theme.palette.mode === 'dark'
        ? 'rgba(244, 67, 54, 0.7)'
        : 'rgba(211, 47, 47, 0.7)'}`,
    },
    '70%': {
      transform: 'scale(1)',
      boxShadow: `0 0 0 6px ${theme.palette.mode === 'dark'
        ? 'rgba(244, 67, 54, 0)'
        : 'rgba(211, 47, 47, 0)'}`,
    },
    '100%': {
      transform: 'scale(0.95)',
      boxShadow: `0 0 0 0 ${theme.palette.mode === 'dark'
        ? 'rgba(244, 67, 54, 0)'
        : 'rgba(211, 47, 47, 0)'}`,
    },
  },
}));

interface SidebarProps {
  toggleNotifications: () => void;
  campaignNotificationCount?: number;
  showCampaignNotification?: boolean;
}

const ProfileMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '12px',
    minWidth: '240px',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.5)'
      : '0 8px 32px rgba(0, 0, 0, 0.15)',
    padding: theme.spacing(1),
    marginTop: theme.spacing(1.5),
  },
  '& .MuiMenuItem-root': {
    borderRadius: '8px',
    padding: theme.spacing(1, 2),
    margin: theme.spacing(0.5, 0),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)',
      transform: 'translateX(4px)',
    },
  },
}));

const Sidebar: React.FC<SidebarProps> = ({ 
  toggleNotifications, 
  campaignNotificationCount = 0,
  showCampaignNotification = false 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [hasNotifications, setHasNotifications] = useState(true);
  const { mode } = useTheme();
  const { user, logout } = useAuth();

  // Profile menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    const nameParts = user.name.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
    }
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <SidebarContainer>
      <Tooltip title="INSPIRE - Go to Dashboard" placement="right" arrow>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <LogoContainer>
            <img
              src={mode === 'dark' ? "/Group 47699.png" : "/Group 47710.svg"}
              alt="INSPIRE Logo"
              width="40"
              height="40"
              style={{
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }}
            />
          </LogoContainer>
        </Link>
      </Tooltip>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tooltip title="Dashboard" placement="right" arrow>
          <Link to="/dashboard">
            <NavButton
              aria-label="Home"
              active={path === '/dashboard'}
            >
              <HomeIcon
                size={24}
                color="currentColor"
                animate={path === '/dashboard'}
                animationVariant="pulse"
              />
            </NavButton>
          </Link>
        </Tooltip>

        <Tooltip title="Companies" placement="right" arrow>
          <Link to="/companies">
            <NavButton
              aria-label="Companies"
              active={path.includes('/companies')}
            >
              <UsersIcon
                size={24}
                color="currentColor"
                animate={path.includes('/companies')}
                animationVariant="pulse"
              />
            </NavButton>
          </Link>
        </Tooltip>

        <Tooltip title="Campaigns" placement="right" arrow>
          <Link to="/campaigns">
            <NavButton
              aria-label="Campaigns"
              active={path === '/campaigns'}
              id="campaigns-nav-button"
              sx={{ position: 'relative' }}
            >
              <FileTextIcon
                size={24}
                color="currentColor"
                animate={path === '/campaigns'}
                animationVariant="pulse"
              />
              {showCampaignNotification && (
                <CampaignNotificationBadge 
                  count={campaignNotificationCount} 
                  showPulse={true}
                  size="small"
                />
              )}
            </NavButton>
          </Link>
        </Tooltip>

        <Tooltip title="Settings" placement="right" arrow>
          <Link to="/settings">
            <NavButton
              aria-label="Settings"
              active={path === '/settings'}
            >
              <SettingsIcon
                size={24}
                color="currentColor"
                animate={path === '/settings'}
                animationVariant="spin"
              />
            </NavButton>
          </Link>
        </Tooltip>

        <Tooltip title="Notifications" placement="right" arrow>
          <NavButton
            onClick={() => {
              toggleNotifications();
              setHasNotifications(false);
            }}
            aria-label="Notifications"
            sx={{ position: 'relative' }}
          >
            <BellIcon
              size={24}
              color="currentColor"
              animate={hasNotifications}
              animationVariant="bounce"
            />
            {hasNotifications && <NotificationBadge />}
          </NavButton>
        </Tooltip>

        {/* Theme toggle button */}
        <ThemeToggle tooltipPlacement="right" />
      </Box>

      <Tooltip title="Your Profile" placement="right" arrow>
        <AvatarContainer
          onClick={handleProfileMenuOpen}
          className="animate-pulse-slow hover:animate-none hover:scale-110 hover:-translate-y-1 transition-all duration-300"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '1rem',
            color: (theme) => theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
          }}
        >
          {getUserInitials()}
        </AvatarContainer>
      </Tooltip>

      <Tooltip title="Logout" placement="right" arrow>
        <NavButton
          onClick={handleLogout}
          aria-label="Logout"
          sx={{
            marginTop: 2,
            color: (theme) => theme.palette.error.main,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(244, 67, 54, 0.1)'
                : 'rgba(244, 67, 54, 0.08)',
            }
          }}
        >
          <ExitToAppIcon fontSize="small" />
        </NavButton>
      </Tooltip>

      {/* Profile Menu */}
      <ProfileMenu
        anchorEl={profileAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={() => navigate('/settings/profile')}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile Settings</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => navigate('/settings/notifications')}>
          <ListItemIcon>
            <NotificationsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Notification Preferences</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => navigate('/settings/security')}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Security & Privacy</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => navigate('/help')}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Help & Support</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </ProfileMenu>
    </SidebarContainer>
  );
};

export default Sidebar; 
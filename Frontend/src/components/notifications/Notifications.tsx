import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  styled,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Button,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTheme } from '../../context/ThemeContext';
import { BORDER_RADIUS } from '../ui/common';

const NotificationsContainer = styled(Box)(({ theme }) => ({
  width: '380px',
  position: 'fixed',
  top: '0',
  right: '0',
  height: '100vh',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'dark'
    ? '-2px 0 20px rgba(0, 0, 0, 0.5)'
    : '-2px 0 20px rgba(0, 0, 0, 0.1)',
  zIndex: 1300,
  transform: 'translateX(100%)',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.open': {
    transform: 'translateX(0)',
  },
  display: 'flex',
  flexDirection: 'column',
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  top: 0,
  zIndex: 10,
}));

const NotificationTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    minWidth: 'auto',
    padding: theme.spacing(1.5, 2),
    '&.Mui-selected': {
      fontWeight: 700,
    },
  },
}));

const NotificationItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  cursor: 'pointer',
  borderRadius: BORDER_RADIUS.md,
  margin: theme.spacing(0.5, 1.5),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)',
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 12px rgba(0, 0, 0, 0.2)'
      : '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
}));

const NotificationContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 3, 2, 3),
}));

const CompanyLogo = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 'auto',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 6px rgba(0, 0, 0, 0.3)'
    : '0 2px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 10px rgba(0, 0, 0, 0.4)'
      : '0 4px 10px rgba(0, 0, 0, 0.15)',
  },
}));

const DismissButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.08)',
    transform: 'rotate(90deg)',
  },
}));

const ContentCollapse = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded'
})<{ expanded: boolean }>(({ expanded }) => ({
  maxHeight: expanded ? '500px' : '20px',
  overflow: 'hidden',
  transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const NewBadge = styled(Box)(({ theme }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  position: 'absolute',
  top: '50%',
  left: '-12px',
  transform: 'translateY(-50%)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: BORDER_RADIUS.md,
  padding: theme.spacing(0.75, 2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 8px rgba(0, 0, 0, 0.3)'
      : '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
}));

const NotificationFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
  marginTop: 'auto',
}));

interface NotificationItemData {
  id: number;
  title: string;
  content: string;
  timeAgo: string;
  logoSrc: string;
  expanded: boolean;
  isNew?: boolean;
  isExiting?: boolean;
  type: 'account' | 'system' | 'alert';
}

interface NotificationsProps {
  className?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ className = '' }) => {
  const { mode } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItemData[]>([
    {
      id: 1,
      title: 'Master Card',
      content: 'New account activity detected. A payment of $2,500 was processed for the quarterly subscription renewal.',
      timeAgo: '10 mins ago',
      logoSrc: '/images/mastercard.png',
      expanded: false,
      isNew: true,
      type: 'account',
    },
    {
      id: 2,
      title: 'Twitter',
      content: 'Your campaign "Summer Promotion" has reached 10,000 impressions. Check the analytics dashboard for more details.',
      timeAgo: '2 hours ago',
      logoSrc: '/images/twitter.png',
      expanded: false,
      type: 'account',
    },
    {
      id: 3,
      title: 'System Update',
      content: 'A new version of the platform is available. Please refresh your browser to access the latest features and improvements.',
      timeAgo: '1 day ago',
      logoSrc: '/inspire-logo.svg',
      expanded: false,
      isNew: true,
      type: 'system',
    },
    {
      id: 4,
      title: 'Star Bucks',
      content: 'Meeting reminder: Quarterly review with the Star Bucks team scheduled for tomorrow at 2:00 PM.',
      timeAgo: '1 day ago',
      logoSrc: '/images/starbucks.png',
      expanded: false,
      type: 'account',
    },
    {
      id: 5,
      title: 'Security Alert',
      content: 'Multiple login attempts detected from an unrecognized device. Please verify your account security settings.',
      timeAgo: '2 days ago',
      logoSrc: '/inspire-logo.svg',
      expanded: false,
      type: 'alert',
    },
    {
      id: 6,
      title: 'Apple',
      content: 'Contract renewal: The service agreement with Apple Inc. is due for renewal in 15 days. Please review the terms.',
      timeAgo: '3 days ago',
      logoSrc: '/images/apple.png',
      expanded: false,
      type: 'account',
    },
    {
      id: 7,
      title: 'Data Backup',
      content: 'Automatic data backup completed successfully. All your account information is safely stored.',
      timeAgo: '5 days ago',
      logoSrc: '/inspire-logo.svg',
      expanded: false,
      type: 'system',
    },
  ]);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  // Real-time notifications toggle
  const [realTimeNotifications, setRealTimeNotifications] = useState(true);

  const toggleExpand = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, expanded: !notification.expanded, isNew: false }
          : notification
      )
    );
  };

  const dismissNotification = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(notifications.map(notification =>
      notification.id === id
        ? { ...notification, isExiting: true }
        : notification
    ));

    setTimeout(() => {
      setNotifications(notifications.filter((notification) => notification.id !== id));
    }, 300);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isNew: false,
      }))
    );
    handleMenuClose();
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    handleMenuClose();
  };

  const handleRealTimeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRealTimeNotifications(event.target.checked);
  };

  // Filter notifications based on tab
  const filteredNotifications = notifications.filter(notification => {
    if (tabValue === 0) return true; // All notifications
    if (tabValue === 1) return notification.type === 'account'; // Account notifications
    if (tabValue === 2) return notification.type === 'system'; // System notifications
    if (tabValue === 3) return notification.type === 'alert'; // Alert notifications
    return true;
  });

  // Count new notifications
  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  return (
    <NotificationsContainer className={className}>
      <NotificationHeader>
        <IconButton size="small" sx={{
          transition: 'all 0.2s ease-in-out',
          '&:hover': { transform: 'translateX(-2px)' }
        }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2, fontWeight: 700 }}>
          Notifications
          {newNotificationsCount > 0 && (
            <Badge
              badgeContent={newNotificationsCount}
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
          <Tooltip title="Notification settings">
            <IconButton size="small" onClick={() => {}}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Options Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: BORDER_RADIUS.md,
              minWidth: 200,
              boxShadow: mode === 'dark'
                ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                : '0 4px 20px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <MenuItem onClick={markAllAsRead}>
            <ListItemIcon>
              <DoneAllIcon fontSize="small" />
            </ListItemIcon>
            Mark all as read
          </MenuItem>
          <MenuItem onClick={clearAllNotifications}>
            <ListItemIcon>
              <DeleteSweepIcon fontSize="small" />
            </ListItemIcon>
            Clear all notifications
          </MenuItem>
          <Divider />
          <MenuItem>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={realTimeNotifications}
                  onChange={handleRealTimeToggle}
                />
              }
              label="Real-time updates"
            />
          </MenuItem>
        </Menu>
      </NotificationHeader>

      {/* Notification Tabs */}
      <NotificationTabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        aria-label="notification categories"
      >
        <Tab label={`All (${notifications.length})`} />
        <Tab label="Accounts" />
        <Tab label="System" />
        <Tab label="Alerts" />
      </NotificationTabs>

      <List
        disablePadding
        sx={{
          overflow: 'auto',
          height: 'calc(100vh - 170px)',
          py: 1
        }}
      >
        {filteredNotifications.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 3,
            opacity: 0.7
          }}>
            <Box sx={{ mb: 2 }}>
              <NotificationsIcon sx={{ fontSize: 60, opacity: 0.3 }} />
            </Box>
            <Typography variant="h6" color="text.secondary" align="center">
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              You're all caught up! Check back later for updates.
            </Typography>
          </Box>
        ) : (
          filteredNotifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <NotificationItem
                onClick={() => toggleExpand(notification.id)}
                sx={{
                  position: 'relative',
                  opacity: notification.isExiting ? 0 : 1,
                  height: notification.isExiting ? 0 : 'auto',
                  padding: notification.isExiting ? '0 24px' : undefined,
                  transition: 'all 0.3s ease-in-out',
                  backgroundColor: notification.isNew
                    ? (mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)')
                    : 'transparent',
                }}
              >
                {notification.isNew && <NewBadge />}
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                      {notification.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 500 }}>
                        {notification.timeAgo}
                      </Typography>
                      <DismissButton size="small" onClick={(e) => dismissNotification(notification.id, e)}>
                        <CloseIcon fontSize="small" />
                      </DismissButton>
                    </Box>
                  </Box>
                  <ContentCollapse expanded={notification.expanded}>
                    <Typography variant="body2" color="text.secondary" noWrap={!notification.expanded}>
                      {notification.content}
                    </Typography>
                  </ContentCollapse>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {notification.expanded ? (
                      <IconButton size="small" sx={{ ml: -1, p: 0.5, color: 'primary.main' }}>
                        <ExpandLessIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton size="small" sx={{ ml: -1, p: 0.5, color: 'text.secondary' }}>
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{
                        ml: 1,
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {notification.expanded ? 'Show less' : 'Read more'}
                    </Typography>
                  </Box>
                </Box>
                <CompanyLogo>
                  <img
                    src={notification.logoSrc}
                    alt={notification.title}
                    width="30"
                    height="30"
                    onError={(e) => {
                      // Fallback for missing images
                      (e.target as HTMLImageElement).src = '/inspire-logo.svg';
                    }}
                  />
                </CompanyLogo>
              </NotificationItem>
            </React.Fragment>
          ))
        )}
      </List>

      {/* Footer with actions */}
      <NotificationFooter>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <ActionButton
            variant="outlined"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={markAllAsRead}
            disabled={!notifications.some(n => n.isNew)}
          >
            Mark all as read
          </ActionButton>
          <ActionButton
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            Clear all
          </ActionButton>
        </Box>
      </NotificationFooter>
    </NotificationsContainer>
  );
};

export default Notifications; 
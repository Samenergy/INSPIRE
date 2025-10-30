import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import icons
import LogoutIcon from '@mui/icons-material/Logout';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SaveIcon from '@mui/icons-material/Save';

// Constants for consistent styling
const BORDER_RADIUS = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
};

const TRANSITIONS = {
  fast: 'all 0.1s ease',
  medium: 'all 0.2s ease',
  slow: 'all 0.3s ease',
};

const SettingsContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  maxWidth: '1200px',
  margin: '0 auto',
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.lg,
  marginBottom: theme.spacing(3),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.2)'
    : '0 4px 20px rgba(0, 0, 0, 0.05)',
  overflow: 'visible',
  transition: TRANSITIONS.medium,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    minWidth: 100,
    padding: theme.spacing(1.5, 2),
    '&.Mui-selected': {
      fontWeight: 700,
    },
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.md,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'black',
  color: theme.palette.mode === 'dark' ? 'black' : 'white',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
    boxShadow: 'none',
    transform: 'translateY(-2px)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.md,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    transform: 'translateY(-2px)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: BORDER_RADIUS.md,
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
      borderWidth: '1.5px',
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: BORDER_RADIUS.md,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: BORDER_RADIUS.md,
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
      borderWidth: '1.5px',
    },
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const { mode, toggleColorMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  const handleSaveSettings = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <SettingsContainer>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
        <SaveButton
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </SaveButton>
      </Box>

      <SettingsCard>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
        >
          <Tab
            icon={<PaletteIcon sx={{ mr: 1, fontSize: 20 }} />}
            iconPosition="start"
            label="Appearance"
          />
          <Tab
            icon={<NotificationsIcon sx={{ mr: 1, fontSize: 20 }} />}
            iconPosition="start"
            label="Notifications"
          />
          <Tab
            icon={<SecurityIcon sx={{ mr: 1, fontSize: 20 }} />}
            iconPosition="start"
            label="Security"
          />
          <Tab
            icon={<LogoutIcon sx={{ mr: 1, fontSize: 20 }} />}
            iconPosition="start"
            label="Account"
            sx={{ color: 'error.main' }}
          />
        </StyledTabs>

        {/* Appearance Tab */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Theme
                    </Typography>
                    <Tooltip title="Choose between light and dark mode">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      borderRadius: BORDER_RADIUS.md,
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: BORDER_RADIUS.md,
                        border: '2px solid',
                        borderColor: mode === 'light' ? 'primary.main' : 'transparent',
                        bgcolor: 'white',
                        color: 'black',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: TRANSITIONS.medium,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                      onClick={() => mode === 'dark' && toggleColorMode()}
                    >
                      <LightModeIcon />
                      <Typography variant="body2" fontWeight="medium">Light</Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: BORDER_RADIUS.md,
                        border: '2px solid',
                        borderColor: mode === 'dark' ? 'primary.main' : 'transparent',
                        bgcolor: '#121212',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: TRANSITIONS.medium,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        },
                      }}
                      onClick={() => mode === 'light' && toggleColorMode()}
                    >
                      <DarkModeIcon />
                      <Typography variant="body2" fontWeight="medium">Dark</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Language
                    </Typography>
                  </Box>

                  <StyledFormControl fullWidth>
                    <InputLabel id="language-select-label">Language</InputLabel>
                    <Select
                      labelId="language-select-label"
                      id="language-select"
                      value={language}
                      label="Language"
                      onChange={(e) => setLanguage(e.target.value as string)}
                      sx={{ borderRadius: BORDER_RADIUS.md }}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                      <MenuItem value="zh">Chinese</MenuItem>
                      <MenuItem value="ja">Japanese</MenuItem>
                    </Select>
                  </StyledFormControl>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Timezone
                    </Typography>
                  </Box>

                  <StyledFormControl fullWidth>
                    <InputLabel id="timezone-select-label">Timezone</InputLabel>
                    <Select
                      labelId="timezone-select-label"
                      id="timezone-select"
                      value={timezone}
                      label="Timezone"
                      onChange={(e) => setTimezone(e.target.value as string)}
                      sx={{ borderRadius: BORDER_RADIUS.md }}
                    >
                      <MenuItem value="UTC">UTC (Coordinated Universal Time)</MenuItem>
                      <MenuItem value="EST">EST (Eastern Standard Time)</MenuItem>
                      <MenuItem value="CST">CST (Central Standard Time)</MenuItem>
                      <MenuItem value="MST">MST (Mountain Standard Time)</MenuItem>
                      <MenuItem value="PST">PST (Pacific Standard Time)</MenuItem>
                      <MenuItem value="GMT">GMT (Greenwich Mean Time)</MenuItem>
                      <MenuItem value="CET">CET (Central European Time)</MenuItem>
                      <MenuItem value="JST">JST (Japan Standard Time)</MenuItem>
                      <MenuItem value="AEST">AEST (Australian Eastern Standard Time)</MenuItem>
                    </Select>
                  </StyledFormControl>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Your current local time: {new Date().toLocaleTimeString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Email Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage the emails you want to receive
              </Typography>

              <Box sx={{
                p: 3,
                borderRadius: BORDER_RADIUS.md,
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: mode === 'dark' ? 'white' : 'black',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: mode === 'dark' ? 'white' : 'black',
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">All Email Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enable or disable all email notifications
                      </Typography>
                    </Box>
                  }
                />

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={securityAlerts}
                      onChange={() => setSecurityAlerts(!securityAlerts)}
                      disabled={!emailNotifications}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: mode === 'dark' ? 'white' : 'black',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: mode === 'dark' ? 'white' : 'black',
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">Security Alerts</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Get notified about security events like password changes
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={marketingEmails}
                      onChange={() => setMarketingEmails(!marketingEmails)}
                      disabled={!emailNotifications}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: mode === 'dark' ? 'white' : 'black',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: mode === 'dark' ? 'white' : 'black',
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">Marketing Emails</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive updates about new features and promotions
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Push Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Control notifications that appear on your device
              </Typography>

              <Box sx={{
                p: 3,
                borderRadius: BORDER_RADIUS.md,
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pushNotifications}
                      onChange={() => setPushNotifications(!pushNotifications)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: mode === 'dark' ? 'white' : 'black',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: mode === 'dark' ? 'white' : 'black',
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">Enable Push Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Allow notifications to be displayed on your device
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Box>
          </CardContent>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Change Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Update your password to keep your account secure
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <StyledTextField
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                    />
                    <StyledTextField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                    />
                    <StyledTextField
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <SaveButton
                        disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      >
                        Update Password
                      </SaveButton>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Two-Factor Authentication
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Add an extra layer of security to your account
                  </Typography>

                  <Box sx={{
                    p: 3,
                    borderRadius: BORDER_RADIUS.md,
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={twoFactorEnabled}
                          onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: mode === 'dark' ? 'white' : 'black',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: mode === 'dark' ? 'white' : 'black',
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="medium">Enable Two-Factor Authentication</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Require a verification code when logging in
                          </Typography>
                        </Box>
                      }
                    />

                    {twoFactorEnabled && (
                      <Alert severity="info" sx={{ mt: 2, borderRadius: BORDER_RADIUS.md }}>
                        Two-factor authentication is enabled. You'll receive a verification code when logging in from a new device.
                      </Alert>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </TabPanel>

        {/* Account Tab */}
        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" color="error" gutterBottom>
                Logout
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Logging out will end your current session. You will need to log in again to access your account.
              </Typography>

              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  borderRadius: BORDER_RADIUS.md,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: TRANSITIONS.medium,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Logout
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box>
              <Typography variant="h6" fontWeight="bold" color="error" gutterBottom>
                Delete Account
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Permanently delete your account and all associated data. This action cannot be undone.
              </Typography>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                sx={{
                  borderRadius: BORDER_RADIUS.md,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: TRANSITIONS.medium,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Delete Account
              </Button>
            </Box>
          </CardContent>
        </TabPanel>
      </SettingsCard>
    </SettingsContainer>
  );
};

export default Settings;
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  Divider,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  styled,
  Tab,
  Tabs,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { BORDER_RADIUS, TRANSITIONS } from '../ui/common/constants';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  margin: '0 auto',
  transition: TRANSITIONS.medium,
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const AvatarEditButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.mode === 'dark' ? 'white' : 'black',
  color: theme.palette.mode === 'dark' ? 'black' : 'white',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
  },
  width: 36,
  height: 36,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)',
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.lg,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.2)' 
    : '0 4px 20px rgba(0, 0, 0, 0.05)',
  overflow: 'visible',
  transition: TRANSITIONS.medium,
  height: '100%',
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

const ProfileSettings: React.FC = () => {
  const { mode } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    contact_email: user?.contact_email || '',
    sector: user?.sector || '',
    objective: user?.objective || '',
    company: 'Acme Inc.',
    location: 'San Francisco, CA',
    bio: 'SME focused on business growth and development.',
    website: 'https://example.com',
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    accountActivity: true,
    marketingEmails: false,
    newFeatures: true,
    securityAlerts: true,
  });
  
  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  // Form errors
  const [profileErrors, setProfileErrors] = useState({
    name: '',
    contact_email: '',
    sector: '',
    objective: '',
  });
  
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
    
    // Clear error when user types
    if (profileErrors[name as keyof typeof profileErrors]) {
      setProfileErrors({
        ...profileErrors,
        [name]: '',
      });
    }
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
    
    // Clear error when user types
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: '',
      });
    }
    
    // Check password match when typing confirm password
    if (name === 'confirmPassword' && passwordForm.newPassword !== value) {
      setPasswordErrors({
        ...passwordErrors,
        confirmPassword: 'Passwords do not match',
      });
    } else if (name === 'confirmPassword') {
      setPasswordErrors({
        ...passwordErrors,
        confirmPassword: '',
      });
    }
    
    // Update confirm password error when new password changes
    if (name === 'newPassword' && passwordForm.confirmPassword && passwordForm.confirmPassword !== value) {
      setPasswordErrors({
        ...passwordErrors,
        confirmPassword: 'Passwords do not match',
      });
    } else if (name === 'newPassword' && passwordForm.confirmPassword && passwordForm.confirmPassword === value) {
      setPasswordErrors({
        ...passwordErrors,
        confirmPassword: '',
      });
    }
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };
  
  const validateProfileForm = () => {
    const errors = {
      name: '',
      contact_email: '',
      sector: '',
      objective: '',
    };
    let isValid = true;
    
    if (!profileForm.name) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!profileForm.contact_email) {
      errors.contact_email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(profileForm.contact_email)) {
      errors.contact_email = 'Email is invalid';
      isValid = false;
    }
    
    if (!profileForm.sector) {
      errors.sector = 'Sector is required';
      isValid = false;
    }
    
    if (!profileForm.objective) {
      errors.objective = 'Description is required';
      isValid = false;
    }
    
    setProfileErrors(errors);
    return isValid;
  };
  
  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    let isValid = true;
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    setProfileForm({
      name: user?.name || '',
      contact_email: user?.contact_email || '',
      sector: user?.sector || '',
      objective: user?.objective || '',
      company: 'Acme Inc.',
      location: 'San Francisco, CA',
      bio: 'SME focused on business growth and development.',
      website: 'https://example.com',
    });
    setProfileErrors({
      name: '',
      contact_email: '',
      sector: '',
      objective: '',
    });
  };
  
  const handleSaveProfile = async () => {
    if (validateProfileForm()) {
      setIsSubmitting(true);
      
      try {
        // Prepare update data - ensure we send valid values
        const updateData: { sector?: string; objective?: string } = {};
        
        // Only include fields that have values
        if (profileForm.sector && profileForm.sector.trim()) {
          updateData.sector = profileForm.sector.trim();
        }
        
        if (profileForm.objective && profileForm.objective.trim()) {
          updateData.objective = profileForm.objective.trim();
        }
        
        // Ensure at least one field is being updated
        if (Object.keys(updateData).length === 0) {
          setSnackbar({
            open: true,
            message: 'Please provide at least one field to update',
            severity: 'warning',
          });
          setIsSubmitting(false);
          return;
        }
        
        console.log('Sending profile update:', updateData);
        
        // Call the actual API to update profile
        const response = await updateProfile(updateData);
        
        console.log('Profile update response:', response);
        
        if (response.success) {
          setIsEditing(false);
          setSnackbar({
            open: true,
            message: 'Profile updated successfully!',
            severity: 'success',
          });
        } else {
          setSnackbar({
            open: true,
            message: response.message || response.error || 'Failed to update profile',
            severity: 'error',
          });
        }
      } catch (error: any) {
        console.error('Profile update error:', error);
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.message || 
                           'Failed to update profile. Please try again.';
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleChangePassword = async () => {
    if (validatePasswordForm()) {
      setIsSubmitting(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reset password form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        setSnackbar({
          open: true,
          message: 'Password changed successfully',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to change password',
          severity: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleSaveNotifications = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: 'Notification preferences saved',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save notification preferences',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };
  
  const handleLogout = () => {
    logout();
    // Redirect will happen automatically via the ProtectedRoute component
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your account settings and preferences
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Left sidebar with profile summary */}
        <Grid item xs={12} md={4}>
          <SettingsCard>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ position: 'relative', width: 'fit-content', mx: 'auto' }}>
                <ProfileAvatar
                  alt={user?.name || 'User'}
                >
                  {!user || !user.name ? 'U' : (() => {
                    const nameParts = user.name.trim().split(' ');
                    if (nameParts.length >= 2) {
                      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
                    }
                    return user.name.charAt(0).toUpperCase();
                  })()}
                </ProfileAvatar>
                <AvatarEditButton size="small">
                  <CameraAltIcon fontSize="small" />
                </AvatarEditButton>
              </Box>
              
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileForm.sector} Sector
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {profileForm.contact_email}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 2 }}>
                {profileForm.objective || 'No description set'}
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                sx={{
                  borderRadius: BORDER_RADIUS.md,
                  textTransform: 'none',
                  fontWeight: 600,
                  mt: 2,
                }}
              >
                Logout
              </Button>
            </CardContent>
          </SettingsCard>
        </Grid>
        
        {/* Right content area with tabs */}
        <Grid item xs={12} md={8}>
          <SettingsCard>
            <StyledTabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="settings tabs"
            >
              <Tab 
                icon={<PersonIcon sx={{ mr: 1, fontSize: 20 }} />}
                iconPosition="start"
                label="Personal Info" 
              />
              <Tab 
                icon={<SecurityIcon sx={{ mr: 1, fontSize: 20 }} />}
                iconPosition="start"
                label="Security" 
              />
              <Tab 
                icon={<NotificationsIcon sx={{ mr: 1, fontSize: 20 }} />}
                iconPosition="start"
                label="Notifications" 
              />
            </StyledTabs>
            
            {/* Personal Info Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3, pb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                  {!isEditing ? (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={handleEditProfile}
                      sx={{
                        borderRadius: BORDER_RADIUS.md,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : null}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Full Name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      fullWidth
                      disabled={!isEditing}
                      error={!!profileErrors.name}
                      helperText={profileErrors.name}
                      required={isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Email Address"
                      name="contact_email"
                      type="email"
                      value={profileForm.contact_email}
                      onChange={handleProfileChange}
                      fullWidth
                      disabled={!isEditing}
                      error={!!profileErrors.contact_email}
                      helperText={profileErrors.contact_email}
                      required={isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Sector"
                      name="sector"
                      value={profileForm.sector}
                      onChange={handleProfileChange}
                      fullWidth
                      disabled={!isEditing}
                      error={!!profileErrors.sector}
                      helperText={profileErrors.sector}
                      required={isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Description"
                      name="objective"
                      value={profileForm.objective}
                      onChange={handleProfileChange}
                      fullWidth
                      disabled={!isEditing}
                      error={!!profileErrors.objective}
                      helperText={profileErrors.objective}
                      required={isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Job Title"
                      name="jobTitle"
                      value={profileForm.jobTitle}
                      onChange={handleProfileChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Company"
                      name="company"
                      value={profileForm.company}
                      onChange={handleProfileChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Location"
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Website"
                      name="website"
                      value={profileForm.website}
                      onChange={handleProfileChange}
                      fullWidth
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Bio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      fullWidth
                      multiline
                      rows={4}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
                
                {isEditing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                    <CancelButton onClick={handleCancelEdit}>
                      Cancel
                    </CancelButton>
                    <SaveButton
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </SaveButton>
                  </Box>
                )}
              </Box>
            </TabPanel>
            
            {/* Security Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 3, pb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Ensure your account is using a strong password to protect your information.
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Current Password"
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                            >
                              {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="New Password"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword || "Password must be at least 8 characters"}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword}
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <SaveButton
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleChangePassword}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Changing...' : 'Change Password'}
                  </SaveButton>
                </Box>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Account Security
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Additional security options to protect your account.
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={true} />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>Two-Factor Authentication</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add an extra layer of security to your account
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
                  />
                  
                  <FormControlLabel
                    control={<Switch checked={false} />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>Login Notifications</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Receive alerts when your account is accessed from a new device
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
                  />
                </Box>
              </Box>
            </TabPanel>
            
            {/* Notifications Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ px: 3, pb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Notification Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage how and when you receive notifications.
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.emailNotifications} 
                        onChange={handleNotificationChange}
                        name="emailNotifications"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>Email Notifications</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Receive notifications via email
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}
                  />
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                    Email me about:
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.accountActivity} 
                        onChange={handleNotificationChange}
                        name="accountActivity"
                      />
                    }
                    label="Account activity and changes"
                    sx={{ mb: 2, ml: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.newFeatures} 
                        onChange={handleNotificationChange}
                        name="newFeatures"
                      />
                    }
                    label="New features and updates"
                    sx={{ mb: 2, ml: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.marketingEmails} 
                        onChange={handleNotificationChange}
                        name="marketingEmails"
                      />
                    }
                    label="Marketing and promotional emails"
                    sx={{ mb: 2, ml: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.securityAlerts} 
                        onChange={handleNotificationChange}
                        name="securityAlerts"
                      />
                    }
                    label="Security alerts"
                    sx={{ mb: 2, ml: 2 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <SaveButton
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveNotifications}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Preferences'}
                  </SaveButton>
                </Box>
              </Box>
            </TabPanel>
          </SettingsCard>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: BORDER_RADIUS.md,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileSettings;
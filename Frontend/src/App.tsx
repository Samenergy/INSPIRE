import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Notifications from './components/notifications/Notifications';
import Companies from './components/accounts/Accounts';
import AccountsNew from './components/accounts/AccountsNew';
import Campaigns from './components/campaigns';
import Settings from './components/settings/Settings';
import ProfileSettings from './components/settings/ProfileSettings';
import LandingPage from './components/auth/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import SMESetupPage from './components/auth/SMESetupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [campaignNotificationCount, setCampaignNotificationCount] = React.useState(0);
  const [showCampaignNotification, setShowCampaignNotification] = React.useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNewCampaign = () => {
    setCampaignNotificationCount(prev => prev + 1);
    setShowCampaignNotification(true);
  };

  const clearCampaignNotifications = () => {
    setCampaignNotificationCount(0);
    setShowCampaignNotification(false);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/sme-setup" element={<SMESetupPage />} />
            <Route path="/logout" element={<LogoutRedirect />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout 
                  toggleNotifications={toggleNotifications} 
                  showNotifications={showNotifications}
                  campaignNotificationCount={campaignNotificationCount}
                  showCampaignNotification={showCampaignNotification}
                  onCampaignNotificationClick={clearCampaignNotifications}
                >
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            {/* Advanced Analytics route removed - charts moved to main dashboard */}
            <Route path="/companies" element={
              <ProtectedRoute>
                <AppLayout 
                  toggleNotifications={toggleNotifications} 
                  showNotifications={showNotifications}
                  campaignNotificationCount={campaignNotificationCount}
                  showCampaignNotification={showCampaignNotification}
                  onCampaignNotificationClick={clearCampaignNotifications}
                >
                  <Companies onNewCampaign={handleNewCampaign} />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/accounts/new" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <AccountsNew />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <AppLayout 
                  toggleNotifications={toggleNotifications} 
                  showNotifications={showNotifications}
                  campaignNotificationCount={campaignNotificationCount}
                  showCampaignNotification={showCampaignNotification}
                  onCampaignNotificationClick={clearCampaignNotifications}
                >
                  <Campaigns onVisit={clearCampaignNotifications} />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings/profile" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <ProfileSettings />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings/notifications" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <ProfileSettings />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings/security" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <ProfileSettings />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/help" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <Box sx={{ p: 4 }}>
                    <h1>Help & Support</h1>
                    <p>This page is under construction.</p>
                  </Box>
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// App layout component for authenticated pages
interface AppLayoutProps {
  children: React.ReactNode;
  toggleNotifications: () => void;
  showNotifications: boolean;
  campaignNotificationCount?: number;
  showCampaignNotification?: boolean;
  onCampaignNotificationClick?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  toggleNotifications, 
  showNotifications,
  campaignNotificationCount = 0,
  showCampaignNotification = false,
  onCampaignNotificationClick
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Sidebar 
        toggleNotifications={toggleNotifications}
        campaignNotificationCount={campaignNotificationCount}
        showCampaignNotification={showCampaignNotification}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          position: 'relative',
          width: 'calc(100% - 80px)',
          padding: '0 24px', // Add consistent horizontal padding
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Box>
      <div className={showNotifications ? 'open' : ''}>
        <Notifications className={showNotifications ? 'open' : ''} />
      </div>
    </Box>
  );
};

// Logout redirect component
const LogoutRedirect: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Logging out...
  </Box>;
};

export default App;

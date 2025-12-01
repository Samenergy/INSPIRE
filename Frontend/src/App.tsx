import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Sidebar from './components/layout/Sidebar';
import Notifications from './components/notifications/Notifications';
import LandingPage from './components/auth/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import SMESetupPage from './components/auth/SMESetupPage';
import TermsAndConditions from './components/auth/TermsAndConditions';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load heavy components for code splitting
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Companies = lazy(() => import('./components/accounts/Accounts'));
const AccountsNew = lazy(() => import('./components/accounts/AccountsNew'));
const Campaigns = lazy(() => import('./components/campaigns'));
const Settings = lazy(() => import('./components/settings/Settings'));
const ProfileSettings = lazy(() => import('./components/settings/ProfileSettings'));

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
    }}
  >
    <CircularProgress />
  </Box>
);

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
            <Route path="/terms" element={<TermsAndConditions />} />
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
                  <Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </Suspense>
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
                  <Suspense fallback={<LoadingFallback />}>
                    <Companies onNewCampaign={handleNewCampaign} />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/accounts/new" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <Suspense fallback={<LoadingFallback />}>
                    <AccountsNew />
                  </Suspense>
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
                  <Suspense fallback={<LoadingFallback />}>
                    <Campaigns onVisit={clearCampaignNotifications} />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <Suspense fallback={<LoadingFallback />}>
                    <Settings />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings/profile" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <Suspense fallback={<LoadingFallback />}>
                    <ProfileSettings />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings/notifications" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <Suspense fallback={<LoadingFallback />}>
                    <ProfileSettings />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/settings/security" element={
              <ProtectedRoute>
                <AppLayout toggleNotifications={toggleNotifications} showNotifications={showNotifications}>
                  <Suspense fallback={<LoadingFallback />}>
                    <ProfileSettings />
                  </Suspense>
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

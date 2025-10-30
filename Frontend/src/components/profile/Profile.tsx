import React from 'react';
import { Box, Typography, Paper, Avatar, Divider, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';

const ProfileContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default,
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const Profile = () => {
  const { mode } = useTheme();

  return (
    <ProfileContainer>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Profile
      </Typography>
      
      <ProfileCard>
        <ProfileHeader>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            JD
          </Avatar>
          <ProfileInfo>
            <Typography variant="h5" fontWeight="bold">
              John Doe
            </Typography>
            <Typography variant="body1" color="text.secondary">
              john.doe@example.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Account Manager
            </Typography>
          </ProfileInfo>
        </ProfileHeader>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Personal Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Full Name
              </Typography>
              <Typography variant="body1">
                John Doe
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                john.doe@example.com
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">
                +1 (555) 123-4567
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">
                New York, USA
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Account Settings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="primary">
              Edit Profile
            </Button>
            <Button variant="outlined" color="primary">
              Change Password
            </Button>
            <Button variant="outlined" color="secondary">
              Notification Settings
            </Button>
          </Box>
        </Box>
      </ProfileCard>
      
      <ProfileCard>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Recent Activity
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((item) => (
            <Box key={item} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Updated account settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile;
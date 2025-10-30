import React from 'react';
import { Box, Typography, styled, Container, Grid, Paper, Button } from '@mui/material';
import ClientLifetimeValueChart from './ClientLifetimeValueChart';
import ClientFunnelChartNew from './ClientFunnelChartNew';
import RevenueForecastChart from './RevenueForecastChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3, 0),
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const BackButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const AdvancedAnalytics: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Container maxWidth="xl">
        <BackButton 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </BackButton>
        
        <Header>
          <Typography variant="h4" fontWeight="bold">
            Book of Business Analytics
          </Typography>
        </Header>
        
        <Box sx={{ mb: 4 }}>
          <RevenueForecastChart />
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <ClientLifetimeValueChart />
          </Grid>
          <Grid item xs={12} lg={6}>
            <ClientFunnelChartNew />
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
};

export default AdvancedAnalytics;
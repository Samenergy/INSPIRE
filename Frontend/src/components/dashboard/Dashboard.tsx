import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Chip,
  styled,
  useTheme as useMuiTheme,
  Tooltip as MuiTooltip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ClientLifetimeValueChart from './ClientLifetimeValueChart';
import ClientFunnelChartNew from './ClientFunnelChartNew';
import RevenueForecastChart from './RevenueForecastChart';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(0, 3), // Add horizontal padding
  boxSizing: 'border-box',
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const SearchBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '3px',
  padding: theme.spacing(0.5, 2),
  width: '300px',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#e0e0e0'}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.05)',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : '#d0d0d0',
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.light}30`,
  },
}));

// Create a styled button that doesn't pass the 'active' prop to the DOM
const FilterButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ theme, active }) => ({
  backgroundColor: active ? theme.palette.secondary.main : 'transparent',
  color: active ? theme.palette.secondary.contrastText : theme.palette.text.primary,
  borderRadius: '3px',
  padding: theme.spacing(0.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: active ? theme.palette.secondary.main : theme.palette.action.hover,
    transform: active ? 'none' : 'translateY(-1px)',
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const ViewAllLink = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.primary.main,
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.dark,
    transform: 'translateX(2px)',
  },
}));

// Create a styled component for the ViewAllLink that uses react-router-dom
const RouterViewAllLink = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.primary.main,
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.dark,
    transform: 'translateX(2px)',
  },
}));

// Create a styled button for navigating to advanced analytics
const AnalyticsButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '8px',
  boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '3px',
  marginBottom: theme.spacing(4),
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.07)',
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
}));

const AnalysisContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '3px',
  marginBottom: theme.spacing(2),
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.07)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
}));

const SuggestionChip = styled(Chip)(({ theme }) => ({
  borderRadius: '3px',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
  margin: theme.spacing(0, 1, 1, 0),
  fontWeight: 600,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#e0e0e0',
    transform: 'scale(1.02)',
  },
}));

const Dashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'below' | 'above'>('all');
  const [chartMenuAnchorEl, setChartMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('quarter');
  const theme = useMuiTheme();
  const { mode } = useTheme();
  const navigate = useNavigate();

  const handleFilterChange = (filter: 'all' | 'below' | 'above') => {
    setActiveFilter(filter);
  };

  const handleChartMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setChartMenuAnchorEl(event.currentTarget);
  };

  const handleChartMenuClose = () => {
    setChartMenuAnchorEl(null);
  };

  const handleTimeRangeChange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
    handleChartMenuClose();
  };

  // Organization types with exit rates
  const organizationTypes = [
    { type: 'Banking', exitRate: 4.2, color: '#4285F4' },
    { type: 'Insurance', exitRate: 3.7, color: '#34A853' },
    { type: 'Healthcare', exitRate: 5.1, color: '#FBBC05' },
    { type: 'Technology', exitRate: 2.8, color: '#EA4335' },
    { type: 'Retail', exitRate: 3.9, color: '#8E24AA' },
    { type: 'Manufacturing', exitRate: 4.5, color: '#00ACC1' },
    { type: 'Education', exitRate: 2.3, color: '#FF6D00' },
  ];

  // Sort by exit rate (highest to lowest)
  const sortedOrganizations = [...organizationTypes].sort((a, b) => b.exitRate - a.exitRate);

  // Chart data
  const chartData = {
    labels: sortedOrganizations.map(org => org.type),
    datasets: [
      {
        label: 'Exit Rate (%)',
        data: sortedOrganizations.map(org => org.exitRate),
        backgroundColor: sortedOrganizations.map(org => org.color),
        borderRadius: 6,
        borderWidth: 0,
        barThickness: 40,
        maxBarThickness: 60,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // Horizontal bar chart
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: mode === 'dark' ? '#e0e0e0' : '#202124',
        bodyColor: mode === 'dark' ? '#a0a0a0' : '#5f6368',
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: any) {
            return `Exit Rate: ${context.parsed.x}%`;
          },
          afterLabel: function(context: any) {
            const orgIndex = context.dataIndex;
            const orgType = sortedOrganizations[orgIndex].type;
            return `Organization: ${orgType}`;
          },
        },
      },
    },
    scales: {
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: mode === 'dark' ? '#a0a0a0' : '#5f6368',
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      x: {
        grid: {
          display: true,
          drawBorder: false,
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: mode === 'dark' ? '#a0a0a0' : '#5f6368',
          stepSize: 1,
          callback: function(value: any) {
            return value + '%';
          },
          font: {
            size: 12,
          },
        },
        suggestedMin: 0,
        suggestedMax: 6,
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 20,
        top: 20,
        bottom: 10,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <DashboardContainer>
      <Header>
        <Typography variant="h5" fontWeight={600}>
          Eyo Zee, Waguani!
        </Typography>
        <SearchBar>
          <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
          <input
            type="text"
            placeholder="Search"
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              backgroundColor: 'transparent',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.875rem',
              color: theme.palette.text.primary,
            }}
          />
        </SearchBar>
      </Header>

      <Typography 
        variant="h4" 
        fontWeight={800} 
        mb={3}
        sx={{ 
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: 40,
            height: 4,
            backgroundColor: '#1a73e8',
            borderRadius: 2,
          }
        }}
      >
        Companies Overview
      </Typography>

      <Box mb={4}>
        <ButtonGroup variant="outlined" sx={{ mb: 3 }}>
          <FilterButton 
            active={activeFilter === 'all'} 
            onClick={() => handleFilterChange('all')}
          >
            All
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'below'} 
            onClick={() => handleFilterChange('below')}
          >
            Below 5K
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'above'} 
            onClick={() => handleFilterChange('above')}
          >
            Above 5K
          </FilterButton>
          <FilterButton 
            active={false}
          >
            0/no exit rate
          </FilterButton>
        </ButtonGroup>
      </Box>

      <SectionHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            Exit Rate by Organization Type
          </Typography>
          <MuiTooltip
            title="Shows the percentage of clients who have terminated their contracts within the selected time period, grouped by organization type."
            arrow
            placement="top"
          >
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </MuiTooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="text"
            size="small"
            sx={{
              mr: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: theme.palette.primary.main,
            }}
            onClick={(e) => handleChartMenuOpen(e)}
            endIcon={<MoreVertIcon fontSize="small" />}
          >
            {timeRange === 'week' ? 'Last 7 days' :
             timeRange === 'month' ? 'Last 30 days' :
             timeRange === 'quarter' ? 'Last quarter' : 'Last year'}
          </Button>
          <Menu
            anchorEl={chartMenuAnchorEl}
            open={Boolean(chartMenuAnchorEl)}
            onClose={handleChartMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px',
              }
            }}
          >
            <MenuItem onClick={() => handleTimeRangeChange('week')} selected={timeRange === 'week'}>
              Last 7 days
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('month')} selected={timeRange === 'month'}>
              Last 30 days
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('quarter')} selected={timeRange === 'quarter'}>
              Last quarter
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('year')} selected={timeRange === 'year'}>
              Last year
            </MenuItem>
          </Menu>
          <IconButton size="small">
            <FileDownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </SectionHeader>

      <ChartContainer>
        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <Box sx={{ height: 400, position: 'relative', p: 1 }}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 2,
            }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Key Insights
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Highest Exit Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: sortedOrganizations[0].color,
                      mr: 1
                    }}
                  />
                  <Typography variant="body1" fontWeight="medium">
                    {sortedOrganizations[0].type}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ ml: 'auto', color: '#EA4335' }}
                  >
                    {sortedOrganizations[0].exitRate}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lowest Exit Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: sortedOrganizations[sortedOrganizations.length - 1].color,
                      mr: 1
                    }}
                  />
                  <Typography variant="body1" fontWeight="medium">
                    {sortedOrganizations[sortedOrganizations.length - 1].type}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ ml: 'auto', color: '#34A853' }}
                  >
                    {sortedOrganizations[sortedOrganizations.length - 1].exitRate}%
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Average Exit Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {(sortedOrganizations.reduce((sum, org) => sum + org.exitRate, 0) / sortedOrganizations.length).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {timeRange === 'quarter' ? 'Q3 2023' :
                   timeRange === 'year' ? '2023' :
                   timeRange === 'month' ? 'Last 30 days' : 'Last 7 days'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </ChartContainer>

      <Box sx={{ mb: 4, mt: 6 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          mb={3}
          sx={{
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 40,
              height: 4,
              backgroundColor: '#1a73e8',
              borderRadius: 2,
            }
          }}
        >
          Revenue & Forecasting
        </Typography>
        <RevenueForecastChart />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          mb={3}
          sx={{
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 40,
              height: 4,
              backgroundColor: '#1a73e8',
              borderRadius: 2,
            }
          }}
        >
          Client Analytics
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <ClientLifetimeValueChart />
          </Grid>
          <Grid item xs={12} lg={6}>
            <ClientFunnelChartNew />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <SectionHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} mr={2}>
            Account Value-Potential Matrix
          </Typography>
          <MuiTooltip
            title="Classifies companies based on their exit rate (value) and growth potential"
            arrow
            placement="top"
          >
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </MuiTooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="text"
            size="small"
            sx={{
              mr: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: theme.palette.primary.main,
            }}
            onClick={() => navigate('/companies')}
            endIcon={<ArrowForwardIcon fontSize="small" />}
          >
            View All Companies
          </Button>
        </Box>
      </SectionHeader>

      <ChartContainer>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 2,
          height: '400px',
          mb: 2
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              bgcolor: 'rgba(46, 204, 113, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              High Value, High Potential
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Strategic Companies
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflow: 'auto',
              flex: 1
            }}>
              {organizationTypes
                .filter(org => org.exitRate > 4.0 && Math.random() > 0.5) // Simulating "high potential" for demo
                .slice(0, 3)
                .map((org, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: org.color,
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    >
                      {org.type.charAt(0)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" noWrap>
                        {org.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Exit Rate: {org.exitRate}%
                      </Typography>
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              bgcolor: 'rgba(52, 152, 219, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              High Value, Low Potential
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Maintain Companies
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflow: 'auto',
              flex: 1
            }}>
              {organizationTypes
                .filter(org => org.exitRate > 4.0 && Math.random() <= 0.5) // Simulating "low potential" for demo
                .slice(0, 3)
                .map((org, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: org.color,
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    >
                      {org.type.charAt(0)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" noWrap>
                        {org.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Exit Rate: {org.exitRate}%
                      </Typography>
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              bgcolor: 'rgba(241, 196, 15, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Low Value, High Potential
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Growth Companies
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflow: 'auto',
              flex: 1
            }}>
              {organizationTypes
                .filter(org => org.exitRate <= 4.0 && Math.random() > 0.5) // Simulating "high potential" for demo
                .slice(0, 3)
                .map((org, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: org.color,
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    >
                      {org.type.charAt(0)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" noWrap>
                        {org.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Exit Rate: {org.exitRate}%
                      </Typography>
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              bgcolor: 'rgba(231, 76, 60, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Low Value, Low Potential
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Review Companies
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflow: 'auto',
              flex: 1
            }}>
              {organizationTypes
                .filter(org => org.exitRate <= 4.0 && Math.random() <= 0.5) // Simulating "low potential" for demo
                .slice(0, 3)
                .map((org, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: org.color,
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    >
                      {org.type.charAt(0)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" noWrap>
                        {org.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Exit Rate: {org.exitRate}%
                      </Typography>
                    </Box>
                  </Box>
                ))
              }
            </Box>
          </Paper>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          Value is based on Exit Rate • Potential is based on growth indicators and market analysis
        </Typography>
      </ChartContainer>

      <Divider sx={{ my: 4 }} />

      <SectionHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} mr={2}>
            Current Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            10 mins ago
          </Typography>
        </Box>
      </SectionHeader>

      <AnalysisContainer>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          Monitor your income regularly to stay on track and allocate a portion to savings each month for better
          financial growth. Monitor your income regularly to stay on track and allocate a portion to savings each
          month for better financial growth. Monitor your income regularly to stay on track and allocate a portion to
          savings each month for better financial growth.
        </Typography>

        <Box mt={3}>
          <SuggestionChip label="Suggested campaigns" />
          <SuggestionChip label="Suggested campaigns" />
          <SuggestionChip label="Suggested campaigns" />
        </Box>
      </AnalysisContainer>
    </DashboardContainer>
  );
};

export default Dashboard; 
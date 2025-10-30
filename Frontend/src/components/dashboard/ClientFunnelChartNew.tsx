import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  styled,
  useTheme as useMuiTheme,
  Tooltip as MuiTooltip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Divider,
  Button,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getClientFunnelData } from '../../services/AnalyticsDataService';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  marginBottom: theme.spacing(4),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.2)' 
    : '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 6px 24px rgba(0, 0, 0, 0.25)' 
      : '0 6px 24px rgba(0, 0, 0, 0.1)',
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  minWidth: 100,
  padding: theme.spacing(1.5, 2),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
}));

const MetricCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const ConversionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  borderRadius: '8px',
  marginBottom: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    transform: 'translateX(4px)',
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
      id={`funnel-tabpanel-${index}`}
      aria-labelledby={`funnel-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ClientFunnelChartProps {
  title?: string;
}

const ClientFunnelChartNew: React.FC<ClientFunnelChartProps> = ({ title = "Client Acquisition & Retention Funnel" }) => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [chartMenuAnchorEl, setChartMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [funnelData, setFunnelData] = useState<{
    acquisition: {
      stages: { name: string; value: number }[];
      conversionRates: { name: string; value: number }[];
    };
    retention: {
      status: { name: string; value: number }[];
      retentionRate: number;
      clientAgeDistribution: { range: string; count: number }[];
      engagementByType: { type: string; avgEngagement: number }[];
    };
  }>({
    acquisition: { stages: [], conversionRates: [] },
    retention: { status: [], retentionRate: 0, clientAgeDistribution: [], engagementByType: [] }
  });
  const theme = useMuiTheme();
  const { mode } = useTheme();

  // Fetch client funnel data
  useEffect(() => {
    const data = getClientFunnelData();
    setFunnelData(data);
  }, []);

  const handleTimeRangeChange = (range: 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
    handleChartMenuClose();
  };

  const handleChartMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setChartMenuAnchorEl(event.currentTarget);
  };

  const handleChartMenuClose = () => {
    setChartMenuAnchorEl(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Check if data is loaded
  const isDataLoaded = funnelData.acquisition.stages.length > 0 && funnelData.retention.status.length > 0;

  // Acquisition funnel data based on real data
  const acquisitionData = {
    labels: isDataLoaded
      ? funnelData.acquisition.stages.map(stage => stage.name)
      : ['Loading...'],
    datasets: [
      {
        data: isDataLoaded
          ? funnelData.acquisition.stages.map(stage => stage.value)
          : [100],
        backgroundColor: [
          '#4285F4',
          '#34A853',
          '#FBBC05',
          '#EA4335',
          '#8E24AA',
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Retention funnel data based on real data
  const retentionData = {
    labels: isDataLoaded
      ? funnelData.retention.status.map(status => status.name)
      : ['Loading...'],
    datasets: [
      {
        data: isDataLoaded
          ? funnelData.retention.status.map(status => status.value)
          : [100],
        backgroundColor: [
          '#34A853',
          '#FBBC05',
          '#EA4335',
          '#4285F4',
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Client age distribution data
  const clientAgeData = {
    labels: isDataLoaded
      ? funnelData.retention.clientAgeDistribution.map(item => item.range)
      : ['Loading...'],
    datasets: [
      {
        label: 'Client Count',
        data: isDataLoaded
          ? funnelData.retention.clientAgeDistribution.map(item => item.count)
          : [0],
        backgroundColor: '#4285F4',
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  // Campaign engagement data
  const engagementData = {
    labels: isDataLoaded
      ? funnelData.retention.engagementByType.map(item => item.type.charAt(0).toUpperCase() + item.type.slice(1))
      : ['Loading...'],
    datasets: [
      {
        label: 'Average Engagement',
        data: isDataLoaded
          ? funnelData.retention.engagementByType.map(item => item.avgEngagement)
          : [0],
        backgroundColor: '#34A853',
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
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
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: mode === 'dark' ? '#a0a0a0' : '#5f6368',
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: mode === 'dark' ? '#a0a0a0' : '#5f6368',
          font: {
            size: 11,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <ChartContainer>
      <SectionHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <MuiTooltip
            title="Visualizes the client journey from acquisition through retention, showing conversion rates at each stage."
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
            {timeRange === 'month' ? 'Last month' : 
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
            <MenuItem onClick={() => handleTimeRangeChange('month')} selected={timeRange === 'month'}>
              Last month
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

      <TabsContainer>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="funnel tabs"
        >
          <StyledTab label="Acquisition" />
          <StyledTab label="Retention" />
        </StyledTabs>
      </TabsContainer>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={acquisitionData} options={doughnutOptions} />
              <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {funnelData.acquisition.conversionRates.find(rate => rate.name === 'Overall Conversion')?.value || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conversion Rate
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Funnel Stages
            </Typography>
            {funnelData.acquisition.stages.map((stage, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {stage.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stage.value.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    width: '100%',
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(stage.value / funnelData.acquisition.stages[0].value) * 100}%`,
                      backgroundColor: acquisitionData.datasets[0].backgroundColor[index % acquisitionData.datasets[0].backgroundColor.length],
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Conversion Rates
            </Typography>
            <Grid container spacing={2}>
              {funnelData.acquisition.conversionRates.map((rate, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <MetricCard>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {rate.name}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={index === 3 ? 'primary' : 'textPrimary'}>
                      {rate.value}%
                    </Typography>
                  </MetricCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={retentionData} options={doughnutOptions} />
              <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {funnelData.retention.retentionRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Retention Rate
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Client Status
            </Typography>
            {funnelData.retention.status.map((status, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {status.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {status.value.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    width: '100%',
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(status.value / funnelData.retention.status.reduce((sum, s) => sum + s.value, 0)) * 100}%`,
                      backgroundColor: retentionData.datasets[0].backgroundColor[index % retentionData.datasets[0].backgroundColor.length],
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Client Age Distribution
            </Typography>
            <Box sx={{ height: 200 }}>
              <Bar data={clientAgeData} options={barOptions} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Campaign Engagement by Type
            </Typography>
            <Box sx={{ height: 200 }}>
              <Bar data={engagementData} options={barOptions} />
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
    </ChartContainer>
  );
};

export default ClientFunnelChartNew;
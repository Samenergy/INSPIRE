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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    minWidth: 100,
    padding: theme.spacing(1, 2),
    '&.Mui-selected': {
      fontWeight: 700,
    },
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const FunnelStage = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
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

const ClientFunnelChart: React.FC<ClientFunnelChartProps> = ({ title = "Client Acquisition & Retention Funnel" }) => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [chartMenuAnchorEl, setChartMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const theme = useMuiTheme();
  const { mode } = useTheme();

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

  // Acquisition funnel data
  const acquisitionData = {
    labels: ['Leads', 'Qualified', 'Proposals', 'Negotiations', 'Closed'],
    datasets: [
      {
        data: [1200, 850, 420, 280, 180],
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

  // Retention funnel data
  const retentionData = {
    labels: ['Active Clients', 'At Risk', 'Churned', 'Reactivated'],
    datasets: [
      {
        data: [720, 85, 45, 20],
        backgroundColor: [
          '#00ACC1',
          '#FF6D00',
          '#D50000',
          '#7CB342',
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Conversion rates data
  const conversionRatesData = {
    labels: ['Lead to Qualified', 'Qualified to Proposal', 'Proposal to Negotiation', 'Negotiation to Closed'],
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: [71, 49, 67, 64],
        backgroundColor: mode === 'dark' ? 'rgba(66, 133, 244, 0.7)' : 'rgba(66, 133, 244, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  // Retention metrics data
  const retentionMetricsData = {
    labels: ['1-3 Months', '4-6 Months', '7-12 Months', '1-2 Years', '2+ Years'],
    datasets: [
      {
        label: 'Retention Rate (%)',
        data: [88, 82, 76, 92, 96],
        backgroundColor: mode === 'dark' ? 'rgba(0, 172, 193, 0.7)' : 'rgba(0, 172, 193, 0.8)',
        borderRadius: 6,
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
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          color: mode === 'dark' ? '#e0e0e0' : '#5f6368',
          font: {
            size: 12,
          },
        },
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
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
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
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y}%`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: true,
          drawBorder: false,
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
          color: mode === 'dark' ? '#a0a0a0' : '#5f6368',
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

  // Calculate key metrics
  const totalLeads = acquisitionData.datasets[0].data[0];
  const closedDeals = acquisitionData.datasets[0].data[4];
  const leadToClientRate = Math.round((closedDeals / totalLeads) * 100);
  
  const activeClients = retentionData.datasets[0].data[0];
  const atRiskClients = retentionData.datasets[0].data[1];
  const churnedClients = retentionData.datasets[0].data[2];
  const churnRate = Math.round((churnedClients / (activeClients + churnedClients)) * 100);

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

      <StyledTabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="funnel tabs"
        centered
      >
        <Tab label="Acquisition" />
        <Tab label="Retention" />
      </StyledTabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ height: 300, position: 'relative', p: 1 }}>
              <Doughnut data={acquisitionData} options={doughnutOptions} />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {leadToClientRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lead to Client
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Funnel Stages
              </Typography>
              {acquisitionData.labels.map((label, index) => (
                <FunnelStage key={label}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: acquisitionData.datasets[0].backgroundColor[index],
                        mr: 1.5,
                      }}
                    />
                    <Typography variant="body2">{label}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {acquisitionData.datasets[0].data[index]}
                    </Typography>
                    {index > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({Math.round((acquisitionData.datasets[0].data[index] / acquisitionData.datasets[0].data[index-1]) * 100)}%)
                      </Typography>
                    )}
                  </Box>
                </FunnelStage>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Conversion Rates by Stage
              </Typography>
              <Box sx={{ height: 250, position: 'relative', p: 1 }}>
                <Bar data={conversionRatesData} options={barOptions} />
              </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <StatBox>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Leads
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalLeads.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {timeRange === 'month' ? 'Last month' : 
                     timeRange === 'quarter' ? 'Last quarter' : 'Last year'}
                  </Typography>
                </StatBox>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatBox>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Closed Deals
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {closedDeals.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {Math.round((closedDeals / acquisitionData.datasets[0].data[3]) * 100)}% close rate
                  </Typography>
                </StatBox>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatBox>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg. Sales Cycle
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    42
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Days from lead to close
                  </Typography>
                </StatBox>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ height: 300, position: 'relative', p: 1 }}>
              <Doughnut data={retentionData} options={doughnutOptions} />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h4" fontWeight="bold" color={churnRate > 10 ? 'error' : 'primary'}>
                  {churnRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Churn Rate
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Client Status
              </Typography>
              {retentionData.labels.map((label, index) => (
                <FunnelStage key={label}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: retentionData.datasets[0].backgroundColor[index],
                        mr: 1.5,
                      }}
                    />
                    <Typography variant="body2">{label}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {retentionData.datasets[0].data[index]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({Math.round((retentionData.datasets[0].data[index] / (activeClients + churnedClients)) * 100)}%)
                    </Typography>
                  </Box>
                </FunnelStage>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Retention Rate by Client Age
              </Typography>
              <Box sx={{ height: 250, position: 'relative', p: 1 }}>
                <Bar data={retentionMetricsData} options={barOptions} />
              </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <StatBox>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Clients
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {activeClients.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {Math.round((activeClients / (activeClients + churnedClients)) * 100)}% retention rate
                  </Typography>
                </StatBox>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatBox>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    At Risk Clients
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {atRiskClients.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {Math.round((atRiskClients / activeClients) * 100)}% of active clients
                  </Typography>
                </StatBox>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatBox>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg. Client Lifetime
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    2.7
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Years per client
                  </Typography>
                </StatBox>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>
    </ChartContainer>
  );
};

export default ClientFunnelChart;
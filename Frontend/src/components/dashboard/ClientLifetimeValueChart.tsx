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
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getClientLifetimeValueData } from '../../services/AnalyticsDataService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  borderRadius: '8px',
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: '6px !important',
    padding: theme.spacing(0.5, 1.5),
    '&.Mui-selected': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
      color: theme.palette.mode === 'dark' ? 'white' : 'black',
      fontWeight: 600,
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

interface ClientLifetimeValueChartProps {
  title?: string;
}

const ClientLifetimeValueChart: React.FC<ClientLifetimeValueChartProps> = ({ title = "Client Lifetime Value by Industry" }) => {
  const [timeRange, setTimeRange] = useState<'1y' | '3y' | '5y' | 'all'>('3y');
  const [chartMenuAnchorEl, setChartMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'value' | 'growth'>('value');
  const [clvData, setClvData] = useState<{
    industries: { name: string; color: string; values: number[]; growth: number }[];
    timeLabels: string[];
  }>({ industries: [], timeLabels: [] });
  const theme = useMuiTheme();
  const { mode } = useTheme();

  // Fetch client lifetime value data
  useEffect(() => {
    const data = getClientLifetimeValueData();
    setClvData(data);
  }, []);

  const handleTimeRangeChange = (range: '1y' | '3y' | '5y' | 'all') => {
    setTimeRange(range);
    handleChartMenuClose();
  };

  const handleChartMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setChartMenuAnchorEl(event.currentTarget);
  };

  const handleChartMenuClose = () => {
    setChartMenuAnchorEl(null);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'value' | 'growth' | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Get industries and time labels from the fetched data
  const { industries, timeLabels } = clvData;
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    // If data is not loaded yet, return empty chart data
    if (!timeLabels || timeLabels.length === 0 || !industries || industries.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    let startIndex = 0;

    switch (timeRange) {
      case '1y':
        startIndex = Math.max(0, timeLabels.length - 2);
        break;
      case '3y':
        startIndex = Math.max(0, timeLabels.length - 4);
        break;
      case '5y':
        startIndex = Math.max(0, timeLabels.length - 6);
        break;
      case 'all':
      default:
        startIndex = 0;
    }

    return {
      labels: timeLabels.slice(startIndex),
      datasets: industries.map(industry => ({
        label: industry.name,
        data: industry.values.slice(startIndex),
        borderColor: industry.color,
        backgroundColor: `${industry.color}20`,
        borderWidth: 2,
        pointBackgroundColor: industry.color,
        pointBorderColor: mode === 'dark' ? '#121212' : '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: viewMode === 'value',
      })),
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: viewMode === 'growth',
        grid: {
          display: true,
          drawBorder: false,
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            if (viewMode === 'value') {
              return new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value);
            } else {
              return value + '%';
            }
          },
          color: mode === 'dark' ? '#a0a0a0' : '#5f6368',
          font: {
            size: 12,
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
            size: 12,
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Get the industry with highest growth (with safety check)
  const highestGrowthIndustry = industries && industries.length > 0
    ? [...industries].sort((a, b) => b.growth - a.growth)[0]
    : { name: 'Loading...', color: '#cccccc', values: [0], growth: 0 };

  // Get the industry with highest current value (with safety check)
  const highestValueIndustry = industries && industries.length > 0
    ? [...industries].sort((a, b) =>
        b.values[b.values.length - 1] - a.values[a.values.length - 1]
      )[0]
    : { name: 'Loading...', color: '#cccccc', values: [0], growth: 0 };

  return (
    <ChartContainer>
      <SectionHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <MuiTooltip
            title="Shows the average revenue generated by clients in each industry segment over their entire relationship with your company."
            arrow
            placement="top"
          >
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </MuiTooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StyledToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="value" aria-label="value view">
              Value
            </ToggleButton>
            <ToggleButton value="growth" aria-label="growth view">
              Growth
            </ToggleButton>
          </StyledToggleButtonGroup>
          
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
            {timeRange === '1y' ? 'Last year' :
             timeRange === '3y' ? 'Last 3 years' :
             timeRange === '5y' ? 'Last 5 years' : 'All time'}
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
            <MenuItem onClick={() => handleTimeRangeChange('1y')} selected={timeRange === '1y'}>
              Last year
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('3y')} selected={timeRange === '3y'}>
              Last 3 years
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('5y')} selected={timeRange === '5y'}>
              Last 5 years
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('all')} selected={timeRange === 'all'}>
              All time
            </MenuItem>
          </Menu>
          <IconButton size="small">
            <FileDownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </SectionHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: 400, position: 'relative', p: 1 }}>
            <Line data={getFilteredData()} options={chartOptions} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12}>
              <StatBox>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Highest Value Industry
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: highestValueIndustry.color,
                      mr: 1
                    }}
                  />
                  <Typography variant="body1" fontWeight="medium">
                    {highestValueIndustry.name}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(highestValueIndustry.values[highestValueIndustry.values.length - 1])}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Average lifetime value per client
                </Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12}>
              <StatBox>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fastest Growing Industry
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: highestGrowthIndustry.color,
                      mr: 1
                    }}
                  />
                  <Typography variant="body1" fontWeight="medium">
                    {highestGrowthIndustry.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#34A853' }}>
                    +{highestGrowthIndustry.growth}%
                  </Typography>
                  <TrendingUpIcon sx={{ ml: 1, color: '#34A853' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Year-over-year growth
                </Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12}>
              <StatBox>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Overall CLV Growth
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  +{industries && industries.length > 0
                    ? Math.round(industries.reduce((sum, industry) => sum + industry.growth, 0) / industries.length)
                    : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Average across all industries
                </Typography>
              </StatBox>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ChartContainer>
  );
};

export default ClientLifetimeValueChart;
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
  Chip,
  Button,
  Divider,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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
import { getRevenueForecastData } from '../../services/AnalyticsDataService';

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

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const OpportunityCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    transform: 'translateY(-2px)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '0.75rem',
}));

interface RevenueForecastChartProps {
  title?: string;
}

const RevenueForecastChart: React.FC<RevenueForecastChartProps> = ({ title = "Revenue Forecast & Opportunities" }) => {
  const [timeRange, setTimeRange] = useState<'quarter' | 'year' | '2years'>('year');
  const [chartMenuAnchorEl, setChartMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [forecastInfo, setForecastInfo] = useState<{
    forecastData: {
      actual: (number | null)[];
      forecast: (number | null)[];
      optimistic: (number | null)[];
      pessimistic: (number | null)[];
    };
    months: string[];
    opportunities: {
      id: string;
      client: string;
      value: number;
      probability: number;
      stage: string;
      expectedClose: string;
      type: string;
    }[];
    metrics: {
      totalRevenue: number;
      monthOverMonthChange: number;
      weightedPipeline: number;
      pipelineToForecastRatio: number;
    };
  }>({
    forecastData: { actual: [], forecast: [], optimistic: [], pessimistic: [] },
    months: [],
    opportunities: [],
    metrics: { totalRevenue: 0, monthOverMonthChange: 0, weightedPipeline: 0, pipelineToForecastRatio: 0 }
  });
  const theme = useMuiTheme();
  const { mode } = useTheme();

  // Fetch revenue forecast data
  useEffect(() => {
    const data = getRevenueForecastData();
    setForecastInfo(data);
  }, []);

  const handleTimeRangeChange = (range: 'quarter' | 'year' | '2years') => {
    setTimeRange(range);
    handleChartMenuClose();
  };

  const handleChartMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setChartMenuAnchorEl(event.currentTarget);
  };

  const handleChartMenuClose = () => {
    setChartMenuAnchorEl(null);
  };

  // Get data from the fetched forecast info
  const { forecastData, months, opportunities } = forecastInfo;

  // Check if data is loaded
  const isDataLoaded = months && months.length > 0 &&
    forecastData && forecastData.actual && forecastData.actual.length > 0;

  // Chart data
  const chartData = {
    labels: isDataLoaded ? months : ['Loading...'],
    datasets: [
      {
        label: 'Actual Revenue',
        data: isDataLoaded ? forecastData.actual : [null],
        borderColor: '#4285F4',
        backgroundColor: '#4285F4',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#4285F4',
        pointBorderColor: mode === 'dark' ? '#121212' : '#fff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Forecast',
        data: isDataLoaded ? forecastData.forecast : [null],
        borderColor: '#34A853',
        backgroundColor: 'rgba(52, 168, 83, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#34A853',
        pointBorderColor: mode === 'dark' ? '#121212' : '#fff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Optimistic',
        data: isDataLoaded ? forecastData.optimistic : [null],
        borderColor: 'rgba(52, 168, 83, 0.5)',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Pessimistic',
        data: isDataLoaded ? forecastData.pessimistic : [null],
        borderColor: 'rgba(234, 67, 53, 0.5)',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          color: mode === 'dark' ? '#e0e0e0' : '#5f6368',
          font: {
            size: 12,
          },
          filter: (item: any) => {
            // Hide optimistic and pessimistic from legend
            return !['Optimistic', 'Pessimistic'].includes(item.text);
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
        beginAtZero: false,
        grid: {
          display: true,
          drawBorder: false,
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD',
              notation: 'compact',
              compactDisplay: 'short',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
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
          maxRotation: 45,
          minRotation: 45,
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

  // Use metrics from the fetched data
  const { metrics } = forecastInfo;

  return (
    <ChartContainer>
      <SectionHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <MuiTooltip
            title="Forecasts future revenue based on historical data and current pipeline, with optimistic and pessimistic scenarios."
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
            {timeRange === 'quarter' ? 'Next Quarter' : 
             timeRange === 'year' ? 'Next Year' : 'Next 2 Years'}
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
            <MenuItem onClick={() => handleTimeRangeChange('quarter')} selected={timeRange === 'quarter'}>
              Next Quarter
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('year')} selected={timeRange === 'year'}>
              Next Year
            </MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('2years')} selected={timeRange === '2years'}>
              Next 2 Years
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
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <StatBox>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Forecasted Revenue
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {isDataLoaded ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: 'compact',
                    compactDisplay: 'short',
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                  }).format(metrics.totalRevenue) : '$0'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {!isDataLoaded ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading data...
                    </Typography>
                  ) : metrics.monthOverMonthChange >= 0 ? (
                    <>
                      <ArrowUpwardIcon sx={{ color: '#34A853', fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: '#34A853' }}>
                        +{metrics.monthOverMonthChange.toFixed(1)}%
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ArrowDownwardIcon sx={{ color: '#EA4335', fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: '#EA4335' }}>
                        {metrics.monthOverMonthChange.toFixed(1)}%
                      </Typography>
                    </>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    month over month
                  </Typography>
                </Box>
              </StatBox>
            </Grid>
            <Grid item xs={12}>
              <StatBox>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Weighted Pipeline
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {isDataLoaded ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: 'compact',
                    compactDisplay: 'short',
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                  }).format(metrics.weightedPipeline) : '$0'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {isDataLoaded ? `${metrics.pipelineToForecastRatio.toFixed(0)}% of forecast covered` : 'Loading data...'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={isDataLoaded ? Math.min(metrics.pipelineToForecastRatio, 100) : 0}
                  sx={{ 
                    mt: 1, 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: metrics.pipelineToForecastRatio >= 100 ? '#34A853' : '#FBBC05',
                    }
                  }} 
                />
              </StatBox>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 3, mb: 2 }}>
            Top Opportunities
          </Typography>

          {!isDataLoaded ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              Loading opportunities data...
            </Typography>
          ) : opportunities && opportunities.length > 0 ? opportunities.slice(0, 3).map((opp) => (
            <OpportunityCard key={opp.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {opp.client}
                </Typography>
                <StyledChip 
                  label={opp.type} 
                  size="small" 
                  sx={{ 
                    backgroundColor: opp.type === 'New Business' ? '#4285F4' : 
                                    opp.type === 'Expansion' ? '#34A853' : '#FBBC05',
                    color: 'white',
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(opp.value)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="medium">
                    {opp.probability}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    probability
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {opp.stage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expected: {new Date(opp.expectedClose).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
            </OpportunityCard>
          )) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No opportunities available.
            </Typography>
          )}

          <Button
            variant="text" 
            sx={{ 
              mt: 1, 
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            View all opportunities
          </Button>
        </Grid>
      </Grid>
    </ChartContainer>
  );
};

export default RevenueForecastChart;
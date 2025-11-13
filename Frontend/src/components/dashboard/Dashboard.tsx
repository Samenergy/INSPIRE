import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import BusinessIcon from '@mui/icons-material/Business';
import ArticleIcon from '@mui/icons-material/Article';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorIcon from '@mui/icons-material/Error';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import MeetingIcon from '@mui/icons-material/Event';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SendIcon from '@mui/icons-material/Send';
import IndustryIcon from '@mui/icons-material/Factory';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStats {
  total_companies: number;
  total_articles: number;
  total_analyses: number;
  total_campaigns: number;
  companies_by_status: {
    completed: number;
    loading: number;
    pending: number;
    failed: number;
  };
  articles_by_classification: {
    'Directly Relevant': number;
    'Indirectly Useful': number;
    'Not Relevant': number;
  };
  campaigns_by_type: {
    email: number;
    call: number;
    meeting: number;
  };
  campaigns_by_status: {
    draft: number;
    scheduled: number;
    sent: number;
  };
  companies_by_industry: Array<{ industry: string; count: number }>;
  analysis_completion_rate: number;
  relevant_articles_percentage: number;
}

interface RecentActivity {
  type: string;
  id: number;
  content: string | Record<string, any> | null;
  date: string | null;
  source: string;
}

const formatActivityContent = (content: RecentActivity['content']): string => {
  if (!content) return 'Activity';

  const normalize = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;

    try {
      if (Array.isArray(value?.updates)) {
        return value.updates
          .map((item: any) => item?.update || '')
          .filter(Boolean)
          .join(' • ');
      }

      if (value?.description) {
        return typeof value.description === 'string'
          ? value.description
          : JSON.stringify(value.description);
      }

      if (Array.isArray(value)) {
        return value
          .map((item) => normalize(item))
          .filter(Boolean)
          .join(' • ');
      }

      return JSON.stringify(value);
    } catch (error) {
      console.warn('Failed to normalize activity content', error);
      return '';
    }
  };

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      const formatted = normalize(parsed);
      return formatted || content;
    } catch (error) {
      return content;
    }
  }

  const formatted = normalize(content);
  return formatted || 'Activity';
};

const Dashboard: React.FC = () => {
  const { mode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.sme_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        const statsResponse = await fetch(
          `http://46.62.228.201:8000/api/inspire/dashboard/stats?sme_id=${user.sme_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(localStorage.getItem('auth_token')
                ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                : {}),
            },
          }
        );

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          setStats(statsResult.data);
        }

        // Fetch recent activity
        const activityResponse = await fetch(
          `http://46.62.228.201:8000/api/inspire/dashboard/activity?limit=10`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(localStorage.getItem('auth_token')
                ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                : {}),
            },
          }
        );

        if (activityResponse.ok) {
          const activityResult = await activityResponse.json();
          if (activityResult.success) {
            setActivities(activityResult.data || []);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.sme_id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={3}>
        <Alert severity="info">No data available. Start by adding companies to analyze.</Alert>
      </Box>
    );
  }

  const themeColors = {
    primary: mode === 'dark' ? '#90caf9' : '#1976d2',
    success: mode === 'dark' ? '#81c784' : '#2e7d32',
    warning: mode === 'dark' ? '#ffb74d' : '#ed6c02',
    error: mode === 'dark' ? '#e57373' : '#d32f2f',
    info: mode === 'dark' ? '#64b5f6' : '#0288d1',
  };

  // Companies by Status Chart
  const companiesStatusData = {
    labels: ['Completed', 'Processing', 'Pending', 'Failed'],
    datasets: [
      {
        label: 'Companies',
        data: [
          stats.companies_by_status.completed,
          stats.companies_by_status.loading,
          stats.companies_by_status.pending,
          stats.companies_by_status.failed,
        ],
        backgroundColor: [
          themeColors.success,
          themeColors.warning,
          themeColors.info,
          themeColors.error,
        ],
        borderWidth: 0,
        borderRadius: 8,
  },
    ],
  };

  // Articles by Classification Chart
  const articlesClassificationData = {
    labels: ['Directly Relevant', 'Indirectly Useful', 'Not Relevant'],
    datasets: [
      {
        label: 'Articles',
        data: [
          stats.articles_by_classification['Directly Relevant'],
          stats.articles_by_classification['Indirectly Useful'],
          stats.articles_by_classification['Not Relevant'],
        ],
        backgroundColor: [themeColors.success, themeColors.warning, themeColors.error],
        borderWidth: 0,
      },
    ],
  };

  // Campaigns by Type Chart
  const campaignsTypeData = {
    labels: ['Email', 'Call', 'Meeting'],
    datasets: [
      {
        label: 'Campaigns',
        data: [
          stats.campaigns_by_type.email,
          stats.campaigns_by_type.call,
          stats.campaigns_by_type.meeting,
        ],
        backgroundColor: [themeColors.primary, themeColors.info, themeColors.success],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };

  // Industry Distribution Chart
  const industryData = {
    labels: stats.companies_by_industry.slice(0, 8).map((i) => i.industry),
    datasets: [
      {
        label: 'Companies',
        data: stats.companies_by_industry.slice(0, 8).map((i) => i.count),
        backgroundColor: [
          themeColors.primary,
          themeColors.success,
          themeColors.warning,
          themeColors.error,
          themeColors.info,
          '#9c27b0',
          '#00acc1',
          '#ff6d00',
        ],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
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
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: mode === 'dark' ? '#a0a0a0' : '#5f6368',
          },
        },
      y: {
        grid: {
          color: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: mode === 'dark' ? '#a0a0a0' : '#5f6368',
        },
      },
          },
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, onClick }) => (
    <Card
      onClick={onClick}
        sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'dark' ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(0, 0, 0, 0.15)',
            }
          : {},
        borderLeft: `4px solid ${color}`,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {title}
          </Typography>
        </Box>
          <Box
            sx={{
              color: color,
              opacity: 0.8,
            }}
          >
            {icon}
        </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time insights into your company analysis and outreach activities
        </Typography>
            </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Companies"
            value={stats.total_companies}
            icon={<BusinessIcon sx={{ fontSize: 40 }} />}
            color={themeColors.primary}
            onClick={() => navigate('/companies')}
          />
          </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Articles Analyzed"
            value={stats.total_articles}
            icon={<ArticleIcon sx={{ fontSize: 40 }} />}
            color={themeColors.info}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Campaigns Generated"
            value={stats.total_campaigns}
            icon={<CampaignIcon sx={{ fontSize: 40 }} />}
            color={themeColors.success}
            onClick={() => navigate('/campaigns')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Analyses Completed"
            value={stats.total_analyses}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color={themeColors.warning}
          />
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Analysis Completion Rate
                </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" fontWeight="bold" color={themeColors.success} mr={2}>
                  {stats.analysis_completion_rate.toFixed(1)}%
                </Typography>
                <TrendingUpIcon sx={{ color: themeColors.success, fontSize: 32 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.analysis_completion_rate}
                    sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: themeColors.success,
                  },
                    }}
                  />
              <Typography variant="body2" color="text.secondary" mt={1}>
                {stats.companies_by_status.completed} of {stats.total_companies} companies fully analyzed
                  </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Relevant Articles Percentage
                  </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" fontWeight="bold" color={themeColors.primary} mr={2}>
                  {stats.relevant_articles_percentage.toFixed(1)}%
                </Typography>
                <ArticleIcon sx={{ color: themeColors.primary, fontSize: 32 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.relevant_articles_percentage}
                    sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: themeColors.primary,
                  },
                    }}
                  />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Articles classified as directly relevant or indirectly useful
                  </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Companies by Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Companies by Status
                  </Typography>
              <Box height={300}>
                <Bar data={companiesStatusData} options={chartOptions} />
                </Box>
              <Box display="flex" justifyContent="space-around" mt={2}>
                <Box textAlign="center">
                  <CheckCircleIcon sx={{ color: themeColors.success, mb: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {stats.companies_by_status.completed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
              </Box>
                <Box textAlign="center">
                  <HourglassEmptyIcon sx={{ color: themeColors.warning, mb: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {stats.companies_by_status.loading + stats.companies_by_status.pending}
                </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Processing
                </Typography>
                </Box>
                <Box textAlign="center">
                  <ErrorIcon sx={{ color: themeColors.error, mb: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {stats.companies_by_status.failed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Failed
                </Typography>
              </Box>
            </Box>
            </CardContent>
          </Card>
          </Grid>

        {/* Articles by Classification */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Articles by Classification
        </Typography>
              <Box height={300} display="flex" alignItems="center" justifyContent="center">
                <Box width="60%">
                  <Doughnut data={articlesClassificationData} options={chartOptions} />
      </Box>
              </Box>
              <Box display="flex" justifyContent="space-around" mt={2}>
                <Box textAlign="center">
                  <Chip
                    label={stats.articles_by_classification['Directly Relevant']}
                    size="small"
                    sx={{ bgcolor: themeColors.success, color: 'white', mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Directly Relevant
        </Typography>
      </Box>
                <Box textAlign="center">
                  <Chip
                    label={stats.articles_by_classification['Indirectly Useful']}
                    size="small"
                    sx={{ bgcolor: themeColors.warning, color: 'white', mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Indirectly Useful
          </Typography>
        </Box>
                <Box textAlign="center">
                  <Chip
                    label={stats.articles_by_classification['Not Relevant']}
            size="small"
                    sx={{ bgcolor: themeColors.error, color: 'white', mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Not Relevant
                  </Typography>
        </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Campaigns by Type */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Campaigns by Type
            </Typography>
              <Box height={300}>
                <Bar data={campaignsTypeData} options={chartOptions} />
                    </Box>
              <Box display="flex" justifyContent="space-around" mt={2}>
                <Box textAlign="center">
                  <EmailIcon sx={{ color: themeColors.primary, mb: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {stats.campaigns_by_type.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                    Email
                      </Typography>
                    </Box>
                <Box textAlign="center">
                  <PhoneIcon sx={{ color: themeColors.info, mb: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {stats.campaigns_by_type.call}
            </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Call
            </Typography>
                    </Box>
                <Box textAlign="center">
                  <MeetingIcon sx={{ color: themeColors.success, mb: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {stats.campaigns_by_type.meeting}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                    Meeting
                      </Typography>
                    </Box>
                  </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Industry Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Top Industries
            </Typography>
              {stats.companies_by_industry.length > 0 ? (
                <Box height={300}>
                  <Bar data={industryData} options={chartOptions} />
                    </Box>
              ) : (
                <Box height={300} display="flex" alignItems="center" justifyContent="center">
                  <Box textAlign="center">
                    <IndustryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No industry data available
                      </Typography>
                    </Box>
                  </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaign Status & Recent Activity */}
      <Grid container spacing={3}>
        {/* Campaign Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Campaign Status
            </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ color: themeColors.warning, mr: 1 }} />
                    <Typography variant="body2">Draft</Typography>
                    </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.campaigns_by_status.draft}
                      </Typography>
                    </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.campaigns_by_status.draft / stats.total_campaigns) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                  </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ color: themeColors.info, mr: 1 }} />
                    <Typography variant="body2">Scheduled</Typography>
            </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.campaigns_by_status.scheduled}
                  </Typography>
        </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.campaigns_by_status.scheduled / stats.total_campaigns) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center">
                    <SendIcon sx={{ color: themeColors.success, mr: 1 }} />
                    <Typography variant="body2">Sent</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.campaigns_by_status.sent}
        </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.campaigns_by_status.sent / stats.total_campaigns) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Recent Activity
          </Typography>
              {activities.length > 0 ? (
                <List>
                  {activities.slice(0, 5).map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          {activity.type === 'analysis' && <AssessmentIcon color="primary" />}
                          {activity.type === 'article' && <ArticleIcon color="info" />}
                          {activity.type === 'recommendation' && <TrendingUpIcon color="success" />}
                        </ListItemIcon>
                        <ListItemText
                      primary={
                        (() => {
                          const formatted = formatActivityContent(activity.content);
                          return formatted.length > 80
                            ? `${formatted.substring(0, 77)}...`
                            : formatted;
                        })()
                      }
                          secondary={activity.date ? new Date(activity.date).toLocaleDateString() : 'Recent'}
                        />
                      </ListItem>
                      {index < activities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
                    No recent activity
          </Typography>
        </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        </Box>
  );
};

export default Dashboard; 

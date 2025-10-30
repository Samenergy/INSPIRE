import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { BORDER_RADIUS, TRANSITIONS } from '../ui/common/constants';
import { Dialog } from '../ui/common/Dialog';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Import our fallback Lucide icons directly
import {
  CampaignIcon,
  GroupIcon,
  TrendingUpIcon,
  FilterListIcon,
  SearchIcon,
  AddIcon,
  MoreVertIcon,
  ShareIcon,
  VisibilityIcon,
  EmailIcon,
  VideocamIcon,
  PhoneIcon,
  SmartToyIcon,
  AutoAwesomeIcon,
  ContentCopyIcon,
  EditIcon,
  DeleteIcon
} from '../icons/FallbackIcons';

// Create a styled list item with proper typing
interface StyledListItemProps {
  selected?: boolean;
}

const ListItemStyled = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'selected'
})<StyledListItemProps>(({ theme, selected }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: selected ?
    (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)') :
    'transparent',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  }
}));

// Define TypeBadge props interface
interface TypeBadgeProps {
  type: 'email' | 'call' | 'meeting' | string;
  label: string;
  size?: 'small' | 'medium';
  [key: string]: any;
}

// Custom TypeBadge component that uses our fallback Lucide icons
const TypeBadge: React.FC<TypeBadgeProps> = ({ type, label, size = 'small', ...props }) => {
  const { mode } = useTheme();
  let color: string, IconComponent: React.ElementType;

  switch(type) {
    case 'email':
      color = '#3498db'; // info blue
      IconComponent = EmailIcon;
      break;
    case 'call':
      color = '#2ecc71'; // success green
      IconComponent = PhoneIcon;
      break;
    case 'meeting':
      color = '#f39c12'; // warning orange
      IconComponent = VideocamIcon;
      break;
    default:
      color = '#95a5a6'; // grey
      IconComponent = CampaignIcon;
  }

  return (
    <Chip
      icon={<IconComponent size={16} color={color} />}
      label={label}
      size={size}
      sx={{
        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        color: color,
        fontWeight: 'bold',
        height: size === 'small' ? 20 : 32,
        fontSize: size === 'small' ? '0.7rem' : '0.8125rem',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)'
        }
      }}
      {...props}
    />
  );
};

// Define the Campaign interface to match backend response
interface Campaign {
  campaign_id: number;
  title: string;
  content: string;
  outreach_type: 'email' | 'call' | 'meeting';
  status: 'draft' | 'sent' | 'scheduled' | 'completed';
  generated_at: string;
  company_name?: string;
}

interface StaticCampaignsNewProps {
  onVisit?: () => void;
}

const StaticCampaignsNew: React.FC<StaticCampaignsNewProps> = ({ onVisit }) => {
  const { mode } = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState<number>(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load campaigns from backend
  useEffect(() => {
    const loadCampaigns = async () => {
      if (!user?.sme_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/outreach/campaigns', {
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('auth_token') ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } : {})
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }

        const result = await response.json();
        setCampaigns(result.data || []);
        setError(null);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setError(error instanceof Error ? error.message : 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [user?.sme_id]);

  // Clear campaign notifications when visiting this page
  useEffect(() => {
    if (onVisit) {
      onVisit();
    }
  }, [onVisit]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCampaignSelect = (id: number) => {
    setSelectedCampaignId(id);
    const campaign = campaigns.find(c => c.campaign_id === id);
    if (campaign) {
      setEditedContent(campaign.content);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(event.target.value);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  // Filter campaigns based on search query and selected tab
  const filteredCampaigns = campaigns.filter(campaign => {
    // Filter by search query
    const matchesSearch = searchQuery === '' ||
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.company_name && campaign.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by tab
    const matchesTab =
      tabValue === 0 || // All types
      (tabValue === 1 && campaign.outreach_type === 'email') || // Email templates
      (tabValue === 2 && campaign.outreach_type === 'call') || // Call scripts
      (tabValue === 3 && campaign.outreach_type === 'meeting'); // Meeting points

    return matchesSearch && matchesTab;
  });

  const selectedCampaign = campaigns.find(c => c.campaign_id === selectedCampaignId);

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      backgroundColor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      p: 3
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Campaigns
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and manage your campaigns and templates
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon size={20} />}
            onClick={handleOpenCreateDialog}
            sx={{
              borderRadius: BORDER_RADIUS.md,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 'none',
              transition: TRANSITIONS.medium,
              bgcolor: mode === 'dark' ? 'white' : 'black',
              color: mode === 'dark' ? 'black' : 'white',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              }
            }}
          >
            New Campaign
          </Button>
          <Button
            variant="outlined"
            startIcon={<SmartToyIcon size={20} />}
            sx={{
              borderRadius: BORDER_RADIUS.md,
              textTransform: 'none',
              fontWeight: 'bold',
              borderColor: mode === 'dark' ? 'white' : 'black',
              color: mode === 'dark' ? 'white' : 'black',
              borderWidth: '1.5px',
              transition: TRANSITIONS.medium,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
                borderColor: mode === 'dark' ? 'white' : 'black',
                borderWidth: '1.5px',
                bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            AI Suggestions
          </Button>
        </Box>
      </Box>

      {/* White Container */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          backgroundColor: 'background.paper',
          boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Tabs */}
        <Box sx={{ px: 3, pt: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                minWidth: 100,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  opacity: 1
                }
              }
            }}
          >
            <Tab label="All Campaigns" />
            <Tab label="Email Templates" />
            <Tab label="Call Scripts" />
            <Tab label="Meeting Points" />
            <Tab label="Proposals" />
          </Tabs>
        </Box>

        {/* Main content */}
        <Box sx={{
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
          borderTop: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`
        }}>
        {/* List of campaigns */}
        <Box sx={{
          width: '350px',
          borderRight: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          {/* Search and filter */}
          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              placeholder="Search campaigns..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={20} color={mode === 'dark' ? '#aaaaaa' : '#666666'} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: BORDER_RADIUS.md,
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  transition: TRANSITIONS.medium,
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                    transition: 'border-color 0.2s ease-in-out',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black',
                    borderWidth: '1.5px',
                  },
                }
              }}
            />
            <IconButton
              onClick={handleFilterClick}
              sx={{
                borderRadius: BORDER_RADIUS.md,
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                transition: TRANSITIONS.medium,
                padding: '8px',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <FilterListIcon size={20} color={mode === 'dark' ? '#ffffff' : '#000000'} />
            </IconButton>
          </Box>

          {/* Filter menu */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.15)',
                borderRadius: BORDER_RADIUS.md,
              }
            }}
          >
            <MenuItem onClick={handleFilterClose}>
              <Typography variant="body2">All Campaigns</Typography>
            </MenuItem>
            <MenuItem onClick={handleFilterClose}>
              <Typography variant="body2">Recent Campaigns</Typography>
            </MenuItem>
            <MenuItem onClick={handleFilterClose}>
              <Typography variant="body2">AI Generated</Typography>
            </MenuItem>
            <MenuItem onClick={handleFilterClose}>
              <Typography variant="body2">Shared with Me</Typography>
            </MenuItem>
          </Menu>

          {/* List of campaigns */}
          <List sx={{ overflow: 'auto', flexGrow: 1, p: 0 }}>
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress size={40} />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  Loading campaigns...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Typography variant="body1" color="text.secondary">
                  Failed to load campaigns
                </Typography>
              </Box>
            ) : filteredCampaigns.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {campaigns.length === 0 ? 'No campaigns yet. Generate your first outreach from the Companies section!' : 'No campaigns found'}
                </Typography>
              </Box>
            ) : (
              filteredCampaigns.map(campaign => (
                <ListItemStyled
                  key={campaign.campaign_id}
                  selected={selectedCampaignId === campaign.campaign_id}
                  onClick={() => handleCampaignSelect(campaign.campaign_id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '200px' }}>
                          {campaign.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(campaign.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                          {campaign.company_name ? `For ${campaign.company_name}` : 'Generated outreach content'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TypeBadge type={campaign.outreach_type} label={campaign.outreach_type.toUpperCase()} />
                          <Chip
                            label={campaign.status.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                              fontSize: '0.7rem',
                              height: 20,
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItemStyled>
              ))
            )}
          </List>
        </Box>

        {/* Campaign detail */}
        <Box sx={{
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {selectedCampaign ? (
            <>
              {/* Campaign header */}
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                      {selectedCampaign.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedCampaign.company_name ? `Generated for ${selectedCampaign.company_name}` : 'AI-generated outreach content'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <TypeBadge type={selectedCampaign.outreach_type} label={selectedCampaign.outreach_type.toUpperCase()} size="medium" />
                      <Chip
                        label={selectedCampaign.status.toUpperCase()}
                        sx={{
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                        <Chip
                          icon={<SmartToyIcon size={16} />}
                          label="AI Generated"
                          sx={{
                            backgroundColor: mode === 'dark' ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.1)',
                            color: '#8a2be2',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      sx={{
                        borderRadius: BORDER_RADIUS.md,
                        transition: TRANSITIONS.medium,
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <ShareIcon size={20} />
                    </IconButton>
                    <IconButton
                      sx={{
                        borderRadius: BORDER_RADIUS.md,
                        transition: TRANSITIONS.medium,
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <FavoriteIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleMenuClick}
                      sx={{
                        borderRadius: BORDER_RADIUS.md,
                        transition: TRANSITIONS.medium,
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <MoreVertIcon size={20} />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Generated on {new Date(selectedCampaign.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={isEditing ? <CheckCircleIcon /> : <EditIcon size={18} />}
                    onClick={handleEditToggle}
                    sx={{
                      borderRadius: BORDER_RADIUS.md,
                      textTransform: 'none',
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        borderColor: mode === 'dark' ? 'white' : 'black',
                      }
                    }}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Campaign'}
                  </Button>
                </Box>
              </Box>

              {/* Campaign content */}
              <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                {isEditing ? (
                  <TextField
                    multiline
                    fullWidth
                    value={editedContent}
                    onChange={handleContentChange}
                    variant="outlined"
                    minRows={20}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                        borderRadius: BORDER_RADIUS.md,
                        '& fieldset': {
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                        },
                        '&:hover fieldset': {
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: mode === 'dark' ? 'white' : 'black',
                          borderWidth: '1.5px',
                        },
                      }
                    }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                      p: 3,
                      borderRadius: BORDER_RADIUS.md,
                      border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      minHeight: '300px'
                    }}
                  >
                    {selectedCampaign.content}
                  </Typography>
                )}
              </Box>

              {/* Campaign actions */}
              <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon size={18} />}
                    sx={{
                      borderRadius: BORDER_RADIUS.md,
                      textTransform: 'none',
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        borderColor: mode === 'dark' ? 'white' : 'black',
                      }
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon size={18} />}
                    sx={{
                      borderRadius: BORDER_RADIUS.md,
                      textTransform: 'none',
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        borderColor: mode === 'dark' ? 'white' : 'black',
                      }
                    }}
                  >
                    Improve with AI
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon size={18} />}
                  sx={{
                    borderRadius: BORDER_RADIUS.md,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'error.main',
                      color: 'white',
                      borderColor: 'error.main',
                    }
                  }}
                >
                  Delete
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No campaign selected
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: '400px' }}>
                Choose a campaign from the list to view its details or create a new one using the button above.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      </Paper>

      {/* Create Campaign Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        title="Create New Campaign"
        maxWidth="md"
        actions={
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCloseCreateDialog}
              sx={{
                borderRadius: BORDER_RADIUS.md,
                borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                color: mode === 'dark' ? 'white' : 'black',
                borderWidth: '1.5px',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'white' : 'black',
                  borderWidth: '1.5px',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: BORDER_RADIUS.md,
                bgcolor: mode === 'dark' ? 'white' : 'black',
                color: mode === 'dark' ? 'black' : 'white',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                }
              }}
            >
              Create
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Campaign Title"
            fullWidth
            variant="outlined"
            placeholder="Enter campaign title"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: BORDER_RADIUS.md,
                '& fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                },
                '&:hover fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: mode === 'dark' ? 'white' : 'black',
                  borderWidth: '1.5px',
                },
              }
            }}
          />
          
          <TextField
            label="Description"
            fullWidth
            variant="outlined"
            placeholder="Enter campaign description"
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: BORDER_RADIUS.md,
                '& fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                },
                '&:hover fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: mode === 'dark' ? 'white' : 'black',
                  borderWidth: '1.5px',
                },
              }
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Client Group"
              fullWidth
              variant="outlined"
              placeholder="e.g., Enterprise, SMB"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: BORDER_RADIUS.md,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black',
                    borderWidth: '1.5px',
                  },
                }
              }}
            />
            
            <TextField
              label="Solution"
              fullWidth
              variant="outlined"
              placeholder="e.g., Cloud Infrastructure"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: BORDER_RADIUS.md,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black',
                    borderWidth: '1.5px',
                  },
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={true}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: mode === 'dark' ? 'white' : 'black',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: mode === 'dark' ? 'white' : 'black',
                    }
                  }}
                />
              }
              label="AI Generated"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Campaign Type:</Typography>
              <Chip
                label="Email"
                clickable
                sx={{
                  backgroundColor: '#3498db20',
                  color: '#3498db',
                  borderRadius: BORDER_RADIUS.pill,
                  fontWeight: 'bold',
                  mr: 1
                }}
              />
              <Chip
                label="Call"
                clickable
                sx={{
                  backgroundColor: '#2ecc7120',
                  color: '#2ecc71',
                  borderRadius: BORDER_RADIUS.pill,
                  fontWeight: 'bold',
                  mr: 1
                }}
              />
              <Chip
                label="Meeting"
                clickable
                sx={{
                  backgroundColor: '#f39c1220',
                  color: '#f39c12',
                  borderRadius: BORDER_RADIUS.pill,
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>
          
          <TextField
            label="Content"
            fullWidth
            variant="outlined"
            placeholder="Enter campaign content"
            multiline
            rows={10}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: BORDER_RADIUS.md,
                '& fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                },
                '&:hover fieldset': {
                  borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: mode === 'dark' ? 'white' : 'black',
                  borderWidth: '1.5px',
                },
              }
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default StaticCampaignsNew;
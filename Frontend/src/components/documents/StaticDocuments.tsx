import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';
import { BORDER_RADIUS, TRANSITIONS } from '../ui/common/constants';
import { Dialog } from '../ui/common/Dialog';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Import our fallback Lucide icons
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

// We'll use regular MUI Box components with sx props instead of styled components

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

// Define Campaign interface
interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string;
  clientGroup: string;
  solution: string;
  type: 'email' | 'call' | 'meeting' | string;
  status: string;
  progress: number;
  engagement: number;
  createdAt: string;
  aiGenerated: boolean;
  content: string;
  owner: {
    name: string;
    avatar: string;
  };
}

const StaticDocuments: React.FC = () => {
  const { mode } = useTheme();
  const [tabValue, setTabValue] = useState<number>(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);

  // Sample data for AI-suggested campaigns
  const campaigns = [
    {
      id: 1,
      title: 'Cloud Migration Email for Enterprise',
      description: 'Personalized email template for enterprise clients considering cloud migration.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Enterprise',
      solution: 'Cloud Infrastructure',
      type: 'email',
      status: 'active',
      progress: 100,
      engagement: 89,
      createdAt: '2023-11-01',
      aiGenerated: true,
      content: `Dear [Client Name],\n\nI hope this email finds you well. Based on our recent discussions about your IT infrastructure challenges, I wanted to share some insights on how our Cloud Migration Solutions could address your specific needs.\n\nOur enterprise-grade migration approach has helped companies like yours reduce operational costs by an average of 35% while improving system reliability by 99.9%.\n\nWould you be available for a brief call next week to discuss how we could tailor this solution for [Company Name]?\n\nBest regards,\n[Your Name]`,
      owner: {
        name: 'Alex Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    },
    {
      id: 2,
      title: 'Cybersecurity Call Script for Financial',
      description: 'Talking points for calls with financial institutions about security solutions.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Financial',
      solution: 'Cybersecurity',
      type: 'call',
      status: 'active',
      progress: 100,
      engagement: 72,
      createdAt: '2023-10-15',
      aiGenerated: true,
      content: `1. Introduction: "Hello [Name], I'm calling regarding the increasing cybersecurity threats specifically targeting financial institutions like yours."\n\n2. Pain Points: "Many of our financial clients have expressed concerns about regulatory compliance and data protection. Is this something your team is currently addressing?"\n\n3. Solution Overview: "Our specialized security framework for financial institutions includes real-time threat monitoring and compliance reporting."\n\n4. Success Story: "We recently helped [Similar Bank] achieve complete regulatory compliance while reducing security incidents by 78%."\n\n5. Call to Action: "I'd like to arrange a security assessment with our financial sector specialists. Would next Tuesday work for your team?"`,
      owner: {
        name: 'Sarah Chen',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      }
    },
    {
      id: 3,
      title: 'AI Analytics Meeting Points for Retail',
      description: 'Key talking points for meetings with retail clients about AI analytics.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Retail',
      solution: 'Analytics',
      type: 'meeting',
      status: 'active',
      progress: 100,
      engagement: 85,
      createdAt: '2023-11-05',
      aiGenerated: true,
      content: `Meeting Agenda:\n\n1. Introduction (5 min)\n   - Thank client for their time\n   - Brief overview of their retail challenges based on previous discussions\n\n2. Industry Trends (10 min)\n   - Share retail analytics benchmarks\n   - Discuss how competitors are leveraging AI\n\n3. Solution Presentation (15 min)\n   - Demonstrate customer behavior prediction models\n   - Show inventory optimization dashboard\n   - Present personalization engine results\n\n4. ROI Analysis (10 min)\n   - Average 24% increase in basket size\n   - 18% reduction in inventory costs\n   - 40% improvement in campaign conversion rates\n\n5. Implementation Timeline (5 min)\n   - 4-week setup process\n   - Training and onboarding schedule\n\n6. Q&A and Next Steps (10 min)`,
      owner: {
        name: 'Michael Torres',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
      }
    },
    {
      id: 4,
      title: 'Healthcare Data Email Template',
      description: 'HIPAA-compliant email template for healthcare data management solutions.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Healthcare',
      solution: 'Data Management',
      type: 'email',
      status: 'active',
      progress: 100,
      engagement: 92,
      createdAt: '2023-11-10',
      aiGenerated: true,
      content: `Subject: HIPAA-Compliant Data Management Solution for [Healthcare Provider]\n\nDear [Decision Maker],\n\nAs healthcare providers continue to navigate the complexities of patient data management while maintaining strict HIPAA compliance, I wanted to share how our specialized Healthcare Data Management solution addresses these unique challenges.\n\nOur platform offers:\n• Fully HIPAA-compliant data storage and processing\n• Seamless integration with major EHR systems\n• Advanced patient data analytics with 99.99% accuracy\n• Automated compliance reporting\n\nMany providers like [Similar Healthcare Organization] have reduced data management costs by 42% while improving patient data security.\n\nI've attached a case study demonstrating how we helped them achieve these results. Would you be available for a brief demonstration next week?\n\nBest regards,\n[Your Name]\n[Your Contact Information]`,
      owner: {
        name: 'Emily Wilson',
        avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
      }
    },
    {
      id: 5,
      title: 'Supply Chain Call Script for Manufacturing',
      description: 'Talking points for calls with manufacturing companies about supply chain solutions.',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Manufacturing',
      solution: 'Supply Chain',
      type: 'call',
      status: 'active',
      progress: 100,
      engagement: 94,
      createdAt: '2023-09-01',
      aiGenerated: true,
      content: `1. Introduction:\n"Hello [Name], I'm calling about the supply chain challenges we discussed at the [Previous Meeting/Event]. Has your team made any progress addressing those issues?"\n\n2. Pain Point Confirmation:\n"Many manufacturing companies like yours are still struggling with inventory visibility and supplier delays. Are these still concerns for your operations?"\n\n3. Solution Overview:\n"Our end-to-end supply chain platform provides real-time visibility across your entire supply network, with predictive analytics to anticipate disruptions before they impact production."\n\n4. Key Differentiators:\n"What sets our solution apart is the manufacturing-specific optimization algorithms that have helped companies reduce inventory costs by 27% while improving on-time delivery by 34%."\n\n5. Relevant Case Study:\n"We recently implemented this for [Similar Manufacturer], and they were able to reduce production downtime by 62% in the first six months."\n\n6. Call to Action:\n"I'd like to arrange a brief demonstration with your operations team. Would you be available next Thursday?"`,
      owner: {
        name: 'David Kim',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
      }
    },
    {
      id: 6,
      title: 'Digital Transformation Meeting Points for SMBs',
      description: 'Key talking points for meetings with SMBs about digital transformation.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'SMB',
      solution: 'Digital Transformation',
      type: 'meeting',
      status: 'active',
      progress: 100,
      engagement: 88,
      createdAt: '2023-10-20',
      aiGenerated: true,
      content: `Meeting Agenda: Digital Transformation for [SMB Name]\n\n1. Introduction (5 min)\n   - Thank the client for their time\n   - Acknowledge their specific business challenges\n\n2. SMB Digital Landscape (10 min)\n   - Current state of digital adoption in their industry\n   - Competitive advantages of digital transformation\n   - Cost-effective approaches for smaller organizations\n\n3. Tailored Solution Presentation (15 min)\n   - Modular approach allowing step-by-step implementation\n   - Cloud-based infrastructure with minimal upfront investment\n   - Mobile-first customer engagement tools\n   - Streamlined operations through automation\n\n4. Implementation Approach (10 min)\n   - Phased rollout to minimize disruption\n   - Training program for staff\n   - Ongoing support options\n\n5. ROI Projection (5 min)\n   - Expected efficiency gains: 30-40%\n   - Customer satisfaction improvements: 25%\n   - Typical payback period: 6-9 months\n\n6. Budget-Friendly Pricing (5 min)\n   - Subscription-based model\n   - Scaling options as business grows\n\n7. Q&A and Next Steps (10 min)`,
      owner: {
        name: 'Jessica Martinez',
        avatar: 'https://randomuser.me/api/portraits/women/56.jpg'
      }
    }
  ];

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
    const campaign = campaigns.find(c => c.id === id);
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
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.clientGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.solution.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab
    const matchesTab =
      tabValue === 0 || // All types
      (tabValue === 1 && campaign.type === 'email') || // Email templates
      (tabValue === 2 && campaign.type === 'call') || // Call scripts
      (tabValue === 3 && campaign.type === 'meeting'); // Meeting points

    return matchesSearch && matchesTab;
  });

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: mode === 'dark' ? '#121212' : '#f5f7fa',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Documents
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and manage your documents and templates
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
            New Document
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

      {/* Tabs */}
      <Box sx={{ px: 3 }}>
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
          <Tab label="All Documents" />
          <Tab label="Email Templates" />
          <Tab label="Call Scripts" />
          <Tab label="Meeting Points" />
          <Tab label="Proposals" />
        </Tabs>
      </Box>

      {/* Main content */}
      <div style={{
        display: 'flex',
        flexGrow: 1,
        overflow: 'hidden',
        borderTop: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`
      }}>
        {/* List of documents */}
        <div style={{
          width: '350px',
          borderRight: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          {/* Search and filter */}
          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              placeholder="Search documents..."
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
                mt: 1.5,
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                minWidth: '200px'
              }
            }}
          >
            <MenuItem onClick={handleFilterClose}>
              <FormControlLabel
                control={<Switch size="small" />}
                label="AI Generated"
                sx={{ width: '100%' }}
              />
            </MenuItem>
            <MenuItem onClick={handleFilterClose}>
              <FormControlLabel
                control={<Switch size="small" />}
                label="Favorites"
                sx={{ width: '100%' }}
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleFilterClose}>
              <Typography variant="body2" fontWeight="bold">
                Sort by Date
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleFilterClose}>
              <Typography variant="body2" fontWeight="bold">
                Sort by Engagement
              </Typography>
            </MenuItem>
          </Menu>

          {/* Document list */}
          <List sx={{ overflow: 'auto', flexGrow: 1, pt: 0 }}>
            {filteredCampaigns.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No documents found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search or filters
                </Typography>
              </Box>
            ) : (
              filteredCampaigns.map((campaign) => (
                <ListItemStyled
                  key={campaign.id}
                  selected={selectedCampaignId === campaign.id}
                  onClick={() => handleCampaignSelect(campaign.id)}
                  sx={{
                    cursor: 'pointer',
                    py: 2,
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(2px)'
                    }
                  }}
                >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '200px' }}>
                        {campaign.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {campaign.aiGenerated && (
                          <Tooltip title="AI Generated">
                            <AutoAwesomeIcon size={16} color="#9c27b0" />
                          </Tooltip>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {campaign.createdAt}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1, maxWidth: '280px' }}>
                        {campaign.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TypeBadge type={campaign.type} label={campaign.type.toUpperCase()} />
                        <Chip
                          label={campaign.clientGroup}
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
            ))}
          </List>
        </div>

        {/* Document detail */}
        <div style={{
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {selectedCampaign ? (
            <>
              {/* Document header */}
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                      {selectedCampaign.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedCampaign.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={handleEditToggle}
                      sx={{
                        borderRadius: '8px',
                        backgroundColor: isEditing ? 'primary.main' : 'transparent',
                        color: isEditing ? 'white' : 'inherit',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: isEditing ? 'primary.dark' : (mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'),
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <EditIcon size={20} color={isEditing ? 'white' : 'currentColor'} />
                    </IconButton>
                    <IconButton
                      sx={{
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <ContentCopyIcon size={20} />
                    </IconButton>
                    <IconButton
                      sx={{
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <ShareIcon size={20} />
                    </IconButton>
                    <IconButton
                      onClick={handleMenuClick}
                      sx={{
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
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

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <TypeBadge type={selectedCampaign.type} label={selectedCampaign.type.toUpperCase()} size="medium" />
                  <Chip
                    label={selectedCampaign.clientGroup}
                    size="medium"
                    sx={{
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  <Chip
                    label={selectedCampaign.solution}
                    size="medium"
                    sx={{
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  {selectedCampaign.aiGenerated && (
                    <Chip
                      icon={<AutoAwesomeIcon size={16} color="#9c27b0" />}
                      label="AI Generated"
                      size="medium"
                      sx={{
                        backgroundColor: mode === 'dark' ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.1)',
                        color: '#9c27b0',
                        fontWeight: 'bold',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={selectedCampaign.owner.avatar} sx={{ width: 32, height: 32 }} />
                    <Typography variant="body2">
                      Created by <b>{selectedCampaign.owner.name}</b>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Engagement Score">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUpIcon size={16} color={mode === 'dark' ? '#90caf9' : '#1976d2'} />
                        <Typography variant="body2" fontWeight="bold" color={mode === 'dark' ? '#90caf9' : '#1976d2'}>
                          {selectedCampaign.engagement}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {/* Document content */}
              <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                {isEditing ? (
                  <TextField
                    multiline
                    fullWidth
                    variant="outlined"
                    value={editedContent}
                    onChange={handleContentChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        fontFamily: 'monospace',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }
                    }}
                    minRows={20}
                  />
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '8px',
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    {selectedCampaign.content}
                  </Paper>
                )}
              </Box>

              {/* Action buttons */}
              {isEditing && (
                <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}

              {/* Menu */}
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    minWidth: '200px'
                  }
                }}
              >
                <MenuItem onClick={handleMenuClose} sx={{ gap: 1.5 }}>
                  <FavoriteIcon fontSize="small" />
                  <Typography variant="body2">Add to Favorites</Typography>
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ gap: 1.5 }}>
                  <DeleteIcon size={18} />
                  <Typography variant="body2">Delete</Typography>
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ gap: 1.5 }}>
                  <VisibilityIcon size={18} />
                  <Typography variant="body2">Preview</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Box
                component="img"
                src="https://illustrations.popsy.co/amber/work-from-home.svg"
                alt="Select a document"
                sx={{ width: '300px', height: '300px', mb: 3, opacity: 0.8 }}
              />
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Select a document to view
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: '400px' }}>
                Choose a document from the list to view its details or create a new one using the button above.
              </Typography>
            </Box>
          )}
        </div>
      </div>

      {/* Create Document Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        title="Create New Document"
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
            label="Document Title"
            fullWidth
            variant="outlined"
            placeholder="Enter document title"
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
            placeholder="Enter document description"
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
              <Typography variant="body2">Document Type:</Typography>
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
            placeholder="Enter document content"
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
    </div>
  );
};

export default StaticDocuments;
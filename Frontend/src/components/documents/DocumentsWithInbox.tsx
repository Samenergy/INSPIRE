import React, { useState, useEffect } from 'react';
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
  ListItemAvatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Import our animated Lucide icons
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
  DeleteIcon,
  CloseIcon
} from '../icons/LucideIcons';

// Create motion variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const listItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  hover: {
    scale: 1.02,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

// Create styled components with Framer Motion
const CampaignsContainer = styled(motion.div)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const InboxContainer = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
  borderTop: `1px solid ${theme.palette.divider}`
}));

const ListContainer = styled(motion.div)(({ theme }) => ({
  width: '350px',
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
}));

const DetailContainer = styled(motion.div)(({ theme }) => ({
  flexGrow: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

// Create a motion component for list items
const MotionListItem = motion(ListItem);

const ListItemStyled = styled(MotionListItem)(({ theme, selected }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: selected ?
    (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)') :
    'transparent',
}));

// Define TypeBadge props interface
interface TypeBadgeProps {
  type: 'email' | 'call' | 'meeting' | string;
  label: string;
  size?: 'small' | 'medium';
  [key: string]: any;
}

// Create a motion Chip component
const MotionChip = motion(Chip);

// Custom TypeBadge component that uses our animated Lucide icons
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
    <MotionChip
      icon={<IconComponent size={16} color={color} />}
      label={label}
      size={size}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{
        scale: 1.05,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      sx={{
        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        color: color,
        fontWeight: 'bold',
        height: size === 'small' ? 20 : 32,
        fontSize: size === 'small' ? '0.7rem' : '0.8125rem',
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
  isRead: boolean;
  owner: {
    name: string;
    avatar: string;
  };
}

const DocumentsWithInbox = () => {
  const { mode } = useTheme();
  const [tabValue, setTabValue] = useState<number>(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  
  // Campaign inbox state
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [hasNewNotification, setHasNewNotification] = useState<boolean>(true);
  
  // Sample data for AI-suggested campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([
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
      isRead: false,
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
      isRead: true,
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
      isRead: false,
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
      isRead: false,
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
      isRead: true,
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
      isRead: true,
      content: `Meeting Agenda: Digital Transformation for [SMB Name]\n\n1. Introduction (5 min)\n   - Thank the client for their time\n   - Acknowledge their specific business challenges\n\n2. SMB Digital Landscape (10 min)\n   - Current state of digital adoption in their industry\n   - Competitive advantages of digital transformation\n   - Cost-effective approaches for smaller organizations\n\n3. Tailored Solution Presentation (15 min)\n   - Modular approach allowing step-by-step implementation\n   - Cloud-based infrastructure with minimal upfront investment\n   - Mobile-first customer engagement tools\n   - Streamlined operations through automation\n\n4. Implementation Approach (10 min)\n   - Phased rollout to minimize disruption\n   - Training program for staff\n   - Ongoing support options\n\n5. ROI Projection (5 min)\n   - Expected efficiency gains: 30-40%\n   - Customer satisfaction improvements: 25%\n   - Typical payback period: 6-9 months\n\n6. Budget-Friendly Pricing (5 min)\n   - Subscription-based model\n   - Scaling options as business grows\n\n7. Q&A and Next Steps (10 min)`,
      owner: {
        name: 'Jessica Martinez',
        avatar: 'https://randomuser.me/api/portraits/women/56.jpg'
      }
    }
  ]);

  // Function to handle campaign selection and mark as read
  const handleCampaignSelect = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    setIsEditing(false);
    
    // Mark the campaign as read
    setCampaigns(prevCampaigns => 
      prevCampaigns.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, isRead: true } 
          : campaign
      )
    );
  };

  // Function to handle campaign filter change
  const handleCampaignFilterChange = (filter: 'all' | 'unread' | 'read') => {
    setCampaignFilter(filter);
  };

  // Function to add a new campaign (simulating the template generation)
  const handleAddNewCampaign = () => {
    const newCampaign: Campaign = {
      id: Date.now(),
      title: `New ${Math.random() > 0.5 ? 'Email' : Math.random() > 0.5 ? 'Call' : 'Meeting'} Template`,
      description: 'AI-generated template for your next client interaction',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Enterprise',
      solution: 'Cloud Infrastructure',
      type: Math.random() > 0.5 ? 'email' : Math.random() > 0.5 ? 'call' : 'meeting',
      status: 'active',
      progress: 100,
      engagement: Math.floor(Math.random() * 30) + 70,
      createdAt: new Date().toISOString().split('T')[0],
      aiGenerated: true,
      isRead: false,
      content: `This is a newly generated template for your next client interaction.\n\nIt contains personalized content based on your client's needs and your previous interactions.\n\nFeel free to edit and use it for your next meeting.`,
      owner: {
        name: 'AI Assistant',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
      }
    };
    
    setCampaigns(prevCampaigns => [newCampaign, ...prevCampaigns]);
    setHasNewNotification(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, campaignId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCampaignId(campaignId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = () => {
    if (selectedCampaign) {
      setEditedContent(selectedCampaign.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    // In a real app, you would save the changes to the backend
    // For now, we'll just update the local state
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  // Filter campaigns based on tab, search query, and read/unread filter
  const filteredCampaigns: Campaign[] = campaigns.filter(campaign => {
    // Filter by search query
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.clientGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.solution.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab (type)
    const matchesTab = 
      tabValue === 0 || // All types
      (tabValue === 1 && campaign.type === 'email') || // Email templates
      (tabValue === 2 && campaign.type === 'call') || // Call scripts
      (tabValue === 3 && campaign.type === 'meeting'); // Meeting talking points

    // Filter by read/unread status
    const matchesReadStatus = 
      campaignFilter === 'all' || 
      (campaignFilter === 'unread' && !campaign.isRead) || 
      (campaignFilter === 'read' && campaign.isRead);

    return matchesSearch && matchesTab && matchesReadStatus;
  });

  // Get the selected campaign
  const selectedCampaign: Campaign | null = campaigns.find(c => c.id === selectedCampaignId) || null;

  // Define TypeInfo interface
  interface TypeInfo {
    icon: React.ReactNode;
    color: string;
    label: string;
    previewLabel: string;
  }

  // Get type icon and color
  const getTypeInfo = (type: string): TypeInfo => {
    switch(type) {
      case 'email':
        return {
          icon: <EmailIcon size={20} color="#3498db" />,
          color: '#3498db',
          label: 'Email Template',
          previewLabel: 'Email Preview'
        };
      case 'call':
        return {
          icon: <PhoneIcon size={20} color="#2ecc71" />,
          color: '#2ecc71',
          label: 'Call Script',
          previewLabel: 'Call Script'
        };
      case 'meeting':
        return {
          icon: <VideocamIcon size={20} color="#f39c12" />,
          color: '#f39c12',
          label: 'Meeting Points',
          previewLabel: 'Meeting Agenda'
        };
      default:
        return {
          icon: <CampaignIcon size={20} color="#95a5a6" />,
          color: '#95a5a6',
          label: type,
          previewLabel: 'Content Preview'
        };
    }
  };

  // Count unread campaigns
  const unreadCount = campaigns.filter(c => !c.isRead).length;

  // Clear notification when viewing campaigns
  useEffect(() => {
    if (selectedCampaignId) {
      setHasNewNotification(false);
    }
  }, [selectedCampaignId]);

  return (
    <CampaignsContainer>
      {/* Header with title and actions */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              Campaign Inbox
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  fontWeight: 'bold',
                  height: 20,
                  minWidth: 20
                }}
              />
            )}
            <Tooltip title="AI-powered suggestions">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SmartToyIcon size={24} color={mode === 'dark' ? '#ffffff' : '#000000'} />
              </Box>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon size={18} color={mode === 'dark' ? '#000000' : '#ffffff'} />}
              onClick={handleAddNewCampaign}
              sx={{
                bgcolor: mode === 'dark' ? 'white' : 'black',
                color: mode === 'dark' ? 'black' : 'white',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                }
              }}
            >
              Generate New Template
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your AI-generated templates and talking points for client interactions
        </Typography>

        {/* Tabs for filtering */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: '48px',
            },
            '& .Mui-selected': {
              color: mode === 'dark' ? 'white' : 'black',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: mode === 'dark' ? 'white' : 'black',
            }
          }}
        >
          <Tab
            label="All Types"
            icon={<CampaignIcon size={20} color={tabValue === 0 ? (mode === 'dark' ? '#ffffff' : '#000000') : '#888888'} />}
            iconPosition="start"
          />
          <Tab
            label="Email Templates"
            icon={<EmailIcon size={20} color={tabValue === 1 ? (mode === 'dark' ? '#ffffff' : '#000000') : '#888888'} />}
            iconPosition="start"
          />
          <Tab
            label="Call Scripts"
            icon={<PhoneIcon size={20} color={tabValue === 2 ? (mode === 'dark' ? '#ffffff' : '#000000') : '#888888'} />}
            iconPosition="start"
          />
          <Tab
            label="Meeting Points"
            icon={<VideocamIcon size={20} color={tabValue === 3 ? (mode === 'dark' ? '#ffffff' : '#000000') : '#888888'} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Main content area with inbox-style layout */}
      <InboxContainer>
        {/* Left sidebar with campaign list */}
        <ListContainer>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              placeholder="Search campaigns..."
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={18} color={mode === 'dark' ? '#aaaaaa' : '#666666'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleFilterClick}>
                      <FilterListIcon size={18} color={mode === 'dark' ? '#aaaaaa' : '#666666'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Filter buttons */}
          <Box sx={{ display: 'flex', p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Button
              variant={campaignFilter === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleCampaignFilterChange('all')}
              sx={{ 
                mr: 1, 
                textTransform: 'none',
                bgcolor: campaignFilter === 'all' ? (mode === 'dark' ? 'white' : 'black') : 'transparent',
                color: campaignFilter === 'all' ? (mode === 'dark' ? 'black' : 'white') : (mode === 'dark' ? 'white' : 'black'),
                borderColor: mode === 'dark' ? 'white' : 'black',
                '&:hover': {
                  bgcolor: campaignFilter === 'all' ? (mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)') : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              All
            </Button>
            <Button
              variant={campaignFilter === 'unread' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleCampaignFilterChange('unread')}
              sx={{ 
                mr: 1, 
                textTransform: 'none',
                bgcolor: campaignFilter === 'unread' ? (mode === 'dark' ? 'white' : 'black') : 'transparent',
                color: campaignFilter === 'unread' ? (mode === 'dark' ? 'black' : 'white') : (mode === 'dark' ? 'white' : 'black'),
                borderColor: mode === 'dark' ? 'white' : 'black',
                '&:hover': {
                  bgcolor: campaignFilter === 'unread' ? (mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)') : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Unread
            </Button>
            <Button
              variant={campaignFilter === 'read' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleCampaignFilterChange('read')}
              sx={{ 
                textTransform: 'none',
                bgcolor: campaignFilter === 'read' ? (mode === 'dark' ? 'white' : 'black') : 'transparent',
                color: campaignFilter === 'read' ? (mode === 'dark' ? 'black' : 'white') : (mode === 'dark' ? 'white' : 'black'),
                borderColor: mode === 'dark' ? 'white' : 'black',
                '&:hover': {
                  bgcolor: campaignFilter === 'read' ? (mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)') : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Read
            </Button>
          </Box>

          <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
            <List disablePadding>
              {filteredCampaigns.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <SmartToyIcon size={40} color={mode === 'dark' ? '#aaaaaa' : '#666666'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    No campaigns found
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Unread Campaigns Section */}
                  {filteredCampaigns.filter(c => !c.isRead).length > 0 && 
                   (campaignFilter === 'all' || campaignFilter === 'unread') && (
                    <>
                      <Box sx={{ 
                        p: 1.5, 
                        bgcolor: 'rgba(25, 118, 210, 0.05)', 
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                      }}>
                        <Typography variant="caption" fontWeight="bold" color="primary">
                          NEW ({filteredCampaigns.filter(c => !c.isRead).length})
                        </Typography>
                      </Box>
                      {filteredCampaigns
                        .filter(campaign => !campaign.isRead)
                        .map(campaign => {
                          const typeInfo = getTypeInfo(campaign.type);
                          const isSelected = campaign.id === selectedCampaignId;
                          
                          return (
                            <ListItemStyled
                              key={campaign.id}
                              selected={isSelected}
                              onClick={() => handleCampaignSelect(campaign.id)}
                              sx={{
                                cursor: 'pointer',
                                py: 1.5,
                                bgcolor: 'rgba(25, 118, 210, 0.05)',
                              }}
                              variants={listItemVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              whileTap="tap"
                            >
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                {typeInfo.icon}
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    noWrap
                                  >
                                    {campaign.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {campaign.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <TypeBadge
                                        label={campaign.clientGroup}
                                        type={campaign.type}
                                      />
                                      <Chip
                                        label={campaign.solution}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.7rem',
                                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                }
                              />
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'error.main',
                                  ml: 1
                                }}
                              />
                            </ListItemStyled>
                          );
                        })}
                    </>
                  )}
                  
                  {/* Read Campaigns Section */}
                  {filteredCampaigns.filter(c => c.isRead).length > 0 && 
                   (campaignFilter === 'all' || campaignFilter === 'read') && (
                    <>
                      <Box sx={{ 
                        p: 1.5, 
                        bgcolor: 'rgba(0, 0, 0, 0.02)', 
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                      }}>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">
                          EARLIER ({filteredCampaigns.filter(c => c.isRead).length})
                        </Typography>
                      </Box>
                      {filteredCampaigns
                        .filter(campaign => campaign.isRead)
                        .map(campaign => {
                          const typeInfo = getTypeInfo(campaign.type);
                          const isSelected = campaign.id === selectedCampaignId;
                          
                          return (
                            <ListItemStyled
                              key={campaign.id}
                              selected={isSelected}
                              onClick={() => handleCampaignSelect(campaign.id)}
                              sx={{
                                cursor: 'pointer',
                                py: 1.5,
                              }}
                              variants={listItemVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover="hover"
                              whileTap="tap"
                            >
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                {typeInfo.icon}
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body1"
                                    noWrap
                                  >
                                    {campaign.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {campaign.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <TypeBadge
                                        label={campaign.clientGroup}
                                        type={campaign.type}
                                      />
                                      <Chip
                                        label={campaign.solution}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.7rem',
                                          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                }
                              />
                            </ListItemStyled>
                          );
                        })}
                    </>
                  )}
                  
                  {/* No Results Message */}
                  {filteredCampaigns.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No {campaignFilter} campaigns found.
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </List>
          </Box>
        </ListContainer>

        {/* Right side with campaign details */}
        <DetailContainer>
          {selectedCampaign ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Campaign header */}
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {selectedCampaign.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedCampaign.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      icon={<AutoAwesomeIcon size={16} color="#9b59b6" />}
                      label="AI Generated" 
                      size="small"
                      sx={{ 
                        backgroundColor: mode === 'dark' ? 'rgba(155, 89, 182, 0.2)' : 'rgba(155, 89, 182, 0.1)',
                        color: '#9b59b6',
                        fontWeight: 'bold'
                      }} 
                    />
                    <IconButton
                      onClick={(e) => handleMenuClick(e, selectedCampaign.id)}
                    >
                      <MoreVertIcon size={20} color={mode === 'dark' ? '#ffffff' : '#000000'} />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TypeBadge 
                    type={selectedCampaign.type} 
                    label={getTypeInfo(selectedCampaign.type).label} 
                    size="medium" 
                  />
                  <Chip 
                    label={selectedCampaign.clientGroup} 
                    size="medium"
                    sx={{ 
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    }} 
                  />
                  <Chip 
                    label={selectedCampaign.solution} 
                    size="medium"
                    sx={{ 
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    }} 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created on {new Date(selectedCampaign.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Engagement rate">
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <TrendingUpIcon size={16} color="#2ecc71" />
                        <Typography variant="body2" sx={{ ml: 0.5, color: '#2ecc71', fontWeight: 'bold' }}>
                          {selectedCampaign.engagement}%
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Chip 
                      icon={<CheckCircleIcon fontSize="small" sx={{ color: '#2ecc71' }} />}
                      label="Active" 
                      size="small"
                      sx={{ 
                        backgroundColor: mode === 'dark' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)',
                        color: '#2ecc71',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                </Box>
              </Box>

              {/* Campaign content */}
              <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                {isEditing ? (
                  <>
                    <TextField
                      multiline
                      fullWidth
                      minRows={20}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          lineHeight: 1.6
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        sx={{ 
                          borderColor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'white' : 'black',
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSaveEdit}
                        sx={{
                          bgcolor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'black' : 'white',
                          '&:hover': {
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {getTypeInfo(selectedCampaign.type).previewLabel}
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
                        {selectedCampaign.content}
                      </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopyIcon size={16} color={mode === 'dark' ? '#ffffff' : '#000000'} />}
                        sx={{ 
                          borderColor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'white' : 'black',
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon size={16} color={mode === 'dark' ? '#ffffff' : '#000000'} />}
                        onClick={handleEditClick}
                        sx={{ 
                          borderColor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'white' : 'black',
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<EmailIcon size={16} color={mode === 'dark' ? '#000000' : '#ffffff'} />}
                        sx={{
                          bgcolor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'black' : 'white',
                          '&:hover': {
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                          }
                        }}
                      >
                        Use Template
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <EmailIcon size={60} color={mode === 'dark' ? '#aaaaaa' : '#666666'} />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  Select a campaign to view
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Your AI-generated templates will appear here
                </Typography>
              </Box>
            </Box>
          )}
        </DetailContainer>
      </InboxContainer>

      {/* Filter menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            mt: 1,
            width: 200,
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={handleFilterClose}>
          <Typography variant="body2">All Campaigns</Typography>
        </MenuItem>
        <MenuItem onClick={handleFilterClose}>
          <Typography variant="body2">Recent First</Typography>
        </MenuItem>
        <MenuItem onClick={handleFilterClose}>
          <Typography variant="body2">Oldest First</Typography>
        </MenuItem>
        <MenuItem onClick={handleFilterClose}>
          <Typography variant="body2">Highest Engagement</Typography>
        </MenuItem>
      </Menu>

      {/* Campaign actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            width: 200,
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ContentCopyIcon size={18} color={mode === 'dark' ? '#ffffff' : '#000000'} />
          </ListItemIcon>
          <Typography variant="body2">Copy</Typography>
        </MenuItem>
        <MenuItem onClick={() => {
          handleEditClick();
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon size={18} color={mode === 'dark' ? '#ffffff' : '#000000'} />
          </ListItemIcon>
          <Typography variant="body2">Edit</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon size={18} color={mode === 'dark' ? '#ffffff' : '#000000'} />
          </ListItemIcon>
          <Typography variant="body2">Share</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DeleteIcon size={18} color="#e74c3c" />
          </ListItemIcon>
          <Typography variant="body2" color="#e74c3c">Delete</Typography>
        </MenuItem>
      </Menu>
    </CampaignsContainer>
  );
};

export default DocumentsWithInbox;
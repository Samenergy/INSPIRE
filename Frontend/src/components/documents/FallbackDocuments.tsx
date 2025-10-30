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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Import Material UI icons as fallback
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import CampaignIcon from '@mui/icons-material/Campaign';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';

const CampaignsContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const InboxContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
  borderTop: `1px solid ${theme.palette.divider}`
}));

const ListContainer = styled(Box)(({ theme }) => ({
  width: '350px',
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
}));

const DetailContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}));

const ListItemStyled = styled(ListItem)(({ theme, selected }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: selected ?
    (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)') :
    'transparent',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  },
}));

// Define TypeBadge props interface
interface TypeBadgeProps {
  type: 'email' | 'call' | 'meeting' | string;
  label: string;
  size?: 'small' | 'medium';
  [key: string]: any;
}

// Custom TypeBadge component that uses our animated icons
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
      icon={<IconComponent fontSize="small" sx={{ color }} />}
      label={label}
      size={size}
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
  owner: {
    name: string;
    avatar: string;
  };
}

const FallbackDocuments = () => {
  const { mode } = useTheme();
  const [tabValue, setTabValue] = useState<number>(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');

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
    },
    {
      id: 7,
      title: 'Cloud Security Email for Financial',
      description: 'Email template for financial institutions about cloud security solutions.',
      image: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Financial',
      solution: 'Cybersecurity',
      type: 'email',
      status: 'active',
      progress: 100,
      engagement: 76,
      createdAt: '2023-10-25',
      aiGenerated: true,
      content: `Subject: Enhanced Cloud Security Framework for [Financial Institution]\n\nDear [Decision Maker],\n\nIn light of the recent regulatory changes affecting financial institutions and the 43% increase in targeted attacks against banking infrastructure, I wanted to share our specialized Cloud Security Framework designed specifically for the financial sector.\n\nOur solution addresses the unique challenges you face:\n\n• Regulatory compliance (GDPR, PCI DSS, SOX) with automated reporting\n• Advanced threat detection tailored to financial transaction patterns\n• Multi-layered encryption for sensitive customer data\n• 24/7 financial sector security operations center\n\nWe recently helped [Similar Financial Institution] achieve complete compliance while reducing security incidents by 76% and cutting security operational costs by 31%.\n\nI've attached a security brief outlining how our approach differs from generic cloud security solutions. Would you be available for a confidential security assessment next week?\n\nBest regards,\n[Your Name]\n[Your Contact Information]`,
      owner: {
        name: 'Robert Chen',
        avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
      }
    },
    {
      id: 8,
      title: 'Healthcare Analytics Call Script',
      description: 'Talking points for calls with healthcare providers about analytics solutions.',
      image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Healthcare',
      solution: 'Analytics',
      type: 'call',
      status: 'active',
      progress: 100,
      engagement: 81,
      createdAt: '2023-11-08',
      aiGenerated: true,
      content: `1. Introduction:\n"Hello [Name], I'm calling regarding the healthcare analytics challenges we discussed at [Previous Interaction]. Has your organization made any progress in addressing patient outcome predictions and resource optimization?"\n\n2. Industry Context:\n"Many healthcare providers are struggling with the increasing demands for data-driven care while maintaining HIPAA compliance. Is this something your team is experiencing?"\n\n3. Pain Point Exploration:\n"Are you currently able to predict patient readmissions effectively? How about optimizing staff scheduling based on predicted patient volumes?"\n\n4. Solution Overview:\n"Our healthcare analytics platform combines clinical data with operational metrics to provide actionable insights while maintaining strict HIPAA compliance."\n\n5. Key Differentiators:\n"What makes our solution unique is its ability to integrate with all major EHR systems and provide predictive models specifically trained on healthcare data."\n\n6. Success Story:\n"We recently implemented this for [Similar Healthcare Provider], resulting in a 28% reduction in readmissions and 15% improvement in resource utilization."\n\n7. Call to Action:\n"I'd like to arrange a demonstration with your clinical and IT teams. Would next Wednesday work for a 30-minute session?"`,
      owner: {
        name: 'Sophia Williams',
        avatar: 'https://randomuser.me/api/portraits/women/23.jpg'
      }
    },
    {
      id: 9,
      title: 'Retail Digital Transformation Email',
      description: 'Email template for retail businesses about digital transformation.',
      image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Retail',
      solution: 'Digital Transformation',
      type: 'email',
      status: 'active',
      progress: 100,
      engagement: 79,
      createdAt: '2023-10-30',
      aiGenerated: true,
      content: `Subject: Transforming [Retail Company] for the Digital-First Consumer\n\nDear [Decision Maker],\n\nAs consumer shopping behaviors continue to evolve rapidly, I wanted to share how our Retail Digital Transformation solution could help [Retail Company] adapt and thrive in this changing landscape.\n\nBased on our analysis of your current digital presence and the specific challenges you mentioned during our last conversation, we've identified several opportunities:\n\n• Unified omnichannel experience connecting your physical and online stores\n• AI-powered personalization increasing average order value by 26%\n• Inventory optimization reducing carrying costs by 31%\n• Streamlined checkout process decreasing cart abandonment by 42%\n\nRetailers similar to yours have seen an average ROI of 3.2x within the first 12 months of implementation.\n\nI've attached a brief case study of how we helped [Similar Retailer] achieve a 47% increase in digital revenue while maintaining their brand identity and customer loyalty.\n\nWould you be available for a 30-minute call next week to discuss how we could tailor this approach for [Retail Company]?\n\nBest regards,\n[Your Name]\n[Your Contact Information]`,
      owner: {
        name: 'Daniel Park',
        avatar: 'https://randomuser.me/api/portraits/men/57.jpg'
      }
    }
  ];

  // Get the selected campaign
  const selectedCampaign: Campaign | null = campaigns.find(c => c.id === selectedCampaignId) || null;

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

  const handleCampaignSelect = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    setIsEditing(false);
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

  // Filter campaigns based on tab and search query
  const filteredCampaigns: Campaign[] = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.clientGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.solution.toLowerCase().includes(searchQuery.toLowerCase());

    if (tabValue === 0) return matchesSearch; // All types
    if (tabValue === 1) return campaign.type === 'email' && matchesSearch; // Email templates
    if (tabValue === 2) return campaign.type === 'call' && matchesSearch; // Call scripts
    if (tabValue === 3) return campaign.type === 'meeting' && matchesSearch; // Meeting talking points

    return matchesSearch;
  });

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
          icon: <EmailIcon fontSize="small" sx={{ color: '#3498db' }} />, 
          color: '#3498db', 
          label: 'Email Template',
          previewLabel: 'Email Preview'
        };
      case 'call':
        return { 
          icon: <PhoneIcon fontSize="small" sx={{ color: '#2ecc71' }} />, 
          color: '#2ecc71', 
          label: 'Call Script',
          previewLabel: 'Call Script'
        };
      case 'meeting':
        return { 
          icon: <VideocamIcon fontSize="small" sx={{ color: '#f39c12' }} />, 
          color: '#f39c12', 
          label: 'Meeting Points',
          previewLabel: 'Meeting Agenda'
        };
      default:
        return { 
          icon: <CampaignIcon fontSize="small" sx={{ color: '#95a5a6' }} />, 
          color: '#95a5a6', 
          label: type,
          previewLabel: 'Content Preview'
        };
    }
  };

  return (
    <CampaignsContainer>
      {/* Header with title and actions */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              AI-Suggested Campaigns
            </Typography>
            <Tooltip title="AI-powered suggestions">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SmartToyIcon fontSize="small" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }} />
              </Box>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={true}
                  size="small"
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
              label="Auto-generate"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: mode === 'dark' ? 'white' : 'black',
                color: mode === 'dark' ? 'black' : 'white',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                }
              }}
            >
              Generate New
            </Button>
          </Box>
        </Box>

        {/* Search and filter */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search campaigns..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: mode === 'dark' ? '#aaaaaa' : '#666666' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{ 
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
              color: mode === 'dark' ? 'white' : 'black',
              borderRadius: '8px',
              minWidth: '100px'
            }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* Tabs for filtering by type */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'medium',
            fontSize: '0.9rem',
          },
          '& .Mui-selected': {
            fontWeight: 'bold',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            backgroundColor: mode === 'dark' ? 'white' : 'black',
          }
        }}
      >
        <Tab 
          label="All Types" 
          icon={<CampaignIcon fontSize="small" sx={{ color: tabValue === 0 ? (mode === 'dark' ? '#ffffff' : '#000000') : '#888888' }} />} 
          iconPosition="start"
        />
        <Tab 
          label="Email" 
          icon={<EmailIcon fontSize="small" sx={{ color: tabValue === 1 ? '#3498db' : '#888888' }} />} 
          iconPosition="start"
        />
        <Tab 
          label="Call" 
          icon={<PhoneIcon fontSize="small" sx={{ color: tabValue === 2 ? '#2ecc71' : '#888888' }} />} 
          iconPosition="start"
        />
        <Tab 
          label="Meeting" 
          icon={<VideocamIcon fontSize="small" sx={{ color: tabValue === 3 ? '#f39c12' : '#888888' }} />} 
          iconPosition="start"
        />
      </Tabs>

      {/* Main content area with list and detail view */}
      <InboxContainer>
        {/* List of campaigns */}
        <ListContainer>
          <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
            <List disablePadding>
              {filteredCampaigns.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <SmartToyIcon fontSize="large" sx={{ color: mode === 'dark' ? '#aaaaaa' : '#666666' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    No campaigns found
                  </Typography>
                </Box>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const typeInfo = getTypeInfo(campaign.type);
                  const isSelected = campaign.id === selectedCampaignId;
                  
                  return (
                    <ListItemStyled
                      key={campaign.id}
                      selected={isSelected}
                      onClick={() => handleCampaignSelect(campaign.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: '80%' }}>
                            {campaign.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                              {new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuClick(e, campaign.id);
                              }}
                            >
                              <MoreVertIcon fontSize="small" sx={{ color: mode === 'dark' ? '#aaaaaa' : '#666666' }} />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {campaign.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <TypeBadge type={campaign.type} label={typeInfo.label} />
                            <Chip 
                              label={campaign.clientGroup} 
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                              }} 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title={`${campaign.engagement}% engagement rate`}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon fontSize="small" sx={{ color: '#2ecc71' }} />
                                <Typography variant="caption" sx={{ ml: 0.5, color: '#2ecc71', fontWeight: 'bold' }}>
                                  {campaign.engagement}%
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </ListItemStyled>
                  );
                })
              )}
            </List>
          </Box>
        </ListContainer>

        {/* Detail view of selected campaign */}
        <DetailContainer>
          {selectedCampaign ? (
            <>
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
                      icon={<AutoAwesomeIcon fontSize="small" sx={{ color: '#9b59b6' }} />}
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
                      <MoreVertIcon fontSize="small" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }} />
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
                        <TrendingUpIcon fontSize="small" sx={{ color: '#2ecc71' }} />
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
                        startIcon={<ContentCopyIcon fontSize="small" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }} />}
                        sx={{ 
                          borderColor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'white' : 'black',
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ShareIcon fontSize="small" sx={{ color: mode === 'dark' ? '#ffffff' : '#000000' }} />}
                        sx={{ 
                          borderColor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'white' : 'black',
                        }}
                      >
                        Share
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon fontSize="small" sx={{ color: mode === 'dark' ? '#000000' : '#ffffff' }} />}
                        onClick={handleEditClick}
                        sx={{
                          bgcolor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'black' : 'white',
                          '&:hover': {
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                          }
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              p: 3
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <SmartToyIcon fontSize="large" sx={{ color: mode === 'dark' ? '#aaaaaa' : '#666666' }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                Select a campaign
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
                Choose an AI-suggested campaign from the list to view and edit its content
              </Typography>
            </Box>
          )}
        </DetailContainer>
      </InboxContainer>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" sx={{ color: '#666666' }} />
          </ListItemIcon>
          <ListItemText>Copy to Clipboard</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#666666' }} />
          </ListItemIcon>
          <ListItemText>Edit Template</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AutoAwesomeIcon fontSize="small" sx={{ color: '#666666' }} />
          </ListItemIcon>
          <ListItemText>Regenerate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" sx={{ color: '#666666' }} />
          </ListItemIcon>
          <ListItemText>Share with Team</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText>Delete Template</ListItemText>
        </MenuItem>
      </Menu>
    </CampaignsContainer>
  );
};

export default FallbackDocuments;
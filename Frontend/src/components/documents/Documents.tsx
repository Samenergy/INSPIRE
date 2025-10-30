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
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
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
  DeleteIcon
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

const Documents = () => {
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

  // Templates state
  const [savedTemplates, setSavedTemplates] = useState<Campaign[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  // Sample data for AI-suggested campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 8,
      title: 'AI-Powered Sales Strategy for SaaS',
      description: 'Comprehensive sales strategy for SaaS products leveraging AI insights.',
      image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'SaaS',
      solution: 'Sales Strategy',
      type: 'meeting',
      status: 'active',
      progress: 100,
      engagement: 95,
      createdAt: '2023-11-15',
      aiGenerated: true,
      isRead: false,
      content: `# AI-Powered Sales Strategy for SaaS Companies\n\n## Executive Summary\nThis strategy leverages AI analysis of market trends and customer behavior to optimize the sales process for SaaS products, resulting in a projected 35% increase in conversion rates and 28% reduction in sales cycle length.\n\n## Key Components\n\n1. **AI-Driven Lead Scoring**\n   - Implement machine learning algorithms to analyze prospect behavior\n   - Score leads based on engagement patterns, company profile, and digital footprint\n   - Prioritize outreach to leads with >80% likelihood of conversion\n\n2. **Personalized Outreach Automation**\n   - Deploy NLP to analyze prospect communications and online presence\n   - Generate customized messaging highlighting specific pain points\n   - A/B test messaging variations with automated optimization\n\n3. **Predictive Sales Forecasting**\n   - Utilize time-series analysis to predict quarterly performance\n   - Identify potential pipeline gaps before they impact revenue\n   - Recommend resource allocation adjustments in real-time\n\n4. **Competitive Intelligence Dashboard**\n   - Monitor competitor pricing, feature releases, and market positioning\n   - Alert sales team to competitive threats and opportunities\n   - Provide AI-generated battle cards for common competitive scenarios\n\n## Implementation Timeline\n- Phase 1 (Weeks 1-2): Data integration and system setup\n- Phase 2 (Weeks 3-4): Model training and validation\n- Phase 3 (Weeks 5-6): Team training and pilot program\n- Phase 4 (Weeks 7-8): Full deployment and optimization`,
      owner: {
        name: 'Jordan Rivera',
        avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
      }
    },
    {
      id: 7,
      title: 'Customer Success Playbook for Tech Startups',
      description: 'Strategic playbook for building and scaling customer success operations.',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      clientGroup: 'Tech Startups',
      solution: 'Customer Success',
      type: 'email',
      status: 'active',
      progress: 100,
      engagement: 91,
      createdAt: '2023-11-12',
      aiGenerated: true,
      isRead: false,
      content: `Subject: Building a Scalable Customer Success Function - Strategic Playbook\n\nDear [Client Name],\n\nFollowing our discussion about establishing a customer success function at [Company Name], I've prepared this strategic playbook to guide your team through the process.\n\n**CUSTOMER SUCCESS PLAYBOOK: FROM STARTUP TO SCALE**\n\n**1. Foundation (Month 1)**\n- Define success metrics for different customer segments\n- Establish health score methodology using product usage, NPS, and support interactions\n- Create customer journey maps with key touchpoints and ownership\n- Implement a dedicated CS platform integrated with your CRM\n\n**2. Early Operations (Months 2-3)**\n- Develop proactive outreach cadences based on health scores\n- Create standardized onboarding processes with clear milestones\n- Build knowledge base and self-service resources\n- Establish QBR (Quarterly Business Review) templates\n\n**3. Growth Phase (Months 4-6)**\n- Implement automated customer health monitoring\n- Develop expansion playbooks for cross-sell/upsell opportunities\n- Create customer advocacy program to generate referrals\n- Establish voice-of-customer feedback loops to product teams\n\n**4. Scaling (Months 7-12)**\n- Segment customers for tiered service models\n- Develop specialized CS roles (Onboarding, Technical CS, Strategic CS)\n- Implement predictive churn models\n- Create customer success operations function\n\nI've attached detailed implementation guides for each phase. Would you like to schedule a workshop next week to customize this playbook for your specific needs?\n\nBest regards,\n[Your Name]`,
      owner: {
        name: 'Taylor Wong',
        avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
      }
    },
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

  // Function to save a template to the templates page
  const handleSaveTemplate = (campaign: Campaign) => {
    // Create a copy of the campaign with a new ID to avoid duplicates
    const templateToSave = {
      ...campaign,
      id: Date.now(),
      isRead: true, // Mark as read since it's now saved
      createdAt: new Date().toISOString().split('T')[0], // Update creation date to today
    };

    // Add to saved templates
    setSavedTemplates(prevTemplates => [templateToSave, ...prevTemplates]);

    // Show success message
    setShowSaveSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };
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
                <SmartToyIcon size={24} color={mode === 'dark' ? '#ffffff' : '#000000'} />
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
              size="small"
              startIcon={<AutoAwesomeIcon size={18} color={mode === 'dark' ? '#000000' : '#ffffff'} />}
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

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Personalized email templates and talking points for your clients
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
                filteredCampaigns.map((campaign) => {
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
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {typeInfo.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            fontWeight={isSelected ? 'bold' : 'normal'}
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
                                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                }}
                              />
                            </Box>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </Typography>
                        {campaign.aiGenerated && (
                          <SmartToyIcon size={14} color={mode === 'dark' ? '#aaaaaa' : '#666666'} />
                        )}
                      </Box>
                    </ListItemStyled>
                  );
                })
              )}
            </List>
          </Box>
        </ListContainer>

        {/* Right side with campaign details */}
        <DetailContainer>
          {selectedCampaign ? (
            <>
              {/* Detail header */}
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {selectedCampaign.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TypeBadge
                        label={getTypeInfo(selectedCampaign.type).label}
                        type={selectedCampaign.type}
                      />
                      {selectedCampaign.aiGenerated && (
                        <Chip
                          icon={<SmartToyIcon size={16} color={mode === 'dark' ? '#ffffff' : '#000000'} />}
                          label="AI Generated"
                          size="small"
                          sx={{
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                            color: mode === 'dark' ? 'white' : 'black',
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCampaign.description}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={(e) => handleMenuClick(e, selectedCampaign.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created on {new Date(selectedCampaign.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={selectedCampaign.clientGroup}
                      size="small"
                      sx={{
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                      }}
                    />
                    <Chip
                      label={selectedCampaign.solution}
                      size="small"
                      sx={{
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Detail content */}
              <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                {isEditing ? (
                  <Box sx={{ height: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      variant="outlined"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      sx={{
                        height: 'calc(100% - 50px)',
                        '& .MuiInputBase-root': {
                          height: '100%',
                        },
                        '& .MuiInputBase-input': {
                          height: '100%',
                          overflow: 'auto',
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
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {getTypeInfo(selectedCampaign.type).previewLabel}:
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            whiteSpace: 'pre-line',
                            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                            lineHeight: 1.6
                          }}
                        >
                          {selectedCampaign.content}
                        </Typography>
                      </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopyIcon size={18} color={mode === 'dark' ? '#ffffff' : '#000000'} />}
                        sx={{
                          borderColor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'white' : 'black',
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ShareIcon size={18} color={mode === 'dark' ? '#ffffff' : '#000000'} />}
                        sx={{
                          borderColor: mode === 'dark' ? 'white' : 'black',
                          color: mode === 'dark' ? 'white' : 'black',
                        }}
                      >
                        Share
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<FavoriteIcon fontSize="small" sx={{ color: '#e74c3c' }} />}
                        onClick={() => selectedCampaign && handleSaveTemplate(selectedCampaign)}
                        sx={{
                          borderColor: '#e74c3c',
                          color: '#e74c3c',
                          '&:hover': {
                            borderColor: '#c0392b',
                            backgroundColor: 'rgba(231, 76, 60, 0.08)',
                          }
                        }}
                      >
                        Save to Templates
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon size={18} color={mode === 'dark' ? '#000000' : '#ffffff'} />}
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
                <SmartToyIcon size={60} color={mode === 'dark' ? '#aaaaaa' : '#666666'} />
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

      {/* Campaign action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ContentCopyIcon size={18} color="#666666" />
          </ListItemIcon>
          <ListItemText>Copy to Clipboard</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon size={18} color="#666666" />
          </ListItemIcon>
          <ListItemText>Edit Template</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AutoAwesomeIcon size={18} color="#666666" />
          </ListItemIcon>
          <ListItemText>Regenerate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon size={18} color="#666666" />
          </ListItemIcon>
          <ListItemText>Share with Team</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedCampaign) {
              handleSaveTemplate(selectedCampaign);
              handleMenuClose();
            }
          }}
        >
          <ListItemIcon>
            <FavoriteIcon fontSize="small" sx={{ color: '#e74c3c' }} />
          </ListItemIcon>
          <ListItemText>Save to Templates</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon size={18} color="#f44336" />
          </ListItemIcon>
          <ListItemText>Delete Template</ListItemText>
        </MenuItem>
      </Menu>

      {/* Success notification */}
      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            bgcolor: '#2ecc71',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          Template saved successfully to Templates page
        </Alert>
      </Snackbar>
    </CampaignsContainer>
  );
};

export default Documents;
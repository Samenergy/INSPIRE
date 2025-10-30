// This service provides data for analytics components based on real system data

// Import account and campaign interfaces
interface Account {
  id: number;
  accountName: string;
  location: string;
  organisationType: string;
  activeAssets: string;
  assets: Asset[];
  productFamily: string;
  exitRate: string;
  updates: 'completed' | 'pending' | 'failed' | 'loading';
  logoSrc: string;
  color?: string;
}

interface Asset {
  id: number;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

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

// Sample data for accounts (this would normally come from your backend)
const sampleAccounts: Account[] = [
  {
    id: 1,
    accountName: 'Master Card',
    location: 'London, United Kingdom',
    organisationType: 'Finance',
    activeAssets: '6 Assets',
    assets: [
      { id: 101, name: 'Risk Analytics Platform', type: 'Software', status: 'active', lastUpdated: '2023-11-15' },
      { id: 102, name: 'Financial Reporting Tool', type: 'Software', status: 'active', lastUpdated: '2023-11-10' },
      { id: 103, name: 'Market Data Feed', type: 'Data Service', status: 'active', lastUpdated: '2023-11-12' },
      { id: 104, name: 'Compliance Monitor', type: 'Software', status: 'active', lastUpdated: '2023-11-08' },
      { id: 105, name: 'Trading Platform', type: 'Software', status: 'active', lastUpdated: '2023-11-05' },
      { id: 106, name: 'Portfolio Manager', type: 'Software', status: 'active', lastUpdated: '2023-11-01' }
    ],
    productFamily: 'Risk & Financial',
    exitRate: '2,343.09',
    updates: 'completed',
    logoSrc: '/images/mastercard.png',
    color: '#EB001B',
  },
  {
    id: 2,
    accountName: 'Twitter',
    location: 'San Francisco, USA',
    organisationType: 'Technology',
    activeAssets: '4 Assets',
    assets: [
      { id: 201, name: 'Social Media Analytics', type: 'Software', status: 'active', lastUpdated: '2023-11-14' },
      { id: 202, name: 'Engagement Tracker', type: 'Software', status: 'active', lastUpdated: '2023-11-09' },
      { id: 203, name: 'Sentiment Analysis', type: 'Data Service', status: 'active', lastUpdated: '2023-11-07' },
      { id: 204, name: 'Trend Predictor', type: 'Software', status: 'active', lastUpdated: '2023-11-03' }
    ],
    productFamily: 'Social Media',
    exitRate: '1,987.65',
    updates: 'completed',
    logoSrc: '/images/twitter.png',
    color: '#1DA1F2',
  },
  {
    id: 3,
    accountName: 'Apple',
    location: 'Cupertino, USA',
    organisationType: 'Technology',
    activeAssets: '8 Assets',
    assets: [
      { id: 301, name: 'Product Design Suite', type: 'Software', status: 'active', lastUpdated: '2023-11-15' },
      { id: 302, name: 'Supply Chain Manager', type: 'Software', status: 'active', lastUpdated: '2023-11-14' },
      { id: 303, name: 'Retail Analytics', type: 'Data Service', status: 'active', lastUpdated: '2023-11-12' },
      { id: 304, name: 'Customer Insights', type: 'Data Service', status: 'active', lastUpdated: '2023-11-10' },
      { id: 305, name: 'Hardware Testing Tools', type: 'Software', status: 'active', lastUpdated: '2023-11-08' },
      { id: 306, name: 'Software Development Kit', type: 'Software', status: 'active', lastUpdated: '2023-11-06' },
      { id: 307, name: 'Market Research Platform', type: 'Software', status: 'active', lastUpdated: '2023-11-04' },
      { id: 308, name: 'Patent Database', type: 'Data Service', status: 'active', lastUpdated: '2023-11-02' }
    ],
    productFamily: 'Hardware & Software',
    exitRate: '3,219.44',
    updates: 'completed',
    logoSrc: '/images/apple.png',
    color: '#555555',
  },
  {
    id: 4,
    accountName: 'Financial Solutions',
    location: 'London, UK',
    organisationType: 'Finance',
    activeAssets: '3 Assets',
    assets: [
      { id: 401, name: 'Investment Platform', type: 'Software', status: 'active', lastUpdated: '2023-10-30' },
      { id: 402, name: 'Risk Assessment Tool', type: 'Software', status: 'active', lastUpdated: '2023-10-25' },
      { id: 403, name: 'Financial Dashboard', type: 'Software', status: 'active', lastUpdated: '2023-10-20' }
    ],
    productFamily: 'Financial Services',
    exitRate: '1,850.75',
    updates: 'completed',
    logoSrc: '/images/avatar.png',
    color: '#4285F4',
  },
  {
    id: 5,
    accountName: 'Healthcare Plus',
    location: 'Boston, USA',
    organisationType: 'Healthcare',
    activeAssets: '7 Assets',
    assets: [
      { id: 501, name: 'Patient Management System', type: 'Software', status: 'active', lastUpdated: '2023-11-10' },
      { id: 502, name: 'Medical Records Database', type: 'Data Service', status: 'active', lastUpdated: '2023-11-05' },
      { id: 503, name: 'Appointment Scheduler', type: 'Software', status: 'active', lastUpdated: '2023-11-01' },
      { id: 504, name: 'Billing System', type: 'Software', status: 'active', lastUpdated: '2023-10-28' },
      { id: 505, name: 'Pharmacy Interface', type: 'Software', status: 'active', lastUpdated: '2023-10-25' },
      { id: 506, name: 'Lab Results Portal', type: 'Software', status: 'active', lastUpdated: '2023-10-22' },
      { id: 507, name: 'Telemedicine Platform', type: 'Software', status: 'active', lastUpdated: '2023-10-20' }
    ],
    productFamily: 'Healthcare IT',
    exitRate: '2,750.30',
    updates: 'completed',
    logoSrc: '/images/avatar.png',
    color: '#34A853',
  },
  {
    id: 6,
    accountName: 'Retail Experts',
    location: 'Seattle, USA',
    organisationType: 'Retail',
    activeAssets: '5 Assets',
    assets: [
      { id: 601, name: 'Inventory Management', type: 'Software', status: 'active', lastUpdated: '2023-11-12' },
      { id: 602, name: 'POS System', type: 'Software', status: 'active', lastUpdated: '2023-11-08' },
      { id: 603, name: 'Customer Loyalty Program', type: 'Software', status: 'active', lastUpdated: '2023-11-05' },
      { id: 604, name: 'E-commerce Platform', type: 'Software', status: 'active', lastUpdated: '2023-11-02' },
      { id: 605, name: 'Supply Chain Tracker', type: 'Software', status: 'active', lastUpdated: '2023-10-30' }
    ],
    productFamily: 'Retail Solutions',
    exitRate: '1,950.60',
    updates: 'completed',
    logoSrc: '/images/avatar.png',
    color: '#EA4335',
  },
  {
    id: 7,
    accountName: 'Media Group',
    location: 'Los Angeles, USA',
    organisationType: 'Media',
    activeAssets: '6 Assets',
    assets: [
      { id: 701, name: 'Content Management System', type: 'Software', status: 'active', lastUpdated: '2023-11-15' },
      { id: 702, name: 'Digital Asset Manager', type: 'Software', status: 'active', lastUpdated: '2023-11-10' },
      { id: 703, name: 'Analytics Dashboard', type: 'Software', status: 'active', lastUpdated: '2023-11-05' },
      { id: 704, name: 'Audience Targeting Tool', type: 'Software', status: 'active', lastUpdated: '2023-11-01' },
      { id: 705, name: 'Ad Campaign Manager', type: 'Software', status: 'active', lastUpdated: '2023-10-28' },
      { id: 706, name: 'Social Media Scheduler', type: 'Software', status: 'active', lastUpdated: '2023-10-25' }
    ],
    productFamily: 'Media Solutions',
    exitRate: '2,150.25',
    updates: 'completed',
    logoSrc: '/images/avatar.png',
    color: '#FBBC05',
  },
  {
    id: 8,
    accountName: 'Construction Partners',
    location: 'Dallas, USA',
    organisationType: 'Construction',
    activeAssets: '4 Assets',
    assets: [
      { id: 801, name: 'Project Management Tool', type: 'Software', status: 'active', lastUpdated: '2023-11-10' },
      { id: 802, name: 'Resource Allocation System', type: 'Software', status: 'active', lastUpdated: '2023-11-05' },
      { id: 803, name: 'Blueprint Repository', type: 'Data Service', status: 'active', lastUpdated: '2023-11-01' },
      { id: 804, name: 'Safety Compliance Tracker', type: 'Software', status: 'active', lastUpdated: '2023-10-28' }
    ],
    productFamily: 'Construction Management',
    exitRate: '1,850.40',
    updates: 'completed',
    logoSrc: '/images/avatar.png',
    color: '#8E24AA',
  }
];

// Sample data for campaigns
const sampleCampaigns: Campaign[] = [
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

// Client Lifetime Value data based on real accounts
export const getClientLifetimeValueData = () => {
  // Group accounts by organization type
  const industryGroups: { [key: string]: Account[] } = {};
  
  sampleAccounts.forEach(account => {
    if (!industryGroups[account.organisationType]) {
      industryGroups[account.organisationType] = [];
    }
    industryGroups[account.organisationType].push(account);
  });

  // Calculate average CLV for each industry over time
  const industries = Object.keys(industryGroups).map(industry => {
    // Convert exitRate strings to numbers for calculations
    const values = industryGroups[industry].map(account => 
      parseFloat(account.exitRate.replace(',', ''))
    );
    
    // Calculate average CLV
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Generate historical data (simulated)
    // We'll use the current value and work backwards with some variation
    const historicalValues = [avgValue];
    
    // Generate 5 years of historical data
    for (let i = 1; i < 6; i++) {
      // Each year back is 5-15% less than the next year
      const reductionFactor = 0.85 + (Math.random() * 0.1); // Between 0.85 and 0.95
      historicalValues.unshift(historicalValues[0] * reductionFactor);
    }
    
    // Calculate YoY growth
    const currentValue = historicalValues[historicalValues.length - 1];
    const previousValue = historicalValues[historicalValues.length - 2];
    const growth = ((currentValue - previousValue) / previousValue) * 100;
    
    // Assign a color based on the industry
    let color;
    switch(industry) {
      case 'Technology':
        color = '#4285F4'; // Google Blue
        break;
      case 'Healthcare':
        color = '#34A853'; // Google Green
        break;
      case 'Finance':
        color = '#FBBC05'; // Google Yellow
        break;
      case 'Retail':
        color = '#EA4335'; // Google Red
        break;
      case 'Media':
        color = '#8E24AA'; // Purple
        break;
      case 'Construction':
        color = '#00ACC1'; // Cyan
        break;
      default:
        color = '#4285F4'; // Default to blue
    }
    
    return {
      name: industry,
      color,
      values: historicalValues,
      growth: Math.round(growth)
    };
  });
  
  return {
    industries,
    timeLabels: ['2018', '2019', '2020', '2021', '2022', '2023']
  };
};

// Client Funnel data based on real accounts and campaigns
export const getClientFunnelData = () => {
  // Total number of accounts
  const totalAccounts = sampleAccounts.length;
  
  // Calculate funnel stages
  const leads = totalAccounts * 3; // Assume 3x more leads than actual accounts
  const opportunities = Math.round(leads * 0.4); // 40% of leads become opportunities
  const proposals = Math.round(opportunities * 0.6); // 60% of opportunities get proposals
  const clients = totalAccounts; // All accounts are clients
  
  // Calculate conversion rates
  const leadToOppRate = Math.round((opportunities / leads) * 100);
  const oppToPropRate = Math.round((proposals / opportunities) * 100);
  const propToClientRate = Math.round((clients / proposals) * 100);
  const overallConversion = Math.round((clients / leads) * 100);
  
  // Retention data
  const activeClients = sampleAccounts.filter(a => a.updates === 'completed').length;
  const inactiveClients = sampleAccounts.filter(a => a.updates === 'failed').length;
  const atRiskClients = Math.round(activeClients * 0.15); // 15% of active clients are at risk
  
  // Calculate retention rate
  const retentionRate = Math.round((activeClients / totalAccounts) * 100);
  
  // Client age distribution (simulated)
  const clientAgeDistribution = [
    { range: '0-6 months', count: Math.round(totalAccounts * 0.25) },
    { range: '6-12 months', count: Math.round(totalAccounts * 0.2) },
    { range: '1-2 years', count: Math.round(totalAccounts * 0.3) },
    { range: '2-3 years', count: Math.round(totalAccounts * 0.15) },
    { range: '3+ years', count: Math.round(totalAccounts * 0.1) }
  ];
  
  // Campaign engagement by type
  const campaignEngagement = sampleCampaigns.reduce((acc, campaign) => {
    if (!acc[campaign.type]) {
      acc[campaign.type] = { count: 0, totalEngagement: 0 };
    }
    acc[campaign.type].count += 1;
    acc[campaign.type].totalEngagement += campaign.engagement;
    return acc;
  }, {} as { [key: string]: { count: number, totalEngagement: number } });
  
  // Calculate average engagement by campaign type
  const engagementByType = Object.entries(campaignEngagement).map(([type, data]) => ({
    type,
    avgEngagement: Math.round(data.totalEngagement / data.count)
  }));
  
  return {
    acquisition: {
      stages: [
        { name: 'Leads', value: leads },
        { name: 'Opportunities', value: opportunities },
        { name: 'Proposals', value: proposals },
        { name: 'Clients', value: clients }
      ],
      conversionRates: [
        { name: 'Lead to Opportunity', value: leadToOppRate },
        { name: 'Opportunity to Proposal', value: oppToPropRate },
        { name: 'Proposal to Client', value: propToClientRate },
        { name: 'Overall Conversion', value: overallConversion }
      ]
    },
    retention: {
      status: [
        { name: 'Active', value: activeClients },
        { name: 'At Risk', value: atRiskClients },
        { name: 'Inactive', value: inactiveClients }
      ],
      retentionRate,
      clientAgeDistribution,
      engagementByType
    }
  };
};

// Revenue Forecast data based on real accounts
export const getRevenueForecastData = () => {
  // Calculate current monthly revenue based on account exit rates
  const currentMonthlyRevenue = sampleAccounts.reduce((sum, account) => {
    return sum + parseFloat(account.exitRate.replace(',', ''));
  }, 0);
  
  // Generate forecast data
  const generateForecastData = () => {
    // Base values
    const baseRevenue = currentMonthlyRevenue;
    const baseGrowth = 0.05;
    const seasonalFactors = [1.0, 0.95, 1.1, 1.05, 1.15, 1.2, 1.1, 0.9, 1.0, 1.1, 1.3, 1.2];
    const currentMonth = new Date().getMonth();
    
    // Actual data (past months)
    const actualData = [];
    
    // Forecast data (future months)
    const forecastData = [];
    const optimisticData = [];
    const pessimisticData = [];
    
    // Generate 12 months of data
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const yearFactor = 1 + (Math.floor((currentMonth + i) / 12) * 0.1); // 10% year-over-year growth
      
      // Base calculation with seasonal adjustment
      const seasonalFactor = seasonalFactors[monthIndex];
      const growthFactor = 1 + (baseGrowth * (i + 1) / 12);
      
      const value = baseRevenue * growthFactor * seasonalFactor * yearFactor;
      
      // First 2 months are actual data
      if (i < 2) {
        actualData.push(value * (0.95 + Math.random() * 0.1)); // Slight random variation
        forecastData.push(null);
        optimisticData.push(null);
        pessimisticData.push(null);
      } else {
        actualData.push(null);
        forecastData.push(value);
        optimisticData.push(value * (1.1 + (i * 0.01))); // Optimistic: 10% better + increasing divergence
        pessimisticData.push(value * (0.9 - (i * 0.005))); // Pessimistic: 10% worse + increasing divergence
      }
    }
    
    return {
      actual: actualData,
      forecast: forecastData,
      optimistic: optimisticData,
      pessimistic: pessimisticData,
    };
  };

  // Generate months for the forecast
  const generateMonths = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    let result = [];
    
    // Next 12 months
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      result.push(months[monthIndex]);
    }
    
    return result;
  };

  // Generate opportunities based on real accounts
  const generateOpportunities = () => {
    return [
      {
        id: 'OPP-1234',
        client: sampleAccounts[0].accountName,
        value: Math.round(parseFloat(sampleAccounts[0].exitRate.replace(',', '')) * 1.5),
        probability: 80,
        stage: 'Negotiation',
        expectedClose: '2023-12-15',
        type: 'Expansion',
      },
      {
        id: 'OPP-2345',
        client: 'TechGlobal Inc.',
        value: 85000,
        probability: 60,
        stage: 'Proposal',
        expectedClose: '2024-01-10',
        type: 'New Business',
      },
      {
        id: 'OPP-3456',
        client: sampleAccounts[4].accountName,
        value: Math.round(parseFloat(sampleAccounts[4].exitRate.replace(',', '')) * 2),
        probability: 40,
        stage: 'Discovery',
        expectedClose: '2024-02-28',
        type: 'New Business',
      },
      {
        id: 'OPP-4567',
        client: sampleAccounts[2].accountName,
        value: Math.round(parseFloat(sampleAccounts[2].exitRate.replace(',', '')) * 0.8),
        probability: 90,
        stage: 'Closing',
        expectedClose: '2023-11-30',
        type: 'Renewal',
      },
    ];
  };

  const forecastData = generateForecastData();
  const months = generateMonths();
  const opportunities = generateOpportunities();

  // Calculate forecast metrics
  const calculateMetrics = () => {
    const actualSum = forecastData.actual.reduce((sum, val) => sum + (val || 0), 0);
    const forecastSum = forecastData.forecast.reduce((sum, val) => sum + (val || 0), 0);
    const totalRevenue = actualSum + forecastSum;
    
    const lastMonthIndex = forecastData.actual.findIndex(val => val === null) - 1;
    const lastMonthValue = forecastData.actual[lastMonthIndex] || 0;
    const nextMonthValue = forecastData.forecast[0] || 0;
    const monthOverMonthChange = ((nextMonthValue - lastMonthValue) / lastMonthValue) * 100;
    
    const weightedPipeline = opportunities.reduce((sum, opp) => sum + (opp.value * (opp.probability / 100)), 0);
    
    return {
      totalRevenue,
      monthOverMonthChange,
      weightedPipeline,
      pipelineToForecastRatio: (weightedPipeline / forecastSum) * 100,
    };
  };

  return {
    forecastData,
    months,
    opportunities,
    metrics: calculateMetrics()
  };
};
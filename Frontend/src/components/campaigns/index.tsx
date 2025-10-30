import React from 'react';
import StaticCampaignsNew from './StaticCampaignsNew';

interface CampaignsProps {
  onVisit?: () => void;
}

// This component will be the default export
// It uses the static version by default, but you can replace it with AnimatedCampaigns
// once framer-motion is installed
const Campaigns: React.FC<CampaignsProps> = (props) => {
  return <StaticCampaignsNew {...props} />;
};

export default Campaigns;
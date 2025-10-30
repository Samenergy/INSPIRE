import React from 'react';
import { styled } from '@mui/material/styles';
import { SvgIcon, SvgIconProps } from '@mui/material';
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

// Define props interface for our animated icons
interface AnimatedIconProps extends SvgIconProps {
  size?: number;
  color?: string;
}

// Create a styled version of each icon with pulse animation
const createAnimatedIcon = (Icon: React.ElementType) => {
  return styled(({ color, size, ...props }: AnimatedIconProps) => (
    <SvgIcon
      component={Icon}
      sx={{
        fontSize: size ? `${size}px` : 'inherit',
        color: color || 'inherit',
      }}
      {...props}
    />
  ))(({ theme }) => ({
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.1)',
      },
      '100%': {
        transform: 'scale(1)',
      },
    },
    '&:hover': {
      animation: 'pulse 1s infinite',
    },
  }));
};

// Export animated versions of all icons
export const AnimatedEmailIcon = createAnimatedIcon(EmailIcon);
export const AnimatedPhoneIcon = createAnimatedIcon(PhoneIcon);
export const AnimatedVideocamIcon = createAnimatedIcon(VideocamIcon);
export const AnimatedCampaignIcon = createAnimatedIcon(CampaignIcon);
export const AnimatedSmartToyIcon = createAnimatedIcon(SmartToyIcon);
export const AnimatedAutoAwesomeIcon = createAnimatedIcon(AutoAwesomeIcon);
export const AnimatedContentCopyIcon = createAnimatedIcon(ContentCopyIcon);
export const AnimatedEditIcon = createAnimatedIcon(EditIcon);
export const AnimatedDeleteIcon = createAnimatedIcon(DeleteIcon);
export const AnimatedShareIcon = createAnimatedIcon(ShareIcon);
export const AnimatedVisibilityIcon = createAnimatedIcon(VisibilityIcon);
export const AnimatedFilterListIcon = createAnimatedIcon(FilterListIcon);
export const AnimatedSearchIcon = createAnimatedIcon(SearchIcon);
export const AnimatedMoreVertIcon = createAnimatedIcon(MoreVertIcon);
export const AnimatedGroupIcon = createAnimatedIcon(GroupIcon);
export const AnimatedTrendingUpIcon = createAnimatedIcon(TrendingUpIcon);
export const AnimatedAddIcon = createAnimatedIcon(AddIcon);

// Re-export the original icons for compatibility
export {
  EmailIcon,
  PhoneIcon,
  VideocamIcon,
  CampaignIcon,
  SmartToyIcon,
  AutoAwesomeIcon,
  ContentCopyIcon,
  EditIcon,
  DeleteIcon,
  ShareIcon,
  VisibilityIcon,
  FilterListIcon,
  SearchIcon,
  MoreVertIcon,
  GroupIcon,
  TrendingUpIcon,
  AddIcon
};
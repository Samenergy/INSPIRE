// This file exports icon components that will use the animated version if available,
// or fall back to the non-animated version if not

import React from 'react';
import IconLoader from './IconLoader';
import * as FallbackIcons from './FallbackIcons';

// Create a type for all available icon names
type IconName = keyof typeof FallbackIcons;

// Create a higher-order component that creates icon components
const createIcon = (iconName: IconName) => {
  return (props: Omit<React.ComponentProps<typeof IconLoader>, 'iconName'>) => (
    <IconLoader iconName={iconName} {...props} />
  );
};

// Export all icons as React components
export const HomeIcon = createIcon('HomeIcon');
export const UsersIcon = createIcon('UsersIcon');
export const FileTextIcon = createIcon('FileTextIcon');
export const SettingsIcon = createIcon('SettingsIcon');
export const BellIcon = createIcon('BellIcon');
export const SunIcon = createIcon('SunIcon');
export const MoonIcon = createIcon('MoonIcon');
export const CampaignIcon = createIcon('CampaignIcon');
export const EmailIcon = createIcon('EmailIcon');
export const PhoneIcon = createIcon('PhoneIcon');
export const VideocamIcon = createIcon('VideocamIcon');
export const SmartToyIcon = createIcon('SmartToyIcon');
export const AutoAwesomeIcon = createIcon('AutoAwesomeIcon');
export const EditIcon = createIcon('EditIcon');
export const DeleteIcon = createIcon('DeleteIcon');
export const ShareIcon = createIcon('ShareIcon');
export const VisibilityIcon = createIcon('VisibilityIcon');
export const FilterListIcon = createIcon('FilterListIcon');
export const SearchIcon = createIcon('SearchIcon');
export const MoreVertIcon = createIcon('MoreVertIcon');
export const GroupIcon = createIcon('GroupIcon');
export const TrendingUpIcon = createIcon('TrendingUpIcon');
export const AddIcon = createIcon('AddIcon');
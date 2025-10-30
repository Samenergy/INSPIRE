import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Video,
  Megaphone,
  Bot,
  Sparkles,
  Copy,
  Edit,
  Trash,
  Share,
  Eye,
  Filter,
  Search,
  MoreVertical,
  Users,
  TrendingUp,
  Plus,
  X
} from 'lucide-react';

// Define props interface for our animated icons
interface AnimatedIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  onClick?: () => void;
}

// Animation variants for different effects
const animations = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: { 
      duration: 0.5,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 1
    }
  },
  hover: {
    scale: 1.1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  },
  tap: {
    scale: 0.9,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  },
  rotate: {
    rotate: [0, 10, 0, -10, 0],
    transition: { 
      duration: 0.5,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1],
      repeat: Infinity,
      repeatDelay: 1
    }
  }
};

// Create a wrapper component for Lucide icons with Framer Motion
const createAnimatedIcon = (Icon: React.ElementType, defaultAnimation: keyof typeof animations = 'hover') => {
  return ({ size = 24, color = 'currentColor', strokeWidth = 2, className = '', onClick }: AnimatedIconProps) => {
    return (
      <motion.div
        className={className}
        style={{ display: 'inline-flex', lineHeight: 0 }}
        whileHover={animations.hover}
        whileTap={animations.tap}
        onClick={onClick}
      >
        <Icon 
          size={size} 
          color={color} 
          strokeWidth={strokeWidth} 
        />
      </motion.div>
    );
  };
};

// Create special animated icons with custom animations
const createSpecialAnimatedIcon = (Icon: React.ElementType, animationKey: keyof typeof animations) => {
  return ({ size = 24, color = 'currentColor', strokeWidth = 2, className = '', onClick }: AnimatedIconProps) => {
    return (
      <motion.div
        className={className}
        style={{ display: 'inline-flex', lineHeight: 0 }}
        animate={animations[animationKey]}
        whileHover={animations.hover}
        whileTap={animations.tap}
        onClick={onClick}
      >
        <Icon 
          size={size} 
          color={color} 
          strokeWidth={strokeWidth} 
        />
      </motion.div>
    );
  };
};

// Export animated versions of all icons
export const EmailIcon = createAnimatedIcon(Mail);
export const PhoneIcon = createAnimatedIcon(Phone);
export const VideocamIcon = createAnimatedIcon(Video);
export const CampaignIcon = createAnimatedIcon(Megaphone);
export const SmartToyIcon = createSpecialAnimatedIcon(Bot, 'pulse');
export const AutoAwesomeIcon = createSpecialAnimatedIcon(Sparkles, 'rotate');
export const ContentCopyIcon = createAnimatedIcon(Copy);
export const EditIcon = createAnimatedIcon(Edit);
export const DeleteIcon = createAnimatedIcon(Trash);
export const ShareIcon = createAnimatedIcon(Share);
export const VisibilityIcon = createAnimatedIcon(Eye);
export const FilterListIcon = createAnimatedIcon(Filter);
export const SearchIcon = createAnimatedIcon(Search);
export const MoreVertIcon = createAnimatedIcon(MoreVertical);
export const GroupIcon = createAnimatedIcon(Users);
export const TrendingUpIcon = createAnimatedIcon(TrendingUp);
export const AddIcon = createAnimatedIcon(Plus);
export const CloseIcon = createAnimatedIcon(X);

// Export all icons for direct use
export {
  Mail as EmailIconStatic,
  Phone as PhoneIconStatic,
  Video as VideocamIconStatic,
  Megaphone as CampaignIconStatic,
  Bot as SmartToyIconStatic,
  Sparkles as AutoAwesomeIconStatic,
  Copy as ContentCopyIconStatic,
  Edit as EditIconStatic,
  Trash as DeleteIconStatic,
  Share as ShareIconStatic,
  Eye as VisibilityIconStatic,
  Filter as FilterListIconStatic,
  Search as SearchIconStatic,
  MoreVertical as MoreVertIconStatic,
  Users as GroupIconStatic,
  TrendingUp as TrendingUpIconStatic,
  Plus as AddIconStatic,
  X as CloseIconStatic
};
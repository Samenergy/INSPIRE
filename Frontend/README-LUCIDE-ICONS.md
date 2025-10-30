# Lucide Icons with Framer Motion Animations

This project uses Lucide icons with Framer Motion animations to create a modern, engaging UI.

## Installation

To use the animated Lucide icons, you need to install both packages:

```bash
# Using npm
npm install framer-motion lucide-react

# Or using yarn
yarn add framer-motion lucide-react
```

## Features

### Animated Icons
- **Pulse Animation**: Subtle scaling effect that draws attention
- **Bounce Animation**: Vertical movement that indicates interactivity
- **Spin Animation**: Rotation effect perfect for loading states or settings icons
- **Hover Animations**: Icons respond to user interaction with smooth scaling

### Icon Customization
- **Size Control**: Easily adjust icon sizes
- **Color Control**: Set custom colors or use theme colors
- **Stroke Width**: Adjust the thickness of icon strokes
- **Animation Variants**: Choose from different animation types

## Usage

### Basic Usage

```jsx
import { HomeIcon } from '../icons/LucideIcons';

// Simple static icon
<HomeIcon size={24} color="#000000" />

// Animated icon
<HomeIcon size={24} color="#000000" animate={true} animationVariant="pulse" />
```

### Animation Variants

```jsx
// Pulse animation (subtle scaling)
<HomeIcon animate={true} animationVariant="pulse" />

// Bounce animation (vertical movement)
<BellIcon animate={true} animationVariant="bounce" />

// Spin animation (rotation)
<SettingsIcon animate={true} animationVariant="spin" />
```

### Conditional Animation

```jsx
// Only animate when a condition is met
<HomeIcon animate={isActive} animationVariant="pulse" />
```

### Styling

```jsx
// Custom size
<HomeIcon size={32} />

// Custom color
<HomeIcon color="#3498db" />

// Custom stroke width
<HomeIcon strokeWidth={1.5} />

// With additional styles
<HomeIcon style={{ margin: '10px' }} />

// With className
<HomeIcon className="my-icon-class" />
```

## Available Icons

The following Lucide icons are available with animations:

- `HomeIcon` - For dashboard/home navigation
- `UsersIcon` - For user/account management
- `FileTextIcon` - For documents/content
- `SettingsIcon` - For settings/configuration
- `BellIcon` - For notifications
- `SunIcon` - For light theme toggle
- `MoonIcon` - For dark theme toggle
- `EmailIcon` - For email functionality
- `PhoneIcon` - For call functionality
- `VideocamIcon` - For video/meeting functionality
- `CampaignIcon` - For marketing/announcements
- `SmartToyIcon` - For AI/automation features
- `AutoAwesomeIcon` - For highlighting special features
- `ContentCopyIcon` - For copy functionality
- `EditIcon` - For editing functionality
- `DeleteIcon` - For delete functionality
- `ShareIcon` - For sharing functionality
- `VisibilityIcon` - For view/preview functionality
- `FilterListIcon` - For filtering functionality
- `SearchIcon` - For search functionality
- `MoreVertIcon` - For additional options menu
- `GroupIcon` - For team/group functionality
- `TrendingUpIcon` - For analytics/metrics
- `AddIcon` - For adding new items

## Customizing Animations

You can customize the animations by modifying the `createAnimatedIcon` function in `LucideIcons.tsx`. The current animations are:

### Pulse Animation
```jsx
{
  animate: {
    scale: [1, 1.1, 1],
    transition: { 
      duration: 2,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 0.5
    }
  }
}
```

### Bounce Animation
```jsx
{
  animate: {
    y: [0, -5, 0],
    transition: { 
      duration: 1,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 0.5
    }
  }
}
```

### Spin Animation
```jsx
{
  animate: {
    rotate: 360,
    transition: { 
      duration: 2,
      ease: "linear",
      repeat: Infinity
    }
  }
}
```

## Adding New Icons

To add a new Lucide icon:

1. Find the icon you want in the [Lucide Icons library](https://lucide.dev/icons/)
2. Add it to `LucideIcons.tsx` following the pattern of existing icons
3. Export it from the file
4. Import and use it in your components

Example:
```jsx
// Adding a new icon
export const NewIcon: React.FC<IconProps> = createAnimatedIcon(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, className = '', style, ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-new-icon ${className}`}
      style={style}
      {...rest}
    >
      {/* SVG path data from Lucide */}
    </svg>
  )
);
```
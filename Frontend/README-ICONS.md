# Lucide Icons with Automatic Fallback

This project uses Lucide icons with Framer Motion animations when available, and automatically falls back to non-animated icons when the required packages aren't installed.

## Installation

To use the animated icons, install the required packages:

```bash
# Using the installation script (recommended)
chmod +x install-packages.sh
./install-packages.sh

# Or manually with npm
npm install framer-motion lucide-react

# Or manually with yarn
yarn add framer-motion lucide-react
```

## Features

### Smart Fallback System

The icons system will:
1. Try to load the animated icons using Framer Motion
2. If successful, use the animated icons with all effects
3. If the packages aren't available, automatically fall back to the non-animated versions
4. All of this happens without any code changes or manual intervention

### Animated Icons (when packages are installed)

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
import { HomeIcon } from '../components/icons';

// Simple static icon
<HomeIcon size={24} color="#000000" />

// Animated icon (will only animate if framer-motion is installed)
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

The following Lucide icons are available:

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

## How It Works

The icon system uses a direct import approach:

1. All icons are imported directly from the FallbackIcons module
2. This ensures consistent rendering across all environments
3. No dynamic imports or runtime checks are needed
4. The application works reliably in all environments

To enable animations:

1. Install the required packages using the installation script
2. Update the imports in your components to use the animated icons:
   ```jsx
   // Change this:
   import { HomeIcon } from '../icons/FallbackIcons';

   // To this (after installing framer-motion):
   import { HomeIcon } from '../icons/LucideIcons';
   ```

## Enabling Animated Documents

The Documents component also has a static version (StaticDocuments) and an animated version (AnimatedDocuments). By default, it uses the static version to ensure compatibility.

To enable the animated version:

1. Install framer-motion:
   ```bash
   npm install framer-motion
   ```

2. Update the Documents component in `src/components/documents/index.tsx`:
   ```jsx
   import React from 'react';
   // Import the animated version instead of the static version
   import AnimatedDocuments from './AnimatedDocuments';

   // Use the animated version
   const Documents = AnimatedDocuments;

   export default Documents;
   ```

This approach ensures that:
- The application works reliably in all environments
- No errors are thrown if packages are missing
- You have full control over which icons use animations

## Troubleshooting

If you encounter any issues with the icons:

1. Check if the required packages are installed:
   ```bash
   npm list framer-motion lucide-react
   ```

2. If you want to use the animated icons but the packages aren't installed, run the installation script:
   ```bash
   ./install-packages.sh
   ```

3. Restart your development server after installing the packages:
   ```bash
   npm run dev
   ```

4. If you still have issues, the application will continue to work with the fallback icons, so your UI will remain functional and visually consistent.
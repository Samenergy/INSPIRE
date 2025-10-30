# Animated UI Components

This project uses Framer Motion and Lucide React for smooth animations and modern icons.

## Installation

To install the required packages, run:

```bash
# Using npm
npm install framer-motion lucide-react

# Or using yarn
yarn add framer-motion lucide-react
```

## Features

### Lucide Icons
- Modern, consistent design language
- Lightweight and optimized for web use
- Consistent style and stroke width

### Framer Motion Animations
- Staggered entrance animations
- Spring physics for natural-feeling animations
- Hover and tap animations
- Page transitions
- List item animations

## Fallback Support

If the required packages are not installed, the application will automatically fall back to using Material UI icons without animations.

## Implementation Details

### Animation Variants

The animations use Framer Motion's variants system for coordinated animations:

```jsx
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
```

### Animated Icons

The icons use custom animations for different effects:

```jsx
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
  }
};
```

## Troubleshooting

If you encounter issues with the animations:

1. Make sure you have installed the required packages
2. Check for any console errors related to framer-motion or lucide-react
3. The application will automatically fall back to a non-animated version if needed

## Performance Considerations

- Animations use transform properties for better performance
- Animation logic is separated from component logic
- Framer Motion optimizes DOM manipulation
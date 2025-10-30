import React, { useState, useEffect } from 'react';
import * as FallbackIcons from './FallbackIcons';

// Define the props for the IconLoader component
interface IconLoaderProps {
  iconName: keyof typeof FallbackIcons;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
  animationVariant?: 'pulse' | 'bounce' | 'spin';
}

// This component will try to load the animated icon, but fall back to the non-animated version
const IconLoader: React.FC<IconLoaderProps> = ({
  iconName,
  ...props
}) => {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useAnimated, setUseAnimated] = useState(false);

  useEffect(() => {
    // Try to dynamically import the animated icons
    const loadAnimatedIcons = async () => {
      try {
        // First check if framer-motion is available
        await import('framer-motion');
        
        // If that succeeds, try to import the animated icons
        const animatedModule = await import('./LucideIcons');
        if (animatedModule && animatedModule[iconName]) {
          setIconComponent(() => animatedModule[iconName]);
          setUseAnimated(true);
        } else {
          // If the icon doesn't exist in the animated module, use fallback
          setIconComponent(() => FallbackIcons[iconName]);
        }
      } catch (error) {
        // If either import fails, use the fallback icon
        setIconComponent(() => FallbackIcons[iconName]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimatedIcons();
  }, [iconName]);

  // While loading, show a placeholder or the fallback icon
  if (isLoading) {
    const FallbackIcon = FallbackIcons[iconName];
    return <FallbackIcon {...props} />;
  }

  // Once loaded, render the appropriate icon
  if (IconComponent) {
    return <IconComponent {...props} animate={useAnimated && props.animate} />;
  }

  // If something went wrong, render the fallback icon
  const FallbackIcon = FallbackIcons[iconName];
  return <FallbackIcon {...props} />;
};

export default IconLoader;
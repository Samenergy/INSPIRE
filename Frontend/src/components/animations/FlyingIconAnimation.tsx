import React, { useEffect, useState } from 'react';
import { Box, styled } from '@mui/material';
import { EmailIcon, PhoneIcon, VideocamIcon } from '../icons/FallbackIcons';

interface FlyingIconAnimationProps {
  isActive: boolean;
  iconType: 'email' | 'call' | 'meeting';
  startElement: HTMLElement | null;
  endElement: HTMLElement | null;
  onAnimationComplete: () => void;
}

const AnimatedIconContainer = styled(Box)<{ 
  startX: number; 
  startY: number; 
  endX: number; 
  endY: number; 
  isAnimating: boolean;
}>(({ startX, startY, endX, endY, isAnimating }) => ({
  position: 'fixed',
  top: startY,
  left: startX,
  zIndex: 9999,
  pointerEvents: 'none',
  transform: isAnimating ? `translate(${endX - startX}px, ${endY - startY}px) scale(0.8)` : 'translate(0, 0) scale(1)',
  transition: isAnimating ? 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
  opacity: isAnimating ? 0.8 : 1,
  '& svg': {
    fontSize: '2rem',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
  }
}));

const PulseEffect = styled(Box)<{ isAnimating: boolean }>(({ isAnimating }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(25, 118, 210, 0.3) 0%, rgba(25, 118, 210, 0.1) 50%, transparent 70%)',
  animation: isAnimating ? 'pulse 1.2s ease-out' : 'none',
  '@keyframes pulse': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(0.5)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'translate(-50%, -50%) scale(1.2)',
      opacity: 0.4,
    },
    '100%': {
      transform: 'translate(-50%, -50%) scale(2)',
      opacity: 0,
    }
  }
}));

const FlyingIconAnimation: React.FC<FlyingIconAnimationProps> = ({
  isActive,
  iconType,
  startElement,
  endElement,
  onAnimationComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [coordinates, setCoordinates] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  });

  useEffect(() => {
    if (isActive && startElement && endElement) {
      const startRect = startElement.getBoundingClientRect();
      const endRect = endElement.getBoundingClientRect();

      setCoordinates({
        startX: startRect.left + startRect.width / 2 - 16, // Center the icon
        startY: startRect.top + startRect.height / 2 - 16,
        endX: endRect.left + endRect.width / 2 - 16,
        endY: endRect.top + endRect.height / 2 - 16
      });

      // Start animation after a brief delay
      setTimeout(() => {
        setIsAnimating(true);
      }, 100);

      // Complete animation
      setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete();
      }, 1300);
    }
  }, [isActive, startElement, endElement, onAnimationComplete]);

  const getIcon = () => {
    const iconProps = {
      size: 32,
      color: iconType === 'email' ? '#4caf50' : iconType === 'call' ? '#ff9800' : '#9c27b0'
    };

    switch (iconType) {
      case 'email':
        return <EmailIcon {...iconProps} />;
      case 'call':
        return <PhoneIcon {...iconProps} />;
      case 'meeting':
        return <VideocamIcon {...iconProps} />;
      default:
        return <EmailIcon {...iconProps} />;
    }
  };

  if (!isActive) return null;

  return (
    <AnimatedIconContainer
      startX={coordinates.startX}
      startY={coordinates.startY}
      endX={coordinates.endX}
      endY={coordinates.endY}
      isAnimating={isAnimating}
    >
      <PulseEffect isAnimating={isAnimating} />
      {getIcon()}
    </AnimatedIconContainer>
  );
};

export default FlyingIconAnimation;











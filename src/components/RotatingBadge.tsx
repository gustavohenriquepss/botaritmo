import React from 'react';
import badgeImage from '@/assets/badge.png';
interface RotatingBadgeProps {
  text: string;
  onClick?: () => void;
  showIcon?: boolean;
  icon?: React.ReactNode;
  className?: string;
}
export const RotatingBadge: React.FC<RotatingBadgeProps> = ({
  text,
  onClick,
  showIcon = false,
  icon,
  className = "fixed top-4 right-4 md:top-8 md:right-8"
}) => {
  // Calculate how many times to repeat the text based on its length
  const getTextRepetitions = (text: string) => {
    const baseRepetitions = 5;
    const textLength = text.length;
    if (textLength <= 4) return 8; // Short text like "LIVE"
    if (textLength <= 6) return 6; // Medium text like "BROWSE"
    return baseRepetitions; // Longer text
  };
  const repetitions = getTextRepetitions(text);
  const offsetIncrement = 100 / repetitions;
  return <div className={`${className} w-[60px] h-[60px] md:w-[72px] md:h-[72px] lg:w-[154px] lg:h-[154px] ${onClick ? 'cursor-pointer' : ''} z-40 animate-fade-in`} style={{
    animationDelay: '0.2s',
    animationFillMode: 'both'
  }} onClick={onClick}>
      {/* Rotating badge background */}
      
      
      {/* Static icon in center */}
      {showIcon && icon && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {icon}
        </div>}
    </div>;
};
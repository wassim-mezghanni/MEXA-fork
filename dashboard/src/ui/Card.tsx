import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({
  children,
  className = '',
  elevation = 'low',
  padding = 'medium'
}: CardProps) {
  const baseShadows: Record<string, string> = {
    low: "shadow-ambient",
    medium: "shadow-[0_15px_45px_-8px_rgba(25,28,29,0.08)]",
    high: "shadow-[0_20px_60px_-10px_rgba(25,28,29,0.1)]"
  };

  const paddings: Record<string, string> = {
    none: "p-0",
    small: "p-4",
    medium: "p-6",
    large: "p-10"
  };

  return (
    <div className={`
      bg-surface-container-lowest 
      rounded-lg 
      transition-all 
      duration-500 
      ${baseShadows[elevation]} 
      ${paddings[padding]} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;

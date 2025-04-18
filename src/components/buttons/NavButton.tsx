import React, { forwardRef } from 'react';

interface NavButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  isCollapsed?: boolean;
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(({
  icon,
  children,
  onClick,
  className = '',
  isCollapsed = false
}, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`w-full flex items-center px-2 py-2 text-gray-600 rounded-md
        hover:bg-gray-100 hover:text-gray-900 hover:scale-105 hover:shadow-md 
        active:scale-95 transition-all duration-200 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
});

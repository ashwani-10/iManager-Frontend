import React from 'react';

interface NavButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  isCollapsed?: boolean;
}

export const NavButton: React.FC<NavButtonProps> = ({
  icon,
  children,
  onClick,
  className = '',
  isCollapsed = false
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-2 py-2 text-gray-600 rounded-md
        hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200`}
    >
      {icon}
      {children}
    </button>
  );
};

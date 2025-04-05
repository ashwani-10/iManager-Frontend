import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import { Layout, Plus, Users, LogOut, User } from 'lucide-react';
import { InviteModal } from './modals/InviteModal';
import { CreateRoleModal } from './modals/CreateRoleModal';
import { NavButton } from './buttons/NavButton';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 256px = 16rem (w-64)
  const [isResizing, setIsResizing] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isCollapsed = sidebarWidth <= 64;

  const handleLogout = () => {
    ['token', 'user', 'projects'].forEach(item => localStorage.removeItem(item));
    navigate('/');
  };

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 50 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  React.useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div 
      className={`bg-white text-gray-800 h-screen flex flex-col relative ${
        isResizing ? 'select-none' : 'transition-[width] duration-300 ease-in-out'
      }`}
      style={{ width: sidebarWidth }}
    >
      {/* Logo Section */}
      <div className="h-14 flex items-center px-4">
        <Layout className="w-7 h-7 text-[#0052CC] flex-shrink-0" />
        <span className={`ml-3 text-[#172B4D] font-medium text-lg tracking-tight overflow-hidden ${
          isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
        } transition-all duration-300`}>
          iManager
        </span>
      </div>

      {/* User Section */}
      <div className="h-14 border-b border-gray-200 flex items-center px-3 overflow-hidden">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <div className={`ml-3 transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'w-0' : 'w-[calc(100%-2.5rem)]'
        }`}>
          <p className="font-medium text-gray-800 truncate">{user?.name || 'User'}</p>
          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 py-4">
        {isAdmin && (
          <div className="space-y-1 px-2">
            <NavButton
              icon={<Users className="w-5 h-5" />}
              onClick={() => setShowInviteModal(true)}
              isCollapsed={isCollapsed}
            >
              <span className={`ml-3 transition-all duration-100 truncate${
                isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
              }`}>
                Invite Members
              </span>
            </NavButton>

            <NavButton
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setShowNewProjectModal(true)}
              isCollapsed={isCollapsed}
            >
              <span className={`ml-3 transition-all duration-100 truncate ${
                isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
              }`}>
                Create Role
              </span>
            </NavButton>
          </div>
        )}
      </nav>

      {/* Logout Section */}
      <div className="h-14 border-t border-gray-200 flex items-center px-2">
        <NavButton
          icon={<LogOut className="w-5 h-5" />}
          onClick={handleLogout}
          isCollapsed={isCollapsed}
        >
          <span className={`ml-3 transition-all duration-300 ${
            isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
          }`}>
            Logout
          </span>
        </NavButton>
      </div>

      {isAdmin && (
        <>
          <InviteModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
          />
          <CreateRoleModal
            isOpen={showNewProjectModal}
            onClose={() => setShowNewProjectModal(false)}
          />
        </>
      )}

      <div
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-gray-200 
          ${isResizing ? 'bg-blue-500' : ''} transition-colors`}
        onMouseDown={startResizing}
      />
    </div>
  );
}
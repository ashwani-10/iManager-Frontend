import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import { Layout, Plus, Users, LogOut, User } from 'lucide-react';
import { InviteModal } from './modals/InviteModal';
import { CreateRoleModal } from './modals/CreateRoleModal';
import { NavButton } from './buttons/NavButton';
import axios from 'axios'; // Add this import

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const hasCalledApi = useRef(false); // Move useRef to the top level
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 256px = 16rem (w-64)
  const [isResizing, setIsResizing] = useState(false);
  const createRoleButtonRef = useRef<HTMLButtonElement | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

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

  const handleOpenCreateRoleModal = () => {
    if (createRoleButtonRef.current) {
      const buttonRect = createRoleButtonRef.current.getBoundingClientRect();
      setModalPosition({
        top: buttonRect.top + window.scrollY,
        left: buttonRect.right + 10, // Position to the right of the button
      });
    }
    setShowNewProjectModal(true);
  };

  const GithubConnect = () => {
    const clientId = 'Ov23liUmjGMOVyaqSahe'; // GitHub se liya hua
    const redirectUri = 'http://localhost:5173/dashboard'; // Tera redirect URL
  
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo user`;

    const handleGithubConnect = () => { 
      window.location.href = githubAuthUrl;
    };

    return { handleGithubConnect };
  };

  useEffect(() => {
    const sendAuthCodeToBackend = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      const loggedId = user?.id; // Assuming user ID is available in the user context
  
      if (authCode && loggedId && !hasCalledApi.current) {
        hasCalledApi.current = true; // Mark API as called
        console.log('GitHub OAuth Code:', authCode);
  
        try {
          const response = await axios.post('http://localhost:8082/api/github/exchange', null, {
            params: { authCode, loggedId },
          });
          console.log('Token exchange response:', response.data);
          // Handle the response from the backend
        } catch (error) {
          console.error('Error during token exchange:', error);
        }
      }
    };
  
    sendAuthCodeToBackend(); // Call the function immediately
  }, [user?.id]);

  return (
    <div 
      className={`bg-white text-gray-800 h-screen flex flex-col relative shadow-lg ${
        isResizing ? 'select-none' : 'transition-[width] duration-300 ease-in-out'
      }`}
      style={{ width: sidebarWidth }}
    >
      {/* Logo Section */}
      <div className="h-14 flex items-center px-4 hover:bg-gray-100 transition-colors">
        <Layout className="w-7 h-7 text-[#0052CC] flex-shrink-0 hover:text-blue-600 transition-colors" />
        <span className={`ml-3 text-[#172B4D] font-bold text-xl tracking-tight overflow-hidden ${
          isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
        } transition-all duration-300`}>
          iManager
        </span>
      </div>

      {/* User Section */}
      <div className="h-14 border-b border-gray-200 flex items-center px-3 overflow-hidden hover:bg-gray-100 transition-colors">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center hover:shadow-md transition-shadow">
          <User className="w-5 h-5 hover:text-blue-600 transition-colors" />
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
              icon={<Users className="w-5 h-5 hover:text-blue-600 transition-colors" />}
              onClick={() => setShowInviteModal(true)}
              isCollapsed={isCollapsed}
            >
              <span className={`ml-3 transition-all duration-100 truncate ${
                isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
              }`}>
                Invite Members
              </span>
            </NavButton>

            <NavButton
              icon={<Plus className="w-5 h-5 hover:text-blue-600 transition-colors" />}
              onClick={handleOpenCreateRoleModal}
              isCollapsed={isCollapsed}
              ref={createRoleButtonRef}
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

      {/* GitHub Connect Section */}
      <div className="h-14 border-t border-gray-200 flex items-center px-2 hover:bg-gray-100 transition-colors">
        <NavButton
          onClick={GithubConnect().handleGithubConnect} // Call the function here
          isCollapsed={isCollapsed}
        >
          <span className={`ml-3 transition-all duration-300 ${
            isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
          }`}>
            GitHub Connect
          </span>
        </NavButton>
      </div>

      {/* Logout Section */}
      <div className="h-14 border-t border-gray-200 flex items-center px-2 hover:bg-gray-100 transition-colors">
        <NavButton
          icon={<LogOut className="w-5 h-5 hover:text-blue-600 transition-colors" />}
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
          {showNewProjectModal && (
            <div
              className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg"
              style={{
                position: 'absolute',
                top: modalPosition.top,
                left: modalPosition.left,
              }}
            >
              <CreateRoleModal
                isOpen={showNewProjectModal}
                onClose={() => setShowNewProjectModal(false)}
              />
            </div>
          )}
        </>
      )}

      <div
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-gray-300 
          ${isResizing ? 'bg-blue-500' : ''} transition-colors`}
        onMouseDown={startResizing}
      />
    </div>
  );
}
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import { Layout, Plus, Users, LogOut, User, Github, ImagePlus } from 'lucide-react';
import { InviteModal } from './modals/InviteModal';
import { CreateRoleModal } from './modals/CreateRoleModal';
import { LogoUploadModal } from './modals/LogoUploadModal';
import { NavButton } from './buttons/NavButton';
import axios from 'axios';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const hasCalledApi = useRef(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const createRoleButtonRef = useRef<HTMLButtonElement | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('companyLogo');
  });
  const logoFetched = useRef(false);

  const isAdmin = user?.role === 'ADMIN';
  const isCollapsed = sidebarWidth <= 64;

  useEffect(() => {
    const fetchCompanyLogo = async () => {
      // If we already have the logo in state, don't fetch
      if (companyLogo || !user?.id) return;
      
      try {
        const loggedId = user?.role === 'ADMIN' ? user?.id : user?.orgId;
        const response = await axios.get(`http://43.204.115.57:8082/db/api/org/get/logo/${loggedId}`, {
        });
        if (response.data) {
          setCompanyLogo(response.data);
          // Store in localStorage
          localStorage.setItem('companyLogo', response.data);
          
        }
      } catch (error) {
        console.error('Error fetching company logo:', error);
      }
    };

    fetchCompanyLogo();
  }, [user?.id, user?.role, companyLogo]);

  const handleLogout = () => {
    ['token', 'user', 'projects', 'companyLogo'].forEach(item => localStorage.removeItem(item));
    navigate('/');
  };

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(64, Math.min(mouseMoveEvent.clientX, 400));
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
    
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const handleOpenCreateRoleModal = () => {
    if (createRoleButtonRef.current) {
      const buttonRect = createRoleButtonRef.current.getBoundingClientRect();
      setModalPosition({
        top: buttonRect.top + window.scrollY,
        left: buttonRect.right + 10,
      });
    }
    setShowNewProjectModal(true);
  };

  const handleLogoUploaded = (logoUrl: string) => {
    setCompanyLogo(logoUrl);
    // Update localStorage when new logo is uploaded
    localStorage.setItem('companyLogo', logoUrl);
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
          const response = await axios.post('http://43.204.115.57:8082/api/github/exchange', null, {
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
      className={`bg-white text-gray-800 h-[calc(100vh-3rem)] flex flex-col relative shadow-2xl rounded-3xl my-6 ml-4 ${
        isResizing ? 'select-none cursor-ew-resize' : 'transition-[width] duration-300 ease-in-out'
      }`}
      style={{ width: sidebarWidth, zIndex: 41 }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none rounded-3xl" />
      <div className="absolute top-0 right-0 w-full h-1/3 bg-gradient-to-bl from-gray-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-tr from-gray-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Logo Section */}
      <div className="h-20 flex items-center px-2 relative z-1 hover:bg-white/30 transition-colors rounded-t-3xl overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative group flex-shrink-0">
            {companyLogo ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-contain p-1"
                />
                {isAdmin && (
                  <button
                    onClick={() => setShowLogoUploadModal(true)}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Upload Logo"
                  >
                    <ImagePlus className="w-3 h-3 text-blue-600" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layout className="w-6 h-6 text-white" />
                {isAdmin && (
                  <button
                    onClick={() => setShowLogoUploadModal(true)}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Upload Logo"
                  >
                    <ImagePlus className="w-3 h-3 text-blue-600" />
                  </button>
                )}
              </div>
            )}
          </div>
          <span className={`font-bold tracking-tight overflow-hidden text-ellipsis whitespace-nowrap ${
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          } transition-all duration-300`}>
            {isAdmin ? (
              <span className="text-gray-800 text-2xl font-bold">
                {user?.name || 'Admin'}
              </span>
            ) : (
              <>
                <span className="text-blue-600 text-2xl font-bold"></span>
                <span className="text-gray-800 text-2xl font-bold">
                  {user?.orgName || 'Manager'}
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* User Section with glassmorphism */}
      <div className="h-14 border-b border-gray-200/50 flex items-center px-4 overflow-hidden hover:bg-white/30 backdrop-blur-sm transition-colors relative z-1">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
        <div
          className={`ml-3 transition-all duration-300 overflow-hidden min-w-0 ${
            isCollapsed ? 'w-0' : 'w-[calc(100%-2.5rem)]'
          }`}
        >
          <p
            className="font-medium truncate text-ellipsis whitespace-nowrap"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#333',
            }}
          >
            {user?.name || 'User'} {user?.role ? `(${user.role})` : ''}
          </p>
          <p
            className="text-sm truncate"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '0.75rem',
              color: '#666',
            }}
          >
            {user?.email}
          </p>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 py-4 relative z-1 overflow-hidden">
        {isAdmin && (
          <div className="space-y-1 px-2 overflow-hidden">
            <NavButton
              icon={<Users className="w-5 h-5 text-blue-600 flex-shrink-0" />}
              onClick={() => setShowInviteModal(true)}
              isCollapsed={isCollapsed}
              className="hover:bg-white/30 backdrop-blur-sm transition-all duration-200 overflow-hidden"
            >
              <span
                className={`ml-3 transition-all duration-100 truncate text-ellipsis whitespace-nowrap ${
                  isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
                }`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: '#333',
                }}
              >
                Invite Members
              </span>
            </NavButton>

            <NavButton
              icon={<Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />}
              onClick={handleOpenCreateRoleModal}
              isCollapsed={isCollapsed}
              ref={createRoleButtonRef}
              className="hover:bg-white/30 backdrop-blur-sm transition-all duration-200 overflow-hidden"
            >
              <span
                className={`ml-3 transition-all duration-100 truncate text-ellipsis whitespace-nowrap ${
                  isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
                }`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: '#333',
                }}
              >
                Create Role
              </span>
            </NavButton>

            <NavButton
              icon={<Github className="w-5 h-5 text-blue-600 flex-shrink-0" />}
              onClick={GithubConnect().handleGithubConnect}
              isCollapsed={isCollapsed}
              className="hover:bg-white/30 backdrop-blur-sm transition-all duration-200 overflow-hidden"
            >
              <span
                className={`ml-3 transition-all duration-300 truncate text-ellipsis whitespace-nowrap ${
                  isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
                }`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: '#333',
                }}
              >
                GitHub Connect
              </span>
            </NavButton>
          </div>
        )}
      </nav>

      {/* Logout Section */}
      <div className="h-14 border-t border-gray-200/50 flex items-center px-4 hover:bg-white/30 backdrop-blur-sm transition-colors relative z-1 rounded-b-3xl overflow-hidden">
        <NavButton
          icon={<LogOut className="w-5 h-5 text-red-500 flex-shrink-0" />}
          onClick={handleLogout}
          isCollapsed={isCollapsed}
          className="hover:bg-white/30 backdrop-blur-sm transition-all duration-200 overflow-hidden"
        >
          <span
            className={`ml-3 transition-all duration-300 truncate text-ellipsis whitespace-nowrap ${
              isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
            }`}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#333',
            }}
          >
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
              className="absolute z-45 bg-white border border-gray-300 rounded-md shadow-lg"
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
          <LogoUploadModal
            isOpen={showLogoUploadModal}
            onClose={() => setShowLogoUploadModal(false)}
            onLogoUploaded={handleLogoUploaded}
          />
        </>
      )}

      <div
        className={`absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/10 transition-colors`}
        onMouseDown={startResizing}
        style={{ zIndex: 31 }}
      >
      </div>
    </div>
  );
}
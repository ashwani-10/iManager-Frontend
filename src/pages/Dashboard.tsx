import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Plus } from 'lucide-react';
import { useUser } from '../context/userContext';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);
  const [limit] = useState(9);
  const [hasMore] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      const idToUse = user?.role === 'ADMIN' ? user.id : user?.orgId;
      const response = await axios.get(
        `https://imanager2.duckdns.org/api/project/get/${idToUse}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit }
        }
      );

      const projectsData = Array.isArray(response.data) ? response.data : [];
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    setIsCreatingProject(true);
    setError(null);

    try {
      console.log('Starting project creation...');
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      console.log('Token found:', token.substring(0, 10) + '...');

      const orgId = user?.role === 'ADMIN' ? user.id : user?.orgId;
      console.log('User role:', user?.role);
      console.log('User ID:', user?.id);
      console.log('Org ID:', orgId);
      
      if (!orgId) {
        setError('Organization ID is required to create a project');
        toast.error('Unable to create project: Organization ID not found');
        setIsCreatingProject(false);
        return;
      }

      console.log('Making API call to create project...');
      const response = await axios.post(
        'https://imanager2.duckdns.org/api/project/create',
        { 
          name: newProjectName.trim(), 
          orgId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('API response:', response.data);

      const newProject = {
        id: response.data.id,
        name: response.data.name,
        createdAt: response.data.createdAt.toString()
      };

      setProjects(prev => [...prev, newProject]);
      setShowNewProjectModal(false);
      setNewProjectName('');
      toast.success('Project created successfully');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to create project');
      toast.error('Failed to create project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const closeModal = () => {
    setShowNewProjectModal(false);
    setNewProjectName('');
    setError(null);
  };

  const handleProjectClick = (project: Project) => {
    if (!project.id) {
      toast.error('Invalid project data');
      return;
    }
    localStorage.setItem('selectedProject', JSON.stringify(project));
    navigate(`/project/${project.id}`);
  };

  const ProjectsGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.length === 0 && !isLoading ? (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 font-inter">No projects yet</h3>
          <p className="text-base text-gray-600 text-center mb-6 font-inter">
            Click the <span className="font-semibold text-indigo-600">"New Project"</span> button above to get started.
          </p>
        </div>
      ) : (
        <>
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-transform transform hover:scale-105"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3 font-inter leading-tight hover:text-indigo-600 transition duration-300">
                {project.name}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-inter">
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleProjectClick(project)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium font-inter transition duration-300"
                >
                  View →
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  ), [projects, isLoading]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-200 via-purple-100 to-pink-100">
      <Sidebar />
      <main className="flex-1 bg-white p-10 shadow-2xl rounded-3xl mx-8 my-6 animate-fadeOut overflow-y-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-extrabold text-gray-800 mb-4 font-inter tracking-wide">
              Workspace
            </h1>
            <div className="h-1 w-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4"></div>
          </div>
          {user?.role === 'ADMIN' && (
            <div className="relative">
              <button
                onClick={() => setShowNewProjectModal(!showNewProjectModal)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-xl transition-transform transform hover:scale-105 font-inter shadow-lg"
              >
                <span className="flex items-center justify-center w-12 h-12 bg-white text-blue-600 rounded-full shadow-md">
                  <Plus className="w-6 h-6" />
                </span>
                <span className="text-lg font-semibold">New Project</span>
              </button>
              {showNewProjectModal && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg p-6 w-96 shadow-lg z-10 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 font-inter">
                    Create a New Project
                  </h2>
                  <p className="text-sm text-gray-500 mb-6 font-inter">
                    Provide a name for your new project to get started.
                  </p>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Enter project name"
                      className="w-full px-4 py-2 pl-10 border border-gray-400 rounded-md text-gray-800 font-inter focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow hover:shadow-md"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newProjectName.trim()) {
                          handleCreateProject();
                        }
                      }}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Plus className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-inter border border-gray-300 rounded-md hover:shadow-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim() || isCreatingProject}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-inter"
                    >
                      {isCreatingProject ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-4 font-inter">{error}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl shadow-lg border border-gray-200 p-8 animate-pulse font-inter">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          ProjectsGrid
        )}
      </main>
    </div>
  );
}

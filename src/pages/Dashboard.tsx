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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [hasMore, setHasMore] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user, page]);

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
        `http://localhost:8085/api/project/get/${idToUse}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit }
        }
      );

      const projectsData = Array.isArray(response.data) ? response.data : [];
      setHasMore(projectsData.length === limit);

      setProjects(prev => page === 1 ? projectsData : [...prev, ...projectsData]);
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

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:8085/api/project/create',
        { 
          name: newProjectName.trim(), 
          orgId: user?.role === 'ADMIN' ? user.id : user?.orgId 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const newProject = {
        id: response.data.id,
        name: response.data.name,
        createdAt: new Date().toISOString(),
      };

      setProjects(prev => [...prev, newProject]);
      setShowNewProjectModal(false);
      setNewProjectName('');
      toast.success('Project created successfully');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      setError(error.response?.data?.message || 'Failed to create project');
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowNewProjectModal(false);
    setNewProjectName('');
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.length === 0 && !isLoading ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-inter">No projects yet</h3>
          <p className="text-gray-500 text-center mb-4 font-inter">
            Click the "New Project" button above to get started
          </p>
        </div>
      ) : (
        <>
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-inter leading-tight">{project.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-inter">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <span 
                  className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer font-inter"
                  onClick={() => handleProjectClick(project)}
                >
                  View Project →
                </span>
              </div>
            </div>
          ))}
          {hasMore && (
            <div className="col-span-full flex justify-center mt-4">
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  ), [projects, isLoading, hasMore]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1 font-inter">Workspace</h1>
            <div className="h-1 w-24 bg-indigo-600 rounded-full"></div>
          </div>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-inter"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          )}
        </div>

        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse font-inter">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          ProjectsGrid
        )}

        {showNewProjectModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 mb-4 font-inter">Create New Project</h2>
              <input
                type="text"
                placeholder="Project Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-4 font-inter"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newProjectName.trim()) {
                    handleCreateProject();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-inter"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-inter"
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 font-inter">{error}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Plus } from 'lucide-react';
import axios from 'axios';

interface Project {
  projectId: string;
  name: string;
  createdAt: string;
}

interface SubProject {
  id: string;
  name: string;
  members?: string[]; // Make members optional
}

export default function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [showNewSubProjectModal, setShowNewSubProjectModal] = useState(false);
  const [newSubProjectName, setNewSubProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // Show 9 items per page
  const [hasMore, setHasMore] = useState(true);

  // Load user role and project data from localStorage
  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUserRole(userData.role);
    }

    const savedProject = localStorage.getItem('selectedProject');
    if (!savedProject) {
      navigate('/');
      return;
    }

    const parsedProject = JSON.parse(savedProject);
    setSelectedProject(parsedProject);
  }, [navigate]);

  // Fetch subprojects after project is loaded
  useEffect(() => {
    const fetchSubProjects = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const response = await axios.get(
          `http://localhost:8085/api/subProject/get/${projectId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { page, limit }
          }
        );

        const subProjectsData = Array.isArray(response.data) 
          ? response.data
          : (response.data?.data || []);

        // Update hasMore based on received data length
        setHasMore(subProjectsData.length === limit);
        
        // Append new data for pagination
        setSubProjects(prev => page === 1 
          ? subProjectsData
          : [...prev, ...subProjectsData]
        );
      } catch (error) {
        console.error('Error loading subprojects:', error);
        toast.error('Failed to load subprojects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubProjects();
  }, [projectId, page, limit]);

  const handleCreateSubProject = async () => {
    if (!newSubProjectName.trim() || !projectId) {
      setError('Please provide a valid sub-project name');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        'http://localhost:8085/api/subProject/create',
        { name: newSubProjectName, projectId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data) {
        throw new Error('Invalid server response');
      }

      const newSubProject: SubProject = {
        id: response.data.id || response.data.subProjectId,
        name: response.data.name,
        members: []
      };

      const updatedSubProjects = [...subProjects, newSubProject];
      setSubProjects(updatedSubProjects);
      localStorage.setItem(`subProjects_${projectId}`, JSON.stringify(updatedSubProjects));
      setShowNewSubProjectModal(false);
      setNewSubProjectName('');
    } catch (error: any) {
      console.error('Failed to create sub-project:', error);
      setError(error.message || 'Failed to create sub-project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubProjectClick = async (subProject: SubProject) => {
    if (!selectedProject || !projectId || !subProject.id) {
      setError('Invalid project or sub-project data');
      return;
    }

    try {
      // Store selected subproject info
      localStorage.setItem('selectedSubProject', JSON.stringify({
        ...subProject,
        projectName: selectedProject.name,
        boardName: `${subProject.name} Board`
      }));
      
      // Navigate to the board page
      navigate(`/project/${projectId}/subproject/${subProject.id}`);
    } catch (error: any) {
      console.error('Failed to navigate:', error);
      setError('Failed to open board. Please try again.');
    }
  };

  // Memoize subprojects grid to prevent unnecessary re-renders
  const SubProjectsGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subProjects.length === 0 && !isLoading ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-inter">No sub-projects yet</h3>
          <p className="text-gray-500 text-center mb-4 font-inter">
            Click the "New Sub-Project" button above to get started
          </p>
        </div>
      ) : (
        <>
          {subProjects.map(subProject => (
            <div
              key={subProject.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-inter leading-tight ">{subProject.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-inter">
                  {subProject.members?.length || 0} members
                </span>
                <button
                  onClick={() => handleSubProjectClick(subProject)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium font-inter"
                >
                  Open Board →
                </button>
              </div>
            </div>
          ))}
          {hasMore && (
            <div className="col-span-full flex justify-center mt-4">
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 font-inter"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  ), [subProjects, isLoading, hasMore]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1 font-inter">
              {selectedProject ? selectedProject.name : 'Project Overview'}
            </h1>
            <div className="h-1 w-24 bg-indigo-600 rounded-full"></div>
          </div>
          {userRole === 'ADMIN' && (
            <button
              onClick={() => setShowNewSubProjectModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-inter"
            >
              <Plus className="w-5 h-5" />
              New Sub-Project
            </button>
          )}
        </div>

        {isLoading && subProjects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse font-inter">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          SubProjectsGrid
        )}

        {showNewSubProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-inter">Create New Sub-Project</h2>
              <input
                type="text"
                placeholder="Sub-Project Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-4 font-inter"
                value={newSubProjectName}
                onChange={(e) => setNewSubProjectName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewSubProjectModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-inter"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubProject}
                  disabled={!newSubProjectName.trim() || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-inter"
                >
                  {isLoading ? 'Creating...' : 'Create'}
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
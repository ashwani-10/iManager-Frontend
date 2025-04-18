import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

interface Repository {
  id: string;
  name: string;
  description: string;
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
  const [repositories, setRepositories] = useState<string[]>([]); // Update to store a list of strings
  const [selectedRepository, setSelectedRepository] = useState<string | null>(null);

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
          `http://43.204.115.57:8085/api/subProject/get/${projectId}`,
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

  // Fetch repositories on page load
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const response = await axios.get('http://43.204.115.57:8085/api/github/repos', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          console.log('Fetched repositories:', response.data);
          setRepositories(response.data); // Store the list of strings
        } else {
          console.error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    fetchRepositories();
  }, []);

  const handleCreateSubProject = async () => {
    if (!newSubProjectName.trim()) { // Remove repository validation
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
        'http://43.204.115.57:8085/api/subProject/create',
        { 
          name: newSubProjectName, 
          projectId, 
          repoName: selectedRepository || null // Allow null for repoName
        },
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
      setSelectedRepository(null); // Reset the selected repository
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

  const handleRepositoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRepository(event.target.value);
  };

  // Memoize subprojects grid to prevent unnecessary re-renders
  const SubProjectsGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subProjects.length === 0 && !isLoading ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition duration-300">
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-inter">No sub-projects yet</h3>
          <p className="text-gray-500 text-center mb-4 font-inter">
            Click the "New Sub-Project" button above to get started
          </p>
        </div>
      ) : (
        <>
          {subProjects.map(subProject => (
            <div
              key={subProject.id} // Ensure unique key for each subproject
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 font-inter leading-tight hover:text-indigo-600 transition duration-300">
                  {subProject.name}
                </h3>
                <button
                  onClick={() => handleSubProjectClick(subProject)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium font-inter transition duration-300"
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
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 font-inter shadow-sm hover:shadow-md transition duration-300"
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
    <div className="flex h-screen bg-gradient-to-r from-blue-200 via-purple-100 to-pink-100">
      <Sidebar />
      <main className="flex-1 bg-white p-10 shadow-2xl rounded-3xl mx-8 my-6 animate-fadeOut overflow-y-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-extrabold text-gray-800 mb-4 font-inter tracking-wide">
              {selectedProject ? selectedProject.name : 'Workspace Overview'}
            </h1>
            <div className="h-1 w-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4"></div>
          </div>
          {userRole === 'ADMIN' && (
            <div className="relative">
              <button
                onClick={() => setShowNewSubProjectModal((prev) => !prev)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-xl transition-transform transform hover:scale-105 font-inter shadow-lg"
              >
                <span className="flex items-center justify-center w-12 h-12 bg-white text-blue-600 rounded-full shadow-md">
                  <Plus className="w-6 h-6" />
                </span>
                <span className="text-lg font-semibold">New Sub-Project</span>
              </button>
              {showNewSubProjectModal && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-6 z-10 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 font-inter">
                    Create New Sub-Project
                  </h2>
                  <p className="text-sm text-gray-500 mb-6 font-inter">
                    Provide a name for your sub-project and optionally link a repository.
                  </p>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Sub-Project Name"
                      className="w-full px-4 py-2 pl-10 border border-gray-400 rounded-md text-gray-800 font-inter focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow hover:shadow-md"
                      value={newSubProjectName}
                      onChange={(e) => setNewSubProjectName(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Plus className="w-5 h-5" />
                    </span>
                  </div>
                  <label htmlFor="repository-select" className="block text-sm font-medium text-gray-700 font-inter mb-2">
                    Select Repository (Optional)
                  </label>
                  <select
                    id="repository-select"
                    className="w-full px-4 py-2 border border-gray-400 rounded-md text-gray-800 mb-6 font-inter focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow hover:shadow-md"
                    value={selectedRepository || ''}
                    onChange={handleRepositoryChange}
                  >
                    <option value="">No repository</option>
                    {repositories.map((repoName, index) => (
                      <option key={index} value={repoName}>
                        {repoName}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowNewSubProjectModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-inter border border-gray-300 rounded-md hover:shadow-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateSubProject}
                      disabled={!newSubProjectName.trim() || isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-inter"
                    >
                      {isLoading ? 'Creating...' : 'Create'}
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
        {isLoading && subProjects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl shadow-lg border border-gray-200 p-8 animate-pulse font-inter">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          SubProjectsGrid
        )}
      </main>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, X, Edit2, Users, Clock, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

// Add these interfaces at the top
interface Task {
  id: string;
  title: string;
  description: string;
  assignee: {
    id: string;
    name: string;
  };
  priority: string;
  status: string;
  columnId?: string;
}

interface Column {
  id: string;
  name: string;
  tasks: Task[];
}

interface Member {
  id: string;
  name: string;
  projectRole?: string;  // Only keep projectRole
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface OrgMember {
  id: string;
  name: string;
  email: string;
}

interface TaskPayload {
  title: string;
  description: string;
  statusId: string;
  priority: string;
  assignedUser: string;
  subProjectID: string;
}

export default function SubProjectView() {
  const { projectId, subProjectId } = useParams();
  const [userRole, setUserRole] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('');  // Changed from 'MEMBER' to empty string
  const [newColumnName, setNewColumnName] = useState('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    id: '',
    title: '',
    description: '',
    assignee: { id: '', name: '' },
    priority: 'MEDIUM',
    status: '',
    columnId: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<{
    id: string;
    taskId: string;
    text: string;
    userId: string;
    createdAt: string;
  }[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add new state for history tab and history data
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [taskHistory] = useState([
    {
      id: '1',
      action: 'Status changed',
      from: 'To Do',
      to: 'In Progress',
      userId: 'user1',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      action: 'Priority updated',
      from: 'LOW',
      to: 'HIGH',
      userId: 'user2',
      timestamp: new Date().toISOString()
    }
  ]);

  const [memberListPosition, setMemberListPosition] = useState({ top: 0, left: 0 });

  // Add new state for comments loading
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  useEffect(() => {
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
      setRoles(JSON.parse(storedRoles));
    }
  }, []);

  useEffect(() => {
    const storedOrgMembers = localStorage.getItem('orgMembers');
    if (storedOrgMembers) {
      setOrgMembers(JSON.parse(storedOrgMembers));
    }
  }, []);

  const fetchColumnsAndTasks = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching columns and tasks...'); // Debug log

      // First fetch columns
      const columnsResponse = await axios.get(
        `http://localhost:8085/api/status/get/${subProjectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Raw columns response:', columnsResponse.data); // Debug log

      // Add this check to verify the response structure
      if (!columnsResponse.data) {
        console.error('No data in columns response');
        setIsLoading(false);
        return;
      }

      // Ensure we're working with an array
      const columnsData = Array.isArray(columnsResponse.data) ? 
        columnsResponse.data : 
        [columnsResponse.data];

      console.log('Columns data after array check:', columnsData); // Debug log

      const fetchedColumns = columnsData.map((column: any) => {
        console.log('Processing column:', column); // Debug individual column
        return {
          id: String(column.id),
          name: column.name,
          tasks: []
        };
      });

      console.log('Processed columns:', fetchedColumns); // Debug processed columns

      // Set columns immediately after processing
      setColumns(fetchedColumns);

      // Then fetch tasks
      const tasksResponse = await axios.get(
        `http://localhost:8085/api/task/get/${subProjectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Raw tasks response:', tasksResponse.data); // Debug log

      if (tasksResponse.data) {
        const tasksData = Array.isArray(tasksResponse.data) ? 
          tasksResponse.data : 
          [tasksResponse.data];

        const columnsWithTasks = fetchedColumns.map(column => ({
          ...column,
          tasks: tasksData
            .filter((task: any) => task.status === column.name)
            .map((task: any) => ({
              id: String(task.id),
              title: task.title,
              description: task.description || '',
              status: task.status,
              priority: task.priority || 'MEDIUM',
              assignee: {
                id: task.assignedUser?.id || '',
                name: task.assignedUser?.name || ''
              },
              columnId: column.id
            }))
        }));

        console.log('Final columns with tasks:', columnsWithTasks); // Debug final state
        setColumns(columnsWithTasks);
      }

    } catch (error: any) {
      console.error('Error fetching board data:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a debug effect to monitor columns state
  useEffect(() => {
    console.log('Columns state updated:', columns);
  }, [columns]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('User from localStorage:', user); // Debug log
      if (user.role) {
        setUserRole(user.role.toUpperCase());
      }
    }
  }, []);

  const fetchSubProjectMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8085/api/member/subProject/${subProjectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setMembers(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch subproject members:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const userId = user ? JSON.parse(user).id : null;

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Make parallel API calls
        const [membersResponse, rolesResponse] = await Promise.all([
          axios.get(`http://localhost:8085/api/member/get/${userRole === 'ADMIN' ? userId : ''}`, { headers }),
          axios.get(`http://localhost:8085/api/role/get/${userRole === 'ADMIN' ? userId : ''}`, { headers })
        ]);

        if (membersResponse.data) {
          setOrgMembers(membersResponse.data);
        }

        if (rolesResponse.data) {
          setRoles(rolesResponse.data);
        }

        // Fetch subproject members as well
        await fetchSubProjectMembers();
      } catch (error: any) {
        console.error('Error fetching initial data:', error.response?.data || error.message);
      }
    };

    if (userRole) {
      fetchInitialData();
    }
  }, [userRole, subProjectId]);

  useEffect(() => {
    if (subProjectId) {
      console.log('SubProjectId changed:', subProjectId); // Debug log
      fetchColumnsAndTasks();
      fetchSubProjectMembers();
    }
  }, [subProjectId]);

  const handleAddMemberClick = () => {
    setShowAddMemberModal(true);
  };

  useEffect(() => {
    if (showTaskModal) {
      fetchSubProjectMembers();
    }
  }, [showTaskModal]);

  const handleAddMember = async () => {
    if (!selectedMember || !selectedRole || !subProjectId) {
      setAddMemberError('Please select both member and role');
      return;
    }
  
    setIsAddingMember(true);
    setAddMemberError('');
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8085/api/member/add/role/${subProjectId}/${selectedMember}/${selectedRole}`,
        {},  // empty body
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.status >= 200 && response.status < 300) {
        // Add the new member to the members list
        const selectedOrgMember = orgMembers.find(m => m.id === selectedMember);
        
        if (selectedOrgMember && response.data.projectRole) {
          const updatedMembers = [...members, {
            id: selectedMember,
            name: selectedOrgMember.name,
            projectRole: response.data.projectRole
          }];
          setMembers(updatedMembers);

          // Save to localStorage
          const boardData = {
            columns,
            members: updatedMembers,
            tasks: columns.flatMap(col => col.tasks)
          };
          localStorage.setItem(`board_${subProjectId}`, JSON.stringify(boardData));
        }
  
        setShowAddMemberModal(false);
        setSelectedMember('');
        setSelectedRole('');
      }
    } catch (error: any) {
      setAddMemberError(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !subProjectId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8085/api/status/create/${subProjectId}/${newColumnName}`,
        {},  // empty body since data is in path variables
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        const createdColumn = response.data;
        
        const updatedColumns = [...columns, { 
          id: createdColumn.id || crypto.randomUUID(), 
          name: newColumnName, 
          tasks: [] 
        }];
        
        setColumns(updatedColumns);
        
        // Save to localStorage
        const boardData = {
          columns: updatedColumns,
          members,
          tasks: updatedColumns.flatMap(col => col.tasks)
        };
        localStorage.setItem(`board_${subProjectId}`, JSON.stringify(boardData));
        
        setNewColumnName('');
        setShowAddColumnModal(false);
      }
    } catch (error: any) {
      console.error('Failed to create column:', error.response?.data || error.message);
      // Optionally add error handling UI here
    }
  };

  const handleAddTask = async (columnId: string) => {
    if (!newTask.title.trim() || !subProjectId) return;

    try {
      const token = localStorage.getItem('token');

      const payload: TaskPayload = {
        title: newTask.title,
        description: newTask.description,
        statusId: columnId,
        priority: newTask.priority,
        assignedUser: newTask.assignee.id || '',
        subProjectID: subProjectId
      };

      const response = await axios.post(
        'http://localhost:8085/api/task/create',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        const createdTask = response.data;
        
        const updatedColumns = columns.map(column => {
          if (column.id === columnId) {
            return {
              ...column,
              tasks: [...column.tasks, {
                id: createdTask.id,
                title: createdTask.title,
                description: createdTask.description,
                status: createdTask.status,
                priority: createdTask.priority,
                assignee: {
                  id: createdTask.assignedUser.id,
                  name: createdTask.assignedUser.name
                },
                columnId
              }]
            };
          }
          return column;
        });

        setColumns(updatedColumns);
        
        // Save to localStorage
        const boardData = {
          columns: updatedColumns,
          members,
          tasks: updatedColumns.flatMap(col => col.tasks)
        };
        localStorage.setItem(`board_${subProjectId}`, JSON.stringify(boardData));

        setShowTaskModal(false);
        setNewTask({
          id: '',
          title: '',
          description: '',
          assignee: { id: '', name: '' },
          priority: 'MEDIUM',
          status: '',
          columnId: ''
        });
      }
    } catch (error: any) {
      console.error('Failed to create task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditTask = (task: Task, columnId: string) => {
    setNewTask({
      ...task,
      columnId
    });
    setIsEditMode(true);
    setShowTaskModal(true);
  };

  const handleUpdateTask = (columnId: string) => {
    const updatedColumns = columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => 
        task.id === newTask.id ? newTask : task
      )
    }));

    setColumns(updatedColumns);
    setShowTaskModal(false);
    setNewTask({
      id: '',
      title: '',
      description: '',
      assignee: { id: '', name: '' },
      priority: 'MEDIUM',
      status: '',
      columnId: ''
    });
    setIsEditMode(false);
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // If the task was dropped in the same column and same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const sourceTasks = [...sourceColumn.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    // Update the task's columnId and status
    movedTask.columnId = destination.droppableId;
    movedTask.status = destColumn.name; // Assuming the column name represents the status

    const destTasks = [...destColumn.tasks];
    destTasks.splice(destination.index, 0, movedTask);

    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: sourceTasks };
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: destTasks };
      }
      return col;
    });

    setColumns(newColumns);

    // Save to localStorage
    const boardData = {
      columns: newColumns,
      members,
      tasks: newColumns.flatMap(col => col.tasks)
    };
    localStorage.setItem(`board_${subProjectId}`, JSON.stringify(boardData));
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !newTask.id) return;

    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : null;

      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await axios.post(
        `http://localhost:8085/api/comment/create/${newTask.id}`,
        {
          message: newComment,
          user_id: userId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        const newCommentData = {
          id: response.data.id || crypto.randomUUID(),
          taskId: newTask.id,
          text: newComment,
          userId: userId,
          createdAt: new Date().toISOString()
        };

        setComments(prevComments => [...prevComments, newCommentData]);
        setNewComment('');
      }
    } catch (error: any) {
      console.error('Failed to add comment:', error.response?.data || error.message);
    }
  };

  const fetchTaskComments = async (taskId: string) => {
    setIsCommentsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8085/api/comment/get/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        const fetchedComments = response.data.map((comment: any) => ({
          id: comment.id,
          taskId: taskId,
          text: comment.message,
          userId: comment.userName, // Changed to userName instead of userId
          createdAt: new Date().toISOString()
        }));
        setComments(fetchedComments);
      }
    } catch (error: any) {
      console.error('Failed to fetch comments:', error.response?.data || error.message);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    const updatedColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        };
      }
      return column;
    });

    setColumns(updatedColumns);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen overflow-hidden bg-[#F4F5F7]">
        <div className="h-full bg-[#1A1B1E] text-white">
          <Sidebar />
        </div>
        
        <main className="flex-1 overflow-x-hidden flex flex-col">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-0">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-[#172B4D]">
                Board
              </h1>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="relative">
                <button
                  onClick={() => setShowMembersModal(!showMembersModal)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded"
                >
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                </button>

                {/* Members Dropdown */}
                {showMembersModal && (
                  <>
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setShowMembersModal(false)}
                    />
                    <div 
                      className="absolute z-50 bg-white rounded-lg shadow-xl w-[320px] max-h-[400px] flex flex-col border border-gray-200 mt-1 left-0"
                    >
                      <div className="p-3 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Board Members</h2>
                      </div>
                      <div className="overflow-y-auto p-2">
                        <div className="space-y-2">
                          {members.map(member => (
                            <div 
                              key={member.id} 
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
                            >
                              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.projectRole}</p>
                              </div>
                            </div>
                          ))}
                          {members.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No members yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {userRole === 'ADMIN' && (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowAddColumnModal(!showAddColumnModal)}
                      className="bg-[#0052CC] text-white px-3 py-1.5 text-sm rounded hover:bg-[#0065FF] transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Column
                    </button>
                    
                    {/* Add Column Dropdown */}
                    {showAddColumnModal && (
                      <>
                        <div 
                          className="fixed inset-0" 
                          onClick={() => setShowAddColumnModal(false)}
                        />
                        <div className="absolute right-0 z-50 bg-white rounded-lg shadow-xl w-[320px] border border-gray-200 mt-1">
                          <div className="p-3 border-b border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-900">Add New Column</h2>
                          </div>
                          <div className="p-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Column Name
                              </label>
                              <input
                                type="text"
                                placeholder="Enter column name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <button
                                onClick={() => setShowAddColumnModal(false)}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAddColumn}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Add Column
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowAddMemberModal(!showAddMemberModal)}
                      className="border border-[#0052CC] text-[#0052CC] px-3 py-1.5 text-sm rounded hover:bg-[#DEEBFF] transition-colors"
                    >
                      Add Member
                    </button>

                    {/* Add Member Dropdown */}
                    {showAddMemberModal && (
                      <>
                        <div 
                          className="fixed inset-0" 
                          onClick={() => setShowAddMemberModal(false)}
                        />
                        <div className="absolute right-0 z-50 bg-white rounded-lg shadow-xl w-[400px] border border-gray-200 mt-1">
                          <div className="p-3 border-b border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-900">Add New Member</h2>
                          </div>
                          <div className="p-4">
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Member
                              </label>
                              <div className="relative">
                                <div 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 cursor-pointer flex justify-between items-center"
                                  onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                                >
                                  <span>
                                    {selectedMember ? orgMembers.find(m => m.id === selectedMember)?.name : 'Select a member'}
                                  </span>
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                                {isMemberDropdownOpen && (
                                  <div className="absolute w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-[60] max-h-48 overflow-y-auto">
                                    {orgMembers.map(member => (
                                      <div
                                        key={member.id}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                        onClick={() => {
                                          setSelectedMember(member.id);
                                          setIsMemberDropdownOpen(false);
                                        }}
                                      >
                                        <div className="font-medium text-gray-900">{member.name}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                              </label>
                              <div className="relative">
                                <div 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 cursor-pointer flex justify-between items-center"
                                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                >
                                  <span>
                                    {selectedRole ? roles.find(r => r.id === selectedRole)?.name : 'Select a role'}
                                  </span>
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                                {isRoleDropdownOpen && (
                                  <div className="absolute w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-[60] max-h-48 overflow-y-auto">
                                    {roles.map(role => (
                                      <div
                                        key={role.id}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                        onClick={() => {
                                          setSelectedRole(role.id);
                                          setIsRoleDropdownOpen(false);
                                        }}
                                      >
                                        <div className="font-medium text-gray-900">{role.name}</div>
                                        <div className="text-sm text-gray-500">{role.description}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {addMemberError && (
                              <p className="text-sm text-red-600 mb-2">{addMemberError}</p>
                            )}

                            <div className="flex justify-end gap-2 mt-6">
                              <button
                                onClick={() => setShowAddMemberModal(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                disabled={isAddingMember}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleAddMember}
                                disabled={isAddingMember || !selectedMember || !selectedRole}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {isAddingMember ? 'Adding...' : 'Add Member'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Board Content */}
          <div className="flex-1 p-4 overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : columns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="mb-4">No columns found</p>
                {userRole === 'ADMIN' && (
                  <button
                    onClick={() => setShowAddColumnModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Add Column
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-4 min-w-max">
                {columns.map(column => (
                  <Droppable key={column.id} droppableId={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="w-[280px] flex-shrink-0"
                      >
                        <div className="bg-[#F4F5F7] rounded-sm">
                          <div className="px-3 py-2 flex justify-between items-center">
                            <h3 className="font-medium text-[#172B4D] text-sm">
                              {column.name}
                              <span className="ml-2 text-gray-500">
                                {column.tasks.length}
                              </span>
                            </h3>
                            <button
                              onClick={() => {
                                setShowTaskModal(true);
                                setIsEditMode(true); // Only set to true for new tasks
                                setNewTask(prev => ({ ...prev, columnId: column.id }));
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="px-2 pb-2">
                            <div className="space-y-2 min-h-[2px]">
                              {column.tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="bg-white rounded shadow-sm p-3 cursor-pointer hover:bg-gray-50 border border-transparent hover:border-[#0052CC]"
                                      onClick={() => {
                                        setNewTask({
                                          ...task,
                                          columnId: column.id
                                        });
                                        setIsEditMode(false); // Set to false initially when opening modal
                                        setShowTaskModal(true);
                                        fetchTaskComments(task.id); // Fetch comments for the task
                                      }}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-[#172B4D]">{task.title}</span>
                                      </div>

                                      {task.description && (
                                        <p className="text-gray-600 text-xs truncate mb-2">
                                          {task.description}
                                        </p>
                                      )}

                                      <div className="flex items-center gap-2 flex-wrap">
                                        {task.assignee.name ? (
                                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700">
                                            {task.assignee.name}
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                                            Unassigned
                                          </span>
                                        )}

                                        <div className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                          task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                          task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                                          'bg-green-100 text-green-700'
                                        }`}>
                                          {task.priority}
                                        </div>

                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700">
                                          {column.name}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Updated Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-[1000px] h-[92vh] overflow-y-auto mt-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {!newTask.id ? 'Create Task' : 'Task Details'}
                </h2>
                <div className="flex items-center gap-3">
                  {newTask.id && (
                    <>
                      <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-4 py-1.5 rounded text-sm font-medium ${
                          isEditMode 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {isEditMode ? 'Cancel Edit' : 'Edit'}
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteTask(newTask.id, newTask.columnId || '');
                          setShowTaskModal(false);
                        }}
                        className="px-4 py-1.5 rounded text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      setShowTaskModal(false);
                      setIsEditMode(false);
                      setNewTask({
                        id: '',
                        title: '',
                        description: '',
                        assignee: { id: '', name: '' },
                        priority: 'MEDIUM',
                        status: '',
                        columnId: ''
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Task Title */}
              <div className="mb-6">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Task Name{isEditMode && '*'}
                </label>
                <input
                  type="text"
                  placeholder="Enter task name"
                  className={`w-full px-4 py-3 text-base border ${
                    isEditMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                  } rounded-lg text-gray-900`}
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  readOnly={!isEditMode}
                />
              </div>

              {/* Task Description */}
              <div className="mb-6">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter task description"
                  rows={4}
                  className={`w-full px-4 py-3 text-base border ${
                    isEditMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                  } rounded-lg text-gray-900 resize-none`}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  readOnly={!isEditMode}
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Single Assignee Dropdown */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Assignee
                  </label>
                  {isEditMode ? (
                    <select
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-gray-900"
                      value={newTask.assignee.id}
                      onChange={(e) => setNewTask({ 
                        ...newTask, 
                        assignee: { 
                          id: e.target.value,
                          name: members.find(m => m.id === e.target.value)?.name || ''
                        } 
                      })}
                    >
                      <option value="">Select assignee</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 text-base bg-gray-50 rounded-lg text-gray-900">
                      {newTask.assignee.name || 'Unassigned'}
                    </div>
                  )}
                </div>

                {/* Status/Column */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  {isEditMode ? (
                    <select
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-gray-900"
                      value={newTask.columnId}
                      onChange={(e) => setNewTask({ ...newTask, columnId: e.target.value })}
                    >
                      <option value="">Select status</option>
                      {columns.map(column => (
                        <option key={column.id} value={column.id}>
                          {column.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 text-base bg-gray-50 rounded-lg text-gray-900">
                      {columns.find(col => col.id === newTask.columnId)?.name || 'No status'}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  {isEditMode ? (
                    <select
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-gray-900"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  ) : (
                    <div className={`px-4 py-3 rounded-lg ${getPriorityColor(newTask.priority)}`}>
                      {newTask.priority}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(isEditMode || !newTask.id) && (
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => {
                      setShowTaskModal(false);
                      setIsEditMode(false);
                      setNewTask({
                        id: '',
                        title: '',
                        description: '',
                        assignee: { id: '', name: '' },
                        priority: 'MEDIUM',
                        status: '',
                        columnId: ''
                      });
                    }}
                    className="px-6 py-2.5 text-base text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => newTask.id ? handleUpdateTask(newTask.columnId) : handleAddTask(newTask.columnId)}
                    disabled={!newTask.title.trim() || !newTask.columnId}
                    className="px-6 py-2.5 text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {newTask.id ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              )}

              {/* Comments and History Section */}
              {newTask.id && (
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-6 border-b border-gray-200 w-full">
                      <button
                        onClick={() => setActiveTab('comments')}
                        className={`py-3 px-4 text-base font-medium relative ${
                          activeTab === 'comments'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Comments ({comments.filter(comment => comment.taskId === newTask.id).length})
                      </button>
                      <button
                        onClick={() => setActiveTab('history')}
                        className={`py-3 px-4 text-base font-medium relative ${
                          activeTab === 'history'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        History
                      </button>
                    </div>
                  </div>

                  {activeTab === 'comments' ? (
                    <>
                      {/* Comments List */}
                      <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6">
                        {isCommentsLoading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        ) : comments.filter(comment => comment.taskId === newTask.id).length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-gray-500">No comments yet</p>
                            <p className="text-xs text-gray-400 mt-1">Be the first to share your thoughts</p>
                          </div>
                        ) : (
                          comments
                            .filter(comment => comment.taskId === newTask.id)
                            .map(comment => (
                              <div key={comment.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {comment.userId.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-gray-900">
                                      {comment.userId}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                      {/* Comment Input - Moved to bottom */}
                      <div className="border-t border-gray-200 pt-4">
                        <textarea 
                          placeholder="Write a comment..."
                          rows={3}
                          className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-6 py-2.5 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            Add Comment
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // History Tab Content
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {taskHistory.map(item => (
                        <div key={item.id} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {members.find(m => m.id === item.userId)?.name || 'Unknown User'}
                                </span>
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.action}
                                  {item.from && item.to && (
                                    <span className="text-gray-500">
                                      : from <span className="font-medium">{item.from}</span> to{' '}
                                      <span className="font-medium">{item.to}</span>
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(item.timestamp).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {taskHistory.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500">No history available</p>
                          <p className="text-xs text-gray-400 mt-1">Changes to this task will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
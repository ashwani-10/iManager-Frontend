import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, X, Edit2, Users, Clock, AlertCircle, UserPlus, User, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../context/userContext';

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
  ticketId?: string; // Add ticketId to Task interface
}

interface Column {
  id: string;
  name: string;
  tasks: Task[];
}

interface Member {
  id: string;
  name: string;
  email?: string; // Add email to Member interface
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
  const { user } = useUser();
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
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'pullRequests'>('comments');
  const [taskHistory, setTaskHistory] = useState([
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

  // Add new state for pull requests
  const [pullRequests, setPullRequests] = useState<{
    id: string;
    username: string;
    title: string;
    url: string;
    baseBranch: string;
    targetBranch: string;
    state: string;
  }[]>([]);

  const [searchMember, setSearchMember] = useState('');
  const [searchOrgMember, setSearchOrgMember] = useState('');

  // Add this state for controlling member list visibility
  const [isSearching, setIsSearching] = useState(false);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearching) {
        const dropdown = document.getElementById('member-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setIsSearching(false);
          setSearchOrgMember('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearching]);

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
        `https://imanager2.duckdns.org/api/service2/api/status/get/${subProjectId}`,
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
        `https://imanager2.duckdns.org/api/service2/api/task/get/${subProjectId}`,
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
              columnId: column.id,
              ticketId: task.ticketId // Ensure ticketId is set from the task object
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
        `https://imanager2.duckdns.org/api/service2/api/member/subProject/${subProjectId}`,
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
          axios.get(`https://imanager2.duckdns.org/api/service2/api/member/get/${userRole === 'ADMIN' ? userId : ''}`, { headers }),
          axios.get(`https://imanager2.duckdns.org/api/service2/api/role/get/${userRole === 'ADMIN' ? userId : ''}`, { headers })
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
        `https://imanager2.duckdns.org/api/service2/api/member/add/role/${subProjectId}/${selectedMember}/${selectedRole}`,
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
        toast.success('Member added successfully!');
      }
    } catch (error: any) {
      toast.error('Failed to add member');
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
        `https://imanager2.duckdns.org/api/service2/api/status/create/${subProjectId}/${newColumnName}`,
        {},  // empty body since data is in path variables
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success('Column created successfully!');
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
        'https://imanager2.duckdns.org/api/service2/api/task/create',
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
                columnId,
                ticketId: createdTask.ticketId // Ensure ticketId is set from the task object
              }]
            };
          }
          return column;
        });
        setColumns(updatedColumns);
        setIsLoading(false);
        
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
      toast.success('Task created successfully!');
    } catch (error: any) {
      toast.error('Failed to create task');
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
      columnId,
      ticketId: task.ticketId // Ensure ticketId is set from the task object
    });
    setIsEditMode(true);
    setShowTaskModal(true);
  };

  const handleUpdateTask = async (columnId: string) => {
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

    // Persist the task update in the database
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://imanager2.duckdns.org/api/service2/api/task/update`,
        {
          id: newTask.id,
          statusId: columnId,
          assignedUser: newTask.assignee.id,
          priority: newTask.priority,
          title: newTask.title,
          description: newTask.description,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Task updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update task');
      console.error('Failed to update task:', error.response?.data || error.message);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!canUpdateTask) return; // Prevent drag and drop if user doesn't have permission

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
  
    // Persist the column change in the database
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://imanager2.duckdns.org/api/service2/api/task/update`,
        {
          id: movedTask.id,
          statusId: destination.droppableId,
          assignedUser:movedTask.assignee.id,
          priority: movedTask.priority,
          title: movedTask.title,
          description: movedTask.description,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Task status updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update task status');
      console.error('Failed to update task status:', error.response?.data || error.message);
    }
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
        `https://imanager2.duckdns.org/api/service2/api/comment/create/${newTask.id}`,
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

      if (response) {
        const newCommentData = {
          id: response.data.id || crypto.randomUUID(),
          taskId: newTask.id,
          text: newComment,
          userId: response.data.userName, // Changed to userName instead of userId
          createdAt: new Date().toISOString()
        };

        setComments((prevComments) => [...prevComments, newCommentData]);
        setNewComment('');

        // Ensure the modal stays open and no unnecessary re-renders occur
        toast.success('Comment added successfully!');
      }
    } catch (error: any) {
      toast.error('Failed to add comment');
      console.error('Failed to add comment:', error.response?.data || error.message);
    }
  };

  const fetchTaskComments = async (taskId: string) => {
    setIsCommentsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://imanager2.duckdns.org/api/service2/api/comment/get/${taskId}`,
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
          createdAt: comment.createdAt.toString()
        }));
        setComments(fetchedComments);
      }
    } catch (error: any) {
      console.error('Failed to fetch comments:', error.response?.data || error.message);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // Fetch pull requests for the task
  const fetchPullRequests = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://imanager2.duckdns.org/api/service2/api/pull-requests/get/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setPullRequests(response.data.map((pr: any) => ({
          id: pr.id,
          username: pr.username,
          title: pr.title,
          url: pr.url,
          baseBranch: pr.baseBranch,
          targetBranch: pr.targetBranch,
          state: pr.state
        })));
      }
    } catch (error: any) {
      console.error('Failed to fetch pull requests:', error.response?.data || error.message);
    }
  };

  const handleDeleteTask = async (taskId: string, columnId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://imanager2.duckdns.org/api/service2/api/task/delete/${taskId}`,
        {}, // Ensure the body is empty if not required
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete task');
      console.error('Failed to delete task:', error.response?.data || error.message);
    }
  };

  // Fetch the current logged-in user's name
  const storedUser = localStorage.getItem('user');
  const currentUserName = storedUser ? JSON.parse(storedUser).name : 'Unknown User';

  // Update fetch logic when opening the task modal
  useEffect(() => {
    if (newTask.id) {
      fetchTaskComments(newTask.id);
      fetchPullRequests(newTask.id); // Fetch pull requests
    }
  }, [newTask.id]);

  const fetchTaskHistory = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://imanager2.duckdns.org/api/service2/api/task/history/${ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Task history response:', response.data); // Debug log
      if (response.data) {
        const fetchedHistory = response.data.map((item: any) => ({
          id: item.id || crypto.randomUUID(),
          action: item.historyMessage,
          userId: item.userName, // Use userName from the response
          timestamp: item.timestamp || new Date().toISOString()
        }));
        setTaskHistory(fetchedHistory);
      }
    } catch (error: any) {
      console.error('Failed to fetch task history:', error.response?.data || error.message);
      setTaskHistory([]); // Clear history if the API call fails
    }
  };

  // Update the onClick handler for tasks to include fetching pull requests
  const handleTaskClick = async (task: Task, columnId: string) => {
    setNewTask({
      ...task,
      columnId,
    });
    setIsEditMode(false);
    setShowTaskModal(true);
  
    if (task.ticketId) {
      await fetchTaskHistory(task.ticketId); // Fetch task history using ticketId
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://imanager2.duckdns.org/api/service2/api/github/get/pr/${task.ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Pull requests response:', response.data); // Debug log
      if (response.data) {
        setPullRequests(response.data.map((pr: any) => ({
          id: pr.id,
          username: pr.author || 'Unknown User', // Ensure username is set correctly
          title: pr.prTitle || 'No Title',
          url: pr.prUrl || '#', // Ensure URL is clickable
          baseBranch: pr.baseBranch || 'Unknown Base', // Ensure base branch is set
          targetBranch: pr.headBranch || 'Unknown Target', // Ensure target branch is set
          state: pr.state || 'Unknown State' // Ensure state is set
        })));
      }
    } catch (error: any) {
      console.error('Failed to fetch pull requests:', error.response?.data || error.message);
      setPullRequests([]); // Clear pull requests if the API call fails
    }
  };

  // Add this helper function
  const filterMembers = (members: Member[]) => {
    return members.filter(
      member => 
        member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(searchMember.toLowerCase()))
    );
  };

  // Add this helper function near other filter functions
  const filterOrgMembers = (orgMembers: OrgMember[]) => {
    return orgMembers.filter(
      member => 
        member.name.toLowerCase().includes(searchOrgMember.toLowerCase()) ||
        member.email.toLowerCase().includes(searchOrgMember.toLowerCase())
    );
  };

  const isAdmin = user?.role === 'ADMIN';
  const canCreateColumn = isAdmin || (user?.operations?.includes('create-columns') ?? false);
  const canAddMembers = isAdmin || (user?.operations?.includes('add-boardMembers') ?? false);
  const canCreateTask = isAdmin || (user?.operations?.includes('create-task') ?? false);
  const canDeleteTask = isAdmin || (user?.operations?.includes('delete-task') ?? false);
  const canUpdateTask = isAdmin || (user?.operations?.includes('update-task') ?? false);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen overflow-hidden bg-[#F4F5F7]">
        <Sidebar />
        
        <main className="flex-1 overflow-x-hidden flex flex-col animate-fadeIn">
          <div className="px-8 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold text-[#3e3e3e] tracking-wide hover:text-blue-600 transition-colors">
                Board
              </h1>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="relative">
                <button
                  onClick={() => setShowMembersModal(!showMembersModal)}
                  className="flex items-center gap-2 text-sm text-gray-700 border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                  title="View Members"
                >
                  <img
                    src="https://img.icons8.com/color/48/000000/conference-call.png" 
                    alt="Members Icon"
                    className="w-5 h-5"
                  />
                  <span>Members</span>
                </button>
                {/* Members Dropdown */}
                {showMembersModal && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowMembersModal(false)} />
                    <div className="absolute z-50 bg-white rounded-lg shadow-lg w-[380px] max-h-[80vh] flex flex-col border border-gray-200 mt-2 left-0">
                      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Board Members</h2>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchMember}
                            onChange={(e) => setSearchMember(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="absolute right-3 top-2.5 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 p-3">
                        <div className="space-y-3">
                          {filterMembers(members).map(member => (
                            <div
                              key={member.id}
                              className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-all"
                            >
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-indigo-600">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {member.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {member.email || 'No email'}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {member.projectRole}
                                </p>
                              </div>
                            </div>
                          ))}
                          {filterMembers(members).length === 0 && (
                            <div className="text-center py-6">
                              <p className="text-sm text-gray-500">
                                {members.length === 0 ? 'No members yet' : 'No matching members found'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {canCreateColumn && (
                <div className="relative">
                  <button
                    onClick={() => setShowAddColumnModal(!showAddColumnModal)}
                    className="flex items-center gap-2 border border-[#0052CC] text-[#0052CC] px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#DEEBFF] transition-all shadow-sm"
                    title="Add Column"
                  >
                    <Plus className="w-4 h-4" />
                    Add Column
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showAddColumnModal && (
                    <>
                      <div className="fixed inset-0" onClick={() => setShowAddColumnModal(false)} />
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Column</h3>
                          <input
                            type="text"
                            placeholder="Enter column name"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => setShowAddColumnModal(false)}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddColumn}
                              disabled={!newColumnName.trim()}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {canAddMembers && (
                <div className="relative">
                  <button
                    onClick={() => setShowAddMemberModal(!showAddMemberModal)}
                    className="flex items-center gap-2 border border-[#0052CC] text-[#0052CC] px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#DEEBFF] transition-all shadow-sm"
                    title="Add Member"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Member
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showAddMemberModal && (
                    <>
                      <div className="fixed inset-0" onClick={() => setShowAddMemberModal(false)} />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-45">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Member</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Select Member</label>
                              <div className="relative" id="member-dropdown">
                                {selectedMember ? (
                                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600">
                                          {orgMembers.find(m => m.id === selectedMember)?.name.charAt(0)}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm text-gray-900">
                                          {orgMembers.find(m => m.id === selectedMember)?.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {orgMembers.find(m => m.id === selectedMember)?.email}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setSelectedMember('');
                                        setSearchOrgMember('');
                                      }}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder="Search by name or email..."
                                      value={searchOrgMember}
                                      onChange={(e) => {
                                        setSearchOrgMember(e.target.value);
                                        setIsSearching(true);
                                      }}
                                      onFocus={() => setIsSearching(true)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <div className="absolute right-3 top-2.5 text-gray-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                                
                                {isSearching && !selectedMember && (
                                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filterOrgMembers(orgMembers).map(member => (
                                      <div
                                        key={member.id}
                                        onClick={() => {
                                          setSelectedMember(member.id);
                                          setIsSearching(false);
                                          setSearchOrgMember('');
                                        }}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                          <span className="text-sm font-medium text-blue-600">
                                            {member.name.charAt(0)}
                                          </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {member.name}
                                          </p>
                                          <p className="text-xs text-gray-500 truncate">
                                            {member.email}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                    {filterOrgMembers(orgMembers).length === 0 && (
                                      <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No matching members found</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Select Role</label>
                              <div className="relative">
                                <button
                                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded flex items-center justify-between"
                                >
                                  {selectedRole
                                    ? roles.find(r => r.id === selectedRole)?.name
                                    : 'Select Role'}
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>
                                {isRoleDropdownOpen && (
                                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {roles.map(role => (
                                      <div
                                        key={role.id}
                                        onClick={() => {
                                          setSelectedRole(role.id);
                                          setIsRoleDropdownOpen(false);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <p className="text-sm font-medium text-gray-700">{role.name}</p>
                                        <p className="text-xs text-gray-500">{role.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {addMemberError && (
                            <p className="text-sm text-red-600 mt-2">{addMemberError}</p>
                          )}

                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => setShowAddMemberModal(false)}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddMember}
                              disabled={!selectedMember || !selectedRole || isAddingMember}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isAddingMember && (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              )}
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Board Content */}
          <div className="flex-1 p-6 overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : columns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="mb-4">No columns found</p>
                {canCreateColumn && (
                  <button
                    onClick={() => setShowAddColumnModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    title="Add Column"
                  >
                    Add Column
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-6 min-w-max">
                {columns.map(column => (
                  <Droppable key={column.id} droppableId={column.id}>
                    {(provided) => (
                      <div className="w-[300px] flex-shrink-0">
                        {/* Column Header Section */}
                        <div className="bg-gradient-to-r from-blue-200 via-blue-200 to-blue-200 text-gray-800 p-4 rounded-lg shadow-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold uppercase tracking-wide">
                              {column.name}
                            </span>
                            <span className="text-sm bg-white text-blue-600 px-3 py-1 rounded-full shadow-md">
                              {column.tasks.length}
                            </span>
                          </div>
                          {canCreateTask && (
                            <button
                              onClick={() => {
                                setShowTaskModal(true);
                                setIsEditMode(true);
                                setNewTask(prev => ({ ...prev, columnId: column.id }));
                              }}
                              className="bg-white text-blue-600 hover:bg-blue-100 p-2 rounded-full shadow-md transition-all"
                              title="Add Task"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {/* Add spacing between header and tasks */}
                        <div className="h-4"></div>

                        {/* Tasks Section */}
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-3 min-h-[350px]"
                        >
                          {column.tasks.map((task, index) => (
                            <Draggable 
                              key={task.id} 
                              draggableId={task.id} 
                              index={index}
                              isDragDisabled={!canUpdateTask} // Disable dragging if user doesn't have permission
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-md shadow-md p-3 border border-gray-300 hover:bg-gray-50 transition-all cursor-pointer ${
                                    snapshot.isDragging ? 'transform scale-105 shadow-lg' : ''
                                  } ${!canUpdateTask ? 'cursor-not-allowed' : ''}`}
                                  onClick={() => handleTaskClick(task, column.id)}
                                >
                                  {/* Display ticketId */}
                                  {task.ticketId && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="text-xs font-semibold text-blue-700 tracking-wide">
                                        Ticket ID: {task.ticketId}
                                      </div>
                                      <div
                                        className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
                                          task.priority === 'HIGH'
                                            ? 'bg-red-100 text-red-700'
                                            : task.priority === 'MEDIUM'
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}
                                      >
                                        {task.priority}
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-[#172B4D] text-sm leading-tight">
                                      {task.title}
                                    </span>
                                  </div>
                                  {task.description && (
                                    <p className="text-gray-600 text-xs leading-relaxed mb-3">
                                      {task.description.length > 40
                                        ? `${task.description.substring(0, 40)}...`
                                        : task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {task.assignee.name ? (
                                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 tracking-wide">
                                        <User className="w-4 h-4" /> {/* Add human icon */}
                                        {task.assignee.name}
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 tracking-wide">
                                        Unassigned
                                      </span>
                                    )}
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 tracking-wide">
                                      {column.name.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
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
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center p-4 z-50">
            <div className="bg-white p-6 w-full max-w-[1100px] h-[85vh] overflow-y-auto mt-4 shadow-lg border border-gray-400">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  {/* Display ticketId */}
                  {newTask.ticketId && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      Ticket ID: {newTask.ticketId}
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-gray-800">
                    {!newTask.id ? 'Create Task' : ''}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {newTask.id && (
                    <>
                      {canUpdateTask && (
                        <button
                          onClick={() => setIsEditMode(!isEditMode)}
                          className={`px-4 py-1.5 rounded text-sm font-medium ${
                            isEditMode 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                          title={isEditMode ? 'Cancel Edit' : 'Edit Task'}
                        >
                          {isEditMode ? 'Cancel Edit' : 'Edit'}
                        </button>
                      )}
                      {canDeleteTask && (
                        <button
                          onClick={() => {
                            handleDeleteTask(newTask.id, newTask.columnId || '');
                            setShowTaskModal(false);
                          }}
                          className="px-4 py-1.5 rounded text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete Task"
                        >
                          Delete
                        </button>
                      )}
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
                  Title{isEditMode && '*'}
                </label>
                <input
                  type="text"
                  placeholder="Enter task name"
                  className={`w-full px-4 py-3 text-base border border-gray-400 rounded-md text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
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
                  className={`w-full px-4 py-3 text-base border border-gray-400 rounded-md text-gray-900 resize-none shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
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
                    <div className="relative">
                      <button
                        onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-left shadow-sm"
                      >
                        {newTask.assignee.id
                          ? `${members.find((member) => member.id === newTask.assignee.id)?.name || 'Select Assignee'} - ${
                              members.find((member) => member.id === newTask.assignee.id)?.projectRole || 'No Role'
                            }`
                          : 'Select Assignee'}
                      </button>
                      {isMemberDropdownOpen && (
                        <div className="absolute z-50 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto w-full shadow-lg">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              onClick={() => {
                                setNewTask({
                                  ...newTask,
                                  assignee: { id: member.id, name: member.name },
                                });
                                setIsMemberDropdownOpen(false);
                              }}
                              className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-50"
                            >
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.projectRole || 'No Role'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-base bg-gray-50 rounded-lg text-gray-900 shadow-sm">
                      {newTask.assignee.name
                        ? `${newTask.assignee.name} - ${
                            members.find((member) => member.id === newTask.assignee.id)?.projectRole || 'No Role'
                          }`
                        : 'Unassigned'}
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
                      className="w-full px-4 py-3 text-base border border-gray-400 rounded-md text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newTask.columnId}
                      onChange={(e) => setNewTask({ ...newTask, columnId: e.target.value })}
                    >
                      <option value="">Select status</option>
                      {columns.map(column => (
                        <option key={column.id} value={column.id}>
                          {column.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-3 text-base bg-gray-50 rounded-lg text-gray-900 shadow-sm">
                      {columns.find(col => col.id === newTask.columnId)?.name.toUpperCase() || 'NO STATUS'}
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
                      className="w-full px-4 py-3 text-base border border-gray-400 rounded-md text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  ) : (
                    <div className={`px-4 py-3 rounded-lg shadow-sm ${getPriorityColor(newTask.priority)}`}>
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
                    className="px-6 py-2.5 text-base text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => newTask.id ? handleUpdateTask(newTask.columnId) : handleAddTask(newTask.columnId)}
                    disabled={!newTask.title.trim() || !newTask.columnId}
                    className="px-6 py-2.5 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
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
                      {/* Add Pull Requests tab */}
                      <button
                        onClick={() => setActiveTab('pullRequests')}
                        className={`py-3 px-4 text-base font-medium relative ${
                          activeTab === 'pullRequests'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Pull Request
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
                              <div key={comment.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {comment.userId ? comment.userId.charAt(0) : currentUserName.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-gray-900">
                                      {comment.userId || currentUserName}
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

                      {/* Comment Input */}
                      <div className="border-t border-gray-200 pt-4">
                        <textarea
                          placeholder="Write a comment..."
                          rows={3}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  ) : activeTab === 'history' ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto bg-white rounded-lg shadow-md p-4">
                      {taskHistory.map(item => (
                        <div
                          key={item.id}
                          className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {members.find(m => m.id === item.userId)?.name || item.userId || 'Unknown User'}
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
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      <table className="w-full text-left border-collapse bg-white rounded-lg shadow-md">
                        <thead className="bg-gray-100">
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">User</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Title</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">URL</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Base Branch</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Head Branch</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">State</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pullRequests.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-6 text-sm text-gray-500 text-center">
                                No pull requests available
                              </td>
                            </tr>
                          ) : (
                            pullRequests.map(pr => (
                              <tr key={pr.id} className="border-b border-gray-200 hover:bg-gray-50 transition-all">
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{pr.username}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{pr.title}</td>
                                <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                                  <a href={pr.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    View PR
                                  </a>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{pr.baseBranch}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{pr.targetBranch}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      pr.state === 'open'
                                        ? 'bg-green-100 text-green-800'
                                        : pr.state === 'closed'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {pr.state}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
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

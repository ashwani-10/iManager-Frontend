export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  subProjects: SubProject[];
}

export interface SubProject {
  id: string;
  name: string;
  description: string;
  members: ProjectMember[];
  columns: Column[];
}

export interface ProjectMember {
  userId: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface Column {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignees: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  status: string;
  labels: string[];
}
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface Column {
  id: string;
  title: string;
  status: 'todo' | 'progress' | 'done';
  color: string;
  icon: string;
}
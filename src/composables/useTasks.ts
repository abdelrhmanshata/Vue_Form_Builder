import { ref, computed, readonly } from 'vue';
import type { Task } from '../types';

const STORAGE_KEY = 'vue-task-board-tasks';

// Load tasks from localStorage
const loadTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt)
      }));
    }
  } catch (error) {
    console.warn('Failed to load tasks from localStorage:', error);
  }
  
  // Default tasks if none stored
  return [
    {
      id: '1',
      title: 'Design new homepage',
      description: 'Create a modern and responsive homepage design',
      status: 'todo',
      priority: 'high',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Implement user authentication',
      description: 'Set up login, signup, and password recovery',
      status: 'progress',
      priority: 'medium',
      createdAt: new Date('2024-01-14'),
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Document all REST API endpoints',
      status: 'done',
      priority: 'low',
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '4',
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment',
      status: 'todo',
      priority: 'medium',
      createdAt: new Date('2024-01-12'),
    },
  ];
};

// Save tasks to localStorage
const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Failed to save tasks to localStorage:', error);
  }
};

export function useTasks() {
  const tasks = ref<Task[]>(loadTasks());

  // Computed properties with memoization
  const todoTasks = computed(() => tasks.value.filter(task => task.status === 'todo'));
  const progressTasks = computed(() => tasks.value.filter(task => task.status === 'progress'));
  const doneTasks = computed(() => tasks.value.filter(task => task.status === 'done'));

  const taskStats = computed(() => ({
    total: tasks.value.length,
    todo: todoTasks.value.length,
    progress: progressTasks.value.length,
    done: doneTasks.value.length,
    completionRate: tasks.value.length > 0 ? Math.round((doneTasks.value.length / tasks.value.length) * 100) : 0
  }));

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    tasks.value.push(newTask);
    saveTasks(tasks.value);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = { ...tasks.value[taskIndex], status: newStatus };
      saveTasks(tasks.value);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = { ...tasks.value[taskIndex], ...updates };
      saveTasks(tasks.value);
    }
  };

  const deleteTask = (taskId: string) => {
    const initialLength = tasks.value.length;
    tasks.value = tasks.value.filter(task => task.id !== taskId);
    if (tasks.value.length !== initialLength) {
      saveTasks(tasks.value);
    }
  };

  const clearCompletedTasks = () => {
    const initialLength = tasks.value.length;
    tasks.value = tasks.value.filter(task => task.status !== 'done');
    if (tasks.value.length !== initialLength) {
      saveTasks(tasks.value);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'success'
    } as const;
    return colors[priority] || 'grey';
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    const icons = {
      high: 'mdi-alert-circle',
      medium: 'mdi-minus-circle',
      low: 'mdi-check-circle'
    } as const;
    return icons[priority] || 'mdi-circle';
  };

  return {
    // Readonly state
    tasks: readonly(tasks),
    todoTasks,
    progressTasks,
    doneTasks,
    taskStats,
    
    // Actions
    addTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    clearCompletedTasks,
    
    // Utilities
    getPriorityColor,
    getPriorityIcon,
  };
}
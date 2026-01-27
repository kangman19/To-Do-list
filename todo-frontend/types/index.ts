export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface Task {
  id: number;
  task: string;
  category: string;
  taskType: 'list' | 'text' | 'image';
  textContent?: string;
  imageUrl?: string;
  completed: boolean;
  userId: number;
  username: string;
  dueDate?: string;
  completedById?: number;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CategoryData {
  tasks: Task[];
  shared: boolean;
  sharedBy?: string;
}

export interface TasksByCategory {
  [category: string]: CategoryData;
}

export interface Reminder {
  id: number;
  senderId: number;
  receiverId: number;
  category: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  senderUsername: string;
}
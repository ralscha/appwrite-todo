export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  created: string;
  updated: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  completed?: boolean;
  user: string;
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

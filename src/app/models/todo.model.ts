export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
  created: string;
  updated: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  completed?: boolean;
  dueDate?: string | null;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string | null;
}

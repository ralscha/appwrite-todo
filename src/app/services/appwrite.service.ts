import { Injectable, signal } from '@angular/core';
import {
  Account,
  Client,
  ID,
  Models,
  Permission,
  Query,
  Role,
  TablesDB
} from 'appwrite';
import { environment } from '../../environments/environment';
import {
  AuthData,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User
} from '../models/user.model';
import {
  CreateTodoRequest,
  Todo,
  UpdateTodoRequest
} from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  isLoggedIn = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  authInitialized = signal<boolean>(false);

  private readonly client: Client;
  private readonly account: Account;
  private readonly tablesDB: TablesDB;

  private readonly DATABASE_ID = 'todos-database';
  private readonly TODOS_TABLE_ID = 'todos';

  constructor() {
    this.client = new Client()
      .setEndpoint(environment.appwriteEndpoint)
      .setProject(environment.appwriteProjectId);

    this.account = new Account(this.client);
    this.tablesDB = new TablesDB(this.client);

    this.checkAuth();
  }

  async login(credentials: LoginRequest): Promise<AuthData> {
    try {
      const session = await this.account.createEmailPasswordSession({
        email: credentials.email,
        password: credentials.password
      });
      const user = await this.account.get();
      const userData = this.mapAppwriteUserToUser(user);
      this.isLoggedIn.set(true);
      this.currentUser.set(userData);
      return {
        token: session.$id,
        record: userData
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<User> {
    try {
      const user = await this.account.create({
        userId: ID.unique(),
        email: userData.email,
        password: userData.password,
        name: userData.name
      });

      await this.login({
        email: userData.email,
        password: userData.password
      });
      return this.mapAppwriteUserToUser(user);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.account.deleteSession({ sessionId: 'current' });
    } catch {}
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const resetUrl = `${window.location.origin}/password-reset`;
      await this.account.createRecovery({
        email,
        url: resetUrl
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshAuth(): Promise<AuthData | null> {
    try {
      const user = await this.account.get();
      const userData = this.mapAppwriteUserToUser(user);
      this.isLoggedIn.set(true);
      this.currentUser.set(userData);
      const session = await this.account.getSession({ sessionId: 'current' });
      return {
        token: session.$id,
        record: userData
      };
    } catch {
      await this.logout();
      return null;
    } finally {
      this.authInitialized.set(true);
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      if (data.email !== undefined && !data.password) {
        return Promise.reject('Password is required when updating email');
      }

      let user;
      if (data.name !== undefined) {
        user = await this.account.updateName({ name: data.name });
      }
      if (data.email !== undefined) {
        user = await this.account.updateEmail({
          email: data.email,
          password: data.password!
        });
      }
      if (!user) {
        user = await this.account.get();
      }
      const userData = this.mapAppwriteUserToUser(user);
      this.currentUser.set(userData);
      return userData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateRecovery(
    userId: string,
    secret: string,
    password: string
  ): Promise<void> {
    try {
      await this.account.updateRecovery({
        userId,
        secret,
        password
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTodos(hideCompleted: boolean): Promise<Todo[]> {
    try {
      const queries = [Query.orderDesc('$createdAt')];

      if (hideCompleted) {
        queries.push(Query.equal('completed', false));
      }

      const response = await this.tablesDB.listRows({
        databaseId: this.DATABASE_ID,
        tableId: this.TODOS_TABLE_ID,
        queries: queries
      });

      return response.rows.map(row => this.mapRowToTodo(row));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTodo(todoData: Omit<CreateTodoRequest, 'user'>): Promise<Todo> {
    try {
      const data = {
        title: todoData.title,
        description: todoData.description ?? '',
        completed: todoData.completed ?? false,
        dueDate: todoData.dueDate ?? null
      };

      const currentUserId = this.currentUser()?.id || '';
      if (!currentUserId) {
        return Promise.reject(new Error('User not authenticated'));
      }

      const document = await this.tablesDB.createRow({
        databaseId: this.DATABASE_ID,
        tableId: this.TODOS_TABLE_ID,
        rowId: ID.unique(),
        data: data,
        permissions: [
          Permission.read(Role.user(currentUserId)),
          Permission.update(Role.user(currentUserId)),
          Permission.delete(Role.user(currentUserId))
        ]
      });

      return this.mapRowToTodo(document);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTodo(todoId: string, data: UpdateTodoRequest): Promise<Todo> {
    try {
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.completed !== undefined) updateData.completed = data.completed;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

      const document = await this.tablesDB.updateRow({
        databaseId: this.DATABASE_ID,
        tableId: this.TODOS_TABLE_ID,
        rowId: todoId,
        data: updateData
      });

      return this.mapRowToTodo(document);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTodo(todoId: string): Promise<void> {
    try {
      await this.tablesDB.deleteRow({
        databaseId: this.DATABASE_ID,
        tableId: this.TODOS_TABLE_ID,
        rowId: todoId
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTodo(todoId: string): Promise<Todo> {
    try {
      const document = await this.tablesDB.getRow({
        databaseId: this.DATABASE_ID,
        tableId: this.TODOS_TABLE_ID,
        rowId: todoId
      });

      return this.mapRowToTodo(document);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async checkAuth(): Promise<void> {
    try {
      const user = await this.account.get();
      const userData = this.mapAppwriteUserToUser(user);
      this.isLoggedIn.set(true);
      this.currentUser.set(userData);
    } catch {
      this.isLoggedIn.set(false);
      this.currentUser.set(null);
    } finally {
      this.authInitialized.set(true);
    }
  }

  private mapAppwriteUserToUser(
    appwriteUser: Models.User<Models.Preferences>
  ): User {
    return {
      id: appwriteUser.$id,
      email: appwriteUser.email,
      name: appwriteUser.name,
      avatar: undefined,
      created: appwriteUser.$createdAt,
      updated: appwriteUser.$updatedAt
    };
  }

  private mapRowToTodo(document: Models.Row): Todo {
    const doc = document as any;
    return {
      id: document.$id,
      title: doc.title,
      description: doc.description,
      completed: doc.completed,
      dueDate: doc.dueDate,
      created: document.$createdAt,
      updated: document.$updatedAt
    };
  }

  private handleError(error: any): Error {
    if (error?.message) {
      return new Error(error.message);
    }
    if (error?.response?.message) {
      return new Error(error.response.message);
    }
    return new Error('An unexpected error occurred');
  }
}

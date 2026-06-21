import { Component, inject, input, OnInit, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  required,
  submit
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonLabel,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { AppwriteService } from '../services/appwrite.service';
import { Todo } from '../models/todo.model';
import { ToastService } from '../services/toast.service';
import { FormErrorService } from '../services/form-error.service';

interface TodoFormModel {
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

@Component({
  selector: 'app-edit-todo',
  templateUrl: './edit-todo.page.html',
  styleUrl: './edit-todo.page.css',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonText,
    IonDatetime,
    IonCheckbox,
    IonButtons,
    IonBackButton,
    FormRoot,
    FormField
  ]
})
export class EditTodoPage implements OnInit {
  formErrorService = inject(FormErrorService);
  todoModel = signal<TodoFormModel>({
    title: '',
    description: '',
    completed: false,
    dueDate: ''
  });
  todoForm = form(this.todoModel, path => {
    required(path.title);
    maxLength(path.title, 255);
    maxLength(path.description, 1000);
  });
  isLoading = signal(false);
  isEditing = signal(false);
  currentTodo = signal<Todo | null>(null);
  id = input<string | null>(null);
  private readonly appwriteService = inject(AppwriteService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  ngOnInit() {
    if (this.id()) {
      this.isEditing.set(true);
      this.loadTodo();
    }
  }

  async loadTodo() {
    const id = this.id();
    if (!id) {
      return;
    }

    this.isLoading.set(true);
    try {
      const todo = await this.appwriteService.getTodo(id);
      this.currentTodo.set(todo);
      this.todoModel.set({
        title: todo.title,
        description: todo.description ?? '',
        completed: todo.completed,
        dueDate: todo.dueDate ?? ''
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit() {
    await submit(this.todoForm, async () => {
      if (this.isLoading()) {
        return;
      }

      this.isLoading.set(true);
      try {
        const formData = this.todoModel();
        const todoData = {
          ...formData,
          dueDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString()
            : null
        };

        if (this.isEditing() && this.id()) {
          await this.appwriteService.updateTodo(this.id()!, todoData);
          await this.toastService.showToast(
            'Todo updated successfully!',
            'success'
          );
        } else {
          await this.appwriteService.createTodo(todoData);
          await this.toastService.showToast(
            'Todo created successfully!',
            'success'
          );
        }

        await this.router.navigate(['/todos']);
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}

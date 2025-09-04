import { Component, inject, input, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
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
    ReactiveFormsModule
  ]
})
export class EditTodoPage implements OnInit {
  formErrorService = inject(FormErrorService);
  todoForm: FormGroup;
  isLoading = signal(false);
  isEditing = signal(false);
  currentTodo = signal<Todo | null>(null);
  id = input<string | null>(null);
  private readonly fb = inject(FormBuilder);
  private readonly appwriteService = inject(AppwriteService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  constructor() {
    this.todoForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
      completed: [false],
      dueDate: ['']
    });
  }

  get title() {
    return this.todoForm.get('title');
  }

  get description() {
    return this.todoForm.get('description');
  }

  get completed() {
    return this.todoForm.get('completed');
  }

  get dueDate() {
    return this.todoForm.get('dueDate');
  }

  ngOnInit() {
    if (this.id()) {
      this.isEditing.set(true);
      this.loadTodo();
    }
  }

  async loadTodo() {
    if (!this.id()) {
      return;
    }

    this.isLoading.set(true);
    const todo = await this.appwriteService.getTodo(this.id()!);
    this.currentTodo.set(todo);
    this.todoForm.patchValue({
      title: todo.title,
      description: todo.description ?? '',
      completed: todo.completed,
      dueDate: todo.dueDate ?? ''
    });
    this.isLoading.set(false);
  }

  async onSubmit() {
    if (this.todoForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      const formData = this.todoForm.value;

      if (formData.dueDate) {
        formData.dueDate = new Date(formData.dueDate).toISOString();
      } else {
        formData.dueDate = null;
      }

      if (this.isEditing() && this.id()) {
        await this.appwriteService.updateTodo(this.id()!, formData);
        await this.toastService.showToast(
          'Todo updated successfully!',
          'success'
        );
      } else {
        await this.appwriteService.createTodo(formData);
        await this.toastService.showToast(
          'Todo created successfully!',
          'success'
        );
      }

      await this.router.navigate(['/todos']);
      this.isLoading.set(false);
    }
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}

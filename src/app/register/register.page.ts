import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  minLength,
  required,
  submit,
  validate
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonRouterLinkWithHref,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { AppwriteService } from '../services/appwrite.service';
import { ToastService } from '../services/toast.service';
import { FormErrorService } from '../services/form-error.service';

interface RegisterFormModel {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrl: './register.page.css',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonInput,
    IonButton,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    RouterLink,
    IonRouterLinkWithHref,
    FormRoot,
    FormField
  ]
})
export class RegisterPage {
  formErrorService = inject(FormErrorService);
  registerModel = signal<RegisterFormModel>({
    email: '',
    name: '',
    password: '',
    passwordConfirm: ''
  });
  registerForm = form(this.registerModel, path => {
    required(path.email);
    email(path.email);
    required(path.password);
    minLength(path.password, 6);
    required(path.passwordConfirm);
    validate(path.passwordConfirm, ({ value, valueOf }) =>
      value() === valueOf(path.password)
        ? null
        : { kind: 'passwordMismatch', message: 'Passwords do not match' }
    );
  });
  isLoading = signal(false);
  private readonly appwriteService = inject(AppwriteService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  async onSubmit() {
    await submit(this.registerForm, async () => {
      if (this.isLoading()) {
        return;
      }

      this.isLoading.set(true);
      try {
        await this.appwriteService.register(this.registerModel());
        await this.toastService.showToast(
          'Registration successful! You can now login.',
          'success'
        );
        await this.router.navigate(['/login']);
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}

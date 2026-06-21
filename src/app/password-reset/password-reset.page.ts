import { Component, inject, input, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  minLength,
  required,
  submit,
  validate
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { AppwriteService } from '../services/appwrite.service';
import { ToastService } from '../services/toast.service';
import { FormErrorService } from '../services/form-error.service';

interface PasswordResetFormModel {
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrl: './password-reset.page.css',
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
    FormRoot,
    FormField
  ]
})
export class PasswordResetPage {
  formErrorService = inject(FormErrorService);
  resetModel = signal<PasswordResetFormModel>({
    password: '',
    confirmPassword: ''
  });
  resetForm = form(this.resetModel, path => {
    required(path.password);
    minLength(path.password, 8);
    required(path.confirmPassword);
    validate(path.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(path.password)
        ? null
        : { kind: 'passwordMismatch', message: 'Passwords do not match' }
    );
  });
  isLoading = signal(false);
  passwordReset = signal(false);
  userId = input<string>('');
  secret = input<string>('');
  private readonly appwriteService = inject(AppwriteService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  async onSubmit() {
    if (!this.userId() || !this.secret()) {
      return;
    }

    await submit(this.resetForm, async () => {
      if (this.isLoading()) {
        return;
      }

      this.isLoading.set(true);
      try {
        await this.appwriteService.updateRecovery(
          this.userId(),
          this.secret(),
          this.resetModel().password
        );
        this.passwordReset.set(true);
        await this.toastService.showToast(
          'Password reset successfully! You can now log in with your new password.',
          'success'
        );
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } catch (error: unknown) {
        await this.toastService.showToast(
          error instanceof Error
            ? error.message
            : 'Failed to reset password. Please try again later.',
          'danger'
        );
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}

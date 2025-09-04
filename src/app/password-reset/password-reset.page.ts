import { Component, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
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
    ReactiveFormsModule
  ]
})
export class PasswordResetPage {
  formErrorService = inject(FormErrorService);
  resetForm: FormGroup;
  isLoading = signal(false);
  passwordReset = signal(false);
  userId = input<string>('userId');
  secret = input<string>('secret');
  private readonly fb = inject(FormBuilder);
  private readonly appwriteService = inject(AppwriteService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  constructor() {
    this.resetForm = this.fb.nonNullable.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get password() {
    return this.resetForm.get('password');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (
      this.resetForm.valid &&
      !this.isLoading() &&
      this.userId() &&
      this.secret()
    ) {
      this.isLoading.set(true);

      try {
        await this.appwriteService.updateRecovery(
          this.userId(),
          this.secret(),
          this.resetForm.value.password
        );
        this.passwordReset.set(true);
        await this.toastService.showToast(
          'Password reset successfully! You can now log in with your new password.',
          'success'
        );
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } catch (error: any) {
        await this.toastService.showToast(
          error?.message ?? 'Failed to reset password. Please try again later.',
          'danger'
        );
      }

      this.isLoading.set(false);
    }
  }
}

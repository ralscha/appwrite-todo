import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-password-reset-request',
  templateUrl: './password-reset-request.page.html',
  styleUrl: './password-reset-request.page.css',
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
    ReactiveFormsModule,
    RouterLink,
    IonRouterLinkWithHref
  ]
})
export class PasswordResetRequestPage {
  formErrorService = inject(FormErrorService);
  resetForm: FormGroup;
  isLoading = signal(false);
  emailSent = signal(false);
  private readonly fb = inject(FormBuilder);
  private readonly appwriteService = inject(AppwriteService);
  private readonly toastService = inject(ToastService);

  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.resetForm.get('email');
  }

  async onSubmit() {
    if (this.resetForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      await this.appwriteService.requestPasswordReset(
        this.resetForm.value.email
      );
      this.emailSent.set(true);
      await this.toastService.showToast(
        'Password reset email sent! Check your inbox.',
        'success'
      );

      this.isLoading.set(false);
    }
  }
}

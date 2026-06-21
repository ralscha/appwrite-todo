import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  required,
  submit
} from '@angular/forms/signals';
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

interface PasswordResetRequestFormModel {
  email: string;
}

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
    RouterLink,
    IonRouterLinkWithHref,
    FormRoot,
    FormField
  ]
})
export class PasswordResetRequestPage {
  formErrorService = inject(FormErrorService);
  resetModel = signal<PasswordResetRequestFormModel>({ email: '' });
  resetForm = form(this.resetModel, path => {
    required(path.email);
    email(path.email);
  });
  isLoading = signal(false);
  emailSent = signal(false);
  private readonly appwriteService = inject(AppwriteService);
  private readonly toastService = inject(ToastService);

  async onSubmit() {
    await submit(this.resetForm, async () => {
      if (this.isLoading()) {
        return;
      }

      this.isLoading.set(true);
      try {
        await this.appwriteService.requestPasswordReset(
          this.resetModel().email
        );
        this.emailSent.set(true);
        await this.toastService.showToast(
          'Password reset email sent! Check your inbox.',
          'success'
        );
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}

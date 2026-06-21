import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  minLength,
  required,
  submit
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
  IonInputPasswordToggle,
  IonRouterLinkWithHref,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { AppwriteService } from '../services/appwrite.service';
import { ToastService } from '../services/toast.service';
import { FormErrorService } from '../services/form-error.service';

interface LoginFormModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
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
    IonInputPasswordToggle,
    FormRoot,
    FormField
  ]
})
export class LoginPage {
  formErrorService = inject(FormErrorService);
  loginModel = signal<LoginFormModel>({
    email: '',
    password: ''
  });
  loginForm = form(this.loginModel, path => {
    required(path.email);
    email(path.email);
    required(path.password);
    minLength(path.password, 6);
  });
  isLoading = signal(false);
  private readonly appwriteService = inject(AppwriteService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  async onSubmit() {
    await submit(this.loginForm, async () => {
      if (this.isLoading()) {
        return;
      }

      this.isLoading.set(true);
      try {
        await this.appwriteService.login(this.loginModel());
        await this.toastService.showToast('Login successful!', 'success');
        await this.router.navigate(['/todos']);
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}

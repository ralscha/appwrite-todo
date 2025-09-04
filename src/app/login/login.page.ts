import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
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
    ReactiveFormsModule,
    RouterLink,
    IonRouterLinkWithHref,
    IonInputPasswordToggle
  ]
})
export class LoginPage {
  formErrorService = inject(FormErrorService);
  loginForm: FormGroup;
  isLoading = signal(false);
  private fb = inject(FormBuilder);
  private appwriteService = inject(AppwriteService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async onSubmit() {
    if (this.loginForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      await this.appwriteService.login(this.loginForm.value);
      await this.toastService.showToast('Login successful!', 'success');
      await this.router.navigate(['/todos']);

      this.isLoading.set(false);
    }
  }
}

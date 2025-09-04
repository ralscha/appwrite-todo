import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
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
    ReactiveFormsModule,
    RouterLink,
    IonRouterLinkWithHref
  ]
})
export class RegisterPage {
  formErrorService = inject(FormErrorService);
  registerForm: FormGroup;
  isLoading = signal(false);
  private readonly fb = inject(FormBuilder);
  private readonly appwriteService = inject(AppwriteService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  constructor() {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        name: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get email() {
    return this.registerForm.get('email');
  }

  get name() {
    return this.registerForm.get('name');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get passwordConfirm() {
    return this.registerForm.get('passwordConfirm');
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');

    if (
      password &&
      passwordConfirm &&
      password.value !== passwordConfirm.value
    ) {
      passwordConfirm.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (passwordConfirm?.errors?.['passwordMismatch']) {
      delete passwordConfirm.errors['passwordMismatch'];
      if (Object.keys(passwordConfirm.errors).length === 0) {
        passwordConfirm.setErrors(null);
      }
    }

    return null;
  }

  async onSubmit() {
    if (this.registerForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      await this.appwriteService.register(this.registerForm.value);
      await this.toastService.showToast(
        'Registration successful! You can now login.',
        'success'
      );
      await this.router.navigate(['/login']);

      this.isLoading.set(false);
    }
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { AppwriteService } from '../services/appwrite.service';
import { UpdateProfileRequest, User } from '../models/user.model';
import { ToastService } from '../services/toast.service';
import { FormErrorService } from '../services/form-error.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonButtons,
    IonBackButton,
    ReactiveFormsModule,
    IonItem
  ]
})
export class ProfilePage implements OnInit {
  formErrorService = inject(FormErrorService);
  profileForm: FormGroup;
  isLoading = signal(false);
  currentUser = signal<User | null>(null);
  showPasswordField = signal(false);
  private originalEmail = '';
  private readonly fb = inject(FormBuilder);
  private readonly appwriteService = inject(AppwriteService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly alertController = inject(AlertController);

  constructor() {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: [''],
      password: ['']
    });
  }

  get email() {
    return this.profileForm.get('email');
  }

  get name() {
    return this.profileForm.get('name');
  }

  get password() {
    return this.profileForm.get('password');
  }

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    this.isLoading.set(true);
    const user = this.appwriteService.currentUser();
    if (user) {
      this.currentUser.set(user);
      this.originalEmail = user.email;
      this.profileForm.patchValue({
        email: user.email,
        name: user.name || ''
      });
    }
    this.isLoading.set(false);
  }

  onEmailChange() {
    const currentEmail = this.email?.value;
    const emailChanged = currentEmail !== this.originalEmail;
    this.showPasswordField.set(emailChanged);

    const passwordControl = this.password;
    if (emailChanged) {
      passwordControl?.setValidators([Validators.required]);
    } else {
      passwordControl?.clearValidators();
      passwordControl?.setValue('');
    }
    passwordControl?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.profileForm.valid && !this.isLoading()) {
      const user = this.currentUser();
      if (!user) return;

      this.isLoading.set(true);

      try {
        const formData = this.profileForm.value;
        const updateData: UpdateProfileRequest = {
          name: formData.name
        };

        if (this.showPasswordField()) {
          updateData.email = formData.email;
          updateData.password = formData.password;
        }

        const updatedUser =
          await this.appwriteService.updateProfile(updateData);
        this.currentUser.set(updatedUser);

        this.originalEmail = updatedUser.email;
        this.showPasswordField.set(false);
        this.password?.setValue('');

        await this.toastService.showToast(
          'Profile updated successfully!',
          'success'
        );
      } catch (error: any) {
        await this.toastService.showToast(
          error.message || 'Failed to update profile',
          'danger'
        );
      }

      this.isLoading.set(false);
    }
  }

  async requestPasswordReset() {
    const user = this.currentUser();
    if (!user) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Password Reset',
      message: `Send password reset email to ${user.email}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: async () => {
            await this.appwriteService.requestPasswordReset(user.email);
            await this.toastService.showToast(
              'Password reset email sent!',
              'success'
            );
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: async () => {
            await this.appwriteService.logout();
            await this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

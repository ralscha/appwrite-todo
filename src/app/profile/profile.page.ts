import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  required,
  submit
} from '@angular/forms/signals';
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

interface ProfileFormModel {
  email: string;
  name: string;
  password: string;
}

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
    IonItem,
    FormRoot,
    FormField
  ]
})
export class ProfilePage implements OnInit {
  formErrorService = inject(FormErrorService);
  profileModel = signal<ProfileFormModel>({
    email: '',
    name: '',
    password: ''
  });
  originalEmail = signal('');
  profileForm = form(this.profileModel, path => {
    required(path.email);
    email(path.email);
    required(path.password, {
      when: ({ valueOf }) => valueOf(path.email) !== this.originalEmail()
    });
  });
  isLoading = signal(false);
  currentUser = signal<User | null>(null);
  showPasswordField = computed(
    () => this.profileModel().email !== this.originalEmail()
  );
  private readonly appwriteService = inject(AppwriteService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly alertController = inject(AlertController);

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    this.isLoading.set(true);
    try {
      const user = this.appwriteService.currentUser();
      if (user) {
        this.currentUser.set(user);
        this.originalEmail.set(user.email);
        this.profileModel.set({
          email: user.email,
          name: user.name || '',
          password: ''
        });
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit() {
    await submit(this.profileForm, async () => {
      const user = this.currentUser();
      if (!user || this.isLoading()) {
        return;
      }

      this.isLoading.set(true);

      try {
        const formData = this.profileModel();
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
        this.originalEmail.set(updatedUser.email);
        this.profileModel.update(value => ({ ...value, password: '' }));

        await this.toastService.showToast(
          'Profile updated successfully!',
          'success'
        );
      } catch (error: unknown) {
        await this.toastService.showToast(
          error instanceof Error ? error.message : 'Failed to update profile',
          'danger'
        );
      } finally {
        this.isLoading.set(false);
      }
    });
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

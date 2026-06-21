import { inject, Service } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Service()
export class ToastService {
  private readonly toastController = inject(ToastController);

  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'medium' = 'medium',
    duration = 3000,
    position: 'top' | 'bottom' | 'middle' = 'top'
  ) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position
    });
    await toast.present();
  }
}

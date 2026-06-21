import { ErrorHandler, inject, Service, NgZone } from '@angular/core';
import { ToastService } from './toast.service';

@Service()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly toastService = inject(ToastService);
  private readonly zone = inject(NgZone);

  handleError(error: unknown): void {
    const unwrappedError = this.unwrapError(error);
    const message =
      unwrappedError instanceof Error
        ? unwrappedError.message
        : 'An unexpected error occurred';

    console.error(unwrappedError);

    this.zone.run(() => {
      this.toastService.showToast(message, 'danger');
    });
  }

  private unwrapError(error: unknown): unknown {
    if (
      typeof error === 'object' &&
      error !== null &&
      'originalError' in error
    ) {
      return error.originalError;
    }

    return error;
  }
}

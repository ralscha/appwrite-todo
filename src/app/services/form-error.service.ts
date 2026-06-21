import { Service } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Service()
export class FormErrorService {
  getErrorMessage(
    field: FieldTree<unknown> | null,
    controlName: string
  ): string {
    const state = field?.();
    if (!state || !state.invalid() || !state.touched()) {
      return '';
    }

    const error = state.errors()[0];
    if (!error) {
      return '';
    }

    if (error.message) {
      return error.message;
    }

    switch (error.kind) {
      case 'required':
        return `${this.capitalizeFirstLetter(controlName)} is required`;
      case 'email':
        return 'Please enter a valid email';
      case 'minLength':
        return `${this.capitalizeFirstLetter(controlName)} must be at least ${this.getErrorNumber(error, 'minLength')} characters`;
      case 'maxLength':
        return `${this.capitalizeFirstLetter(controlName)} cannot exceed ${this.getErrorNumber(error, 'maxLength')} characters`;
      case 'passwordMismatch':
        return 'Passwords do not match';
      default:
        return '';
    }
  }

  private getErrorNumber(error: object, key: string): number {
    const value = (error as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : 0;
  }

  private capitalizeFirstLetter(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

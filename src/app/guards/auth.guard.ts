import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';
import { filter, firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = async () => {
  const appwriteService = inject(AppwriteService);
  const router = inject(Router);

  await firstValueFrom(
    toObservable(appwriteService.authInitialized).pipe(
      filter((initialized: boolean) => initialized)
    )
  );

  if (appwriteService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const guestGuard: CanActivateFn = async () => {
  const appwriteService = inject(AppwriteService);
  const router = inject(Router);

  await firstValueFrom(
    toObservable(appwriteService.authInitialized).pipe(
      filter((initialized: boolean) => initialized)
    )
  );

  if (!appwriteService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/todos']);
    return false;
  }
};

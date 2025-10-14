import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../_services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError(error => {
      if (error) {
        switch (error.status) {
          case 400:
            if (error.error.errors) {
              const modelStateErrors = [];
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modelStateErrors.push(error.error.errors[key])
                }
              }
              throw modelStateErrors.flat();
            } else {
              notificationService.error(`Validation error: ${error.error.message}`);
            }
            break;
          case 401:
            notificationService.error('Unauthorized. Please sign in.');
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras: NavigationExtras = {state: {error: error.error}};
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            notificationService.error('Something unexpected happened. Please try again.');
            console.log(error);
            break;
        }
      }
      throw error;
    })
  )
}

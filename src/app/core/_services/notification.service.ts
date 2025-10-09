import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Shows a notification with appropriate styling based on type and theme
   */
  show(message: string, type: NotificationType = 'info', duration = 4000) {
    const config = this.getSnackBarConfig(type, duration);

    this.snackBar.open(message, 'Cerrar', config);
  }

  /**
   * Shows a success notification
   */
  success(message: string, duration = 4000) {
    this.show(message, 'success', duration);
  }

  /**
   * Shows an error notification
   */
  error(message: string, duration = 6000) {
    this.show(message, 'error', duration);
  }

  /**
   * Shows a warning notification
   */
  warning(message: string, duration = 5000) {
    this.show(message, 'warning', duration);
  }

  /**
   * Shows an info notification
   */
  info(message: string, duration = 4000) {
    this.show(message, 'info', duration);
  }

  /**
   * Gets snackbar configuration based on notification type and current theme
   */
  private getSnackBarConfig(type: NotificationType, duration: number): MatSnackBarConfig {
    const isDarkTheme = document.body.classList.contains('dark-theme');

    // Base configuration
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: []
    };

    // Ensure panelClass is an array
    const panelClasses = Array.isArray(config.panelClass) ? config.panelClass : [];

    // Add theme class
    panelClasses.push(isDarkTheme ? 'dark-theme' : 'light-theme');

    // Add notification type class
    switch (type) {
      case 'success':
        panelClasses.push('notification-success');
        break;
      case 'error':
        panelClasses.push('notification-error');
        break;
      case 'warning':
        panelClasses.push('notification-warning');
        break;
      case 'info':
      default:
        panelClasses.push('notification-info');
        break;
    }

    config.panelClass = panelClasses;
    return config;
  }
}

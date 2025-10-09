import { inject, Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  busyRequestCount = 0;

  private spinnerService = inject(NgxSpinnerService);

  busy() {
    this.busyRequestCount++;

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const spinnerColor = '#007ACC';
    const backgroundColor = isDarkTheme
      ? 'rgba(15, 25, 35, 0.8)'
      : 'rgba(255, 255, 255, 0.8)';

    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: backgroundColor,
      color: spinnerColor,
      size: 'medium'
    });
  }

  idle() {
    this.busyRequestCount--;
    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.spinnerService.hide();
    }
  }
}

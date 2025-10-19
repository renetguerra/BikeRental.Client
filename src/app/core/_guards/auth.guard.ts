import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { AuthStore } from '../_stores/auth.store';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const authStore = inject(AuthStore);
  const toastr = inject(ToastrService);

  // Allow if AccountService or AuthStore already has a current user.
  const accountUser = accountService.currentUser();
  const storeUser = authStore.currentUser();
  if (accountUser || storeUser) return true;
  else {
    toastr.error('you shall not pass!');
    return false;
  }
};

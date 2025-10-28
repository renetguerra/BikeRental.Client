import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { TranslocoService } from '@jsverse/transloco';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastrService);
  const transloco = inject(TranslocoService);

  if (accountService.roles().includes('Admin') || accountService.roles().includes('Moderator')) {
    return true;
  } else {
    toastr.error(transloco.translate('adminGuard.error'));
    return false;
  }
};

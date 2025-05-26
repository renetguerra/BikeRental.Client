import { Directive, TemplateRef, ViewContainerRef, inject, input } from '@angular/core';
import { AccountService } from '../../core/_services/account.service';

@Directive({
    selector: '[appHasRole]',
    standalone: true
})
export class HasRoleDirective {
  private accountService = inject(AccountService);  
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);

  appHasRole = input<string[]>([]);
  user = this.accountService.currentUser();
  
  ngOnInit(): void {
    if (this.user?.roles.some(r => this.appHasRole().includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }

}

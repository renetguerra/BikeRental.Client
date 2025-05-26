import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatBadgeModule} from '@angular/material/badge';
import { AccountService } from 'src/app/core/_services/account.service';
import { HasRoleDirective } from 'src/app/shared/_directives/has-role.directive';
import { MemberStore } from 'src/app/core/_stores/member.store';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
    imports: [RouterLink, RouterLinkActive, HasRoleDirective, BsDropdownModule, CollapseModule, FormsModule, 
      MatBadgeModule, MatButtonModule, MatIconModule
    ]
})
export class NavComponent {
  model: any = {}

  isCollapsed = true;

  private router = inject(Router);  
  private accountService = inject(AccountService);    

  private memberStore = inject(MemberStore);

  user = this.memberStore.user;  

  constructor() { }
 
  login() {
    this.accountService.login(this.model).subscribe({
      next: _ => {                       
        this.router.navigateByUrl('/bikes');
        this.model = {}
      }
    })
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');        
  }    

}

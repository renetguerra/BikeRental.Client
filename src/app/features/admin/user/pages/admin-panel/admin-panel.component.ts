import { Component } from '@angular/core';
import { UserManagementComponent } from '../../components/user-management/user-management.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { HasRoleDirective } from 'src/app/shared/_directives/has-role.directive';
import { PhotoManagementComponent } from '../../components/photo-management/photo-management.component';

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.css'],
    imports: [TabsModule, HasRoleDirective, UserManagementComponent, PhotoManagementComponent]
})
export class AdminPanelComponent {

}

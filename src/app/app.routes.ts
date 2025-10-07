import { Routes } from "@angular/router";
import { adminGuard } from "./core/_guards/admin.guard";
import { authGuard } from "./core/_guards/auth.guard";
import { preventUnsavedChangesGuard } from "./core/_guards/prevent-unsaved-changes.guard";
import { memberDetailedResolver } from "./core/_resolvers/member-detailed.resolver";
import { AdminPanelComponent } from "./features/admin/pages/admin-panel/admin-panel.component";
import { NotFoundComponent } from "./features/errors/not-found/not-found.component";
import { HomeComponent } from "./features/home/home.component";
import { MemberDetailComponent } from "./features/members/pages/member-detail/member-detail.component";
import { MemberEditComponent } from "./features/members/pages/member-edit/member-edit.component";
import { MemberListComponent } from "./features/members/pages/member-list/member-list.component";
import { BikeListComponent } from "./features/bikes/pages/bike-list/bike-list.component";
import { BikeDetailComponent } from "./features/bikes/pages/bike-detail/bike-detail.component";
import { bikeDetailedResolver } from "./core/_resolvers/bike-detailed.resolver";
import { SignInComponent } from "./features/sign-in/sign-in.component";
import { RegisterComponent } from "./features/register/register.component";

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'signin', component: SignInComponent },
    { path: 'login', redirectTo: '/signin' }, // Alias for backward compatibility
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            { path: 'members', component: MemberListComponent },
            { path: 'bikes', component: BikeListComponent },
            { path: 'member/:username', component: MemberDetailComponent, resolve: { member: memberDetailedResolver } },
            { path: 'bike/:id', component: BikeDetailComponent, resolve: { bike: bikeDetailedResolver } },
            { path: 'member/profile/edit', component: MemberEditComponent, canDeactivate: [preventUnsavedChangesGuard] },                                    
            { path: 'admin', component: AdminPanelComponent, canActivate: [adminGuard] },  
            // { path: 'admin-bike', component: BikeManagementComponent, canActivate: [adminGuard] },                               
        ]
    },    
    { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];
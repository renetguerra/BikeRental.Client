import { computed, inject, Injectable, signal } from "@angular/core";
import { User } from "../_models/user";
import { AdminService } from "../_services/admin.service";

@Injectable({ providedIn: 'root' })
export class AdminUserStore {
    private adminService = inject(AdminService);

    private _users = signal<User[]>([]);    
  
    readonly users = computed(() => this._users());    
  
    setUsers(users: User[]) {
      this._users.set(users);            
    }
  
    updateUserRoles(username: string, roles: string[]) {
      const updatedUsers = this._users().map(user => {
        if (user.username === username) {
          return { ...user, roles };
        }
        return user;
      });
      this._users.set(updatedUsers);
    }        
  }
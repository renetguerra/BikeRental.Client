import { computed, inject, Injectable, signal } from "@angular/core";
import { User } from "../_models/user";
import { AdminService } from "../_services/admin.service";

@Injectable({ providedIn: 'root' })
export class AdminUserStore {
    private adminService = inject(AdminService);

    private _users = signal<User[]>([]);
    private _canSendMessages = signal<{ [username: string]: boolean }>({});
  
    readonly users = computed(() => this._users());
    readonly canSendMessages = computed(() => this._canSendMessages());
  
    setUsers(users: User[]) {
      this._users.set(users);
      const messagePermissions: { [username: string]: boolean } = {};
      users.forEach(user => {
        messagePermissions[user.username] = user.canSendMessages;
      });
      this._canSendMessages.set(messagePermissions);
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
  
    toggleSendMessagesPermission(username: string) {
      const currentState = this._canSendMessages()[username];
      this._canSendMessages.update(state => ({
        ...state,
        [username]: !currentState
      }));
    }
  
    updateUserCanSendMessages(username: string, canSendMessages: boolean) {
      const updatedPermissions = { ...this._canSendMessages(), [username]: canSendMessages };
      this._canSendMessages.set(updatedPermissions);

      this.adminService.updateCanSendMessages(username, canSendMessages);       
    }
  }
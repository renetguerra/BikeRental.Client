import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  private toastr = inject(ToastrService);
  private router = inject(Router);

  /**
   * Create and establish SignalR hub connection for real-time presence tracking
   * @param user - Authenticated user object containing access token
   */
  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Reconnection intervals in ms
      .build();

    // Establish connection with improved error handling
    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection established');
      })
      .catch(error => {
        console.error('SignalR connection error:', error);
        // Avoid toastr notifications here to prevent spam
      });

    // Handle reconnection events
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR attempting to reconnect...');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected successfully');
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
      // Clear online users state when connection is lost
      this.onlineUsersSource.next([]);
    });

    // Register event handlers with error handling
    this.hubConnection.on('UserIsOnline', username => {
      try {
        this.onlineUsers$.pipe(take(1)).subscribe({
          next: usernames => this.onlineUsersSource.next([...usernames, username]),
          error: error => console.error('Error handling UserIsOnline:', error)
        });
      } catch (error) {
        console.error('Error in UserIsOnline handler:', error);
      }
    });

    this.hubConnection.on('UserIsOffline', username => {
      try {
        this.onlineUsers$.pipe(take(1)).subscribe({
          next: usernames => this.onlineUsersSource.next([...usernames.filter(x => x !== username)]),
          error: error => console.error('Error handling UserIsOffline:', error)
        });
      } catch (error) {
        console.error('Error in UserIsOffline handler:', error);
      }
    });

    this.hubConnection.on('GetOnlineUsers', usernames => {
      try {
        this.onlineUsersSource.next(usernames);
      } catch (error) {
        console.error('Error handling GetOnlineUsers:', error);
      }
    });
  }

  /**
   * Stop the SignalR hub connection gracefully
   */
  stopHubConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('SignalR connection stopped successfully');
          this.onlineUsersSource.next([]);
        })
        .catch(error => {
          console.error('Error stopping SignalR connection:', error);
        })
        .finally(() => {
          this.hubConnection = undefined;
        });
    }
  }

  /**
   * Get current connection state
   * @returns Connection state as string
   */
  getConnectionState(): string {
    return this.hubConnection?.state || 'Disconnected';
  }

  /**
   * Manually reconnect to SignalR hub if disconnected
   * @param user - Authenticated user object for reconnection
   */
  async reconnect(user: User): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === 'Disconnected') {
      try {
        await this.hubConnection.start();
        console.log('Manual reconnection successful');
      } catch (error) {
        console.error('Manual reconnection failed:', error);
        // If reconnection fails, create a new connection
        this.stopHubConnection();
        this.createHubConnection(user);
      }
    }
  }
}

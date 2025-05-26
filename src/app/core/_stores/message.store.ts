import { inject, signal, Injectable, DestroyRef } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { Member } from '../_models/member';
import { MemberStore } from './member.store';
import { Message } from '../_models/message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Pagination } from '../_models/pagination';
import { MessageParams } from '../_models/messageParams';

@Injectable({ providedIn: 'root' })
export class MessageStore {
  private messageService = inject(MessageService);
  private memberStore = inject(MemberStore);

  private messageParams = new MessageParams();

  messageContent = signal('');
  member = this.memberStore.member;
  members = this.memberStore.members;

  private _thread = signal<Message[]>([]);
  readonly thread = this._thread.asReadonly();
  
  private readonly _messages = signal<Message[]>([]);
  readonly messages = this._messages.asReadonly();
  readonly pagination = signal<Pagination | undefined>(undefined);
  readonly container = this.messageParams.container;
  loading = signal<boolean>(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.messageService.messageThread$
      .pipe(        
        takeUntilDestroyed(destroyRef))
      .subscribe(messages => {        
          this._thread.set(messages);        
      });
  }

  loadMessages() {
    this.loading.set(true);
    this.messageService.getMessages(this.messageParams.pageNumber(), this.messageParams.pageSize, this.messageParams.container()).subscribe({
      next: response => {
        this._messages.set(response.result!);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      }
    })
  }

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id).subscribe({
      next: _ => this.messages()?.splice(this.messages().findIndex(m => m.id === id), 1)
    })
  }

  setContainer(value: 'Unread' | 'Inbox' | 'Outbox'): void {
    this.messageParams.container.set(value);
    this.messageParams.pageNumber.set(1);
    this.loadMessages();
  }

  pageChanged(page: number) {
    if (this.messageParams.pageNumber() !== page) {
      this.messageParams.pageNumber.set(page);
      this.loadMessages();
    }
  }
  
  sendMessageToOne(username: string) {
    this.messageService.sendMessage(username, this.messageContent());    
  }

  sendMessageToAll() {    
    const messages = this.members().map((member: Member) => {        
        this.messageService.sendMessage(member.username, this.messageContent());
    });
    return Promise.all(messages);
  }

  getThread(username: string) {
    this.messageService.getMessageThread(username).subscribe({
      next: messages => this._thread.set(messages)
    });
  }

  sendMessage(username: string, content: string) {    
    return this.messageService.sendMessage(username, content);
  }
}

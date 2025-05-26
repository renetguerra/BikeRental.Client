import { signal } from "@angular/core";
import { Params } from "./params";

export class MessageParams extends Params {
        
    readonly container = signal<'Unread' | 'Inbox' | 'Outbox'>('Unread');
    
}
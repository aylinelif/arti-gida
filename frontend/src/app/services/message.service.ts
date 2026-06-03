import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ConversationRead, MessageRead } from '../models/message';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly baseUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getConversations(): Observable<ConversationRead[]> {
    return this.http.get<ConversationRead[]>(`${this.baseUrl}/conversations`);
  }

  getHistory(otherUserId: number): Observable<MessageRead[]> {
    return this.http.get<MessageRead[]>(`${this.baseUrl}/history/${otherUserId}`);
  }

  sendMessage(receiverId: number, content: string, listingId?: number): Observable<MessageRead> {
    return this.http.post<MessageRead>(this.baseUrl, {
      receiverId,
      content,
      listingId,
    });
  }
}

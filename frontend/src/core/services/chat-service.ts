import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ChatMessage, Conversation } from '../../interfaces/chat-message';

@Service()
export class ChatService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getConversations() {
    return this.http.get<Conversation[]>(`${this.baseUrl}/messages`);
  }

  getConversation(memberId: string) {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/messages/${memberId}`);
  }
}

import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ChatService } from '../../core/services/chat-service';
import { Conversation } from '../../interfaces/chat-message';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-messages',
  styleUrl: './messages.css',
  templateUrl: './messages.html',
})
export class Messages implements OnInit {
  private chatService = inject(ChatService);

  protected conversations = signal<Conversation[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  ngOnInit(): void {
    void this.loadConversations();
  }

  private async loadConversations(): Promise<void> {
    try {
      this.conversations.set(await firstValueFrom(this.chatService.getConversations()));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not load messages.');
    } finally {
      this.loading.set(false);
    }
  }
}

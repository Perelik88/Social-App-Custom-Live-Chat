import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { AccountService } from '../../../../core/services/account-service';
import { ChatService } from '../../../../core/services/chat-service';
import { RealtimeChatService } from '../../../../core/services/realtime-chat-service';
import { ChatMessage } from '../../../../interfaces/chat-message';
import { MemberService } from '../../../../core/services/member-service';

@Component({
  imports: [DatePipe, FormsModule],
  selector: 'app-member-messages',
  styleUrl: './member-messages.css',
  templateUrl: './member-messages.html',
})
export class MemberMessages implements OnInit, OnDestroy {
  private accountService = inject(AccountService);
  private chatService = inject(ChatService);
  private memberService = inject(MemberService);
  private realtime = inject(RealtimeChatService);
  private messageSubscription?: Subscription;
  private errorSubscription?: Subscription;

  protected member = this.memberService.member;
  protected connected = this.realtime.connected;
  protected messages = signal<ChatMessage[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected draft = '';

  ngOnInit(): void {
    const member = this.member();
    const currentUser = this.accountService.currentUser();
    if (!member || !currentUser) {
      this.error.set('A member and signed-in user are required to open chat.');
      this.loading.set(false);
      return;
    }

    if (member.id === currentUser.id) {
      this.error.set('You cannot start a conversation with yourself.');
      this.loading.set(false);
      return;
    }

    this.messageSubscription = this.realtime.messages.subscribe(message => {
      if (
        (message.senderId === currentUser.id && message.recipientId === member.id) ||
        (message.senderId === member.id && message.recipientId === currentUser.id)
      ) {
        this.addMessages([message]);
      }
    });
    this.errorSubscription = this.realtime.errors.subscribe(message => this.error.set(message));
    void this.loadConversation(member.id, currentUser.token);
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.errorSubscription?.unsubscribe();
    this.realtime.disconnect();
  }

  sendMessage(): void {
    const content = this.draft.trim();
    const member = this.member();
    if (!content || !member) {
      return;
    }

    try {
      this.realtime.sendMessage(member.id, content);
      this.draft = '';
      this.error.set(null);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not send the message.');
    }
  }

  protected isOwnMessage(message: ChatMessage): boolean {
    return message.senderId === this.accountService.currentUser()?.id;
  }

  protected accountMemberId(): string | undefined {
    return this.accountService.currentUser()?.id;
  }

  private async loadConversation(memberId: string, token: string): Promise<void> {
    try {
      await this.realtime.connect(token);
      const history = await firstValueFrom(this.chatService.getConversation(memberId));
      this.addMessages(history);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not load the conversation.');
    } finally {
      this.loading.set(false);
    }
  }

  private addMessages(incoming: ChatMessage[]): void {
    const messagesById = new Map(this.messages().map(message => [message.id, message]));
    for (const message of incoming) {
      messagesById.set(message.id, message);
    }
    this.messages.set([...messagesById.values()].sort(
      (left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime(),
    ));
  }
}

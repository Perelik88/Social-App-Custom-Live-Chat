import { Service, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatMessage } from '../../interfaces/chat-message';

@Service()
export class RealtimeChatService {
  connected = signal(false);
  messages = new Subject<ChatMessage>();
  errors = new Subject<string>();

  private socket: WebSocket | null = null;
  private token: string | null = null;
  private intentionalDisconnect = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private connecting: Promise<void> | null = null;

  connect(token: string): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN && this.token === token) {
      return Promise.resolve();
    }

    if (this.connecting && this.token === token) {
      return this.connecting;
    }

    this.disconnect();
    this.token = token;
    this.intentionalDisconnect = false;
    const connecting = this.openSocket(token).finally(() => {
      if (this.connecting === connecting) {
        this.connecting = null;
      }
    });
    this.connecting = connecting;
    return connecting;
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    this.token = null;
    this.clearReconnectTimer();
    const socket = this.socket;
    this.socket = null;
    this.connected.set(false);
    this.reconnectAttempts = 0;
    if (socket && socket.readyState < WebSocket.CLOSING) {
      socket.close(1000, 'Chat closed');
    }
  }

  sendMessage(recipientId: string, content: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('The chat connection is not ready.');
    }

    this.socket.send(JSON.stringify({
      type: 'chat.send',
      recipientId,
      content,
    }));
  }

  private openSocket(token: string): Promise<void> {
    const socket = new WebSocket(this.createSocketUrl(token));
    this.socket = socket;

    return new Promise<void>((resolve, reject) => {
      let settled = false;

      socket.addEventListener('open', () => {
        if (this.socket !== socket) {
          socket.close();
          return;
        }

        this.connected.set(true);
        this.reconnectAttempts = 0;
        settled = true;
        resolve();
      });

      socket.addEventListener('message', event => this.handleServerMessage(event.data));
      socket.addEventListener('error', () => {
        if (!settled) {
          settled = true;
          reject(new Error('Could not connect to chat.'));
        }
      });
      socket.addEventListener('close', () => {
        if (this.socket === socket) {
          this.socket = null;
        }
        this.connected.set(false);

        if (!settled) {
          settled = true;
          reject(new Error('The chat connection closed before it was ready.'));
        } else if (!this.intentionalDisconnect && this.token === token) {
          this.errors.next('The chat connection closed. Reconnecting…');
        }

        if (!this.intentionalDisconnect && this.token === token) {
          this.scheduleReconnect(token);
        }
      });
    });
  }

  private scheduleReconnect(token: string): void {
    this.clearReconnectTimer();
    const delay = Math.min(30_000, 1_000 * 2 ** Math.min(this.reconnectAttempts, 5));
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.intentionalDisconnect && this.token === token) {
        void this.openSocket(token).catch(error => {
          this.errors.next(error instanceof Error ? error.message : 'Could not reconnect to chat.');
        });
      }
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private createSocketUrl(token: string): string {
    const url = new URL(environment.apiUrl, window.location.origin);
    const apiPath = url.pathname.replace(/\/+$/, '');
    const basePath = apiPath.endsWith('/api') ? apiPath.slice(0, -4) : apiPath;
    url.pathname = `${basePath}/api/realtime`.replace(/\/{2,}/g, '/');
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.searchParams.set('access_token', token);
    return url.toString();
  }

  private handleServerMessage(data: unknown): void {
    if (typeof data !== 'string') {
      this.errors.next('Received an unsupported chat response.');
      return;
    }

    let event: unknown;
    try {
      event = JSON.parse(data);
    } catch {
      this.errors.next('Received an invalid chat response.');
      return;
    }

    if (!isRecord(event) || typeof event['type'] !== 'string' || !isRecord(event['payload'])) {
      this.errors.next('Received an invalid chat response.');
      return;
    }

    if (event['type'] === 'chat.message' && isChatMessage(event['payload'])) {
      this.messages.next(event['payload']);
      return;
    }

    if (event['type'] === 'error' && typeof event['payload']['message'] === 'string') {
      this.errors.next(event['payload']['message']);
      return;
    }

    this.errors.next('Received an unknown chat event.');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isChatMessage(value: Record<string, unknown>): value is Record<string, unknown> & ChatMessage {
  return typeof value['id'] === 'number' &&
    typeof value['senderId'] === 'string' &&
    typeof value['recipientId'] === 'string' &&
    typeof value['content'] === 'string' &&
    typeof value['sentAt'] === 'string';
}

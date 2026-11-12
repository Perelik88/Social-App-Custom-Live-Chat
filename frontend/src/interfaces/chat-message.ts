export interface ChatMessage {
  id: number;
  senderId: string;
  recipientId: string;
  content: string;
  sentAt: string;
}

export interface Conversation {
  memberId: string;
  displayName: string;
  imageUrl: string | null;
  lastMessage: string;
  sentAt: string;
}

/**
 * Chat-related types for the JamMatch application
 */

export interface Message {
  id: string;
  band_id: string;
  user_id: string;
  content: string;
  message_type: "text" | "system";
  created_at: string;
}

export interface MessageWithUser extends Message {
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface PaginatedMessages {
  messages: MessageWithUser[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface SendMessageData {
  content: string;
  message_type?: "text" | "system";
}

export interface ChatState {
  messages: MessageWithUser[];
  isLoading: boolean;
  hasMore: boolean;
  nextCursor?: string;
  isConnected: boolean;
  error?: string;
}

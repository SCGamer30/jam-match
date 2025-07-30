import { supabase, Message, Tables } from "../config/supabase";

export interface CreateMessageData {
  band_id: string;
  user_id: string;
  content: string;
  message_type?: "text" | "system";
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

/**
 * Message service for handling chat message operations
 */
export class MessageService {
  /**
   * Create a new message
   */
  static async createMessage(messageData: CreateMessageData): Promise<Message> {
    // Validate and sanitize content
    const sanitizedContent = this.sanitizeMessageContent(messageData.content);

    if (!sanitizedContent.trim()) {
      throw new Error("Message content cannot be empty");
    }

    const { data, error } = await supabase
      .from(Tables.MESSAGES)
      .insert({
        band_id: messageData.band_id,
        user_id: messageData.user_id,
        content: sanitizedContent,
        message_type: messageData.message_type || "text",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }

    return data;
  }

  /**
   * Get messages for a band with pagination
   */
  static async getMessages(
    bandId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<PaginatedMessages> {
    let query = supabase
      .from(Tables.MESSAGES)
      .select(
        `
        *,
        user:users!messages_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("band_id", bandId)
      .order("created_at", { ascending: false })
      .limit(limit + 1); // Get one extra to check if there are more

    // Add cursor-based pagination
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    const messages = data || [];
    const hasMore = messages.length > limit;

    // Remove the extra message if we have more
    if (hasMore) {
      messages.pop();
    }

    // Reverse to get chronological order (oldest first)
    const orderedMessages = messages.reverse();

    return {
      messages: orderedMessages as MessageWithUser[],
      hasMore,
      nextCursor:
        hasMore && messages.length > 0
          ? messages[messages.length - 1].created_at
          : undefined,
    };
  }

  /**
   * Get recent messages for a band (for real-time updates)
   */
  static async getRecentMessages(
    bandId: string,
    since?: string,
    limit: number = 20
  ): Promise<MessageWithUser[]> {
    let query = supabase
      .from(Tables.MESSAGES)
      .select(
        `
        *,
        user:users!messages_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq("band_id", bandId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (since) {
      query = query.gt("created_at", since);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch recent messages: ${error.message}`);
    }

    return (data || []) as MessageWithUser[];
  }

  /**
   * Check if user is a member of the band (for authorization)
   */
  static async isUserBandMember(
    userId: string,
    bandId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from(Tables.BANDS)
      .select("drummer_id, guitarist_id, bassist_id, singer_id")
      .eq("id", bandId)
      .single();

    if (error || !data) {
      return false;
    }

    return [
      data.drummer_id,
      data.guitarist_id,
      data.bassist_id,
      data.singer_id,
    ].includes(userId);
  }

  /**
   * Create a real-time subscription for new messages in a band
   */
  static createMessageSubscription(
    bandId: string,
    onMessage: (message: Message) => void,
    onError?: (error: Error) => void
  ) {
    return supabase
      .channel(`messages:${bandId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: Tables.MESSAGES,
          filter: `band_id=eq.${bandId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: Tables.MESSAGES,
        },
        (payload) => {
          if (payload.errors && onError) {
            onError(new Error("Real-time subscription error"));
          }
        }
      )
      .subscribe();
  }

  /**
   * Sanitize message content to prevent XSS and other security issues
   */
  private static sanitizeMessageContent(content: string): string {
    if (typeof content !== "string") {
      return "";
    }

    // Basic sanitization - remove potentially dangerous characters
    return content
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate message data before creation
   */
  static validateMessageData(messageData: CreateMessageData): void {
    if (!messageData.band_id || typeof messageData.band_id !== "string") {
      throw new Error("Valid band_id is required");
    }

    if (!messageData.user_id || typeof messageData.user_id !== "string") {
      throw new Error("Valid user_id is required");
    }

    if (!messageData.content || typeof messageData.content !== "string") {
      throw new Error("Message content is required");
    }

    if (messageData.content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    if (messageData.content.length > 1000) {
      throw new Error("Message content is too long (max 1000 characters)");
    }

    if (
      messageData.message_type &&
      !["text", "system"].includes(messageData.message_type)
    ) {
      throw new Error("Invalid message type");
    }
  }
}

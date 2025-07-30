import { MessageService, CreateMessageData } from "../messageService";
import { supabase } from "../../config/supabase";

// Mock Supabase
jest.mock("../../config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
  },
  Tables: {
    MESSAGES: "messages",
    BANDS: "bands",
    USERS: "users",
    COMPATIBILITY_SCORES: "compatibility_scores",
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("MessageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMessage", () => {
    const mockMessageData: CreateMessageData = {
      band_id: "band-123",
      user_id: "user-123",
      content: "Hello, band!",
      message_type: "text",
    };

    const mockCreatedMessage = {
      id: "message-123",
      band_id: "band-123",
      user_id: "user-123",
      content: "Hello, band!",
      message_type: "text",
      created_at: "2024-01-01T00:00:00Z",
    };

    it("should create a message successfully", async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCreatedMessage,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await MessageService.createMessage(mockMessageData);

      expect(mockSupabase.from).toHaveBeenCalledWith("messages");
      expect(mockQuery.insert).toHaveBeenCalledWith({
        band_id: "band-123",
        user_id: "user-123",
        content: "Hello, band!",
        message_type: "text",
      });
      expect(result).toEqual(mockCreatedMessage);
    });

    it("should sanitize message content", async () => {
      const maliciousData: CreateMessageData = {
        band_id: "band-123",
        user_id: "user-123",
        content: "<script>alert('xss')</script>Hello <b>world</b>!",
        message_type: "text",
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockCreatedMessage, content: "Hello world!" },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await MessageService.createMessage(maliciousData);

      expect(mockQuery.insert).toHaveBeenCalledWith({
        band_id: "band-123",
        user_id: "user-123",
        content: "Hello world!",
        message_type: "text",
      });
    });

    it("should throw error for empty content", async () => {
      const emptyContentData: CreateMessageData = {
        band_id: "band-123",
        user_id: "user-123",
        content: "   ",
        message_type: "text",
      };

      await expect(
        MessageService.createMessage(emptyContentData)
      ).rejects.toThrow("Message content cannot be empty");
    });

    it("should handle database errors", async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(
        MessageService.createMessage(mockMessageData)
      ).rejects.toThrow("Failed to create message: Database error");
    });
  });

  describe("getMessages", () => {
    const mockMessages = [
      {
        id: "message-1",
        band_id: "band-123",
        user_id: "user-1",
        content: "First message",
        message_type: "text",
        created_at: "2024-01-01T00:00:00Z",
        user: {
          id: "user-1",
          name: "John Doe",
          avatar_url: "avatar1.jpg",
        },
      },
      {
        id: "message-2",
        band_id: "band-123",
        user_id: "user-2",
        content: "Second message",
        message_type: "text",
        created_at: "2024-01-01T01:00:00Z",
        user: {
          id: "user-2",
          name: "Jane Smith",
          avatar_url: "avatar2.jpg",
        },
      },
    ];

    it("should get messages with pagination", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
      };

      mockQuery.limit.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await MessageService.getMessages("band-123", 50);

      expect(mockSupabase.from).toHaveBeenCalledWith("messages");
      expect(mockQuery.select).toHaveBeenCalledWith(`
        *,
        user:users!messages_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `);
      expect(mockQuery.eq).toHaveBeenCalledWith("band_id", "band-123");
      expect(mockQuery.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(mockQuery.limit).toHaveBeenCalledWith(51);
      expect(result.messages).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it("should handle cursor-based pagination", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
      };

      mockQuery.lt.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await MessageService.getMessages("band-123", 50, "2024-01-01T02:00:00Z");

      expect(mockQuery.lt).toHaveBeenCalledWith(
        "created_at",
        "2024-01-01T02:00:00Z"
      );
    });

    it("should handle database errors", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };

      mockQuery.limit.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await expect(MessageService.getMessages("band-123")).rejects.toThrow(
        "Failed to fetch messages: Database error"
      );
    });
  });

  describe("getRecentMessages", () => {
    const mockRecentMessages = [
      {
        id: "message-3",
        band_id: "band-123",
        user_id: "user-1",
        content: "Recent message",
        message_type: "text",
        created_at: "2024-01-01T02:00:00Z",
        user: {
          id: "user-1",
          name: "John Doe",
          avatar_url: "avatar1.jpg",
        },
      },
    ];

    it("should get recent messages", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
      };

      mockQuery.limit.mockResolvedValue({
        data: mockRecentMessages,
        error: null,
      });

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await MessageService.getRecentMessages("band-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("messages");
      expect(mockQuery.eq).toHaveBeenCalledWith("band_id", "band-123");
      expect(mockQuery.order).toHaveBeenCalledWith("created_at", {
        ascending: true,
      });
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockRecentMessages);
    });

    it("should filter messages since timestamp", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
      };

      mockQuery.gt.mockResolvedValue({
        data: mockRecentMessages,
        error: null,
      });

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await MessageService.getRecentMessages(
        "band-123",
        "2024-01-01T01:00:00Z"
      );

      expect(mockQuery.gt).toHaveBeenCalledWith(
        "created_at",
        "2024-01-01T01:00:00Z"
      );
    });
  });

  describe("isUserBandMember", () => {
    const mockBandData = {
      drummer_id: "user-1",
      guitarist_id: "user-2",
      bassist_id: "user-3",
      singer_id: "user-4",
    };

    it("should return true for band member", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockBandData,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await MessageService.isUserBandMember(
        "user-2",
        "band-123"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("bands");
      expect(mockQuery.select).toHaveBeenCalledWith(
        "drummer_id, guitarist_id, bassist_id, singer_id"
      );
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "band-123");
      expect(result).toBe(true);
    });

    it("should return false for non-member", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockBandData,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await MessageService.isUserBandMember(
        "user-5",
        "band-123"
      );

      expect(result).toBe(false);
    });

    it("should return false for database errors", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Band not found" },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await MessageService.isUserBandMember(
        "user-1",
        "band-123"
      );

      expect(result).toBe(false);
    });
  });

  describe("createMessageSubscription", () => {
    it("should create real-time subscription", () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      };

      mockSupabase.channel.mockReturnValue(mockChannel as any);

      const onMessage = jest.fn();
      const onError = jest.fn();

      MessageService.createMessageSubscription("band-123", onMessage, onError);

      expect(mockSupabase.channel).toHaveBeenCalledWith("messages:band-123");
      expect(mockChannel.on).toHaveBeenCalledWith(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: "band_id=eq.band-123",
        },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe("validateMessageData", () => {
    const validData: CreateMessageData = {
      band_id: "band-123",
      user_id: "user-123",
      content: "Valid message",
      message_type: "text",
    };

    it("should validate valid message data", () => {
      expect(() => MessageService.validateMessageData(validData)).not.toThrow();
    });

    it("should throw error for missing band_id", () => {
      const invalidData = { ...validData, band_id: "" };
      expect(() => MessageService.validateMessageData(invalidData)).toThrow(
        "Valid band_id is required"
      );
    });

    it("should throw error for missing user_id", () => {
      const invalidData = { ...validData, user_id: "" };
      expect(() => MessageService.validateMessageData(invalidData)).toThrow(
        "Valid user_id is required"
      );
    });

    it("should throw error for empty content", () => {
      const invalidData = { ...validData, content: "" };
      expect(() => MessageService.validateMessageData(invalidData)).toThrow(
        "Message content is required"
      );
    });

    it("should throw error for whitespace-only content", () => {
      const invalidData = { ...validData, content: "   " };
      expect(() => MessageService.validateMessageData(invalidData)).toThrow(
        "Message content cannot be empty"
      );
    });

    it("should throw error for content too long", () => {
      const invalidData = { ...validData, content: "a".repeat(1001) };
      expect(() => MessageService.validateMessageData(invalidData)).toThrow(
        "Message content is too long (max 1000 characters)"
      );
    });

    it("should throw error for invalid message type", () => {
      const invalidData = { ...validData, message_type: "invalid" as any };
      expect(() => MessageService.validateMessageData(invalidData)).toThrow(
        "Invalid message type"
      );
    });
  });
});

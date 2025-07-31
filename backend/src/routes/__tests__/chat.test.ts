import request from "supertest";
import express from "express";
import chatRoutes from "../chat";
import { authenticateToken } from "../../middleware/auth";
import { MessageService } from "../../services/messageService";

// Mock dependencies
jest.mock("../../middleware/auth");
jest.mock("../../services/messageService");
jest.mock("../../config/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: "user-123",
              name: "John Doe",
              avatar_url: "avatar.jpg",
            },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

const mockAuthenticateToken = authenticateToken as jest.MockedFunction<
  typeof authenticateToken
>;
const mockMessageService = MessageService as jest.Mocked<typeof MessageService>;

const app = express();
app.use(express.json());
app.use("/chat", chatRoutes);

const mockUser = {
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  avatar_url: "avatar.jpg",
};

const mockMessages = [
  {
    id: "msg-1",
    band_id: "band-123",
    user_id: "user-1",
    content: "Hello everyone!",
    message_type: "text" as const,
    created_at: "2024-01-01T10:00:00Z",
    user: {
      id: "user-1",
      name: "Alice",
      avatar_url: "avatar1.jpg",
    },
  },
  {
    id: "msg-2",
    band_id: "band-123",
    user_id: "user-123",
    content: "Hey there!",
    message_type: "text" as const,
    created_at: "2024-01-01T10:01:00Z",
    user: {
      id: "user-123",
      name: "John Doe",
      avatar_url: "avatar2.jpg",
    },
  },
];

describe("Chat Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authentication middleware
    mockAuthenticateToken.mockImplementation(async (req: any, res, next) => {
      req.user = mockUser;
      next();
    });
  });

  describe("GET /chat/:bandId/messages", () => {
    it("should get messages for a band", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.getMessages.mockResolvedValue({
        messages: mockMessages,
        hasMore: false,
      });

      const response = await request(app).get("/chat/band-123/messages");

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(2);
      expect(response.body.messages[0].content).toBe("Hello everyone!");
      expect(mockMessageService.isUserBandMember).toHaveBeenCalledWith(
        "user-123",
        "band-123"
      );
      expect(mockMessageService.getMessages).toHaveBeenCalledWith(
        "band-123",
        50,
        undefined
      );
    });

    it("should handle pagination with cursor", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.getMessages.mockResolvedValue({
        messages: mockMessages,
        hasMore: true,
        nextCursor: "cursor-123",
      });

      const response = await request(app)
        .get("/chat/band-123/messages")
        .query({ limit: "25", cursor: "cursor-123" });

      expect(response.status).toBe(200);
      expect(response.body.hasMore).toBe(true);
      expect(response.body.nextCursor).toBe("cursor-123");
      expect(mockMessageService.getMessages).toHaveBeenCalledWith(
        "band-123",
        25,
        "cursor-123"
      );
    });

    it("should return 403 for non-band members", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(false);

      const response = await request(app).get("/chat/band-123/messages");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
      expect(response.body.error.message).toBe(
        "You don't have access to this band's chat"
      );
    });

    it("should handle service errors", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.getMessages.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/chat/band-123/messages");

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
      expect(response.body.error.message).toBe("Database error");
    });

    it("should limit the maximum number of messages", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.getMessages.mockResolvedValue({
        messages: mockMessages,
        hasMore: false,
      });

      const response = await request(app)
        .get("/chat/band-123/messages")
        .query({ limit: "200" }); // Request more than max

      expect(response.status).toBe(200);
      expect(mockMessageService.getMessages).toHaveBeenCalledWith(
        "band-123",
        100, // Should be capped at 100
        undefined
      );
    });
  });

  describe("POST /chat/:bandId/messages", () => {
    it("should send a message", async () => {
      const newMessage = {
        id: "msg-3",
        band_id: "band-123",
        user_id: "user-123",
        content: "New message",
        message_type: "text" as const,
        created_at: "2024-01-01T10:02:00Z",
      };

      const messageWithUser = {
        ...newMessage,
        user: {
          id: "user-123",
          name: "John Doe",
          avatar_url: "avatar.jpg",
        },
      };

      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.validateMessageData.mockImplementation(() => {});
      mockMessageService.createMessage.mockResolvedValue(newMessage);
      mockMessageService.getRecentMessages.mockResolvedValue([messageWithUser]);

      const response = await request(app).post("/chat/band-123/messages").send({
        content: "New message",
        message_type: "text",
      });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe("New message");
      expect(response.body.user.name).toBe("John Doe");
      expect(mockMessageService.createMessage).toHaveBeenCalledWith({
        band_id: "band-123",
        user_id: "user-123",
        content: "New message",
        message_type: "text",
      });
    });

    it("should return 403 for non-band members", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(false);

      const response = await request(app).post("/chat/band-123/messages").send({
        content: "New message",
      });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    });

    it("should validate message data", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.validateMessageData.mockImplementation(() => {
        throw new Error("Message content is required");
      });

      const response = await request(app).post("/chat/band-123/messages").send({
        content: "",
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.message).toBe("Message content is required");
    });

    it("should handle service errors", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.validateMessageData.mockImplementation(() => {});
      mockMessageService.createMessage.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).post("/chat/band-123/messages").send({
        content: "New message",
      });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });

    it("should default message_type to text", async () => {
      const newMessage = {
        id: "msg-3",
        band_id: "band-123",
        user_id: "user-123",
        content: "New message",
        message_type: "text" as const,
        created_at: "2024-01-01T10:02:00Z",
      };

      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.validateMessageData.mockImplementation(() => {});
      mockMessageService.createMessage.mockResolvedValue(newMessage);
      mockMessageService.getRecentMessages.mockResolvedValue([]);

      const response = await request(app).post("/chat/band-123/messages").send({
        content: "New message",
        // No message_type provided
      });

      expect(response.status).toBe(201);
      expect(mockMessageService.createMessage).toHaveBeenCalledWith({
        band_id: "band-123",
        user_id: "user-123",
        content: "New message",
        message_type: "text", // Should default to "text"
      });
    });
  });

  describe("GET /chat/:bandId/recent", () => {
    it("should get recent messages", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.getRecentMessages.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get("/chat/band-123/recent")
        .query({ since: "2024-01-01T09:00:00Z", limit: "10" });

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(2);
      expect(mockMessageService.getRecentMessages).toHaveBeenCalledWith(
        "band-123",
        "2024-01-01T09:00:00Z",
        10
      );
    });

    it("should return 403 for non-band members", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(false);

      const response = await request(app).get("/chat/band-123/recent");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    });

    it("should limit the maximum number of recent messages", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.getRecentMessages.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get("/chat/band-123/recent")
        .query({ limit: "100" }); // Request more than max

      expect(response.status).toBe(200);
      expect(mockMessageService.getRecentMessages).toHaveBeenCalledWith(
        "band-123",
        undefined,
        50 // Should be capped at 50
      );
    });

    it("should handle service errors", async () => {
      mockMessageService.isUserBandMember.mockResolvedValue(true);
      mockMessageService.getRecentMessages.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/chat/band-123/recent");

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("Authentication", () => {
    it("should require authentication for all endpoints", async () => {
      // Mock unauthenticated request
      mockAuthenticateToken.mockImplementation(async (req: any, res, next) => {
        req.user = undefined;
        next();
      });

      const endpoints = [
        { method: "get" as const, path: "/chat/band-123/messages" },
        { method: "post" as const, path: "/chat/band-123/messages" },
        { method: "get" as const, path: "/chat/band-123/recent" },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});

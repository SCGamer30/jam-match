import { Router, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { MessageService } from "../services/messageService";
import { supabase } from "../config/supabase";

const router = Router();

/**
 * GET /chat/:bandId/messages
 * Get messages for a specific band with pagination
 */
router.get(
  "/:bandId/messages",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bandId } = req.params;
      const { limit = "50", cursor } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        });
      }

      // Check if user is a member of the band
      const isMember = await MessageService.isUserBandMember(userId, bandId);
      if (!isMember) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "You don't have access to this band's chat",
          },
        });
      }

      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const messages = await MessageService.getMessages(
        bandId,
        limitNum,
        cursor as string
      );

      res.json(messages);
      return;
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to fetch messages",
        },
      });
      return;
    }
  }
);

/**
 * POST /chat/:bandId/messages
 * Send a new message to a band chat
 */
router.post(
  "/:bandId/messages",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bandId } = req.params;
      const { content, message_type = "text" } = req.body || {};
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        });
      }

      // Check if user is a member of the band
      const isMember = await MessageService.isUserBandMember(userId, bandId);
      if (!isMember) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "You don't have access to this band's chat",
          },
        });
      }

      // Validate message data
      const messageData = {
        band_id: bandId,
        user_id: userId,
        content,
        message_type,
      };

      MessageService.validateMessageData(messageData);

      // Create the message
      const message = await MessageService.createMessage(messageData);

      // Fetch the complete message with user data for response
      const messagesWithUser = await MessageService.getRecentMessages(
        bandId,
        message.created_at,
        1
      );

      const messageWithUser = messagesWithUser.find(
        (msg) => msg.id === message.id
      );

      if (!messageWithUser) {
        // Fallback: fetch user data from database
        const { data: userData } = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .eq("id", userId)
          .single();

        return res.status(201).json({
          ...message,
          user: {
            id: userId,
            name: userData?.name || "Unknown User",
            avatar_url: userData?.avatar_url,
          },
        });
      }

      res.status(201).json(messageWithUser);
      return;
    } catch (error) {
      console.error("Error sending message:", error);

      if (error instanceof Error && error.message.includes("required")) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to send message",
        },
      });
      return;
    }
  }
);

/**
 * GET /chat/:bandId/recent
 * Get recent messages since a specific timestamp (for real-time updates)
 */
router.get(
  "/:bandId/recent",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bandId } = req.params;
      const { since, limit = "20" } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        });
      }

      // Check if user is a member of the band
      const isMember = await MessageService.isUserBandMember(userId, bandId);
      if (!isMember) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "You don't have access to this band's chat",
          },
        });
      }

      const limitNum = Math.min(parseInt(limit as string) || 20, 50);
      const messages = await MessageService.getRecentMessages(
        bandId,
        since as string,
        limitNum
      );

      res.json({ messages });
      return;
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch recent messages",
        },
      });
      return;
    }
  }
);

export default router;

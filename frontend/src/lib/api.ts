/**
 * API service functions for the JamMatch application
 */

import { Band, Match, User } from "@/types/dashboard";
import {
  MessageWithUser,
  PaginatedMessages,
  SendMessageData,
} from "@/types/chat";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// User profile API
export const userApi = {
  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },

  async updateProfile(
    profileData: Partial<User>
  ): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse<{ message: string; user: User }>(response);
  },

  async setupProfile(
    profileData: Omit<User, "id" | "profile_completed">
  ): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/users/profile/setup`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse<{ message: string; user: User }>(response);
  },
};

// Bands API
export const bandsApi = {
  async getUserBands(): Promise<{ bands: Band[]; total: number }> {
    const response = await fetch(`${API_BASE_URL}/bands`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ bands: Band[]; total: number }>(response);
  },

  async getBandDetails(bandId: string): Promise<Band> {
    const response = await fetch(`${API_BASE_URL}/bands/${bandId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Band>(response);
  },

  async getBandMembers(bandId: string): Promise<{
    band_id: string;
    members: User[];
    compatibility_scores: any[];
    total_members: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/bands/${bandId}/members`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{
      band_id: string;
      members: User[];
      compatibility_scores: any[];
      total_members: number;
    }>(response);
  },
};

// Matching API
export const matchingApi = {
  async getUserMatches(): Promise<{ matches: Match[]; total_matches: number }> {
    const response = await fetch(`${API_BASE_URL}/users/matches`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ matches: Match[]; total_matches: number }>(
      response
    );
  },

  async calculateMatches(): Promise<{
    message: string;
    bands_formed: number;
    potential_bands_found: number;
    calculations_performed: number;
    notifications: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/matching/calculate`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{
      message: string;
      bands_formed: number;
      potential_bands_found: number;
      calculations_performed: number;
      notifications: number;
    }>(response);
  },

  async requestAIAnalysis(
    user1Id: string,
    user2Id: string
  ): Promise<{
    compatibility_score: number;
    reasoning: string;
    model_used: string;
    fallback_used: boolean;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/matching/ai-analysis`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user1_id: user1Id,
        user2_id: user2Id,
      }),
    });
    return handleResponse<{
      compatibility_score: number;
      reasoning: string;
      model_used: string;
      fallback_used: boolean;
      timestamp: string;
    }>(response);
  },
};

// Chat API
export const chatApi = {
  async getMessages(
    bandId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<PaginatedMessages> {
    const url = new URL(`${API_BASE_URL}/chat/${bandId}/messages`);
    url.searchParams.set("limit", limit.toString());
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<PaginatedMessages>(response);
  },

  async sendMessage(
    bandId: string,
    messageData: SendMessageData
  ): Promise<MessageWithUser> {
    const response = await fetch(`${API_BASE_URL}/chat/${bandId}/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    });
    return handleResponse<MessageWithUser>(response);
  },
};

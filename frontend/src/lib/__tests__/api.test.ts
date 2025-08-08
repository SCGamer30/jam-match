/**
 * Unit tests for API utility functions
 */

import { api } from "../api";

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("API Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe("api.get", () => {
    it("should make GET request with correct headers", async () => {
      const mockResponse = { data: "test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      (window.localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      const result = await api.get("/test-endpoint");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-endpoint"),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle requests without auth token", async () => {
      const mockResponse = { data: "test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      await api.get("/test-endpoint");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-endpoint"),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("should throw error for failed requests", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ error: "Not found" }),
      } as Response);

      (window.localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      await expect(api.get("/test-endpoint")).rejects.toThrow("Not Found");
    });
  });

  describe("api.post", () => {
    it("should make POST request with data", async () => {
      const mockResponse = { success: true };
      const testData = { name: "test" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      (window.localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      const result = await api.post("/test-endpoint", testData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-endpoint"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify(testData),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("api.put", () => {
    it("should make PUT request with data", async () => {
      const mockResponse = { updated: true };
      const testData = { name: "updated" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      (window.localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      const result = await api.put("/test-endpoint", testData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-endpoint"),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify(testData),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("api.delete", () => {
    it("should make DELETE request", async () => {
      const mockResponse = { deleted: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      (window.localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      const result = await api.delete("/test-endpoint");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test-endpoint"),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Error handling", () => {
    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      (window.localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      await expect(api.get("/test-endpoint")).rejects.toThrow("Network error");
    });

    it("should handle JSON parsing errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as Response);

      (window.localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      await expect(api.get("/test-endpoint")).rejects.toThrow("Invalid JSON");
    });

    it("should handle 401 unauthorized responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ error: "Unauthorized" }),
      } as Response);

      (window.localStorage.getItem as jest.Mock).mockReturnValue("test-token");

      await expect(api.get("/test-endpoint")).rejects.toThrow("Unauthorized");
    });
  });
});

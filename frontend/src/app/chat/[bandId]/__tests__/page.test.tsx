import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import ChatPage from "../page";
import { chatApi, bandsApi } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  chatApi: {
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
  },
  bandsApi: {
    getBandDetails: jest.fn(),
  },
}));

jest.mock("@/lib/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    channel: jest.fn(),
    from: jest.fn(),
  },
}));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockChatApi = chatApi as jest.Mocked<typeof chatApi>;
const mockBandsApi = bandsApi as jest.Mocked<typeof bandsApi>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const mockUser = {
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  primary_role: "guitarist" as const,
  instruments: ["Guitar"],
  genres: ["Rock"],
  experience: "intermediate" as const,
  profile_completed: true,
};

const mockBand = {
  id: "band-123",
  name: "Test Band",
  drummer_id: "user-1",
  guitarist_id: "user-123", // Current user
  bassist_id: "user-2",
  singer_id: "user-3",
  status: "active" as const,
  compatibility_data: {},
  formation_date: "2024-01-01T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  members: [],
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

describe("ChatPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ bandId: "band-123" });
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });

    // Mock Supabase channel
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockImplementation((callback) => {
        callback("SUBSCRIBED");
        return mockChannel;
      }),
      unsubscribe: jest.fn(),
    };
    mockSupabase.channel.mockReturnValue(mockChannel as any);

    // Mock Supabase query
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockMessages[0],
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(mockQuery as any);
  });

  it("should render loading state initially", () => {
    mockBandsApi.getBandDetails.mockImplementation(() => new Promise(() => {}));
    mockChatApi.getMessages.mockImplementation(() => new Promise(() => {}));

    render(<ChatPage />);

    expect(screen.getByText("Loading chat...")).toBeInTheDocument();
  });

  it("should load and display chat messages", async () => {
    mockBandsApi.getBandDetails.mockResolvedValue(mockBand);
    mockChatApi.getMessages.mockResolvedValue({
      messages: mockMessages,
      hasMore: false,
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Band")).toBeInTheDocument();
    });

    expect(screen.getByText("Hello everyone!")).toBeInTheDocument();
    expect(screen.getByText("Hey there!")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("should send a message when form is submitted", async () => {
    mockBandsApi.getBandDetails.mockResolvedValue(mockBand);
    mockChatApi.getMessages.mockResolvedValue({
      messages: mockMessages,
      hasMore: false,
    });
    mockChatApi.sendMessage.mockResolvedValue({
      id: "msg-3",
      band_id: "band-123",
      user_id: "user-123",
      content: "New message",
      message_type: "text",
      created_at: "2024-01-01T10:02:00Z",
      user: {
        id: "user-123",
        name: "John Doe",
        avatar_url: "avatar2.jpg",
      },
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Band")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send message/i });

    fireEvent.change(input, { target: { value: "New message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockChatApi.sendMessage).toHaveBeenCalledWith("band-123", {
        content: "New message",
        message_type: "text",
      });
    });

    expect(input).toHaveValue("");
  });

  it("should prevent sending empty messages", async () => {
    mockBandsApi.getBandDetails.mockResolvedValue(mockBand);
    mockChatApi.getMessages.mockResolvedValue({
      messages: mockMessages,
      hasMore: false,
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Band")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(sendButton);

    expect(mockChatApi.sendMessage).not.toHaveBeenCalled();
  });

  it("should show unauthorized access message for non-members", async () => {
    const nonMemberBand = {
      ...mockBand,
      guitarist_id: "other-user", // Current user is not a member
    };

    mockBandsApi.getBandDetails.mockResolvedValue(nonMemberBand);
    mockChatApi.getMessages.mockResolvedValue({
      messages: [],
      hasMore: false,
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/You don't have access to this band's chat/)
      ).toBeInTheDocument();
    });

    const backButton = screen.getByText("Back to Dashboard");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle API errors gracefully", async () => {
    mockBandsApi.getBandDetails.mockRejectedValue(
      new Error("Failed to load band")
    );
    mockChatApi.getMessages.mockRejectedValue(
      new Error("Failed to load messages")
    );

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load chat/)).toBeInTheDocument();
    });
  });

  it("should load more messages when scrolling to top", async () => {
    mockBandsApi.getBandDetails.mockResolvedValue(mockBand);
    mockChatApi.getMessages
      .mockResolvedValueOnce({
        messages: mockMessages,
        hasMore: true,
        nextCursor: "cursor-123",
      })
      .mockResolvedValueOnce({
        messages: [
          {
            id: "msg-0",
            band_id: "band-123",
            user_id: "user-1",
            content: "Earlier message",
            message_type: "text" as const,
            created_at: "2024-01-01T09:00:00Z",
            user: {
              id: "user-1",
              name: "Alice",
              avatar_url: "avatar1.jpg",
            },
          },
        ],
        hasMore: false,
      });

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Band")).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByText("Load more messages");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(mockChatApi.getMessages).toHaveBeenCalledWith(
        "band-123",
        50,
        "cursor-123"
      );
    });
  });

  it("should navigate back to dashboard", async () => {
    mockBandsApi.getBandDetails.mockResolvedValue(mockBand);
    mockChatApi.getMessages.mockResolvedValue({
      messages: mockMessages,
      hasMore: false,
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Band")).toBeInTheDocument();
    });

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should show connection status", async () => {
    mockBandsApi.getBandDetails.mockResolvedValue(mockBand);
    mockChatApi.getMessages.mockResolvedValue({
      messages: mockMessages,
      hasMore: false,
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByText("Connected")).toBeInTheDocument();
    });
  });

  it("should display empty state when no messages", async () => {
    mockBandsApi.getBandDetails.mockResolvedValue(mockBand);
    mockChatApi.getMessages.mockResolvedValue({
      messages: [],
      hasMore: false,
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No messages yet. Start the conversation!")
      ).toBeInTheDocument();
    });
  });
});

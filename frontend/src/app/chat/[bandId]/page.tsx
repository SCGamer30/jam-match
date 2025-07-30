"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { chatApi, bandsApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { MessageWithUser, ChatState } from "@/types/chat";
import { Band } from "@/types/dashboard";
import { useAuth } from "@/lib/useAuth";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bandId = params.bandId as string;

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    hasMore: false,
    isConnected: false,
  });

  const [band, setBand] = useState<Band | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load initial messages and band data
  useEffect(() => {
    if (!bandId || !user) return;

    const loadInitialData = async () => {
      try {
        setChatState((prev) => ({
          ...prev,
          isLoading: true,
          error: undefined,
        }));

        // Load band details and messages in parallel
        const [bandData, messagesData] = await Promise.all([
          bandsApi.getBandDetails(bandId),
          chatApi.getMessages(bandId, 50),
        ]);

        setBand(bandData);
        setChatState((prev) => ({
          ...prev,
          messages: messagesData.messages,
          hasMore: messagesData.hasMore,
          nextCursor: messagesData.nextCursor,
          isLoading: false,
        }));

        // Scroll to bottom after loading messages
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Failed to load chat data:", error);
        setChatState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to load chat",
        }));
      }
    };

    loadInitialData();
  }, [bandId, user, scrollToBottom]);

  // Set up real-time subscription
  useEffect(() => {
    if (!bandId || !user) return;

    const setupRealtimeSubscription = () => {
      // Clean up existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }

      const channel = supabase
        .channel(`messages:${bandId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `band_id=eq.${bandId}`,
          },
          async (payload) => {
            const newMessage = payload.new as any;

            // Fetch the complete message with user data
            try {
              const { data: messageWithUser } = await supabase
                .from("messages")
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
                .eq("id", newMessage.id)
                .single();

              if (messageWithUser) {
                setChatState((prev) => ({
                  ...prev,
                  messages: [
                    ...prev.messages,
                    messageWithUser as MessageWithUser,
                  ],
                }));

                // Auto-scroll to bottom for new messages
                setTimeout(scrollToBottom, 100);
              }
            } catch (error) {
              console.error("Failed to fetch new message details:", error);
            }
          }
        )
        .subscribe((status) => {
          setChatState((prev) => ({
            ...prev,
            isConnected: status === "SUBSCRIBED",
          }));
        });

      subscriptionRef.current = channel;
    };

    setupRealtimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [bandId, user, scrollToBottom]);

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!chatState.hasMore || isLoadingMore || !chatState.nextCursor) return;

    setIsLoadingMore(true);
    try {
      const messagesData = await chatApi.getMessages(
        bandId,
        50,
        chatState.nextCursor
      );

      setChatState((prev) => ({
        ...prev,
        messages: [...messagesData.messages, ...prev.messages],
        hasMore: messagesData.hasMore,
        nextCursor: messagesData.nextCursor,
      }));
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending || !user) return;

    setIsSending(true);
    try {
      await chatApi.sendMessage(bandId, {
        content: newMessage.trim(),
        message_type: "text",
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to send message",
      }));
    } finally {
      setIsSending(false);
    }
  };

  // Check if user is band member
  const isUserBandMember = () => {
    if (!band || !user) return false;
    return [
      band.drummer_id,
      band.guitarist_id,
      band.bassist_id,
      band.singer_id,
    ].includes(user.id);
  };

  // Handle unauthorized access
  if (band && !isUserBandMember()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            You don't have access to this band's chat. Only band members can
            view and participate in the conversation.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (chatState.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{band?.name || "Band Chat"}</h1>
          <p className="text-sm text-gray-500">
            {chatState.isConnected ? "Connected" : "Connecting..."}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {chatState.error && (
        <Alert className="mb-4">
          <AlertDescription>{chatState.error}</AlertDescription>
        </Alert>
      )}

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Chat</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0 p-4">
          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto mb-4 space-y-1"
            onScroll={(e) => {
              const { scrollTop } = e.currentTarget;
              if (scrollTop === 0 && chatState.hasMore) {
                loadMoreMessages();
              }
            }}
          >
            {/* Load More Button */}
            {chatState.hasMore && (
              <div className="flex justify-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMoreMessages}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Load more messages
                </Button>
              </div>
            )}

            {/* Messages */}
            {chatState.messages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No messages yet. Start the conversation!
              </div>
            ) : (
              chatState.messages.map((message, index) => {
                const prevMessage = chatState.messages[index - 1];
                const showAvatar =
                  !prevMessage ||
                  prevMessage.user_id !== message.user_id ||
                  new Date(message.created_at).getTime() -
                    new Date(prevMessage.created_at).getTime() >
                    300000; // 5 minutes

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isCurrentUser={message.user_id === user?.id}
                    showAvatar={showAvatar}
                  />
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1"
              maxLength={1000}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              size="sm"
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

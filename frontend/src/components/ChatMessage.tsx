"use client";

import { MessageWithUser } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: MessageWithUser;
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

export function ChatMessage({
  message,
  isCurrentUser,
  showAvatar = true,
}: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (message.message_type === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {showAvatar && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.user.avatar_url} alt={message.user.name} />
          <AvatarFallback className="text-xs">
            {getInitials(message.user.name)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {showAvatar && (
          <div
            className={cn(
              "text-xs text-gray-500 mb-1",
              isCurrentUser ? "text-right" : "text-left"
            )}
          >
            {isCurrentUser ? "You" : message.user.name}
          </div>
        )}

        <div
          className={cn(
            "px-4 py-2 rounded-lg break-words",
            isCurrentUser
              ? "bg-[#FED7AA] text-gray-900 rounded-br-sm"
              : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        <div
          className={cn(
            "text-xs text-gray-400 mt-1",
            isCurrentUser ? "text-right" : "text-left"
          )}
        >
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
}

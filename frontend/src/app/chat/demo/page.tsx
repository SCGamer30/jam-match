"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Music, Users, Heart } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

export default function ChatDemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Riley Martinez",
      content: "Hey! I saw we matched on JamMatch. Love your guitar style! 🎸",
      timestamp: new Date(Date.now() - 3600000),
      isCurrentUser: false,
    },
    {
      id: "2",
      sender: "You",
      content: "Thanks! Your vocals are amazing. Want to jam sometime? 🎤",
      timestamp: new Date(Date.now() - 3000000),
      isCurrentUser: true,
    },
    {
      id: "3",
      sender: "Riley Martinez",
      content:
        "Absolutely! I'm free this weekend. Maybe we can work on that indie rock sound? 🎵",
      timestamp: new Date(Date.now() - 2400000),
      isCurrentUser: false,
    },
    {
      id: "4",
      sender: "You",
      content: "Perfect! I have a few song ideas we could explore. ✨",
      timestamp: new Date(Date.now() - 1800000),
      isCurrentUser: true,
    },
    {
      id: "5",
      sender: "Riley Martinez",
      content: "Can't wait! This is going to be epic! 🔥",
      timestamp: new Date(Date.now() - 900000),
      isCurrentUser: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "You",
        content: newMessage,
        timestamp: new Date(),
        isCurrentUser: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");

      // Simulate a response after a delay
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          sender: "Riley Martinez",
          content: "Sounds great! Can't wait to create some music together 🎵",
          timestamp: new Date(),
          isCurrentUser: false,
        };
        setMessages((prev) => [...prev, response]);
      }, 1500);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-chart-2/10 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 animate-gradient">
            Band Chat
          </h1>
          <p className="text-muted-foreground">
            Connect with your matched musicians
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card/90 backdrop-blur-sm border-border shadow-lg card-hover relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary animate-pulse" />
                  Active Chats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 animate-pulse-glow">
                  <Avatar className="ring-2 ring-primary/30">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      RM
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Riley Martinez
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vocalist • 92% match
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 smooth-transition cursor-pointer card-hover">
                  <Avatar className="ring-2 ring-chart-2/30">
                    <AvatarFallback className="bg-chart-2 text-primary-foreground">
                      TK
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Taylor Kim</p>
                    <p className="text-sm text-muted-foreground">
                      Drummer • 88% match
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <Avatar>
                    <AvatarFallback className="bg-accent-foreground text-primary-foreground">
                      ED
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Electric Dreams
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Band Chat • 3 members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-card/90 backdrop-blur-sm border-border shadow-lg h-[600px] flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      RM
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-foreground">
                      Riley Martinez
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4 text-accent-foreground" />
                      92% compatibility • Vocalist, Guitarist
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Online
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[70%] ${
                        message.isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className={
                            message.isCurrentUser
                              ? "bg-chart-2 text-primary-foreground"
                              : "bg-primary text-primary-foreground"
                          }
                        >
                          {message.isCurrentUser ? "You" : "RM"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          message.isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isCurrentUser
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-background border-border"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 text-center">
              <Music className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                Share Music
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload and share your tracks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-chart-2 mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                Schedule Jam
              </h3>
              <p className="text-sm text-muted-foreground">
                Plan your next session
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-accent-foreground mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                View Profile
              </h3>
              <p className="text-sm text-muted-foreground">
                Learn more about Riley
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

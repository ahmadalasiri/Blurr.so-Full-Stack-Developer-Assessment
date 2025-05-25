"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { processUserMessage } from "@/lib/chatbot-actions";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  error?: boolean;
  retryable?: boolean;
}

export function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content:
        "Hi! I'm your HR Portal assistant. I can help you with tasks, projects, employee information, and navigation. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized, messages]);
  const handleSendMessage = async (retryMessageId?: string) => {
    if (!inputValue.trim() || isLoading) return;

    let userMessage: ChatMessage;

    if (retryMessageId) {
      // Find the message to retry
      const messageToRetry = messages.find((m) => m.id === retryMessageId);
      if (!messageToRetry) return;

      userMessage = messageToRetry;
      // Remove the error message that will be replaced
      setMessages((prev) => prev.filter((m) => m.id !== retryMessageId + "_error"));
    } else {
      userMessage = {
        id: Date.now().toString(),
        content: inputValue.trim(),
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
    }

    setIsLoading(true);

    try {
      const response = await processUserMessage(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: retryMessageId ? retryMessageId + "_retry" : (Date.now() + 1).toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: retryMessageId ? retryMessageId + "_error" : (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
        error: true,
        retryable: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Ensure input stays focused after response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        content:
          "Hi! I'm your HR Portal assistant. I can help you with tasks, projects, employee information, and navigation. What would you like to know?",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open HR Assistant</span>
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-xl border-0 transition-all duration-300",
        "chatbot-container sm:max-w-[95vw] sm:max-h-[95vh]",
        isMinimized ? "w-80 h-16" : "w-96 h-[600px] sm:h-[500px]",
        // Mobile responsive classes
        "sm:bottom-6 sm:right-6 sm:left-auto sm:w-96",
        "max-sm:bottom-4 max-sm:right-4 max-sm:left-4 max-sm:w-auto",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 bg-blue-600 text-white rounded-t-lg shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <CardTitle className="text-sm font-medium">HR Assistant</CardTitle>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 text-xs"
          >
            Online
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-blue-700 transition-colors"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-blue-700 transition-colors"
            onClick={clearChat}
            title="Clear chat"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-red-600 transition-colors"
            onClick={() => setIsOpen(false)}
            title="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col p-0 h-full overflow-hidden">
          {" "}
          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea
              ref={scrollAreaRef}
              className="h-full chatbot-scroll-area"
            >
              <div className="p-3 sm:p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2 sm:gap-3",
                      message.role === "user" ? "flex-row-reverse message-user" : "flex-row message-assistant",
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          message.role === "user" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700",
                        )}
                      >
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 max-w-[85%] text-sm break-words",
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900",
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <span
                        className={cn(
                          "text-xs mt-1 block opacity-70",
                          message.role === "user" ? "text-blue-100" : "text-gray-500",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 sm:gap-3 message-assistant">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-gray-100 text-gray-700">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
          {/* Input Area */}
          <div className="border-t bg-white p-3 sm:p-4 shrink-0">
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1 mb-3">
              {["Show my tasks", "Project status", "Find employee", "How to create task?"].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>{" "}
            {/* Input Field */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about tasks, projects, or employees..."
                disabled={isLoading}
                className="flex-1 text-sm chatbot-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />{" "}
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="shrink-0 h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

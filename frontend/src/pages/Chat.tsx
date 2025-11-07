import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, History, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  sendMessage,
  getChatSessions,
  getChatThread,
  updateChatTitle,
  deleteChatSession,
  type ChatSession,
} from "@/services/aiChatService";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>("New Conversation");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const data = await getChatSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    }
  };

  const loadChatThread = async (chatTitle: string) => {
    try {
      setIsLoading(true);
      const thread = await getChatThread(chatTitle);
      
      const loadedMessages: Message[] = [];
      thread.messages.forEach((msg) => {
        loadedMessages.push({
          id: msg.id * 2,
          text: msg.userMessage,
          sender: "user",
          timestamp: new Date(msg.createdAt),
        });
        loadedMessages.push({
          id: msg.id * 2 + 1,
          text: msg.aiResponse,
          sender: "ai",
          timestamp: new Date(msg.createdAt),
        });
      });

      setMessages(loadedMessages);
      setCurrentChatTitle(thread.chatTitle);
      setHistoryOpen(false);
      
      toast({
        title: "Chat loaded",
        description: `Loaded conversation: ${thread.chatTitle}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat thread",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessage({
        message: inputValue,
        chatTitle: currentChatTitle === "New Conversation" ? undefined : currentChatTitle,
      });

      const aiMessage: Message = {
        id: response.id,
        text: response.aiResponse,
        sender: "ai",
        timestamp: new Date(response.createdAt),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (currentChatTitle === "New Conversation" && response.chatTitle) {
        setCurrentChatTitle(response.chatTitle);
      }

      await loadSessions();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatTitle("New Conversation");
    setHistoryOpen(false);
    toast({
      title: "New chat started",
      description: "Start a fresh conversation",
    });
  };

  const handleEditTitle = async () => {
    if (!editTitleValue.trim() || currentChatTitle === "New Conversation") return;

    try {
      const firstMessage = messages.find((m) => m.sender === "ai");
      if (firstMessage) {
        await updateChatTitle(firstMessage.id, editTitleValue);
        setCurrentChatTitle(editTitleValue);
        setIsEditingTitle(false);
        await loadSessions();
        
        toast({
          title: "Title updated",
          description: "Chat title has been updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chat title",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      await deleteChatSession(sessionToDelete);
      
      if (currentChatTitle === sessionToDelete) {
        handleNewChat();
      }
      
      await loadSessions();
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
      
      toast({
        title: "Chat deleted",
        description: "Chat session has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    }
  };

  const startEditTitle = () => {
    setEditTitleValue(currentChatTitle);
    setIsEditingTitle(true);
  };

  return (
    <div className="p-4 sm:p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                className="max-w-md"
                onKeyDown={(e) => e.key === "Enter" && handleEditTitle()}
              />
              <Button size="icon" variant="ghost" onClick={handleEditTitle}>
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingTitle(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                {currentChatTitle}
              </h1>
              {currentChatTitle !== "New Conversation" && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={startEditTitle}
                  className="h-8 w-8 flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Talk to your AI mental health companion
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button onClick={handleNewChat} variant="outline" className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>

          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <History className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[85vw] sm:w-[400px] md:w-[540px]">
              <SheetHeader>
                <SheetTitle>Chat History</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No chat history yet
                    </p>
                  ) : (
                    sessions.map((session) => (
                      <Card
                        key={session.sessionId}
                        className="cursor-pointer hover:bg-accent transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="flex-1"
                              onClick={() => loadChatThread(session.chatTitle)}
                            >
                              <h3 className="font-semibold text-sm">
                                {session.chatTitle}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {session.firstMessage}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{session.messageCount} messages</span>
                                <span>
                                  {new Date(session.lastMessageAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSessionToDelete(session.chatTitle);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 mx-auto text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Welcome to AI Chat
                </h2>
                <p className="text-muted-foreground">
                  Start a conversation with your AI mental health companion.
                  <br />
                  Share your thoughts, feelings, or ask for guidance.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <CardContent className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat session and all its messages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;

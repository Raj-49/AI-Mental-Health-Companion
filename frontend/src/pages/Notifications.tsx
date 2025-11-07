import { useState, useEffect } from "react";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getNotificationStats,
  Notification as NotificationType,
} from "@/services/notificationService";

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await getNotifications(1, 50);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await getNotificationStats();
      setUnreadCount(stats.unreadCount);
    } catch (error) {
      console.error("Failed to load notification stats:", error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
      toast({ title: "Marked as read" });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({ title: "All notifications marked as read" });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      const notification = notifications.find(n => n.id === id);
      setNotifications(notifications.filter(n => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      toast({ title: "Notification deleted" });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadNotifications();
      setNotifications(notifications.filter(n => !n.isRead));
      toast({ title: "Read notifications cleared" });
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear read notifications",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string | null) => {
    return <Bell className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex flex-wrap items-center gap-2 sm:gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2 py-1">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Stay updated with your wellness journey</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="text-xs sm:text-sm">
              <CheckCheck className="w-4 h-4 mr-1 sm:mr-2" />
              Mark all read
            </Button>
          )}
          {notifications.some(n => n.isRead) && (
            <Button variant="outline" size="sm" onClick={handleClearRead} className="text-xs sm:text-sm">
              <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
              Clear read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading notifications...
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all ${
                !notification.isRead ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`p-2 rounded-full ${
                  !notification.isRead ? "bg-primary/10" : "bg-muted"
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {notification.title}
                    </h3>
                    {notification.type && (
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">No notifications yet</p>
            <p className="text-sm">You're all caught up!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;

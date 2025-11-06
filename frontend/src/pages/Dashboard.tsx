import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState("User");
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  
  const currentHour = new Date().getHours();
  
  useEffect(() => {
    if (user) {
      setUserName(user.fullName || user.email.split('@')[0] || "User");
      setUserImageUrl(user.profileImageUrl);
    }
  }, [user]);
  
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return userName[0].toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 md:p-10 max-w-6xl">
          {/* Header Section */}
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="w-20 h-20 border-2 border-primary">
              <AvatarImage src={userImageUrl || ""} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {getGreeting()}, {userName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                How are you feeling today?
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="gradient-card shadow-soft hover:shadow-hover transition-smooth cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Start a Chat</CardTitle>
                    <CardDescription>Talk to your AI companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Begin Conversation
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-soft hover:shadow-hover transition-smooth cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Daily Check-in</CardTitle>
                    <CardDescription>Log your mood for today</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Check In Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chat Placeholder Section */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>AI Chat Interface</CardTitle>
              <CardDescription>Your conversations will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-12 text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  No active conversation
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Start a new chat to receive personalized support and guidance
                </p>
                <Button>
                  Start New Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

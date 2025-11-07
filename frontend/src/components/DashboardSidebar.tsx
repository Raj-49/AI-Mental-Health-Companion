import { MessageCircle, BookOpen, TrendingUp, Lightbulb, User, LogOut, Target, Sparkles, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
  };

  const navItems = [
    { to: "/dashboard/chat", icon: MessageCircle, label: "AI Chat" },
    { to: "/dashboard/journals", icon: BookOpen, label: "Journals" },
    { to: "/dashboard/mood-logs", icon: TrendingUp, label: "Mood Logs" },
    { to: "/dashboard/therapy-plans", icon: Target, label: "Therapy Plans" },
    { to: "/dashboard/insights", icon: Lightbulb, label: "Insights" },
    { to: "/dashboard/recommendations", icon: Sparkles, label: "Recommendations" },
    { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-smooth"
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <NavLink
          to="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-smooth"
          activeClassName="bg-primary/10 text-primary font-medium"
        >
          <User className="w-5 h-5" />
          Profile
        </NavLink>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

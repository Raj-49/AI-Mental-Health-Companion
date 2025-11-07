import { MessageCircle, BookOpen, TrendingUp, Lightbulb, Target, Sparkles, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const DashboardSidebar = ({ isCollapsed, isMobileOpen, onMobileClose }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug: Log user data
  console.log('DashboardSidebar - User data:', user);
  console.log('DashboardSidebar - isCollapsed:', isCollapsed, 'isMobileOpen:', isMobileOpen);

  const navItems = [
    { to: "/dashboard/chat", icon: MessageCircle, label: "AI Chat" },
    { to: "/dashboard/journals", icon: BookOpen, label: "Journals" },
    { to: "/dashboard/mood-logs", icon: TrendingUp, label: "Mood Logs" },
    { to: "/dashboard/therapy-plans", icon: Target, label: "Therapy Plans" },
    { to: "/dashboard/insights", icon: Lightbulb, label: "Insights" },
    { to: "/dashboard/recommendations", icon: Sparkles, label: "Recommendations" },
    { to: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  ];

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
    onMobileClose(); // Close mobile sidebar when navigating
  };

  const handleNavClick = () => {
    onMobileClose(); // Close mobile sidebar when navigating
  };

  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    const names = user.fullName.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <aside 
      className={`
        bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out
        fixed left-0 overflow-hidden
        ${isMobileOpen ? 'w-[85%] max-w-[320px] z-50' : 'w-0 md:w-20 md:z-40'}
        ${!isMobileOpen && !isCollapsed ? 'md:w-64' : ''}
      `}
      style={{
        top: '64px',
        bottom: 0,
        height: 'calc(100vh - 64px)'
      }}
    >
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-smooth text-base md:text-sm min-w-0"
            activeClassName="bg-primary/10 text-primary font-medium"
            title={isCollapsed && !isMobileOpen ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className={`whitespace-nowrap overflow-hidden text-ellipsis ${isMobileOpen ? 'block' : isCollapsed ? 'hidden md:hidden' : 'hidden md:block'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Profile Section at Bottom */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <button
          onClick={handleProfileClick}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-smooth min-w-0"
          title={isCollapsed && !isMobileOpen ? "Profile" : undefined}
        >
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.fullName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className={`flex flex-col items-start overflow-hidden min-w-0 flex-1 ${isMobileOpen ? 'block' : isCollapsed ? 'hidden' : 'hidden md:block'}`}>
            <span className="text-base md:text-sm font-medium text-foreground truncate w-full">
              {user?.fullName || "User"}
            </span>
            <span className="text-sm md:text-xs text-muted-foreground truncate w-full"></span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import SettingsDropdown from "@/components/SettingsDropdown";
import Chat from "./Chat";
import Journals from "./Journals";
import MoodLogs from "./MoodLogs";
import TherapyPlans from "./TherapyPlans";
import Insights from "./Insights";
import Recommendations from "./Recommendations";
import Notifications from "./Notifications";
import Profile from "./Profile";

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile vs desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoClick = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Full Width, Static, Always on Top */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between max-w-full">
          {/* Logo on left - toggles sidebar */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img 
              src="/logo.png" 
              alt="MindCare Logo" 
              className="h-10 w-auto object-contain"
            />
          </button>

          {/* App name in center */}
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground truncate mx-2 sm:mx-4 flex-1 text-center">
            AI Mental Health Companion
          </h1>

          {/* Settings on right */}
          <div className="flex-shrink-0">
            <SettingsDropdown />
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          style={{ top: '64px' }}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Area - Flex Container */}
      <div className="flex flex-1 pt-16 sm:pt-20">
        {/* Sidebar - Below Header */}
        <DashboardSidebar 
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content - Static positioning on mobile, responsive margins */}
        <main 
          className="flex-1 overflow-auto"
          style={{
            marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '0' : '256px'),
            transition: isMobile ? 'none' : 'margin-left 300ms ease-in-out'
          }}
        >
          <div className="p-4 sm:p-6 md:p-8 mx-[5%]">
            <Routes>
              <Route index element={<Navigate to="/dashboard/chat" replace />} />
              <Route path="chat" element={<Chat />} />
              <Route path="journals" element={<Journals />} />
              <Route path="mood-logs" element={<MoodLogs />} />
              <Route path="therapy-plans" element={<TherapyPlans />} />
              <Route path="insights" element={<Insights />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

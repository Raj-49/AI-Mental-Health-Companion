import { Routes, Route, Navigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import Chat from "./Chat";
import Journals from "./Journals";
import MoodLogs from "./MoodLogs";
import TherapyPlans from "./TherapyPlans";
import Insights from "./Insights";
import Recommendations from "./Recommendations";
import Notifications from "./Notifications";
import Profile from "./Profile";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-auto">
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
      </main>
    </div>
  );
};

export default Dashboard;

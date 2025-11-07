/**
 * Settings Dropdown Component
 * 
 * Provides a dropdown menu for user settings:
 * - Theme toggle (Light/Dark)
 * - AI Tone selection
 * - Daily Reminder toggle
 * - Sign Out button
 */

import { useState, useEffect } from "react";
import { Settings, Moon, Sun, LogOut, Bell, BellOff, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  getUserPreferences,
  updateTheme,
  updateAiTone,
  updateReminderSetting,
  Theme,
  AiTone,
} from "@/services/preferenceService";

const SettingsDropdown = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>("light");
  const [aiTone, setAiTone] = useState<AiTone>("empathetic");
  const [dailyReminder, setDailyReminder] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await getUserPreferences();
        if (response.preferences) {
          setTheme(response.preferences.theme);
          setAiTone(response.preferences.aiTone);
          setDailyReminder(response.preferences.dailyReminder);
          
          // Apply theme to document
          applyTheme(response.preferences.theme);
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  const handleThemeChange = async (newTheme: Theme) => {
    setIsLoading(true);
    try {
      await updateTheme(newTheme);
      setTheme(newTheme);
      applyTheme(newTheme);
      
      toast({
        title: "Theme updated",
        description: `Switched to ${newTheme} mode`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiToneChange = async (newTone: AiTone) => {
    setIsLoading(true);
    try {
      await updateAiTone(newTone);
      setAiTone(newTone);
      
      toast({
        title: "AI Tone updated",
        description: `Set to ${newTone} mode`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI tone",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReminderToggle = async () => {
    setIsLoading(true);
    const newValue = !dailyReminder;
    try {
      await updateReminderSetting(newValue);
      setDailyReminder(newValue);
      
      toast({
        title: "Reminder setting updated",
        description: `Daily reminders ${newValue ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder setting",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isLoading}>
            {theme === "dark" ? (
              <Moon className="w-4 h-4 mr-2" />
            ) : (
              <Sun className="w-4 h-4 mr-2" />
            )}
            <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleThemeChange("light")}>
              <Sun className="w-4 h-4 mr-2" />
              Light
              {theme === "light" && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
              <Moon className="w-4 h-4 mr-2" />
              Dark
              {theme === "dark" && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* AI Tone */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isLoading}>
            <Sparkles className="w-4 h-4 mr-2" />
            <span>AI Tone</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleAiToneChange("empathetic")}>
              Empathetic
              {aiTone === "empathetic" && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAiToneChange("neutral")}>
              Neutral
              {aiTone === "neutral" && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAiToneChange("motivational")}>
              Motivational
              {aiTone === "motivational" && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Daily Reminder Toggle */}
        <DropdownMenuItem onClick={handleReminderToggle} disabled={isLoading}>
          {dailyReminder ? (
            <Bell className="w-4 h-4 mr-2" />
          ) : (
            <BellOff className="w-4 h-4 mr-2" />
          )}
          <span>Daily Reminder: {dailyReminder ? "On" : "Off"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;

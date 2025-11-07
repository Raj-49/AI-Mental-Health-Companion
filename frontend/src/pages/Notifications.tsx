import { useState } from "react";
import { Bell, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const Notifications = () => {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [moodCheckIn, setMoodCheckIn] = useState(true);
  const [journalPrompt, setJournalPrompt] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-2">Manage your reminder preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Daily Reminders
          </CardTitle>
          <CardDescription>
            Set up notifications to help you stay consistent with your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-reminder">Daily Check-in Reminder</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to check in with yourself daily
              </p>
            </div>
            <Switch
              id="daily-reminder"
              checked={dailyReminder}
              onCheckedChange={setDailyReminder}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mood-checkin">Mood Logging Reminder</Label>
              <p className="text-sm text-muted-foreground">
                Remember to log your mood throughout the day
              </p>
            </div>
            <Switch
              id="mood-checkin"
              checked={moodCheckIn}
              onCheckedChange={setMoodCheckIn}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="journal-prompt">Evening Journal Prompt</Label>
              <p className="text-sm text-muted-foreground">
                Get a thoughtful prompt for evening reflection
              </p>
            </div>
            <Switch
              id="journal-prompt"
              checked={journalPrompt}
              onCheckedChange={setJournalPrompt}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Reminder Time
          </CardTitle>
          <CardDescription>
            Choose when you'd like to receive your daily reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Preferred Time</Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Reminders will be sent at {reminderTime} every day
            </p>
          </div>

          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Recent reminders and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: "Daily Check-in", time: "2 hours ago", message: "Time for your daily mood check-in!" },
              { title: "Journal Prompt", time: "Yesterday, 8:00 PM", message: "What brought you joy today?" },
              { title: "Streak Milestone", time: "2 days ago", message: "You've maintained a 10-day streak!" }
            ].map((notification, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-lg border">
                <Bell className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{notification.title}</p>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;

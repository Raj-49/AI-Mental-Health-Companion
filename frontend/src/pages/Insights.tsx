import { useState, useEffect } from "react";
import { TrendingUp, Calendar, BookOpen, Smile } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getJournalStats } from "@/services/journalService";
import { getMoodStats } from "@/services/moodService";
import { toast } from "@/hooks/use-toast";

const moodData = [
  { name: "Mon", mood: 7 },
  { name: "Tue", mood: 6 },
  { name: "Wed", mood: 8 },
  { name: "Thu", mood: 5 },
  { name: "Fri", mood: 9 },
  { name: "Sat", mood: 8 },
  { name: "Sun", mood: 7 }
];

const moodDistribution = [
  { name: "Happy", value: 35, color: "hsl(142, 76%, 36%)" },
  { name: "Calm", value: 30, color: "hsl(262, 83%, 58%)" },
  { name: "Anxious", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Sad", value: 15, color: "hsl(221, 83%, 53%)" }
];

const Insights = () => {
  const [journalStats, setJournalStats] = useState<{ totalCount: number } | null>(null);
  const [moodStats, setMoodStats] = useState<{ 
    totalLogs: number; 
    averageEnergy: number;
    moodTimeline: Array<{ date: string; energyLevel: number }>;
    moodBreakdown: Array<{ mood: string; count: number; percentage: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [journals, moods] = await Promise.all([
        getJournalStats(),
        getMoodStats(7) // Last 7 days
      ]);
      setJournalStats(journals);
      setMoodStats(moods);
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format mood timeline for chart
  const moodChartData = moodStats?.moodTimeline.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    mood: item.energyLevel
  })) || moodData;

  // Format mood distribution for pie chart
  const moodPieData = moodStats?.moodBreakdown.map((item, index) => ({
    name: item.mood,
    value: item.count,
    color: moodDistribution[index % moodDistribution.length]?.color || "hsl(var(--primary))"
  })) || moodDistribution;
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground mt-2">Your wellness journey at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Journals</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : journalStats?.totalCount || 0}</div>
            <p className="text-xs text-muted-foreground">All time entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mood Logs</CardTitle>
            <Smile className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : moodStats?.totalLogs || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Energy Level</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : moodStats?.averageEnergy ? moodStats.averageEnergy.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Out of 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : moodStats?.moodBreakdown[0]?.mood || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Mood Trend</CardTitle>
            <CardDescription>Your average mood score this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={moodChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
            <CardDescription>Breakdown of your emotions this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={moodPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Highlights</CardTitle>
          <CardDescription>Personalized insights based on your activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <p className="font-medium">You're most active on weekends</p>
              <p className="text-sm text-muted-foreground">Consider maintaining this consistency throughout the week</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <p className="font-medium">Your mood improves after journaling</p>
              <p className="text-sm text-muted-foreground">Keep up with your daily journaling practice</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <p className="font-medium">Stress levels decrease on meditation days</p>
              <p className="text-sm text-muted-foreground">Try to meditate more frequently for better results</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;

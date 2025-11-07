import { useState, useEffect } from "react";
import { Smile, Frown, Meh, Heart, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getMoodLogs, createMoodLog, MoodLog as MoodLogType } from "@/services/moodService";

const moods = [
  { name: "Happy", icon: "😊", color: "bg-green-100 text-green-600" },
  { name: "Sad", icon: "😢", color: "bg-blue-100 text-blue-600" },
  { name: "Anxious", icon: "😰", color: "bg-yellow-100 text-yellow-600" },
  { name: "Calm", icon: "😌", color: "bg-purple-100 text-purple-600" },
  { name: "Angry", icon: "😠", color: "bg-red-100 text-red-600" }
];

const MoodLogs = () => {
  const [logs, setLogs] = useState<MoodLogType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [notes, setNotes] = useState("");

  // Load mood logs on mount
  useEffect(() => {
    loadMoodLogs();
  }, []);

  const loadMoodLogs = async () => {
    try {
      setIsLoading(true);
      const response = await getMoodLogs(1, 30);
      setLogs(response.moodLogs);
    } catch (error) {
      console.error("Failed to load mood logs:", error);
      toast({
        title: "Error",
        description: "Failed to load mood logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = logs.slice(0, 7).reverse().map(log => ({
    date: new Date(log.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    stress: log.stressLevel,
    energy: log.energyLevel
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMoodLog({
        mood: selectedMood,
        energyLevel: energyLevel[0],
        stressLevel: stressLevel[0],
        note: notes || undefined,
      });

      toast({ title: "Mood logged successfully" });
      setIsDialogOpen(false);
      setSelectedMood("");
      setEnergyLevel([5]);
      setStressLevel([5]);
      setNotes("");
      
      // Reload logs
      loadMoodLogs();
    } catch (error) {
      console.error("Failed to create mood log:", error);
      toast({
        title: "Error",
        description: "Failed to log mood",
        variant: "destructive",
      });
    }
  };

  const getMoodIcon = (mood: string) => {
    const moodData = moods.find(m => m.name.toLowerCase() === mood.toLowerCase());
    return moodData?.icon || "😊";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mood Tracker</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Track your emotional well-being</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Log Mood</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How are you feeling?</DialogTitle>
              <DialogDescription>Select your current mood, energy, and stress levels</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Select Mood</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.name}
                        type="button"
                        onClick={() => setSelectedMood(mood.name)}
                        className={`p-4 rounded-xl border-2 transition-smooth text-center ${
                          selectedMood === mood.name 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-3xl mb-1">{mood.icon}</div>
                        <div className="text-xs font-medium">{mood.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Energy Level: {energyLevel[0]}/10</Label>
                  <Slider
                    value={energyLevel}
                    onValueChange={setEnergyLevel}
                    min={1}
                    max={10}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">How energized do you feel?</p>
                </div>

                <div className="space-y-2">
                  <Label>Stress Level: {stressLevel[0]}/10</Label>
                  <Slider
                    value={stressLevel}
                    onValueChange={setStressLevel}
                    min={1}
                    max={10}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">How stressed do you feel?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="What's on your mind?"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!selectedMood}>Save Mood</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mood Trends (Last 7 Days)</CardTitle>
          <CardDescription>Track your energy and stress levels over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Loading chart...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="energy" stroke="hsl(var(--primary))" strokeWidth={2} name="Energy" />
                <Line type="monotone" dataKey="stress" stroke="hsl(var(--destructive))" strokeWidth={2} name="Stress" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No mood logs yet. Start tracking your mood!
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading mood logs...</div>
        ) : logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="text-4xl">{getMoodIcon(log.mood)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{log.mood}</h3>
                      <span className="text-sm text-muted-foreground">
                        • Energy: {log.energyLevel}/10 • Stress: {log.stressLevel}/10
                      </span>
                    </div>
                    {log.note && <p className="text-sm text-muted-foreground">{log.note}</p>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(log.loggedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No mood logs yet. Click "Log Mood" to start tracking!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MoodLogs;

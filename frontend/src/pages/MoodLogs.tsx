import { useState } from "react";
import { Smile, Frown, Meh, Heart, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MoodLog {
  id: string;
  mood: string;
  icon: string;
  stressLevel: number;
  notes: string;
  date: string;
}

const moods = [
  { name: "Happy", icon: "😊", color: "bg-green-100 text-green-600" },
  { name: "Sad", icon: "😢", color: "bg-blue-100 text-blue-600" },
  { name: "Anxious", icon: "😰", color: "bg-yellow-100 text-yellow-600" },
  { name: "Calm", icon: "😌", color: "bg-purple-100 text-purple-600" },
  { name: "Angry", icon: "😠", color: "bg-red-100 text-red-600" }
];

const MoodLogs = () => {
  const [logs, setLogs] = useState<MoodLog[]>([
    { id: "1", mood: "Happy", icon: "😊", stressLevel: 2, notes: "Great day at work!", date: "2024-01-15" },
    { id: "2", mood: "Calm", icon: "😌", stressLevel: 3, notes: "Meditation helped", date: "2024-01-14" },
    { id: "3", mood: "Anxious", icon: "😰", stressLevel: 7, notes: "Deadline pressure", date: "2024-01-13" },
    { id: "4", mood: "Happy", icon: "😊", stressLevel: 2, notes: "Weekend was relaxing", date: "2024-01-12" },
    { id: "5", mood: "Sad", icon: "😢", stressLevel: 6, notes: "Missing family", date: "2024-01-11" }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [stressLevel, setStressLevel] = useState([5]);
  const [notes, setNotes] = useState("");

  const chartData = logs.slice(0, 7).reverse().map(log => ({
    date: log.date,
    stress: log.stressLevel
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const moodData = moods.find(m => m.name === selectedMood);
    
    const newLog: MoodLog = {
      id: Date.now().toString(),
      mood: selectedMood,
      icon: moodData?.icon || "😊",
      stressLevel: stressLevel[0],
      notes,
      date: new Date().toISOString().split('T')[0]
    };

    setLogs([newLog, ...logs]);
    toast({ title: "Mood logged successfully" });
    setIsDialogOpen(false);
    setSelectedMood("");
    setStressLevel([5]);
    setNotes("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mood Tracker</h1>
          <p className="text-muted-foreground mt-2">Track your emotional well-being</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Log Mood</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How are you feeling?</DialogTitle>
              <DialogDescription>Select your current mood and stress level</DialogDescription>
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
                  <Label>Stress Level: {stressLevel[0]}/10</Label>
                  <Slider
                    value={stressLevel}
                    onValueChange={setStressLevel}
                    max={10}
                    step={1}
                    className="py-4"
                  />
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
          <CardTitle>Stress Trend (Last 7 Days)</CardTitle>
          <CardDescription>Track your stress levels over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="stress" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="text-4xl">{log.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{log.mood}</h3>
                    <span className="text-sm text-muted-foreground">• Stress: {log.stressLevel}/10</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                </div>
                <div className="text-sm text-muted-foreground">{log.date}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodLogs;

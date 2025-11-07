import { useState } from "react";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: string;
}

const Journals = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      title: "A Beautiful Day",
      content: "Today was amazing. I felt calm and peaceful throughout the day.",
      date: "2024-01-15",
      mood: "Happy"
    },
    {
      id: "2",
      title: "Feeling Grateful",
      content: "Reflecting on all the good things in my life. Feeling thankful.",
      date: "2024-01-14",
      mood: "Grateful"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", mood: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEntry) {
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, ...formData, date: new Date().toISOString().split('T')[0] }
          : entry
      ));
      toast({ title: "Journal updated successfully" });
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        ...formData,
        date: new Date().toISOString().split('T')[0]
      };
      setEntries([newEntry, ...entries]);
      toast({ title: "Journal entry created" });
    }

    setIsDialogOpen(false);
    setFormData({ title: "", content: "", mood: "" });
    setEditingEntry(null);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({ title: entry.title, content: entry.content, mood: entry.mood });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    toast({ title: "Journal entry deleted" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Journals</h1>
          <p className="text-muted-foreground mt-2">Express your thoughts and feelings</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingEntry(null); setFormData({ title: "", content: "", mood: "" }); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Edit" : "New"} Journal Entry</DialogTitle>
              <DialogDescription>
                Write down your thoughts and feelings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mood">How are you feeling?</Label>
                  <Input
                    id="mood"
                    placeholder="Happy, Sad, Anxious, Calm..."
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Your thoughts</Label>
                  <Textarea
                    id="content"
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-hover transition-smooth">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="line-clamp-1">{entry.title}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {entry.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{entry.content}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {entry.mood}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Journals;

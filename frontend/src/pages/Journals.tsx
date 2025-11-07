import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  getJournals, 
  createJournal, 
  updateJournal, 
  deleteJournal,
  Journal as JournalType 
} from "@/services/journalService";

const Journals = () => {
  const [entries, setEntries] = useState<JournalType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalType | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", mood: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      setIsLoading(true);
      const response = await getJournals(1, 50);
      setEntries(response.journals);
    } catch (error) {
      console.error("Failed to load journals:", error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editingEntry) {
        await updateJournal(editingEntry.id, formData);
        toast({ title: "Journal updated successfully" });
      } else {
        await createJournal(formData);
        toast({ title: "Journal entry created" });
      }

      setIsDialogOpen(false);
      setFormData({ title: "", content: "", mood: "" });
      setEditingEntry(null);
      loadJournals();
    } catch (error) {
      console.error("Failed to save journal:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (entry: JournalType) => {
    setEditingEntry(entry);
    setFormData({ 
      title: entry.title || "", 
      content: entry.content || "", 
      mood: entry.mood || "" 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteJournal(id);
      toast({ title: "Journal entry deleted" });
      loadJournals();
    } catch (error) {
      console.error("Failed to delete journal:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Journals</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Express your thoughts and feelings</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingEntry(null); setFormData({ title: "", content: "", mood: "" }); }} className="w-full sm:w-auto">
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
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Entry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading journal entries...
        </div>
      ) : entries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-hover transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="line-clamp-1">{entry.title || "Untitled"}</span>
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
                  {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {entry.content || "No content"}
                </p>
                {entry.mood && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {entry.mood}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No journal entries yet. Click "New Entry" to start writing!
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Journals;

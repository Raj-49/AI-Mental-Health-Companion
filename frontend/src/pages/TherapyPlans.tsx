import { useState } from "react";
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface TherapyPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
  category: string;
}

const TherapyPlans = () => {
  const [plans, setPlans] = useState<TherapyPlan[]>([
    {
      id: "1",
      title: "Daily Meditation Practice",
      description: "Meditate for 10 minutes every morning",
      progress: 65,
      category: "Mindfulness"
    },
    {
      id: "2",
      title: "Exercise 3x per Week",
      description: "Engage in physical activity to boost mood",
      progress: 80,
      category: "Physical Health"
    },
    {
      id: "3",
      title: "Journaling Every Night",
      description: "Write down thoughts before bed",
      progress: 45,
      category: "Self-Reflection"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TherapyPlan | null>(null);
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    progress: 0,
    category: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlan) {
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id ? { ...plan, ...formData } : plan
      ));
      toast({ title: "Goal updated successfully" });
    } else {
      const newPlan: TherapyPlan = {
        id: Date.now().toString(),
        ...formData
      };
      setPlans([...plans, newPlan]);
      toast({ title: "New goal created" });
    }

    setIsDialogOpen(false);
    setFormData({ title: "", description: "", progress: 0, category: "" });
    setEditingPlan(null);
  };

  const handleEdit = (plan: TherapyPlan) => {
    setEditingPlan(plan);
    setFormData({ 
      title: plan.title, 
      description: plan.description, 
      progress: plan.progress,
      category: plan.category
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPlans(plans.filter(plan => plan.id !== id));
    toast({ title: "Goal deleted" });
  };

  const updateProgress = (id: string, newProgress: number) => {
    setPlans(plans.map(plan => 
      plan.id === id ? { ...plan, progress: newProgress } : plan
    ));
    toast({ title: "Progress updated" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Therapy Goals</h1>
          <p className="text-muted-foreground mt-2">Track your progress towards wellness</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { 
              setEditingPlan(null); 
              setFormData({ title: "", description: "", progress: 0, category: "" }); 
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit" : "New"} Therapy Goal</DialogTitle>
              <DialogDescription>
                Set a wellness goal and track your progress
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g. Mindfulness, Exercise, Sleep"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progress">Initial Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Goal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-hover transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary">{plan.category}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{plan.title}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-primary">{plan.progress}%</span>
                </div>
                <Progress value={plan.progress} className="h-2" />
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateProgress(plan.id, Math.max(0, plan.progress - 10))}
                  >
                    -10%
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateProgress(plan.id, Math.min(100, plan.progress + 10))}
                  >
                    +10%
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TherapyPlans;

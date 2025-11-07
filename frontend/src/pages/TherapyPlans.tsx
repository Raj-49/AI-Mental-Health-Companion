import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  getTherapyPlans, 
  createTherapyPlan, 
  updateTherapyPlan, 
  deleteTherapyPlan,
  updateTherapyProgress,
  type TherapyPlan 
} from "@/services/therapyService";

interface TherapyPlanForm {
  goalTitle: string;
  goalDescription: string;
  progress: number;
}

const TherapyPlans = () => {
  const [plans, setPlans] = useState<TherapyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TherapyPlan | null>(null);
  const [formData, setFormData] = useState<TherapyPlanForm>({ 
    goalTitle: "", 
    goalDescription: "", 
    progress: 0
  });

  // Load therapy plans on mount
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const response = await getTherapyPlans(1, 100); // Get all plans
      setPlans(response.therapyPlans);
    } catch (error: any) {
      toast({ 
        title: "Error loading plans", 
        description: error.response?.data?.message || "Failed to load therapy plans",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlan) {
        await updateTherapyPlan(editingPlan.id, formData);
        toast({ title: "Goal updated successfully" });
      } else {
        await createTherapyPlan(formData);
        toast({ title: "New goal created" });
      }

      await loadPlans(); // Reload plans
      setIsDialogOpen(false);
      setFormData({ goalTitle: "", goalDescription: "", progress: 0 });
      setEditingPlan(null);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to save goal",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (plan: TherapyPlan) => {
    setEditingPlan(plan);
    setFormData({ 
      goalTitle: plan.goalTitle, 
      goalDescription: plan.goalDescription || "", 
      progress: plan.progress
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTherapyPlan(id);
      toast({ title: "Goal deleted" });
      await loadPlans(); // Reload plans
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to delete goal",
        variant: "destructive"
      });
    }
  };

  const updateProgress = async (id: number, newProgress: number) => {
    try {
      await updateTherapyProgress(id, newProgress);
      toast({ title: "Progress updated" });
      await loadPlans(); // Reload plans
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Therapy Goals</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Track your progress towards wellness</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { 
              setEditingPlan(null); 
              setFormData({ goalTitle: "", goalDescription: "", progress: 0 }); 
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
                  <Label htmlFor="goalTitle">Goal Title</Label>
                  <Input
                    id="goalTitle"
                    value={formData.goalTitle}
                    onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalDescription">Description</Label>
                  <Textarea
                    id="goalDescription"
                    rows={4}
                    value={formData.goalDescription}
                    onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading therapy plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <Target className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No therapy goals yet</p>
          <p className="text-sm text-muted-foreground mt-2">Create your first goal to start tracking progress</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-hover transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="w-5 h-5 text-primary" />
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
                <CardTitle className="text-lg">{plan.goalTitle}</CardTitle>
                <CardDescription>{plan.goalDescription}</CardDescription>
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
      )}
    </div>
  );
};

export default TherapyPlans;

import { BookOpen, Headphones, Video, Heart, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recommendations = [
  {
    id: "1",
    title: "Mindfulness Meditation Guide",
    description: "A beginner-friendly guide to help you start your meditation journey",
    category: "Meditation",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: "2",
    title: "Understanding Anxiety",
    description: "Learn about anxiety triggers and coping mechanisms",
    category: "Article",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "3",
    title: "Relaxing Sleep Sounds",
    description: "Curated playlist to help you fall asleep peacefully",
    category: "Audio",
    icon: Headphones,
    color: "bg-green-100 text-green-600"
  },
  {
    id: "4",
    title: "Breathing Exercises",
    description: "Video tutorial on breathing techniques for stress relief",
    category: "Video",
    icon: Video,
    color: "bg-red-100 text-red-600"
  },
  {
    id: "5",
    title: "Self-Care Routine Tips",
    description: "Build a sustainable self-care routine that works for you",
    category: "Guide",
    icon: Heart,
    color: "bg-pink-100 text-pink-600"
  },
  {
    id: "6",
    title: "Cognitive Behavioral Therapy Basics",
    description: "Introduction to CBT techniques for managing negative thoughts",
    category: "Article",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600"
  }
];

const Recommendations = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recommendations</h1>
        <p className="text-muted-foreground mt-2">Personalized resources for your wellness journey</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="hover:shadow-hover transition-smooth cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary font-medium hover:underline">
                  Learn more →
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">More Coming Soon!</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We're constantly adding new resources tailored to your needs based on your mood patterns and journal entries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recommendations;

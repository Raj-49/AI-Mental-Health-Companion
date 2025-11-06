import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, MessageCircle, BookOpen, TrendingUp, Shield } from "lucide-react";
import heroImage from "@/assets/hero-wellness.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Peaceful wellness background" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-8">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Your Personal AI
              <span className="block text-primary mt-2">Mental Health Companion</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              A safe space to express yourself, track your mental wellness, and receive supportive guidance through AI-powered conversations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Everything You Need for Mental Wellness
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Comprehensive tools designed to support your mental health journey
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="gradient-card rounded-2xl p-8 shadow-soft hover:shadow-hover transition-smooth">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <MessageCircle className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">AI Chat Support</h3>
              <p className="text-muted-foreground">
                24/7 compassionate AI companion to listen and provide supportive guidance
              </p>
            </div>
            
            <div className="gradient-card rounded-2xl p-8 shadow-soft hover:shadow-hover transition-smooth">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Personal Journal</h3>
              <p className="text-muted-foreground">
                Express your thoughts and feelings in a private, secure space
              </p>
            </div>
            
            <div className="gradient-card rounded-2xl p-8 shadow-soft hover:shadow-hover transition-smooth">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Mood Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your emotional patterns and identify trends over time
              </p>
            </div>
            
            <div className="gradient-card rounded-2xl p-8 shadow-soft hover:shadow-hover transition-smooth">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Privacy First</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and secure. Your privacy is our priority
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands who have found support and peace of mind
          </p>
          <Link to="/register">
            <Button size="lg">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 AI Mental Health Companion. Supporting your wellness journey.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

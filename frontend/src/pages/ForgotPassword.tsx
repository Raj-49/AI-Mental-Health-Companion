import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Brain, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { forgotPassword } from "@/services/authService";
import { AxiosError } from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await forgotPassword({ email });
      
      toast({
        title: "Reset link sent!",
        description: response.message || "Check your email for password reset instructions.",
      });
      
      setIsSubmitted(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;
      const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || "Failed to send reset link. Please try again.";
      
      toast({
        title: "Request failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "We've sent you an email with reset instructions"
              : "Enter your email to receive reset instructions"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent/50 border border-accent rounded-lg p-4">
                <p className="text-sm text-center text-accent-foreground">
                  We've sent an email to <strong>{email}</strong> with instructions to reset your password.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsSubmitted(false)}
                disabled={isLoading}
              >
                Resend Email
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;

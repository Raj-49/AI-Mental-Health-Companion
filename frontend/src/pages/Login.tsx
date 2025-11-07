import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { googleLogin } from "@/services/authService";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;
      const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || "Login failed. Please try again.";
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({
        title: "Google Sign-In Failed",
        description: "No credential received from Google",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await googleLogin(credentialResponse.credential);
      
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;
      const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || "Google sign-in failed. Please try again.";
      
      toast({
        title: "Google Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Google Sign-In Failed",
      description: "An error occurred during Google sign-in. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center space-y-3 px-4 sm:px-6">
          <div className="flex justify-center mb-2">
            <img 
              src="/logo.png" 
              alt="MindCare Logo" 
              className="h-14 sm:h-16 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full items-center justify-center hidden">
              <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-sm sm:text-base">Sign in to continue your wellness journey</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="username email"
                className="h-10 sm:h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs sm:text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
                className="h-10 sm:h-11"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
              />
              <Label
                htmlFor="rememberMe"
                className="text-xs sm:text-sm font-normal cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </div>

            <Button type="submit" className="w-full h-10 sm:h-11" size="lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-[384px]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="large"
                  width="100%"
                  text="signin_with"
                  useOneTap={false}
                />
              </div>
            </div>

            <div className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

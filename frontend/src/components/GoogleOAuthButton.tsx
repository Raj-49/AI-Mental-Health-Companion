import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { toast } from '@/hooks/use-toast';
import { googleAuth } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

interface GoogleOAuthButtonProps {
  rememberMe?: boolean;
  onSuccess?: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

export const GoogleOAuthButton = ({ 
  rememberMe = false, 
  onSuccess,
  text = 'signin_with'
}: GoogleOAuthButtonProps) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      console.log('Google OAuth Response:', credentialResponse);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('Sending credential to backend...');
      const response = await googleAuth(credentialResponse.credential, rememberMe);
      
      console.log('Backend response:', response);
      setUser(response.user);
      
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      const axiosError = error as AxiosError<{ error: string; message: string }>;
      const errorMessage = axiosError.response?.data?.error 
        || axiosError.response?.data?.message 
        || (error as Error).message
        || "Google sign-in failed. Please try again.";
      
      console.error('Error details:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: errorMessage,
      });
      
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth error occurred');
    toast({
      title: "Authentication failed",
      description: "Could not connect to Google. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text={text}
        size="large"
        width="350"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleOAuthButton;

/**
 * ProfileAvatar Component
 * 
 * A robust avatar component that handles:
 * - Image loading with validation
 * - Automatic fallback to placeholder on 429 or other errors
 * - In-memory caching to prevent repeated failures
 * - Loading states
 * - Initials fallback
 */

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { loadProfileImage } from '@/lib/imageLoader';

interface ProfileAvatarProps {
  imageUrl?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLoadingState?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-32 h-32 text-4xl',
};

export const ProfileAvatar = ({
  imageUrl,
  userName,
  userEmail,
  size = 'md',
  className = '',
  showLoadingState = true,
}: ProfileAvatarProps) => {
  const [validatedImageUrl, setValidatedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get user initials for fallback
  const getUserInitials = () => {
    if (userName) {
      const names = userName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (userEmail) {
      return userEmail[0].toUpperCase();
    }
    return 'U';
  };

  // Load and validate image on mount or when imageUrl changes
  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!imageUrl) {
        setIsLoading(false);
        setValidatedImageUrl(null);
        return;
      }

      setIsLoading(true);
      setImageError(false);

      try {
        // Use our caching image loader
        const validUrl = await loadProfileImage(imageUrl, {
          placeholder: undefined, // We'll handle fallback with initials
        });

        if (isMounted) {
          // If it returned a placeholder or the original URL
          if (validUrl === imageUrl) {
            setValidatedImageUrl(validUrl);
          } else {
            // Validation failed, use fallback
            console.log('ProfileAvatar: Image validation failed, showing initials');
            setValidatedImageUrl(null);
            setImageError(true);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('ProfileAvatar: Error loading image', error);
        if (isMounted) {
          setValidatedImageUrl(null);
          setImageError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  // Handle runtime image errors (e.g., image loads initially but fails later)
  const handleImageError = () => {
    console.log('ProfileAvatar: Image load error, falling back to initials');
    setImageError(true);
    setValidatedImageUrl(null);
  };

  const sizeClass = sizeClasses[size];

  return (
    <Avatar className={`${sizeClass} border-2 border-primary ${className}`}>
      {isLoading && showLoadingState ? (
        <AvatarFallback className="bg-primary/10 text-primary font-semibold animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
        </AvatarFallback>
      ) : validatedImageUrl && !imageError ? (
        <>
          <AvatarImage
            src={validatedImageUrl}
            alt={userName || userEmail || 'User avatar'}
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getUserInitials()}
          </AvatarFallback>
        </>
      ) : (
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getUserInitials()}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default ProfileAvatar;

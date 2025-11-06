/**
 * Image Loader Utility
 * 
 * Handles profile image loading with:
 * - URL validation and health checking
 * - In-memory caching to prevent repeated 429 errors
 * - Automatic fallback to placeholder on failure
 * - Debouncing to avoid rate limits
 */

interface CachedImage {
  url: string;
  status: 'valid' | 'invalid' | 'pending';
  timestamp: number;
  validatedUrl?: string;
}

// In-memory cache for image validation results
const imageCache = new Map<string, CachedImage>();

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Debounce map to prevent multiple simultaneous requests for same URL
const pendingValidations = new Map<string, Promise<string>>();

/**
 * Default placeholder image path
 * You can replace this with your own default avatar
 */
const DEFAULT_AVATAR = '/assets/default-avatar.svg';

/**
 * Validate if an image URL is accessible
 * Returns the URL if valid, or null if invalid
 */
async function validateImageUrl(url: string): Promise<string | null> {
  try {
    // Use HEAD request to check if image is accessible without downloading it
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // Google images are cross-origin
      cache: 'force-cache', // Use browser cache if available
    });

    // With no-cors, we can't check status, so we'll use a different approach
    // Create an Image object to test loading
    return new Promise((resolve) => {
      const img = new Image();
      
      // Set a timeout to avoid hanging
      const timeout = setTimeout(() => {
        resolve(null);
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.warn(`Image failed to load: ${url}`);
        resolve(null);
      };
      
      // Set crossOrigin before src to handle CORS properly
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  } catch (error) {
    console.error('Error validating image URL:', error);
    return null;
  }
}

/**
 * Get cached image status
 */
function getCachedImage(url: string): CachedImage | null {
  const cached = imageCache.get(url);
  
  if (!cached) return null;
  
  // Check if cache is still valid
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    imageCache.delete(url);
    return null;
  }
  
  return cached;
}

/**
 * Load and validate profile image with caching
 * 
 * @param imageUrl - The profile image URL to load
 * @param options - Optional configuration
 * @returns Promise that resolves to a valid image URL or placeholder
 */
export async function loadProfileImage(
  imageUrl: string | null | undefined,
  options: {
    placeholder?: string;
    skipValidation?: boolean;
  } = {}
): Promise<string> {
  const placeholder = options.placeholder || DEFAULT_AVATAR;
  
  // Return placeholder immediately if no URL provided
  if (!imageUrl) {
    console.log('No image URL provided, using placeholder');
    return placeholder;
  }
  
  // Skip validation if requested (use for already validated URLs)
  if (options.skipValidation) {
    return imageUrl;
  }
  
  // Check cache first
  const cached = getCachedImage(imageUrl);
  if (cached) {
    console.log('Using cached image result:', cached.status);
    if (cached.status === 'valid' && cached.validatedUrl) {
      return cached.validatedUrl;
    }
    if (cached.status === 'invalid') {
      return placeholder;
    }
  }
  
  // Check if validation is already in progress for this URL
  const pending = pendingValidations.get(imageUrl);
  if (pending) {
    console.log('Waiting for pending validation...');
    return pending;
  }
  
  // Start new validation
  console.log('Validating image URL:', imageUrl);
  const validationPromise = (async () => {
    try {
      const validatedUrl = await validateImageUrl(imageUrl);
      
      if (validatedUrl) {
        // Cache as valid
        imageCache.set(imageUrl, {
          url: imageUrl,
          status: 'valid',
          timestamp: Date.now(),
          validatedUrl,
        });
        console.log('Image validated successfully');
        return validatedUrl;
      } else {
        // Cache as invalid
        imageCache.set(imageUrl, {
          url: imageUrl,
          status: 'invalid',
          timestamp: Date.now(),
        });
        console.log('Image validation failed, using placeholder');
        return placeholder;
      }
    } catch (error) {
      console.error('Image validation error:', error);
      // Cache as invalid on error
      imageCache.set(imageUrl, {
        url: imageUrl,
        status: 'invalid',
        timestamp: Date.now(),
      });
      return placeholder;
    } finally {
      // Clean up pending validation
      pendingValidations.delete(imageUrl);
    }
  })();
  
  // Store pending validation
  pendingValidations.set(imageUrl, validationPromise);
  
  return validationPromise;
}

/**
 * Preload profile image in the background
 * This can be called when user data is loaded to warm up the cache
 */
export function preloadProfileImage(imageUrl: string | null | undefined): void {
  if (!imageUrl) return;
  
  // Check if already cached
  const cached = getCachedImage(imageUrl);
  if (cached && cached.status !== 'pending') return;
  
  // Load in background (don't await)
  loadProfileImage(imageUrl).catch((error) => {
    console.error('Background preload failed:', error);
  });
}

/**
 * Clear image cache (useful for debugging or manual refresh)
 */
export function clearImageCache(): void {
  imageCache.clear();
  pendingValidations.clear();
  console.log('Image cache cleared');
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getImageCacheStats() {
  return {
    size: imageCache.size,
    entries: Array.from(imageCache.entries()).map(([url, data]) => ({
      url,
      status: data.status,
      age: Date.now() - data.timestamp,
    })),
  };
}

export default {
  loadProfileImage,
  preloadProfileImage,
  clearImageCache,
  getImageCacheStats,
};

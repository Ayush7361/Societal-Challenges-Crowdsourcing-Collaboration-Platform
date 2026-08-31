/**
 * Resolves full image URL for uploaded evidence photos.
 * Converts relative backend paths (/uploads/file.jpg) into full backend server URLs.
 * Must use the same API origin as axios (see services/api.js) so card photos load.
 */
const API_BASE =
  import.meta.env.VITE_API_URL || 'https://samadhan-setu-kn61.onrender.com/api';

export const getApiBaseUrl = () => API_BASE;

export const getServerOrigin = () => {
  // A relative API base (such as `/api`) is served through Vite/Vercel's proxy,
  // so uploaded files must remain rooted at the current origin as `/uploads`.
  if (API_BASE.startsWith('/')) return '';

  try {
    return new URL(API_BASE).origin;
  } catch {
    // Keep a predictable fallback for malformed local configuration.
    return API_BASE.replace(/\/api\/?$/, '');
  }
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${getServerOrigin()}${cleanPath}`;
};

/** Cover photo: primary image, or first additional evidence file. */
export const getChallengeCoverUrl = (challenge) => {
  if (!challenge) return '';
  const path = challenge.image || challenge.evidence?.[0] || '';
  return getImageUrl(path);
};

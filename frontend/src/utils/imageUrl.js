/**
 * Resolves full image URL for uploaded evidence photos.
 * Converts relative backend paths (/uploads/file.jpg) into full backend server URLs.
 * Must use the same API origin as axios (see services/api.js) so card photos load.
 */
const API_BASE =
  import.meta.env.VITE_API_URL || 'https://samadhan-setu-kn61.onrender.com/api';

export const getApiBaseUrl = () => API_BASE;

export const getServerOrigin = () => API_BASE.replace(/\/api\/?$/, '');

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

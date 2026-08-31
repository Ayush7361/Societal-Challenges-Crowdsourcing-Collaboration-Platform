/**
 * Resolves full image URL for uploaded evidence photos.
 * Converts relative backend paths (/uploads/file.jpg) into full backend server URLs
 * (e.g. http://localhost:5000/uploads/file.jpg or https://backend.domain.com/uploads/file.jpg).
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // Derive backend base origin from VITE_API_URL or fallback to http://localhost:5000
  let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Strip trailing /api or /api/
  const serverOrigin = apiBase.replace(/\/api\/?$/, '');

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${serverOrigin}${cleanPath}`;
};

import defaultProfileImage from '../../../assets/imgs/default-profile.png';

export const PROFILE_PHOTO_EXPORT_SIZE = 512;

const DEFAULT_AVATAR_MARKERS = ['/default/', 'default-profile', 'default/person.png'];

export const isCustomProfilePhoto = (avatarPath) => {
  if (!avatarPath || typeof avatarPath !== 'string') return false;
  const normalized = avatarPath.trim();
  if (!normalized) return false;
  if (normalized.startsWith('blob:') || normalized.startsWith('data:')) return true;
  if (normalized.includes('/uploads/avatars/')) return true;
  return !DEFAULT_AVATAR_MARKERS.some((marker) => normalized.includes(marker));
};

export const getProfilePhotoDisplayUrl = (avatarPath, apiBaseUrl) => {
  if (!isCustomProfilePhoto(avatarPath)) return defaultProfileImage;
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:')) {
    return avatarPath;
  }
  if (avatarPath.startsWith('/')) return `${apiBaseUrl}${avatarPath}`;
  return `${apiBaseUrl}/${avatarPath}`;
};

export const exportCroppedProfilePhoto = ({
  image,
  viewportSize,
  offsetX,
  offsetY,
  scale,
  exportSize = PROFILE_PHOTO_EXPORT_SIZE,
}) => {
  const canvas = document.createElement('canvas');
  canvas.width = exportSize;
  canvas.height = exportSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare image export.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const scaledWidth = image.naturalWidth * scale;
  const scaledHeight = image.naturalHeight * scale;
  const sourceSize = viewportSize / scale;
  // Mirror the modal layout: image is centered in the viewport, then shifted by offset.
  const sourceX = (scaledWidth / 2 - viewportSize / 2 - offsetX) / scale;
  const sourceY = (scaledHeight / 2 - viewportSize / 2 - offsetY) / scale;

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    exportSize,
    exportSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not export profile photo.'));
          return;
        }
        resolve(blob);
      },
      'image/png'
    );
  });
};

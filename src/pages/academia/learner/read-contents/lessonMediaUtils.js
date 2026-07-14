export function resolveYoutubeEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  let videoId = '';
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts[1]) {
      videoId = parts[1].split(/[?#]/)[0];
    }
  } else if (url.includes('v=')) {
    const parts = url.split('v=');
    if (parts[1]) {
      videoId = parts[1].split(/[&#]/)[0];
    }
  } else if (url.includes('youtube.com/v/')) {
    const parts = url.split('youtube.com/v/');
    if (parts[1]) {
      videoId = parts[1].split(/[?#]/)[0];
    }
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

export function isYoutubeUrl(url) {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export function resolveVideoSrc(videoUrl, apiBaseUrl) {
  if (!videoUrl) return '';
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://') || videoUrl.startsWith('data:')) {
    return videoUrl;
  }
  if (videoUrl.startsWith('/') && !videoUrl.startsWith('/src/')) {
    return `${apiBaseUrl}${videoUrl}`;
  }
  return videoUrl;
}

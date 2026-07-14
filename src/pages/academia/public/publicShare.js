export async function sharePublicPage({ title = '', text = '', url } = {}) {
  const shareUrl = url || window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return { ok: true, method: 'share' };
    } catch (error) {
      if (error?.name === 'AbortError') {
        return { ok: false, method: 'abort' };
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return { ok: true, method: 'clipboard' };
    } catch {
      // fall through
    }
  }

  return { ok: false, method: 'none' };
}

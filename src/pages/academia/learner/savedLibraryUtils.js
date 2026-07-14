const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function normalizeAssetUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

export function extractProjectList(body) {
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.projects)) return body.projects;
  if (Array.isArray(body)) return body;
  return [];
}

export async function fetchSavedProjects(token) {
  const headers = { Authorization: `Bearer ${token}` };

  const dedicatedEndpoints = ['/api/projects/saved', '/api/projects/my/saves'];
  for (const endpoint of dedicatedEndpoints) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
      if (!res.ok) continue;
      const body = await res.json();
      const list = extractProjectList(body);
      if (list.length > 0 || body?.success) return list;
    } catch {
      // try next endpoint
    }
  }

  const res = await fetch(`${API_BASE_URL}/api/projects`, { headers });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || body?.error?.message || 'Could not load projects');
  }

  const projects = extractProjectList(body).slice(0, 60);
  if (!projects.length) return [];

  const saved = await Promise.all(
    projects.map(async (project) => {
      if (!project?.id) return null;
      try {
        const checkRes = await fetch(`${API_BASE_URL}/api/projects/${project.id}/saves/check`, { headers });
        if (!checkRes.ok) return null;
        const checkBody = await checkRes.json();
        return checkBody?.data?.hasSaved ? project : null;
      } catch {
        return null;
      }
    })
  );

  return saved.filter(Boolean);
}

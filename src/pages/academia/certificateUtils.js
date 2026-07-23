export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function normalizeCertificate(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const finalScoreRaw = raw.finalScore ?? raw.final_score ?? raw.score ?? null;
  const finalScore = finalScoreRaw === null || finalScoreRaw === undefined || finalScoreRaw === ''
    ? null
    : Number(finalScoreRaw);

  const isVerified = Boolean(
    raw.isVerified === true
    || raw.is_verified === 1
    || raw.is_verified === true
    || raw.verified === true
  );

  const certificateNumber = raw.certificateNumber || raw.certificate_number || raw.number || '';
  const issueDate = raw.issueDate || raw.issue_date || raw.createdAt || raw.created_at || raw.issued_at || null;
  const totalHours = Number(raw.total_hours ?? raw.totalHours ?? raw.timeSpent?.hours ?? 0);
  const timeDisplay = raw.timeSpent?.display
    || (totalHours > 0 ? `${Math.round(totalHours)}h` : '—');

  return {
    ...raw,
    id: raw.id,
    courseId: raw.courseId ?? raw.course_id ?? raw.course?.id ?? null,
    courseTitle: raw.courseTitle || raw.course_title || raw.courseName || raw.course_name || raw.course?.title || 'Certificate',
    finalScore: Number.isFinite(finalScore) ? finalScore : null,
    totalQuestions: raw.totalQuestions ?? raw.total_questions ?? 0,
    total_hours: totalHours,
    timeSpent: { display: timeDisplay, hours: totalHours },
    issueDate,
    certificateNumber,
    isVerified,
    displayStatus: isVerified ? 'approved' : 'pending',
    tutorName: raw.tutorName || raw.tutor_name || raw.instructor_name || raw.instructorName || '',
    student: raw.student || {
      name: raw.student_name || raw.studentName || '',
      email: raw.student_email || raw.studentEmail || '',
    },
  };
}

export function formatCertificateIssuedOn(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' }).toUpperCase();
  const year = date.getFullYear();
  return `${day} - ${month} - ${year}`;
}

export function formatShortName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const initial = parts[0][0]?.toUpperCase() || '';
  return `${initial}. ${parts[parts.length - 1]}`;
}

export function buildCertificatePreviewPath(certificateNumber) {
  const number = String(certificateNumber || '').trim();
  if (!number) return '/certificate-preview';
  return `/certificate-preview?number=${encodeURIComponent(number)}`;
}

export function getCertificateVerifyPageUrl(certificateNumber) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/certificates?certificate=${encodeURIComponent(certificateNumber)}`;
}

function extractCertificateList(body) {
  const listData = body?.data ?? body;
  const raw = Array.isArray(listData?.certificates)
    ? listData.certificates
    : Array.isArray(listData?.data)
      ? listData.data
      : Array.isArray(listData)
        ? listData
        : [];
  return raw.map(normalizeCertificate).filter(Boolean);
}

function mapToPreviewFields(cert, profileUser, tutorName) {
  const studentName = cert.student?.name || cert.studentName || '';
  const profileName = profileUser?.name || profileUser?.email || studentName;
  const issueDate = cert.issueDate;

  return {
    studentName,
    courseTitle: cert.courseTitle || 'Course',
    tutorName: tutorName || cert.tutorName || 'Academia Tutor',
    issuedOn: formatCertificateIssuedOn(issueDate),
    downloadedBy: formatShortName(profileName) || studentName,
    validSince: issueDate ? String(new Date(issueDate).getFullYear()) : '',
    certificateNumber: cert.certificateNumber,
  };
}

async function fetchAdminCertificateByNumber(number, headers) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/certificates`, { headers });
    if (!res.ok) return null;
    const body = await res.json();
    const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
    const raw = list.find((item) => {
      const itemNumber = item.certificate_number || item.certificateNumber || item.number || '';
      return itemNumber === number;
    });
    return raw ? normalizeCertificate(raw) : null;
  } catch {
    return null;
  }
}

export function openCertificatePreview(certificateNumber, { newTab = false } = {}) {
  const path = buildCertificatePreviewPath(certificateNumber);
  const url = `${window.location.origin}${path}`;
  if (newTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  window.location.assign(path);
}

async function fetchCourseTutor(courseId, headers) {
  if (!courseId) return '';
  try {
    const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, { headers });
    if (!res.ok) return '';
    const body = await res.json();
    const course = body?.data ?? body;
    return course.instructor_name || course.instructorName || course.tutor_name || '';
  } catch {
    return '';
  }
}

export async function fetchCertificatePreviewData(certificateNumber) {
  const number = String(certificateNumber || '').trim();
  if (!number) {
    throw new Error('Certificate number is required.');
  }

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const requests = [
    fetch(`${API_BASE_URL}/api/certificates/verify/${encodeURIComponent(number)}`),
  ];

  if (token) {
    requests.push(
      fetch(`${API_BASE_URL}/api/profile`, { headers: authHeaders }),
      fetch(`${API_BASE_URL}/api/certificates/user/my-certificates?limit=200&offset=0`, { headers: authHeaders }),
    );
  }

  const [verifyRes, profileRes, listRes] = await Promise.all(requests);

  const verifyBody = await verifyRes.json().catch(() => ({}));
  const verifyData = verifyBody?.data ?? verifyBody;

  let cert = null;

  if (listRes?.ok) {
    const listBody = await listRes.json();
    const items = extractCertificateList(listBody);
    cert = items.find((item) => item.certificateNumber === number) || null;
  }

  if (!cert && token) {
    cert = await fetchAdminCertificateByNumber(number, authHeaders);
  }

  if (!cert && verifyRes.ok && verifyData?.valid) {
    cert = normalizeCertificate({
      certificate_number: number,
      student_name: verifyData.student_name || verifyData.studentName,
      course_title: verifyData.course_title || verifyData.courseTitle,
      issue_date: verifyData.issue_date || verifyData.issueDate || verifyData.issued_at,
      is_verified: verifyData.is_verified ?? verifyData.isVerified ?? 1,
      course_id: verifyData.course_id || verifyData.courseId,
      instructor_name: verifyData.instructor_name || verifyData.tutor_name,
    });
  }

  if (!cert) {
    const message = verifyBody?.message || verifyData?.reason || 'Certificate not found.';
    throw new Error(message);
  }

  let profileUser = null;
  if (profileRes?.ok) {
    const profileBody = await profileRes.json();
    profileUser = profileBody?.data?.user ?? profileBody?.user ?? null;
  }

  const tutorName = cert.tutorName || await fetchCourseTutor(cert.courseId, authHeaders);

  return {
    data: mapToPreviewFields(cert, profileUser, tutorName),
    isVerified: cert.isVerified,
    certificateNumber: number,
  };
}

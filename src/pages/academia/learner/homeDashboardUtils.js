const DAY_MS = 24 * 60 * 60 * 1000;
const LAST_CHAPTER_STORAGE_KEY = 'gonaraza-learner-last-chapter-by-course';

export function getStoredChapterId(courseId) {
  if (!courseId) return null;
  try {
    const raw = localStorage.getItem(LAST_CHAPTER_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const value = map[String(courseId)];
    return value ? String(value) : null;
  } catch {
    return null;
  }
}

export function setStoredChapterId(courseId, chapterId) {
  if (!courseId || chapterId === undefined || chapterId === null) return;
  try {
    const raw = localStorage.getItem(LAST_CHAPTER_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(courseId)] = String(chapterId);
    localStorage.setItem(LAST_CHAPTER_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage failures
  }
}

function resolveCourseChapterId(course) {
  return course?.last_chapter_id
    || course?.current_chapter_id
    || course?.next_chapter_id
    || getStoredChapterId(course?.id)
    || null;
}

function resolveAssessmentChapterId(item) {
  const rawType = String(item?.assessmentType || item?.type || item?.category || '').toLowerCase();
  if (rawType === 'summative' || item?.isSummative) return 'assessment';

  const assessmentRef = item?.formative_assessment_uuid
    || item?.assessmentUuid
    || item?.uuid
    || item?.assessmentId
    || item?.assessment_id
    || item?.id;
  if (!assessmentRef) return null;
  if (String(assessmentRef).startsWith('formative-')) return String(assessmentRef);
  return `formative-${assessmentRef}`;
}

function withScheduleNavigation(base, source) {
  const courseId = source?.course_uuid
    || source?.uuid
    || source?.courseUuid
    || source?.course?.course_uuid
    || source?.course?.uuid
    || source?.courseId
    || source?.course_id
    || source?.course?.id
    || (base.kind === 'course' ? source?.id : null);
  const chapterId = source?.chapterId
    || source?.chapter_id
    || (base.kind === 'assessment' ? resolveAssessmentChapterId(source) : resolveCourseChapterId(source));

  const href = courseId ? buildReaderUrl(courseId, chapterId) : null;
  return {
    ...base,
    courseId: courseId ? String(courseId) : null,
    chapterId: chapterId ? String(chapterId) : null,
    href,
  };
}

export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function buildWeekDates(anchorDate) {
  const start = startOfWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function shiftWeek(anchorDate, direction) {
  const next = new Date(anchorDate);
  next.setDate(next.getDate() + direction * 7);
  return next;
}

export function getWeekTitle(anchorDate) {
  const start = startOfWeek(anchorDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString(
    undefined,
    sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' }
  );
  return {
    weekLabel: `Week of ${startLabel}`,
    rangeLabel: `${startLabel} – ${endLabel}, ${end.getFullYear()}`,
  };
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

export function isDateInWeek(date, anchorDate) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return false;
  return value >= startOfWeek(anchorDate) && value <= endOfWeek(anchorDate);
}

export function formatCalendarTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function mapAssessmentToScheduleItem(item) {
  const rawDate = item.startTime || item.endTime || item.createdAt || item.scheduledAt;
  const date = rawDate ? new Date(rawDate) : null;
  if (!date || Number.isNaN(date.getTime())) return null;

  const title = item.assessmentTitle || item.courseTitle || item.title || 'Assessment';
  const attemptNumber = item.attemptNumber || item.attemptsUsed || 1;
  const attemptLimit = item.attemptLimit || item.maxAttempts || 1;

  return withScheduleNavigation({
    id: item.id || `${title}-${rawDate}`,
    kind: 'assessment',
    date,
    dateLabel: String(date.getDate()).padStart(2, '0'),
    title: title.toUpperCase(),
    num: String(attemptNumber),
    total: String(attemptLimit),
    progressLabel: 'Assessment',
    time: formatCalendarTime(date),
    meta: item.assessmentType || item.category || item.status || 'Assessment',
  }, item);
}

export function mapCourseToScheduleItem(course) {
  const rawDate = course.next_due_at || course.enrolled_at || course.updated_at || course.last_accessed_at;
  const date = rawDate ? new Date(rawDate) : new Date();
  if (Number.isNaN(date.getTime())) return null;

  const completed = Number(course.completed_chapters || 0);
  const total = Number(course.total_chapters || 0);

  return withScheduleNavigation({
    id: `course-${course.id}`,
    kind: 'course',
    date,
    dateLabel: String(date.getDate()).padStart(2, '0'),
    title: (course.title || 'Course').toUpperCase(),
    num: String(completed),
    total: String(total || Math.max(completed, 1)),
    progressLabel: 'Chapters',
    time: formatCalendarTime(date),
    meta: Number(course.progress_percentage || 0) >= 100 ? 'Completed' : 'Continue learning',
  }, course);
}

export function extractDashboardSchedule(body) {
  const data = body?.data || {};
  const candidates = [
    data.upcomingAssessments,
    data.schedule,
    data.calendarEvents,
    data.upcomingEvents,
  ];

  for (const list of candidates) {
    if (Array.isArray(list) && list.length > 0) {
      return list.map(mapAssessmentToScheduleItem).filter(Boolean);
    }
  }

  return [];
}

export function extractAssessmentHistory(body) {
  const data = body?.data?.data || body?.data || body;
  if (Array.isArray(data?.assessmentHistory)) return data.assessmentHistory;
  if (Array.isArray(data)) return data;
  return [];
}

export function buildScheduleItems({
  dashboardBody,
  performanceBody,
  enrolledCourses,
  weekAnchor,
}) {
  const fromDashboard = extractDashboardSchedule(dashboardBody);
  const fromPerformance = extractAssessmentHistory(performanceBody)
    .map(mapAssessmentToScheduleItem)
    .filter(Boolean);

  const merged = [...fromDashboard, ...fromPerformance];
  const unique = [];
  const seen = new Set();

  merged.forEach((item) => {
    const key = `${item.id}-${item.date.toISOString()}`;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(item);
  });

  let weekItems = unique
    .filter((item) => isDateInWeek(item.date, weekAnchor))
    .sort((a, b) => a.date - b.date);

  if (weekItems.length === 0 && Array.isArray(enrolledCourses) && isDateInWeek(new Date(), weekAnchor)) {
    weekItems = enrolledCourses
      .filter((course) => Number(course.progress_percentage || 0) < 100)
      .slice(0, 5)
      .map(mapCourseToScheduleItem)
      .filter(Boolean);
  }

  return weekItems;
}

export function buildHomeSubtitle({ name, stats, enrolledCount }) {
  const learnerName = name || 'Learner';
  const inProgress = Number(stats?.inProgress || 0);
  const completed = Number(stats?.completed || 0);
  const avg = Math.round(Number(stats?.avgProgress || 0));

  if (enrolledCount === 0) {
    return `Welcome back, ${learnerName}. Browse courses to start your learning journey.`;
  }

  if (inProgress > 0) {
    return `Welcome back, ${learnerName}. You have ${inProgress} course${inProgress === 1 ? '' : 's'} in progress with ${avg}% average progress.`;
  }

  if (completed > 0) {
    return `Welcome back, ${learnerName}. You have completed ${completed} course${completed === 1 ? '' : 's'}. Keep going.`;
  }

  return `Welcome back, ${learnerName}. You are enrolled in ${enrolledCount} course${enrolledCount === 1 ? '' : 's'}.`;
}

export function buildEnrollmentNotice(enrolledCourses) {
  if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) return null;

  const latest = [...enrolledCourses]
    .filter((course) => course.enrolled_at)
    .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at))[0];

  if (!latest?.enrolled_at) return null;

  const enrolledAt = new Date(latest.enrolled_at);
  if (Number.isNaN(enrolledAt.getTime())) return null;
  if (Date.now() - enrolledAt.getTime() > 14 * DAY_MS) return null;

  const paymentMethod = latest.payment_method || latest.paymentMethod || '';
  const paymentLabel = paymentMethod
    ? paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    : 'your selected payment method';

  return {
    title: `Enrolled in ${latest.title || 'a new course'}`,
    message: `Your enrollment was confirmed on ${enrolledAt.toLocaleDateString()} through ${paymentLabel}.`,
  };
}

export function extractCourseList(body) {
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.data?.courses)) return body.data.courses;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
}

export function buildReaderUrl(courseId, chapterId) {
  // courseId should preferably be the public course_uuid (same as course-part URLs).
  if (!courseId) return '/academia/learner/courses';
  const params = new URLSearchParams({ id: String(courseId) });
  if (chapterId) params.set('chapterId', String(chapterId));
  return `/academia/learner/read-contents?${params.toString()}`;
}

export function getCoursePublicRef(course) {
  if (!course) return null;
  return course.course_uuid || course.uuid || course.id || null;
}

export function buildContinueLearningTarget(enrolledCourses) {
  if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) return null;

  const inProgress = enrolledCourses
    .filter((course) => Number(course.progress_percentage || 0) < 100)
    .sort((a, b) => {
      const progressDiff = Number(b.progress_percentage || 0) - Number(a.progress_percentage || 0);
      if (progressDiff !== 0) return progressDiff;
      const aDate = new Date(a.last_accessed_at || a.updated_at || a.enrolled_at || 0).getTime();
      const bDate = new Date(b.last_accessed_at || b.updated_at || b.enrolled_at || 0).getTime();
      return bDate - aDate;
    });

  const course = inProgress[0] || enrolledCourses[0];
  const publicRef = getCoursePublicRef(course);
  if (!publicRef) return null;

  const chapterId = course.last_chapter_id
    || course.current_chapter_id
    || course.next_chapter_id
    || getStoredChapterId(publicRef)
    || getStoredChapterId(course.id)
    || null;

  const progress = Math.round(Number(course.progress_percentage || 0));
  const chapterLabel = course.last_chapter_title
    || course.current_chapter_title
    || course.next_chapter_title
    || (progress > 0 ? 'Continue where you left off' : 'Start the first lesson');

  return {
    courseId: publicRef,
    courseTitle: course.title || 'Your course',
    chapterId: chapterId ? String(chapterId) : null,
    chapterLabel,
    progress,
    thumbnail: course.thumbnail,
    instructorName: course.instructor_name || 'Academia',
    readerUrl: buildReaderUrl(publicRef, chapterId),
  };
}

export function paginateList(list, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: list.slice(start, start + pageSize),
    totalPages,
    page: safePage,
  };
}

export function resolveCourseProgressPercent({
  progressPercentage,
  outlineProgress,
}) {
  const outlineTotal = Number(outlineProgress?.total || 0);
  const outlineCompleted = Number(outlineProgress?.completed || 0);
  const outlinePct = outlineTotal > 0
    ? Math.round((outlineCompleted / outlineTotal) * 100)
    : null;

  let backendPct = null;
  if (progressPercentage != null && !Number.isNaN(Number(progressPercentage))) {
    backendPct = Math.round(Math.min(100, Number(progressPercentage)));
  }

  if (backendPct != null && outlinePct != null) {
    return Math.max(backendPct, outlinePct);
  }
  if (backendPct != null) return backendPct;
  if (outlinePct != null) return outlinePct;
  return 0;
}

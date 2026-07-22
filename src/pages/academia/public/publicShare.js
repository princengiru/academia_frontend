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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isPublicUuid = (value) => typeof value === 'string' && UUID_RE.test(String(value).trim());

/** Prefer public course_uuid so internal primary keys stay out of URLs. */
export function getCoursePublicRef(course) {
  if (!course) return null;
  return course.course_uuid || course.uuid || course.id || null;
}

export function buildCourseDetailsPath(courseOrId) {
  const ref = typeof courseOrId === 'object' && courseOrId !== null
    ? getCoursePublicRef(courseOrId)
    : courseOrId;
  if (!ref) return '/academia/courses';
  return `/academia/course-details?id=${encodeURIComponent(String(ref))}`;
}

/** Prefer public syllabus_uuid so internal primary keys stay out of URLs. */
export function getSyllabusPublicRef(syllabus) {
  if (!syllabus) return null;
  return syllabus.syllabus_uuid
    || syllabus.uuid
    || syllabus.syllabusId
    || syllabus.syllabus_id
    || null;
}

export function getOutlinePublicRef(outline) {
  if (!outline) return null;
  if (typeof outline !== 'object') return outline;
  return outline.syllabus_outline_uuid || outline.uuid || outline.id || null;
}

export function getTopicPublicRef(topic) {
  if (!topic) return null;
  if (typeof topic !== 'object') return topic;
  return topic.topic_uuid || topic.uuid || topic.id || null;
}

export function getChapterPublicRef(chapter) {
  if (!chapter) return null;
  if (typeof chapter !== 'object') return chapter;
  return chapter.chapter_uuid || chapter.uuid || chapter.id || null;
}

export function getFormativePublicRef(assessment) {
  if (!assessment) return null;
  if (typeof assessment !== 'object') return assessment;
  return assessment.formative_assessment_uuid || assessment.uuid || assessment.id || null;
}

export function getProjectPublicRef(project) {
  if (!project) return null;
  if (typeof project !== 'object') return project;
  return project.project_uuid || project.uuid || project.id || null;
}

export function getStoryPublicRef(story) {
  if (!story) return null;
  if (typeof story !== 'object') return story;
  return story.community_story_uuid || story.uuid || story.id || null;
}

export function getUserPublicRef(user) {
  if (!user) return null;
  if (typeof user !== 'object') return user;
  return user.user_uuid
    || user.uuid
    || user.instructor_uuid
    || user.uploaded_by_uuid
    || user.author_uuid
    || user.authorId
    || user.id
    || null;
}

export function buildSyllabusPartPath(topicOrId) {
  const ref = typeof topicOrId === 'object' && topicOrId !== null
    ? getTopicPublicRef(topicOrId)
    : topicOrId;
  if (!ref) return '/academia/syllabuses';
  return `/academia/syllabus-part?topicId=${encodeURIComponent(String(ref))}`;
}

export function buildSyllabusReaderPath({
  syllabus,
  syllabusId,
  outline,
  topicId,
  categoryTopic,
  categoryTopicId,
} = {}) {
  const syllabusRef = syllabus
    ? getSyllabusPublicRef(syllabus)
    : (syllabusId || null);
  if (!syllabusRef) return '/academia/syllabuses';

  const outlineRef = outline
    ? getOutlinePublicRef(outline)
    : (topicId || null);
  const categoryTopicRef = categoryTopic
    ? getTopicPublicRef(categoryTopic)
    : (categoryTopicId || null);

  const params = new URLSearchParams({
    syllabusId: String(syllabusRef),
  });
  if (outlineRef) params.set('topicId', String(outlineRef));
  if (categoryTopicRef) params.set('categoryTopicId', String(categoryTopicRef));
  return `/academia/read-contents?${params.toString()}`;
}

export function buildProjectPath(projectOrId) {
  const ref = typeof projectOrId === 'object' && projectOrId !== null
    ? getProjectPublicRef(projectOrId)
    : projectOrId;
  if (!ref) return '/academia/projects';
  return `/academia/read-project?id=${encodeURIComponent(String(ref))}`;
}

export function buildStoryPath(storyOrId) {
  const ref = typeof storyOrId === 'object' && storyOrId !== null
    ? getStoryPublicRef(storyOrId)
    : storyOrId;
  if (!ref) return '/academia/watch';
  return `/academia/read-story?id=${encodeURIComponent(String(ref))}`;
}

export function buildAuthorPath(userOrId) {
  const ref = typeof userOrId === 'object' && userOrId !== null
    ? getUserPublicRef(userOrId)
    : userOrId;
  if (!ref) return '/academia/index';
  return `/academia/author?authorId=${encodeURIComponent(String(ref))}`;
}

export function buildLearnerProjectPath(projectOrId) {
  const ref = typeof projectOrId === 'object' && projectOrId !== null
    ? getProjectPublicRef(projectOrId)
    : projectOrId;
  if (!ref) return '/academia/learner/projects';
  return `/academia/learner/view-project?id=${encodeURIComponent(String(ref))}`;
}

export function buildProfessorProjectPath(projectOrId) {
  const ref = typeof projectOrId === 'object' && projectOrId !== null
    ? getProjectPublicRef(projectOrId)
    : projectOrId;
  if (!ref) return '/academia/professor/projects';
  return `/academia/professor/view-project?id=${encodeURIComponent(String(ref))}`;
}

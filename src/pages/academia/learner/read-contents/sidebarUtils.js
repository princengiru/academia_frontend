export function isSameOutlineItemId(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) return false;
  return String(a) === String(b);
}

export function findWeekIdForOutlineItem(weeks, itemId) {
  if (!itemId || itemId === 'assessment' || !Array.isArray(weeks)) return null;

  const match = weeks.find((week) =>
    week.chapters?.some((chapter) => isSameOutlineItemId(chapter.id, itemId))
    || week.assessments?.some((assessment) => isSameOutlineItemId(assessment.id, itemId))
  );

  return match?.id || null;
}

export function countOutlineProgress(weeks, isSummativeComplete = false) {
  let total = 1;
  let completed = isSummativeComplete ? 1 : 0;

  if (!Array.isArray(weeks)) {
    return { total, completed };
  }

  weeks.forEach((week) => {
    if (Array.isArray(week.chapters)) {
      total += week.chapters.length;
      completed += week.chapters.filter((chapter) => chapter.completed).length;
    }
    if (Array.isArray(week.assessments)) {
      total += week.assessments.length;
      completed += week.assessments.filter((assessment) => assessment.completed).length;
    }
  });

  return { total, completed };
}

export function iterateOutlineItems(weeks, isSummativeComplete = false) {
  const items = [];
  if (!Array.isArray(weeks)) return items;

  weeks.forEach((week) => {
    week.chapters?.forEach((chapter) => {
      items.push({
        type: 'chapter',
        id: chapter.id,
        title: chapter.title,
        weekId: week.id,
        completed: Boolean(chapter.completed),
      });
    });
    week.assessments?.forEach((assessment) => {
      items.push({
        type: 'formative',
        id: assessment.id,
        title: assessment.title,
        weekId: week.id,
        completed: Boolean(assessment.completed),
      });
    });
  });

  items.push({
    type: 'summative',
    id: 'assessment',
    title: 'Summative assessment',
    completed: Boolean(isSummativeComplete),
  });

  return items;
}

export function isOutlineItemComplete(item, isSummativeComplete = false) {
  if (!item) return false;
  if (item.type === 'summative') return Boolean(isSummativeComplete);
  return Boolean(item.completed);
}

export function isOutlineItemUnlocked(weeks, itemId, isSummativeComplete = false) {
  const items = iterateOutlineItems(weeks, isSummativeComplete);
  const index = items.findIndex((item) => isSameOutlineItemId(item.id, itemId));
  if (index === -1) return false;
  if (index === 0) return true;

  for (let i = 0; i < index; i += 1) {
    if (!isOutlineItemComplete(items[i], isSummativeComplete)) return false;
  }
  return true;
}

export function getFirstUnlockedOutlineItem(weeks, isSummativeComplete = false) {
  const items = iterateOutlineItems(weeks, isSummativeComplete);
  return items.find((item) => isOutlineItemUnlocked(weeks, item.id, isSummativeComplete)) || items[0] || null;
}

export function isSummativeUnlocked(weeks, isSummativeComplete = false) {
  return isOutlineItemUnlocked(weeks, 'assessment', isSummativeComplete);
}

export function isWeekAccessible(weeks, weekId, isSummativeComplete = false) {
  const week = weeks?.find((w) => isSameOutlineItemId(w.id, weekId));
  if (!week) return false;

  const firstChapter = week.chapters?.[0];
  if (firstChapter) {
    return isOutlineItemUnlocked(weeks, firstChapter.id, isSummativeComplete);
  }

  const firstAssessment = week.assessments?.[0];
  if (firstAssessment) {
    return isOutlineItemUnlocked(weeks, firstAssessment.id, isSummativeComplete);
  }

  return false;
}

export function resolveReaderChapterTarget(weeks, requestedId, isSummativeComplete = false) {
  if (isSameOutlineItemId(requestedId, 'assessment')) {
    return { id: 'assessment', weekId: null };
  }

  if (requestedId) {
    const weekId = findWeekIdForOutlineItem(weeks, requestedId);
    if (weekId) {
      return { id: requestedId, weekId };
    }
  }

  const firstUnlocked = getFirstUnlockedOutlineItem(weeks, isSummativeComplete);
  if (firstUnlocked) {
    return {
      id: firstUnlocked.id,
      weekId: firstUnlocked.weekId || findWeekIdForOutlineItem(weeks, firstUnlocked.id),
    };
  }

  const firstWeek = weeks?.find((week) => week.chapters?.length > 0);
  const firstChapter = firstWeek?.chapters?.[0];
  return {
    id: firstChapter?.id || null,
    weekId: firstWeek?.id || null,
  };
}

export function getNextOutlineItem(weeks, currentId, isSummativeComplete = false) {
  const items = iterateOutlineItems(weeks, isSummativeComplete);
  if (isSummativeComplete) {
    return null;
  }

  const currentIndex = items.findIndex((item) => isSameOutlineItemId(item.id, currentId));
  if (currentIndex === -1) {
    return items.find((item) => !item.completed) || items[0] || null;
  }

  for (let index = currentIndex + 1; index < items.length; index += 1) {
    if (!items[index].completed) return items[index];
  }

  return items[currentIndex + 1] || null;
}

export function getNextAssessment(weeks, isSummativeComplete = false) {
  if (isSummativeComplete) return null;

  for (const week of weeks || []) {
    for (const assessment of week.assessments || []) {
      if (!assessment.completed) {
        return {
          id: assessment.id,
          title: assessment.title,
          type: 'formative',
          weekId: week.id,
        };
      }
    }
  }

  if (isSummativeUnlocked(weeks, isSummativeComplete)) {
    return {
      id: 'assessment',
      title: 'Summative assessment',
      type: 'summative',
    };
  }

  return null;
}

export function isSameOutlineItemId(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) return false;
  return String(a) === String(b);
}

/** Build interleaved week items: chapter → quizzes placed after it → leftover quizzes at end. */
export function getWeekOutlineItems(week) {
  const chapters = Array.isArray(week?.chapters) ? week.chapters : [];
  const assessments = Array.isArray(week?.assessments) ? [...week.assessments] : [];
  const items = [];
  const used = new Set();

  const quizzesAfter = (chapterId) => assessments
    .filter((a) => a.after_chapter_id != null && String(a.after_chapter_id) === String(chapterId))
    .sort((a, b) => Number(a.assessmentId || a.id) - Number(b.assessmentId || b.id));

  chapters.forEach((chapter) => {
    items.push({ kind: 'chapter', data: chapter });
    quizzesAfter(chapter.id).forEach((assessment) => {
      used.add(String(assessment.id));
      items.push({ kind: 'formative', data: assessment });
    });
  });

  assessments
    .filter((a) => !used.has(String(a.id)))
    .sort((a, b) => Number(a.assessmentId || a.id) - Number(b.assessmentId || b.id))
    .forEach((assessment) => {
      items.push({ kind: 'formative', data: assessment });
    });

  return items;
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
    getWeekOutlineItems(week).forEach((entry) => {
      if (entry.kind === 'chapter') {
        items.push({
          type: 'chapter',
          id: entry.data.id,
          title: entry.data.title,
          weekId: week.id,
          completed: Boolean(entry.data.completed),
        });
      } else {
        items.push({
          type: 'formative',
          id: entry.data.id,
          title: entry.data.title,
          weekId: week.id,
          completed: Boolean(entry.data.completed),
        });
      }
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

  const firstItem = getWeekOutlineItems(week)[0];
  if (firstItem) {
    return isOutlineItemUnlocked(weeks, firstItem.data.id, isSummativeComplete);
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

  const items = iterateOutlineItems(weeks, isSummativeComplete);
  const nextFormative = items.find((item) => item.type === 'formative' && !item.completed);
  if (nextFormative) {
    return {
      id: nextFormative.id,
      title: nextFormative.title,
      type: 'formative',
      weekId: nextFormative.weekId,
    };
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

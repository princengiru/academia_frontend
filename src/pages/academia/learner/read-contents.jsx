import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import acSav from '../../../assets/icons/ac-sav.svg';
import wExitRight from '../../../assets/icons/w-exit-right.svg';
import acLe from '../../../assets/icons/ac-le.svg';
import acOnImg from '../../../assets/imgs/ac-on.jpg';
import profImg from '../../../assets/imgs/prof.jpg';
import accMinus from '../../../assets/icons/acc-minus.svg';
import checkCircle from '../../../assets/icons/check-circle.svg';
import noCheckCircle from '../../../assets/icons/no-check-circle.svg';
import acCl from '../../../assets/icons/ac-cl.svg';
import acOp from '../../../assets/icons/ac-op.svg';
import right1 from '../../../assets/icons/right1.svg';
import bars from '../../../assets/icons/bars.svg';
import wAcBook from '../../../assets/icons/w-ac-book.svg';
import leTec from '../../../assets/icons/le-tec.svg';
import leftIcon from '../../../assets/icons/left.svg';
import doneIcon from '../../../assets/icons/done.svg';
import dtiktok from '../../../assets/icons/dtiktok.svg';
import dwhat from '../../../assets/icons/dwhat.svg';
import dfaceb from '../../../assets/icons/dfaceb.svg';
import dinstagram from '../../../assets/icons/dinstagram.svg';
import acSms from '../../../assets/icons/ac-sms.svg';
import acSend from '../../../assets/icons/ac-send.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import './read-contents.css';

const apexCourseMeta = {
  title: '',
  author: '',
  authorImage: profImg,
  authorRole: '',
  publishedOn: '',
  headline: '',
  summary: '',
  image: acOnImg,
  duration: '',
  weekly: '',
  level: '',
  price: '',
  discount: '',
  intro: '',
  audience: '',
  category: '',
};

const slateCourseReader = { title: '', author: '', score: '0.0%' };

const genesisOutcomes = [];

const slateExerciseQuestions = [];

const genesisAssessmentTracker = [];

const slateAssessmentQuestions = [];

const apexAssessmentResult = {
  score: '89.8%',
  headline: 'Congratulations John Doe,',
  summary: 'Week 1 done, Ready to lock in ultimately on other weeks',
  buttonLabel: 'Continue WEEK 2',
  stats: [
    { value: '26', label: 'Questions' },
    { value: '21', label: 'Correct answer' },
    { value: '5', label: 'Wrong Answer' },
    { value: '1h 7min', label: 'Time' },
    { value: 'Passed', label: 'Status', tone: 'success' },
  ],
};

const slateOutlineWeeks = [];

const apexChapterContent = {};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const extractBody = (body) => body?.data?.data || body?.data || body;

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatHtmlContent = (html) => {
  if (!html) return '';
  return html.replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`);
};

function LearnersReadContents() {
  const preventDefault = (e) => e.preventDefault();
  const navigate = useNavigate();

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({ 'week-1': true });
  const [activeChapterId, setActiveChapterId] = useState('chapter-1');
  const [isAudienceExpanded, setIsAudienceExpanded] = useState(false);
  const [activePdfIndex, setActivePdfIndex] = useState(0);

  // Router params
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Backend-driven content state (fallback to local mocks)
  const [courseMetaState, setCourseMetaState] = useState(apexCourseMeta);
  const [courseReader, setCourseReader] = useState(slateCourseReader);
  const [outlineWeeksState, setOutlineWeeksState] = useState(slateOutlineWeeks);
  const [chapterContentMapState, setChapterContentMapState] = useState(apexChapterContent);
  const [exerciseQuestionsState, setExerciseQuestionsState] = useState(slateExerciseQuestions);
  const [outcomesState, setOutcomesState] = useState(genesisOutcomes);
  const [studentAttempts, setStudentAttempts] = useState([]);

  const [loadingCourse, setLoadingCourse] = useState(false);

  // Exercise State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseStates, setExerciseStates] = useState(() => exerciseQuestionsState.map(() => 'pending'));
  const [selectedExerciseOption, setSelectedExerciseOption] = useState(null);
  const [isExerciseGraded, setIsExerciseGraded] = useState(false);

  // Assessment State
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [assessmentTracker, setAssessmentTracker] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState(apexAssessmentResult);

  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [selectedAssessmentOptions, setSelectedAssessmentOptions] = useState([]);
  const [isAssessmentGraded, setIsAssessmentGraded] = useState(false);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);

  // Enrollment State
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const inboundId = location.state?.courseId || searchParams.get('id');
  const initialChapterId = location.state?.chapterId || searchParams.get('chapterId');

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token || !inboundId) {
        setIsEnrolled(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          const progressList = body?.data?.progress || body?.progress || [];
          const enrolled = progressList.some(p => Number(p.course_id) === Number(inboundId));
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Failed to check enrollment status:", err);
      }
    };
    checkEnrollmentStatus();
  }, [inboundId]);

  useEffect(() => {
    let cancelled = false;

    const loadSummativeAssessment = async (courseId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/summative-assessment`);
        if (!res.ok) return;
        const body = await res.json();
        const data = extractBody(body);
        if (!data || !data.id) return;

        const res2 = await fetch(`${API_BASE_URL}/api/summative-assessments/${data.id}`);
        if (!res2.ok) return;
        const body2 = await res2.json();
        const fullAssessment = extractBody(body2);

        if (cancelled) return;

        if (fullAssessment && Array.isArray(fullAssessment.questions)) {
          const mappedQuestions = fullAssessment.questions.map((q, idx) => {
            let options = q.options;
            if (typeof options === 'string') {
              try { options = JSON.parse(options); } catch (e) { options = null; }
            }
            const optionLabels = Array.isArray(options) ? options.map(o => (typeof o === 'object' ? (o.label || o.value || String(o)) : String(o))) : (options || ['Option A', 'Option B']);
            const correctAnswers = Array.isArray(options) ? options.map((o, idx) => (o && o.is_correct ? idx : -1)).filter(i => i >= 0) : (q.correct_answer ? [q.correct_answer] : []);

            return {
              id: q.id,
              number: idx + 1,
              type: q.question_type === 'multiple_choice' ? 'single' : (q.question_type === 'true_false' ? 'single' : 'multi'),
              prompt: q.question_text || 'Assessment Question',
              options: optionLabels,
              correctAnswers,
              progressText: `Question ${idx + 1} of ${fullAssessment.questions.length}`,
            };
          });

          setAssessmentQuestions(mappedQuestions);
          setAssessmentTracker(mappedQuestions.map(() => 'pending'));
        }
      } catch (err) {
        console.error("Failed to load summative assessment:", err);
      }
    };

    const loadCourse = async (id) => {
      if (!id) return;
      setLoadingCourse(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
        const body = await res.json();
        const data = extractBody(body);
        const courseData = data?.data || data?.course || data || {};

        if (cancelled) return;

        // map course meta
        setCourseMetaState((prev) => ({
          ...prev,
          title: courseData.title || prev.title,
          author: courseData.instructor_name || courseData.author || prev.author,
          authorImage: prev.authorImage,
          publishedOn: courseData.created_at || prev.publishedOn,
          headline: courseData.subtitle || courseData.title || prev.headline,
          summary: courseData.description || prev.summary,
          image: courseData.thumbnail && (courseData.thumbnail.startsWith('/') ? `${API_BASE_URL}${courseData.thumbnail}` : courseData.thumbnail) || prev.image,
          duration: courseData.duration_weeks ? `${courseData.duration_weeks} weeks` : prev.duration,
          weekly: courseData.required_hours_per_week ? `${courseData.required_hours_per_week} hours` : prev.weekly,
          level: courseData.level || prev.level,
          price: courseData.price ? `$${courseData.price}` : (courseData.is_free ? 'Free' : prev.price),
          intro: courseData.intro_message || courseData.description || prev.intro,
          audience: courseData.target_audience || prev.audience,
          category: courseData.category || prev.category,
        }));

        setCourseReader((prev) => ({
          ...prev,
          title: courseData.title || prev.title,
          author: courseData.instructor_name || prev.author,
        }));

        // chapters -> outline weeks
        const chapters = Array.isArray(courseData.chapters) ? courseData.chapters : [];
        const apiWeeks = Array.isArray(courseData.weeks) ? courseData.weeks : [];

        if (apiWeeks.length > 0) {
          const mappedWeeks = apiWeeks.map((w, idx) => ({
            id: w.id || `week-${w.week_number || idx + 1}`,
            title: w.title || `Week ${w.week_number || idx + 1}`,
            completed: false,
            expanded: idx === 0,
            chapters: Array.isArray(w.chapters) ? w.chapters.map((c, ci) => ({
              id: c.id || `ch-${idx}-${ci}`,
              title: c.title || c.name || `Chapter ${ci + 1}`,
              completed: false
            })) : []
          }));
          setOutlineWeeksState(mappedWeeks);

          let activeChId = initialChapterId;
          let targetWeekId = null;
          if (activeChId) {
            const foundWeek = mappedWeeks.find(w => w.chapters.some(c => String(c.id) === String(activeChId)));
            if (foundWeek) {
              targetWeekId = foundWeek.id;
            } else {
              const firstWeekWithCh = mappedWeeks.find(w => w.chapters && w.chapters.length > 0);
              activeChId = firstWeekWithCh ? firstWeekWithCh.chapters[0].id : (chapters[0]?.id || `ch-0`);
              if (firstWeekWithCh) targetWeekId = firstWeekWithCh.id;
            }
          } else {
            const firstWeekWithCh = mappedWeeks.find(w => w.chapters && w.chapters.length > 0);
            activeChId = firstWeekWithCh ? firstWeekWithCh.chapters[0].id : (chapters[0]?.id || `ch-0`);
            if (firstWeekWithCh) targetWeekId = firstWeekWithCh.id;
          }

          setActiveChapterId(activeChId);
          if (targetWeekId) {
            setExpandedWeeks((prev) => ({ ...prev, [targetWeekId]: true }));
          }

          // build chapter content map
          const cmap = {};
          apiWeeks.forEach((w, idx) => {
            const weekLabel = w.title || `Week ${w.week_number || idx + 1}`;
            if (Array.isArray(w.chapters)) {
              w.chapters.forEach((c, ci) => {
                const cid = c.id || `ch-${idx}-${ci}`;
                cmap[cid] = {
                  weekLabel: weekLabel,
                  chapterLabel: c.title || c.name || `Chapter ${ci + 1}`,
                  progressLabel: `Viewed : 0%`,
                  headline: c.title || c.name || '',
                  summary: c.description || c.summary || '',
                  image: c.thumbnail ? (c.thumbnail.startsWith('/') ? `${API_BASE_URL}${c.thumbnail}` : c.thumbnail) : acOnImg,
                  introTitle: 'Introduction',
                  introBody: c.description || c.content || '',
                  introLinkLabel: 'Read more',
                  audienceTitle: 'Who is the course for?',
                  audienceBody: c.target_audience || courseData.target_audience || '',
                  attachments: c.attachments,
                };
              });
            }
          });
          setChapterContentMapState((prev) => ({ ...prev, ...cmap }));

          // outcomes
          if (courseData.objectives) {
            let list = [];
            if (typeof courseData.objectives === 'string') list = courseData.objectives.split('\n');
            else if (Array.isArray(courseData.objectives)) list = courseData.objectives;
            setOutcomesState(list.map(stripHtml).filter(Boolean));
          }

          // exercises
          const exercises = [];
          let exCount = 0;
          apiWeeks.forEach((w) => {
            if (Array.isArray(w.chapters)) {
              w.chapters.forEach((c) => {
                if (Array.isArray(c.exercises)) {
                  c.exercises.forEach((ex, exIndex) => {
                    exCount++;
                    exercises.push({
                      id: ex.id || `${c.id}.${exIndex + 1}`,
                      number: exCount,
                      type: ex.type || 'single',
                      prompt: ex.question || ex.title || ex.prompt || 'Exercise',
                      options: ex.options || ['Option A', 'Option B'],
                      correctAnswers: ex.correctAnswers || [],
                    });
                  });
                }
              });
            }
          });
          if (exercises.length) {
            setExerciseQuestionsState(exercises);
            setExerciseStates(exercises.map(() => 'pending'));
          }

          if (activeChId && typeof activeChId === 'number') {
            fetchChapterExercises(activeChId).catch(() => { });
          }
        } else if (chapters.length) {
          // Fallback when weeks list is empty: group chapters by week_number or just week-1
          const groupedWeeksMap = {};
          chapters.forEach((c, i) => {
            const wNum = c.week_number || 1;
            if (!groupedWeeksMap[wNum]) {
              groupedWeeksMap[wNum] = {
                id: `week-${wNum}`,
                title: `Week ${wNum}`,
                completed: false,
                expanded: wNum === 1,
                chapters: []
              };
            }
            groupedWeeksMap[wNum].chapters.push({
              id: c.id || `ch-${i}`,
              title: c.title || c.name || `Chapter ${i + 1}`,
              completed: false
            });
          });
          const mappedWeeks = Object.values(groupedWeeksMap).sort((a, b) => a.title.localeCompare(b.title));
          setOutlineWeeksState(mappedWeeks);

          let activeChId = initialChapterId;
          let targetWeekId = null;
          if (activeChId) {
            const foundWeek = mappedWeeks.find(w => w.chapters.some(c => String(c.id) === String(activeChId)));
            if (foundWeek) {
              targetWeekId = foundWeek.id;
            } else {
              const firstWeekWithCh = mappedWeeks.find(w => w.chapters && w.chapters.length > 0);
              activeChId = firstWeekWithCh ? firstWeekWithCh.chapters[0].id : (chapters[0]?.id || `ch-0`);
              if (firstWeekWithCh) targetWeekId = firstWeekWithCh.id;
            }
          } else {
            const firstWeekWithCh = mappedWeeks.find(w => w.chapters && w.chapters.length > 0);
            activeChId = firstWeekWithCh ? firstWeekWithCh.chapters[0].id : (chapters[0]?.id || `ch-0`);
            if (firstWeekWithCh) targetWeekId = firstWeekWithCh.id;
          }

          setActiveChapterId(activeChId);
          if (targetWeekId) {
            setExpandedWeeks((prev) => ({ ...prev, [targetWeekId]: true }));
          }

          // Build content map for all fallback chapters
          const cmap = {};
          chapters.forEach((c, i) => {
            const cid = c.id || `ch-${i}`;
            const wNum = c.week_number || 1;
            cmap[cid] = {
              weekLabel: `Week ${wNum}`,
              chapterLabel: c.title || c.name || `Chapter ${i + 1}`,
              progressLabel: `Viewed : 0%`,
              headline: c.title || c.name || '',
              summary: c.description || c.summary || '',
              image: c.thumbnail ? (c.thumbnail.startsWith('/') ? `${API_BASE_URL}${c.thumbnail}` : c.thumbnail) : acOnImg,
              introTitle: 'Introduction',
              introBody: c.description || c.content || '',
              introLinkLabel: 'Read more',
              audienceTitle: 'Who is the course for?',
              audienceBody: c.target_audience || courseData.target_audience || '',
              attachments: c.attachments,
            };
          });
          setChapterContentMapState((prev) => ({ ...prev, ...cmap }));

          // outcomes
          if (courseData.objectives) {
            let list = [];
            if (typeof courseData.objectives === 'string') list = courseData.objectives.split('\n');
            else if (Array.isArray(courseData.objectives)) list = courseData.objectives;
            setOutcomesState(list.map(stripHtml).filter(Boolean));
          }

          // exercises
          const exercises = [];
          chapters.forEach((c, chIndex) => {
            if (Array.isArray(c.exercises)) {
              c.exercises.forEach((ex, exIndex) => {
                exercises.push({
                  id: ex.id || `${chIndex + 1}.${exIndex + 1}`,
                  number: exIndex + 1,
                  type: ex.type || 'single',
                  prompt: ex.title || ex.name || ex.headline || ex.prompt || 'Exercise',
                  options: ex.options || ['Option A', 'Option B'],
                  correctAnswers: ex.correctAnswers || [],
                });
              });
            }
          });
          if (exercises.length) {
            setExerciseQuestionsState(exercises);
            setExerciseStates(exercises.map(() => 'pending'));
          }
          if (chapters[0] && (chapters[0].id || chapters[0].chapter_id)) {
            const cid = chapters[0].id || chapters[0].chapter_id;
            fetchChapterExercises(cid).catch(() => { });
          }
        }

        // load summative assessment
        await loadSummativeAssessment(courseData.id || id);

        // load student attempts for this course to reflect progress
        if (courseData.id || courseData.course_id || id) {
          const courseId = courseData.id || courseData.course_id || id;
          fetchCourseStudentAttempts(courseId).catch(() => { });
        }
      } catch (err) {
        // keep fallbacks
      } finally {
        if (!cancelled) setLoadingCourse(false);
      }
    };

    if (inboundId) loadCourse(inboundId);

    return () => { cancelled = true; };
  }, [inboundId]);

  // Dynamic Content Loading based on Active Chapter
  const defaultContent = {
    weekLabel: '',
    chapterLabel: '',
    progressLabel: '',
    headline: '',
    summary: '',
    image: acOnImg,
    introTitle: '',
    introBody: '',
    introLinkLabel: '',
    audienceTitle: '',
    audienceBody: '',
    attachments: null,
  };
  const activeContent = chapterContentMapState[activeChapterId] || defaultContent;

  const pdfAttachments = useMemo(() => {
    if (!activeContent || !activeContent.attachments) return [];
    try {
      const attachmentsRaw = activeContent.attachments;
      const atts = typeof attachmentsRaw === 'string' ? JSON.parse(attachmentsRaw) : attachmentsRaw;
      if (Array.isArray(atts)) {
        return atts.filter(a =>
          a.file_type === 'application/pdf' ||
          (a.file_path || '').toLowerCase().endsWith('.pdf') ||
          (a.file_url || '').toLowerCase().endsWith('.pdf')
        );
      }
    } catch (e) {
      console.warn("Error parsing attachments for PDFs", e);
    }
    return [];
  }, [activeContent]);

  const pdfUrl = useMemo(() => {
    if (pdfAttachments.length === 0) return null;
    const activePdf = pdfAttachments[activePdfIndex] || pdfAttachments[0];
    const path = activePdf.file_path || activePdf.file_url;
    if (path) {
      return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    }
    return null;
  }, [pdfAttachments, activePdfIndex]);

  const attachmentsList = useMemo(() => {
    if (!activeContent || !activeContent.attachments) return [];
    try {
      const attachmentsRaw = activeContent.attachments;
      const parsed = typeof attachmentsRaw === 'string'
        ? JSON.parse(attachmentsRaw)
        : attachmentsRaw;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to parse attachments in reader", e);
      return [];
    }
  }, [activeContent]);

  const isAssessmentView = activeChapterId === 'assessment';
  const hasOutline = Array.isArray(outlineWeeksState) && outlineWeeksState.length > 0;
  const hasOutcomes = Array.isArray(outcomesState) && outcomesState.length > 0;
  const showContentSections = !loadingCourse && (hasOutline || hasOutcomes);

  const toggleWeek = (weekId) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const handleChapterSelect = (chapterId) => {
    setActiveChapterId(chapterId);
    if (window.innerWidth <= 991) setIsSidebarOpen(false);

    // Reset States
    setIsAudienceExpanded(false);
    setActivePdfIndex(0);

    if (chapterId === 'assessment') {
      setCurrentAssessmentIndex(0);
      setSelectedAssessmentOptions([]);
      setIsAssessmentGraded(false);
      setIsAssessmentComplete(false);
    } else {
      setCurrentExerciseIndex(0);
      setSelectedExerciseOption(null);
      setIsExerciseGraded(false);
      setExerciseStates(exerciseQuestionsState.map(() => 'pending'));
    }
    // fetch exercises for the selected chapter from backend
    if (chapterId && chapterId !== 'assessment') {
      const numeric = String(chapterId).replace(/[^0-9]/g, '');
      const cid = numeric ? Number(numeric) : chapterId;
      fetchChapterExercises(cid).catch(() => { });
    }
  };

  // Fetch exercises for a chapter from backend and set state
  const fetchChapterExercises = async (chapterId) => {
    if (!chapterId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/chapters/${chapterId}/exercises`);
      if (!res.ok) return;
      const body = await res.json();
      const data = extractBody(body) || [];
      const list = Array.isArray(data) ? data : (data.data || []);
      if (!list || !list.length) return;
      const mapped = list.map((ex, i) => {
        // options may be JSON string or array
        let options = ex.options;
        if (typeof options === 'string') {
          try { options = JSON.parse(options); } catch (e) { options = null; }
        }
        // if options are objects with label/value/is_correct
        const optionLabels = Array.isArray(options) ? options.map(o => (typeof o === 'object' ? (o.label || o.value || String(o)) : String(o))) : (options || ['Option A', 'Option B']);
        const correctAnswers = Array.isArray(options) ? options.map((o, idx) => (o && o.is_correct ? idx : -1)).filter(i => i >= 0) : (ex.correct_answer ? [ex.correct_answer] : []);
        return {
          id: ex.id || ex.exercise_id || `ex-${i}`,
          number: ex.order_index || i + 1,
          type: ex.type || 'single',
          prompt: ex.question || ex.title || ex.prompt || 'Exercise',
          options: optionLabels,
          correctAnswers,
        };
      });
      setExerciseQuestionsState(mapped);
      // set states based on student attempts if available
      setExerciseStates(mapped.map((m) => {
        const att = studentAttempts.find(a => Number(a.exercise_id) === Number(m.id) || Number(a.exercise_id) === Number(m.id));
        if (att) return att.is_correct ? 'correct' : 'wrong';
        return 'pending';
      }));
    } catch (err) {
      // ignore
    }
  };

  // Fetch student attempts for a course
  const fetchCourseStudentAttempts = async (courseId) => {
    if (!courseId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/exercise-attempts`);
      if (!res.ok) return;
      const body = await res.json();
      const data = extractBody(body) || [];
      const list = Array.isArray(data) ? data : (data.data || []);
      setStudentAttempts(list || []);
      // merge into existing exercise states
      setExerciseStates((prev) => {
        return exerciseQuestionsState.map((q) => {
          const att = list.find(a => Number(a.exercise_id) === Number(q.id) || Number(a.exercise_id) === Number(q.id));
          if (att) return att.is_correct ? 'correct' : 'wrong';
          return 'pending';
        });
      });
    } catch (err) {
      // ignore
    }
  };

  // Exercise Logic
  const handleExerciseOptionSelect = (idx) => {
    if (isExerciseGraded) return;
    setSelectedExerciseOption(idx);
  };

  const handleExerciseAction = () => {
    const question = exerciseQuestionsState[currentExerciseIndex];
    if (!isExerciseGraded) {
      if (selectedExerciseOption === null) return;
      const isCorrect = (question.correctAnswers || []).includes(selectedExerciseOption);
      const newStates = [...exerciseStates];
      newStates[currentExerciseIndex] = isCorrect ? 'correct' : 'wrong';
      setExerciseStates(newStates);
      setIsExerciseGraded(true);
    } else {
      if (currentExerciseIndex < exerciseQuestionsState.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setSelectedExerciseOption(null);
        setIsExerciseGraded(false);
      }
    }
  };

  // Assessment Logic
  const handleAssessmentOptionSelect = (idx, type) => {
    if (isAssessmentGraded) return;
    if (type === 'single') {
      setSelectedAssessmentOptions([idx]);
    } else {
      setSelectedAssessmentOptions((prev) =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    }
  };

  const handleAssessmentAction = () => {
    const question = assessmentQuestions[currentAssessmentIndex];
    if (!question) return;

    if (!isAssessmentGraded) {
      if (selectedAssessmentOptions.length === 0) return;

      const correctAnswers = question.correctAnswers || [];
      const isCorrect =
        selectedAssessmentOptions.length === correctAnswers.length &&
        selectedAssessmentOptions.every(val => correctAnswers.includes(val));

      const newTracker = [...assessmentTracker];
      newTracker[currentAssessmentIndex] = isCorrect ? 'correct' : 'wrong';
      setAssessmentTracker(newTracker);
      setIsAssessmentGraded(true);
    } else {
      if (currentAssessmentIndex < assessmentQuestions.length - 1) {
        setCurrentAssessmentIndex((prev) => prev + 1);
        setSelectedAssessmentOptions([]);
        setIsAssessmentGraded(false);
      } else {
        const total = assessmentQuestions.length;
        const correct = assessmentTracker.filter(status => status === 'correct').length;
        const wrong = total - correct;
        const pct = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;
        const passed = parseFloat(pct) >= 80;

        setAssessmentResult({
          score: `${pct}%`,
          headline: passed ? 'Congratulations!' : 'Keep practicing!',
          summary: passed
            ? 'You have passed the final summative assessment. You can now claim your certificate!'
            : 'You did not achieve the required passing score. Please try again.',
          buttonLabel: passed ? 'Claim Certificate' : 'Retry Quiz',
          stats: [
            { value: String(total), label: 'Questions' },
            { value: String(correct), label: 'Correct Answer' },
            { value: String(wrong), label: 'Wrong Answer' },
            { value: passed ? 'Passed' : 'Failed', label: 'Status', tone: passed ? 'success' : 'danger' },
          ],
        });

        setIsAssessmentComplete(true);
      }
    }
  };

  const handleAssessmentCompleteButton = () => {
    const total = assessmentQuestions.length;
    const correct = assessmentTracker.filter(status => status === 'correct').length;
    const pct = total > 0 ? (correct / total) * 100 : 0;
    const passed = pct >= 80;

    if (passed) {
      navigate('/academia/learner/certificates');
    } else {
      setCurrentAssessmentIndex(0);
      setSelectedAssessmentOptions([]);
      setIsAssessmentGraded(false);
      setIsAssessmentComplete(false);
      setAssessmentTracker(assessmentQuestions.map(() => 'pending'));
    }
  };

  const handleEnrollFromReader = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please sign in to enroll in this course.");
      navigate('/academia/auth/signin');
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${inboundId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_method: 'credit_card'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to enroll in the course.');
      }
      setIsEnrolled(true);
    } catch (err) {
      alert(err.message || 'Failed to enroll in the course.');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <LearnersPageShell>
      <section className="learners-read-contents-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Courses</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="/" onClick={preventDefault}>
                <img src={acSav} alt="Save" />
                <span>Saved Library</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/" onClick={preventDefault}>
                <span>Go to website</span>
                <img src={wExitRight} alt="Exit" />
              </a>
            </div>
          </div>
        </section>

        <div className="filters-grid-b-h">
          <button type="button" onClick={() => navigate(`/academia/learner/course-part?id=${inboundId}`, { state: { courseId: inboundId } })}>
            <img src={acLe} alt="Left" />
          </button>
          <div>
            <p>{stripHtml(courseMetaState.category) || 'Courses'}</p>
            <span>/</span>
            <span>{stripHtml(courseMetaState.title)}</span>
            <span>/</span>
          </div>
        </div>

        <div className={`learners-read-contents-shell ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
          <aside className="learners-read-contents-sidebar" aria-label="Course contents">
            <div className="learners-read-contents-sidebar-card">
              <div className="learners-read-contents-sidebar-head">
                <div>
                  <h1>{stripHtml(courseReader.title)}</h1>
                  <p>Prepared by <strong>{stripHtml(courseReader.author)}</strong></p>
                </div>
                <button
                  type="button"
                  className="learners-read-contents-close"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-expanded={isSidebarOpen}
                  aria-label="Close contents sidebar"
                >
                  <img src={accMinus} alt="Close" />
                </button>
              </div>

              <div className="learners-read-contents-score-row">
                <span className="learners-read-contents-score-badge">{courseReader.score}</span>
                <span className="learners-read-contents-score-label">Avg. Score</span>
              </div>

              <div className="learners-read-contents-divider"></div>

              <div className="learners-read-contents-outline">
                {outlineWeeksState.map((huskWeek) => (
                  <section
                    key={huskWeek.id}
                    className={`learners-read-week ${expandedWeeks[huskWeek.id] ? 'is-open' : ''}`}
                  >
                    <div className="learners-read-week-rail" aria-hidden="true">
                      <img
                        className="learners-read-week-status"
                        src={huskWeek.completed ? checkCircle : noCheckCircle}
                        alt="Status"
                      />
                    </div>

                    <div className="learners-read-week-body">
                      <button
                        type="button"
                        className="learners-read-week-toggle"
                        onClick={() => toggleWeek(huskWeek.id)}
                        aria-expanded={expandedWeeks[huskWeek.id] ? 'true' : 'false'}
                      >
                        <span className="learners-read-week-title">{stripHtml(huskWeek.title)}</span>
                        {huskWeek.chapters && huskWeek.chapters.length > 0 ? (
                          <>
                            <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-minus" src={acCl} alt="Collapse" />
                            <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-plus" src={acOp} alt="Expand" />
                          </>
                        ) : (
                          <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-plus only" src={acOp} alt="Expand" />
                        )}
                      </button>

                      {huskWeek.chapters && huskWeek.chapters.length > 0 && (
                        <div className="learners-read-week-panel">
                          <div className="learners-read-chapters">
                            {huskWeek.chapters.map((huskChapter) => (
                              <button
                                key={huskChapter.id}
                                type="button"
                                className={`learners-read-chapter ${activeChapterId === huskChapter.id ? 'is-active' : ''}`}
                                onClick={() => handleChapterSelect(huskChapter.id)}
                              >
                                <span className="learners-read-chapter-line" aria-hidden="true"></span>
                                <span className="learners-read-chapter-title">{stripHtml(huskChapter.title)}</span>
                                <img
                                  src={huskChapter.completed ? checkCircle : noCheckCircle}
                                  alt={huskChapter.completed ? "Completed" : "Not completed"}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                ))}

                <section className="learners-read-week learners-read-week-assessment">
                  <div className="learners-read-week-rail" aria-hidden="true">
                    <img className="learners-read-week-status" src={noCheckCircle} alt="Status" />
                  </div>
                  <div className="learners-read-week-body">
                    <button
                      type="button"
                      className="learners-read-week-toggle learners-read-week-toggle-link"
                      onClick={() => handleChapterSelect('assessment')}
                    >
                      <span className="learners-read-week-title">Summative Assessment</span>
                      <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-arrow" src={right1} alt="Open" />
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </aside>

          <div
            className="learners-read-contents-backdrop"
            hidden={!isSidebarOpen || window.innerWidth > 991}
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <main className="learners-read-contents-main">
            <div className="learners-read-contents-topbar">
              <button
                type="button"
                className="learners-read-contents-open"
                onClick={() => setIsSidebarOpen(true)}
                aria-expanded={isSidebarOpen}
                aria-label="Toggle contents sidebar"
              >
                <img src={bars} alt="Menu" />
                <span>Contents</span>
              </button>
            </div>

            <section className="learners-read-contents-summary-card" aria-label="Current lesson summary">
              <div className="learners-read-contents-summary-main">
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', color: '#5B0A86', display: 'block', marginBottom: '4px' }}>
                  {stripHtml(activeContent.weekLabel)}
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#071437', margin: 0 }}>
                  {stripHtml(activeContent.chapterLabel)}
                </h2>
              </div>
              <div className="learners-read-contents-summary-side">
                <h3>Progress</h3>
                <p>{stripHtml(activeContent.progressLabel)}</p>
              </div>
            </section>

            <article className="learners-read-article">
              {loadingCourse ? (
                <div className="learners-loading">Loading course content…</div>
              ) : showContentSections ? (
                !isEnrolled ? (
                  <div className="learners-read-lesson-view">
                    <h2 className="learners-read-article-title">{stripHtml(activeContent.headline)}</h2>

                    <div className="learners-read-article-media-preview-locked">
                      <div className="learners-read-article-media blur-locked">
                        <img src={activeContent.image} alt={activeContent.headline} />
                      </div>

                      <div className="learners-read-lock-overlay">
                        <div className="learners-read-lock-card">
                          <div className="learners-read-lock-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          </div>
                          <h3>Enroll to unlock this lesson</h3>
                          <p>Join the course today to get access to all the lectures, interactive quizzes, student discussions, and earn your digital certificate.</p>
                          <div className="learners-read-lock-actions">
                            <button
                              type="button"
                              className="learners-btn learners-btn-primary learners-read-lock-enroll-btn"
                              onClick={handleEnrollFromReader}
                              disabled={isEnrolling}
                            >
                              <span>{isEnrolling ? 'Enrolling...' : 'Join Course Today'}</span>
                            </button>
                            <button
                              type="button"
                              className="learners-btn learners-btn-secondary"
                              onClick={() => navigate(`/academia/learner/course-part?id=${inboundId}`, { state: { courseId: inboundId } })}
                            >
                              <span>Back to Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* LESSON VIEW */}
                    {!isAssessmentView && (
                      <div className="learners-read-lesson-view">
                        <h2 className="learners-read-article-title">{stripHtml(activeContent.headline)}</h2>

                        <div className="learners-read-article-media">
                          <img src={activeContent.image} alt={activeContent.headline} />
                        </div>

                        <section className="learners-read-article-detail-section learners-read-article-detail-section-last">
                          <h3>{activeContent.audienceTitle}</h3>
                          {(() => {
                            const cleanText = stripHtml(activeContent.audienceBody);
                            const needsToggle = cleanText.length > 250;
                            if (needsToggle && !isAudienceExpanded) {
                              return (
                                <p>
                                  <span>{cleanText.slice(0, 250)}...</span>
                                  <button
                                    type="button"
                                    onClick={() => setIsAudienceExpanded(true)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#5B0A86',
                                      fontWeight: 600,
                                      marginLeft: '6px',
                                      padding: 0,
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    Read more
                                  </button>
                                </p>
                              );
                            } else {
                              return (
                                <div style={{ marginTop: '12px' }}>
                                  <div
                                    style={{
                                      maxWidth: '960px',
                                      fontFamily: 'Inter, sans-serif',
                                      fontWeight: 400,
                                      fontSize: '13px',
                                      lineHeight: '18px',
                                      letterSpacing: 0,
                                      color: '#4B5675'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: activeContent.audienceBody || '' }}
                                  />
                                  {needsToggle && (
                                    <button
                                      type="button"
                                      onClick={() => setIsAudienceExpanded(false)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#5B0A86',
                                        fontWeight: 600,
                                        marginTop: '6px',
                                        padding: 0,
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        display: 'block'
                                      }}
                                    >
                                      Read less
                                    </button>
                                  )}
                                </div>
                              );
                            }
                          })()}
                        </section>

                        <section className="learners-read-article-bottom-section">
                          <h3>What will you achieve?</h3>
                          <p>By the end of the course, you'll be able to...</p>
                          <ul className="learners-read-article-outcomes">
                            {outcomesState.length === 0 ? (
                              <li className="learners-empty">No learning outcomes available.</li>
                            ) : (
                              outcomesState.map((husk, idx) => (
                                <li key={`${husk}-${idx}`}>{stripHtml(husk)}</li>
                              ))
                            )}
                          </ul>

                          <h3 className="learners-read-article-paper-title">Observe well this past papers</h3>

                          {/* PDF Pagination Bar */}
                          {pdfAttachments.length > 1 && (
                            <div className="learners-pdf-pagination-bar">
                              <button
                                type="button"
                                onClick={() => setActivePdfIndex(prev => Math.max(0, prev - 1))}
                                disabled={activePdfIndex === 0}
                                className="learners-pdf-pagination-btn"
                              >
                                &larr; Prev Paper
                              </button>
                              <span className="learners-pdf-pagination-info">
                                Paper {activePdfIndex + 1} of {pdfAttachments.length}: {pdfAttachments[activePdfIndex]?.file_name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActivePdfIndex(prev => Math.min(pdfAttachments.length - 1, prev + 1))}
                                disabled={activePdfIndex === pdfAttachments.length - 1}
                                className="learners-pdf-pagination-btn"
                              >
                                Next Paper &rarr;
                              </button>
                            </div>
                          )}

                          <div className="learners-read-article-paper-a3" aria-hidden="true">
                            {pdfUrl ? (
                              <iframe
                                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                                title="Past Paper PDF Viewer"
                                width="100%"
                                height="100%"
                                style={{ border: 'none', borderRadius: '8px' }}
                                loading="lazy"
                              />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', padding: '20px', textAlign: 'center' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                                <h4>No PDF document attached for this lesson</h4>
                                <p style={{ fontSize: '12px', marginTop: '4px' }}>There are no downloadable slides or past papers provided for this chapter yet.</p>
                              </div>
                            )}
                          </div>

                          {/* All Chapter Attachments Section (Merged under Observe well this past papers) */}
                          {attachmentsList.length > 0 && (
                            <div className="learners-read-attachments-section" style={{ marginTop: '20px' }}>
                              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#4B5675', marginBottom: '10px' }}>All Chapter Attachments</h4>
                              <div className="learners-attachments-grid">
                                {attachmentsList.map((file, idx) => {
                                  const fileUrlString = file.file_path.startsWith('http') ? file.file_path : `${API_BASE_URL}${file.file_path}`;
                                  const ext = file.file_name?.split('.').pop()?.toUpperCase() || 'FILE';
                                  const isPDF = file.file_type === 'application/pdf' || (file.file_path || '').toLowerCase().endsWith('.pdf');
                                  const isActivePDF = isPDF && pdfAttachments[activePdfIndex] && (pdfAttachments[activePdfIndex].file_path === file.file_path);
                                  return (
                                    <a
                                      key={`res-${idx}`}
                                      href={fileUrlString}
                                      download={file.file_name}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`learners-attachment-download-card ${isActivePDF ? 'is-active-pdf' : ''}`}
                                      onClick={(e) => {
                                        if (isPDF) {
                                          e.preventDefault();
                                          const pdfIdx = pdfAttachments.findIndex(p => p.file_path === file.file_path);
                                          if (pdfIdx >= 0) setActivePdfIndex(pdfIdx);
                                        }
                                      }}
                                    >
                                      <div className="learners-attachment-ext-badge">
                                        {ext}
                                      </div>
                                      <div className="learners-attachment-meta">
                                        <p title={file.file_name}>
                                          {file.file_name}
                                        </p>
                                        <span>
                                          {isPDF ? (isActivePDF ? 'Viewing now' : 'Click to view in paper frame') : 'Click to download'}
                                        </span>
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </section>

                        <section className="learners-read-support-cta" aria-label="Private question support">
                          <div className="learners-read-support-cta-copy">
                            <h3>Didn’t get it right, Ask a question Privately</h3>
                            <p>See your personalized recommendations based on your interests and goals.</p>
                          </div>
                          <button type="button" className="learners-read-support-cta-btn" onClick={preventDefault}>
                            <span>Ask a question</span>
                            <img src={wAcBook} alt="Ask" />
                          </button>
                        </section>

                        <section className="learners-read-exercise" aria-label="Exercise">
                          <div className="learners-read-exercise-head">
                            <div className="learners-read-exercise-badge" aria-hidden="true">
                              <img src={leTec} alt="Exercise" />
                            </div>
                            <h3>Exercise</h3>
                          </div>

                          <div className="learners-read-assessment-tracker learners-read-exercise-tracker">
                            {exerciseQuestionsState.length === 0 ? (
                              <div className="learners-empty">No exercises for this chapter.</div>
                            ) : (
                              exerciseQuestionsState.map((q, idx) => (
                                <button
                                  key={q.id || `ex-${idx}`}
                                  type="button"
                                  className={`learners-read-assessment-track-item ${idx === currentExerciseIndex ? 'is-current' : ''} ${exerciseStates[idx] !== 'pending' ? `is-${exerciseStates[idx]}` : ''}`}
                                  onClick={() => {
                                    setCurrentExerciseIndex(idx);
                                    setSelectedExerciseOption(null);
                                    setIsExerciseGraded(false);
                                  }}
                                >
                                  {idx + 1}
                                </button>
                              ))
                            )}
                          </div>

                          <p className="learners-read-assessment-question learners-read-exercise-question">
                            <span>{exerciseQuestionsState[currentExerciseIndex]?.number}.</span>
                            <span>{stripHtml(exerciseQuestionsState[currentExerciseIndex]?.prompt)}</span>
                          </p>

                          <div className="learners-read-assessment-options learners-read-exercise-options">
                            {exerciseQuestionsState[currentExerciseIndex]?.options?.length ? exerciseQuestionsState[currentExerciseIndex].options.map((optHusk, optIdx) => {
                              const isSelected = selectedExerciseOption === optIdx;
                              const isCorrect = (exerciseQuestionsState[currentExerciseIndex].correctAnswers || []).includes(optIdx);
                              let stateClass = '';
                              if (isExerciseGraded) {
                                if (isSelected) {
                                  stateClass = isCorrect ? 'is-correct' : 'is-wrong';
                                } else if (isCorrect) {
                                  stateClass = 'is-correct';
                                }
                              }
                              return (
                                <button
                                  key={`${exerciseQuestionsState[currentExerciseIndex]?.id || currentExerciseIndex}-${optIdx}`}
                                  type="button"
                                  className={`learners-read-assessment-option learners-read-exercise-option ${isSelected ? 'is-selected' : ''} ${stateClass}`}
                                  onClick={() => handleExerciseOptionSelect(optIdx)}
                                >
                                  <span className="learners-read-assessment-option-marker"></span>
                                  <span>{stripHtml(optHusk)}</span>
                                </button>
                              );
                            }) : (
                              <div className="learners-empty">No options available for this exercise.</div>
                            )}
                          </div>

                          <button
                            type="button"
                            className={`learners-read-assessment-action learners-read-exercise-action ${isExerciseGraded && currentExerciseIndex === exerciseQuestionsState.length - 1 ? 'is-complete' : ''}`}
                            onClick={handleExerciseAction}
                          >
                            <span>{isExerciseGraded && currentExerciseIndex < exerciseQuestionsState.length - 1 ? 'Next' : 'Done'}</span>
                            <img src={right1} alt="Next" hidden={!isExerciseGraded || currentExerciseIndex >= exerciseQuestionsState.length - 1} />
                          </button>
                        </section>
                      </div>
                    )}

                    {/* ASSESSMENT VIEW */}
                    {isAssessmentView && (
                      <section className="learners-read-assessment-view">
                        <div className="learners-read-assessment-strip">
                          <div className="learners-read-assessment-strip-top">
                            <div className="learners-read-assessment-strip-title">
                              <div className="learners-read-assessment-badge" aria-hidden="true">
                                <img src={leTec} alt="Assessment" />
                              </div>
                              <h3>Assessment</h3>
                            </div>
                            <p className="learners-read-assessment-time">Time remaining : <strong>12:58</strong></p>
                          </div>

                          <div className="learners-read-assessment-tracker">
                            {assessmentTracker.length === 0 ? (
                              <div className="learners-empty">No assessment tracker available.</div>
                            ) : (
                              assessmentTracker.map((huskState, idx) => (
                                <button
                                  key={`track-${idx}-${huskState}`}
                                  type="button"
                                  className={`learners-read-assessment-track-item is-${huskState} ${idx === currentAssessmentIndex ? 'is-current' : ''}`}
                                  onClick={() => {
                                    if (idx < assessmentQuestions.length) {
                                      setCurrentAssessmentIndex(idx);
                                      setSelectedAssessmentOptions([]);
                                      setIsAssessmentGraded(false);
                                      setIsAssessmentComplete(false);
                                    }
                                  }}
                                >
                                  {idx + 1}
                                </button>
                              ))
                            )}
                          </div>
                        </div>

                        {!isAssessmentComplete ? (
                          assessmentQuestions.length === 0 ? (
                            <div className="learners-card learners-empty-state" style={{ margin: '20px 0', padding: '40px', textAlign: 'center' }}>
                              <h3>No assessment questions available</h3>
                              <p>There are no questions for this assessment yet.</p>
                            </div>
                          ) : (
                            <section className="learners-read-assessment-card">
                              <div className="learners-read-assessment-card-top">
                                <div className="learners-read-assessment-card-title">
                                  <img src={leftIcon} alt="Back" />
                                  <span>Assessment</span>
                                </div>
                                <strong>{assessmentQuestions[currentAssessmentIndex]?.progressText}</strong>
                              </div>

                              <p className="learners-read-assessment-question">
                                <span>{assessmentQuestions[currentAssessmentIndex]?.number}.</span>
                                <span>{stripHtml(assessmentQuestions[currentAssessmentIndex]?.prompt)}</span>
                              </p>

                              {assessmentQuestions[currentAssessmentIndex]?.image && (
                                <div className="learners-read-assessment-image-wrap">
                                  <img src={assessmentQuestions[currentAssessmentIndex].image} alt="Assessment reference" />
                                </div>
                              )}

                              <div className="learners-read-assessment-options">
                                {assessmentQuestions[currentAssessmentIndex]?.options?.map((optHusk, optIdx) => {
                                  const isMulti = assessmentQuestions[currentAssessmentIndex].type === 'multi';
                                  const isSelected = selectedAssessmentOptions.includes(optIdx);
                                  const isCorrect = assessmentQuestions[currentAssessmentIndex].correctAnswers.includes(optIdx);

                                  let stateClass = '';
                                  if (isAssessmentGraded) {
                                    if (isSelected) {
                                      stateClass = isCorrect ? 'is-correct' : 'is-wrong';
                                    } else if (isCorrect && !isMulti) {
                                      stateClass = 'is-correct';
                                    }
                                  }

                                  return (
                                    <button
                                      key={`${assessmentQuestions[currentAssessmentIndex]?.id || currentAssessmentIndex}-${optIdx}`}
                                      type="button"
                                      className={`learners-read-assessment-option ${isMulti ? 'is-multi' : ''} ${isSelected ? 'is-selected' : ''} ${stateClass}`}
                                      onClick={() => handleAssessmentOptionSelect(optIdx, assessmentQuestions[currentAssessmentIndex].type)}
                                    >
                                      <span className="learners-read-assessment-option-marker">
                                        {isMulti && <img src={doneIcon} alt="Check" />}
                                      </span>
                                      <span>{stripHtml(optHusk)}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                className={`learners-read-assessment-action ${isAssessmentGraded && currentAssessmentIndex === assessmentQuestions.length - 1 ? 'is-complete' : ''}`}
                                onClick={handleAssessmentAction}
                              >
                                <span>
                                  {assessmentQuestions[currentAssessmentIndex]?.type === 'multi' && !isAssessmentGraded ? 'Done' : 'Next'}
                                </span>
                                {!(assessmentQuestions[currentAssessmentIndex]?.type === 'multi' && !isAssessmentGraded) && (
                                  <img src={right1} alt="Next" />
                                )}
                              </button>
                            </section>
                          )
                        ) : (
                          <section className="learners-read-assessment-complete">
                            <div className="learners-read-assessment-complete-orb" aria-hidden="true">
                              <span>{assessmentResult.score}</span>
                            </div>
                            <div className="learners-read-assessment-complete-copy">
                              <h3>
                                <span aria-hidden="true">🎉</span>
                                <span>{assessmentResult.headline}</span>
                              </h3>
                            </div>
                            <div className="learners-read-assessment-complete-stats">
                              {assessmentResult.stats.map((huskStat, idx) => (
                                <div key={idx} className={`learners-read-assessment-complete-stat ${huskStat.tone ? `is-${huskStat.tone}` : ''}`}>
                                  <strong>{huskStat.value}</strong>
                                  <span>{huskStat.label}</span>
                                </div>
                              ))}
                            </div>
                            <p className="learners-read-assessment-complete-summary">{assessmentResult.summary}</p>
                            <button type="button" className="learners-read-assessment-complete-button" onClick={handleAssessmentCompleteButton}>
                              <span>{assessmentResult.buttonLabel}</span>
                              <img src={right1} alt="Continue" />
                            </button>
                          </section>
                        )}
                      </section>
                    )}
                  </>
                )
              ) : (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>No content published</h3>
                  <p className="visually-hidden">There are no chapters or learning outcomes for this course yet.</p>
                  <div>
                    <button className="learners-btn learners-btn-primary" disabled>Browse courses</button>
                    <button className="learners-btn learners-btn-secondary" disabled>Contact author</button>
                  </div>
                </div>
              )}
            </article>
          </main>
        </div>
      </section>

      <section className="learners-course-specific-author-card" aria-label="Course author">
        <div className="learners-course-specific-author-card-inner">
          <div className="learners-course-specific-author-avatar">
            <img src={courseMetaState.authorImage} alt={courseMetaState.author} />
          </div>
          <div className="learners-course-specific-author-copy">
            <h3>{courseMetaState.author}</h3>
            <p className="learners-course-specific-author-role">{courseMetaState.authorRole}</p>

            <div className="learners-course-specific-author-meta">
              <span>Published on</span>
              <span aria-hidden="true">|</span>
              <span>{courseMetaState.publishedOn}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="learners-course-specific-newsletter" aria-label="Newsletter signup">
        <div className="learners-course-specific-newsletter-column learners-course-specific-newsletter-column-copy">
          <h3>Find the right course for you</h3>
          <p>See your personalised recommendations based on your interests and goals.</p>
          <div className="learners-course-specific-newsletter-socials">
            <a href="/" onClick={preventDefault} aria-label="TikTok">
              <img src={dtiktok} alt="TikTok" />
            </a>
            <a href="/" onClick={preventDefault} aria-label="WhatsApp">
              <img src={dwhat} alt="WhatsApp" />
            </a>
            <a href="/" onClick={preventDefault} aria-label="Facebook">
              <img src={dfaceb} alt="Facebook" />
            </a>
            <a href="/" onClick={preventDefault} aria-label="Instagram">
              <img src={dinstagram} alt="Instagram" />
            </a>
          </div>
        </div>

        <div className="learners-course-specific-newsletter-column learners-course-specific-newsletter-column-form">
          <h3>Stay tune and get the latest update</h3>
          <p>See your personalised recommendations based on your interests and goals.</p>
          <form className="learners-course-specific-newsletter-form" onSubmit={preventDefault}>
            <img src={acSms} alt="Mail" className="learners-course-specific-newsletter-mail" />
            <input type="email" placeholder="Enter email address" aria-label="Enter email address" />
            <button type="submit" aria-label="Submit email">
              <img src={acSend} alt="Send" />
            </button>
          </form>
        </div>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersReadContents;

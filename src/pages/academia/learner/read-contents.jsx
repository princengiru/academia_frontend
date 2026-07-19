import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import Sidebar from './read-contents/Sidebar';
import LessonView from './read-contents/LessonView';
import LessonWorkspacePanels from './read-contents/LessonWorkspacePanels';
import { findWeekIdForOutlineItem, isSameOutlineItemId, countOutlineProgress, getNextOutlineItem, getNextAssessment, isOutlineItemUnlocked, getFirstUnlockedOutlineItem, resolveReaderChapterTarget, iterateOutlineItems } from './read-contents/sidebarUtils';
import { getStoredChapterId, setStoredChapterId, resolveCourseProgressPercent } from './homeDashboardUtils';
import LearnerLoadError from './LearnerLoadError';
import CourseCompleteCelebration, { hasSeenCourseCelebration, markCourseCelebrationSeen } from './read-contents/CourseCompleteCelebration';
import {
  buildAccountPaymentHref,
  computeCertificateTotalHours,
  getPaymentMethodLabel,
  hasSavedPaymentMethods,
  isEnrollmentRoleAllowed,
} from './enrollmentPaymentUtils';
import AssessmentView from './read-contents/AssessmentView';
import { useLearnerToast } from './useLearnerToast';

// Icons & Images
import SavedLibraryButton from './SavedLibraryButton';
import EnrollmentPaymentPicker from './EnrollmentPaymentPicker';
import {
  buildAvailablePaymentChoices,
  enrollInCourse,
  fetchSavedPaymentMethods,
  isCourseFree,
  pickDefaultPaymentValue,
} from './enrollmentPaymentUtils';
import { learnerPageTitle, LEARNER_PRODUCT_NAME } from './learnerBrand';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import acLe from '../../../assets/icons/ac-le.svg';
import acOnImg from '../../../assets/imgs/ac-on.jpg';
import defaultProfile from '../../../assets/imgs/default-profile.png';
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
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import './read-contents.css';

const apexCourseMeta = {
  title: '',
  author: '',
  authorImage: defaultProfile,
  authorRole: '',
  publishedOn: '',
  headline: '',
  summary: '',
  image: acOnImg,
  duration: '',
  weekly: '',
  level: '',
  price: '',
  rawPrice: 0,
  isFree: false,
  discount: '',
  intro: '',
  audience: '',
  category: '',
};

const slateCourseReader = { title: '', author: '', score: '0.0%' };

const genesisOutcomes = [];

const slateExerciseQuestions = [];

const EMPTY_ASSESSMENT_RESULT = {
  score: '',
  headline: '',
  summary: '',
  buttonLabel: '',
  stats: [],
  status: '',
};

const EMPTY_ASSESSMENT_DETAILS = {
  id: null,
  type: 'summative',
  title: '',
  passingScore: 80,
  durationMinutes: 0,
  attemptLimit: null,
  showCorrectAnswers: true,
  showScoreImmediately: true,
  randomizeQuestions: false,
  isPublished: true,
};

const slateOutlineWeeks = [];

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
  let cleanHtml = html
    .replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`)
    .replace(/href="\/uploads\//g, `href="${API_BASE_URL}/uploads/`);
  
  cleanHtml = cleanHtml.replace(/<a\s+(href="[^"]*")/gi, (match, hrefPart) => {
    if (/target=/i.test(match)) {
      return match;
    }
    return `<a target="_blank" rel="noopener noreferrer" ${hrefPart}`;
  });
  
  return cleanHtml;
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getOptionLabel = (o) => {
  if (o && typeof o === 'object') {
    return o.text || o.label || o.value || o.option || o.option_text || o.optionText || o.content || String(o);
  }
  return String(o);
};

const extractCorrectAnswers = (q, options, optionLabels) => {
  let correctAnswers = [];
  if (Array.isArray(options)) {
    correctAnswers = options.map((o, idx) => (o && typeof o === 'object' && (o.is_correct || o.isCorrect) ? idx : -1)).filter(i => i >= 0);
  }
  
  const correctField = q.correct_answer || q.correctAnswer;
  if (correctAnswers.length === 0 && correctField) {
    const rawCorrect = correctField;
    let parsedCorrect = null;
    
    if (typeof rawCorrect === 'string') {
      try {
        parsedCorrect = JSON.parse(rawCorrect);
      } catch (e) {
        parsedCorrect = null;
      }
    }
    
    if (Array.isArray(parsedCorrect)) {
      parsedCorrect.forEach(item => {
        const itemStr = String(item).trim();
        const idx = parseInt(itemStr, 10);
        if (!isNaN(idx) && idx >= 0 && idx < optionLabels.length) {
          correctAnswers.push(idx);
        } else {
          const matchedIdx = optionLabels.findIndex(lbl => String(lbl).trim().toLowerCase() === itemStr.toLowerCase());
          if (matchedIdx >= 0) {
            correctAnswers.push(matchedIdx);
          }
        }
      });
    } else {
      const cleanCorrect = String(rawCorrect).trim();
      const parsedNum = parseInt(cleanCorrect, 10);
      if (!isNaN(parsedNum) && String(parsedNum) === cleanCorrect && parsedNum >= 0 && parsedNum < optionLabels.length) {
        correctAnswers.push(parsedNum);
      } else if (cleanCorrect.includes(',')) {
        const correctTexts = cleanCorrect.split(',').map(s => s.trim().toLowerCase());
        correctTexts.forEach(text => {
          const partNum = parseInt(text, 10);
          if (!isNaN(partNum) && String(partNum) === text && partNum >= 0 && partNum < optionLabels.length) {
            correctAnswers.push(partNum);
          } else {
            const matchedIdx = optionLabels.findIndex(lbl => String(lbl).trim().toLowerCase() === text);
            if (matchedIdx >= 0) {
              correctAnswers.push(matchedIdx);
            }
          }
        });
      } else {
        const matchedIdx = optionLabels.findIndex(lbl => String(lbl).trim().toLowerCase() === cleanCorrect.toLowerCase());
        if (matchedIdx >= 0) {
          correctAnswers.push(matchedIdx);
        }
      }
    }
  }
  return [...new Set(correctAnswers)];
};

function LearnersReadContents() {
  const preventDefault = (e) => e.preventDefault();
  const navigate = useNavigate();
  const { showToast } = useLearnerToast();

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [isAudienceExpanded, setIsAudienceExpanded] = useState(false);
  const [activePdfIndex, setActivePdfIndex] = useState(0);
  const [activeTextPageIndex, setActiveTextPageIndex] = useState(0);

  // Router params
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyStateId = location.state?.courseId;
  const legacyChapterId = location.state?.chapterId;

  // Backend-driven content state (fallback to local mocks)
  const [courseMetaState, setCourseMetaState] = useState(apexCourseMeta);
  const [courseReader, setCourseReader] = useState(slateCourseReader);
  const [outlineWeeksState, setOutlineWeeksState] = useState(slateOutlineWeeks);
  const [activeChapterContent, setActiveChapterContent] = useState(null);
  const [loadingChapterContent, setLoadingChapterContent] = useState(false);
  const [contentReloadKey, setContentReloadKey] = useState(0);
  const [exerciseQuestionsState, setExerciseQuestionsState] = useState(slateExerciseQuestions);
  const [outcomesState, setOutcomesState] = useState(genesisOutcomes);
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [exerciseGradedList, setExerciseGradedList] = useState({});
  const [completedChapters, setCompletedChapters] = useState([]);
  const [courseAvgScore, setCourseAvgScore] = useState('0.0%');
  const [courseProgressPercentage, setCourseProgressPercentage] = useState(null);
  const [courseLoadError, setCourseLoadError] = useState('');
  const [chapterLoadError, setChapterLoadError] = useState('');
  const [showCourseCelebration, setShowCourseCelebration] = useState(false);

  const [loadingCourse, setLoadingCourse] = useState(false);

  // Exercise State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseStates, setExerciseStates] = useState(() => exerciseQuestionsState.map(() => 'pending'));
  const [selectedExerciseOption, setSelectedExerciseOption] = useState(null);
  const [isExerciseGraded, setIsExerciseGraded] = useState(false);

  // Assessment State
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [assessmentTracker, setAssessmentTracker] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState(EMPTY_ASSESSMENT_RESULT);

  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [assessmentAttemptData, setAssessmentAttemptData] = useState(null);

  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [selectedAssessmentOptions, setSelectedAssessmentOptions] = useState([]);
  const [isAssessmentGraded, setIsAssessmentGraded] = useState(false);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const [isSummativeComplete, setIsSummativeComplete] = useState(false);
  const [currentAssessmentDetails, setCurrentAssessmentDetails] = useState(EMPTY_ASSESSMENT_DETAILS);
  const [currentAttemptId, setCurrentAttemptId] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [isAssessmentReviewMode, setIsAssessmentReviewMode] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  // Timer & Attempt State
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [assessmentTimerActive, setAssessmentTimerActive] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [maxAttempts, setMaxAttempts] = useState(null);
  const timerIntervalRef = useRef(null);
  const submitRef = useRef(null);
  const contentLoadTokenRef = useRef(0);
  const outlineWeeksRef = useRef(outlineWeeksState);
  const isSummativeCompleteRef = useRef(isSummativeComplete);
  const sequenceRedirectedToRef = useRef(null);

  useEffect(() => {
    outlineWeeksRef.current = outlineWeeksState;
  }, [outlineWeeksState]);

  useEffect(() => {
    isSummativeCompleteRef.current = isSummativeComplete;
  }, [isSummativeComplete]);

  const bumpLoadToken = () => {
    contentLoadTokenRef.current += 1;
    return contentLoadTokenRef.current;
  };

  const isStaleLoad = (token) => contentLoadTokenRef.current !== token;

  const resetAssessmentState = () => {
    setAssessmentQuestions([]);
    setAssessmentTracker([]);
    setAssessmentAnswers({});
    setSelectedAssessmentOptions([]);
    setAssessmentTextAnswer('');
    setIsAssessmentGraded(false);
    setIsAssessmentComplete(false);
    setIsAssessmentStarted(false);
    setIsConfirmingSubmit(false);
    setIsAssessmentReviewMode(false);
    setAssessmentAttemptData(null);
    setCurrentAttemptId(null);
    setCurrentAssessmentIndex(0);
    setAssessmentResult(EMPTY_ASSESSMENT_RESULT);
    setCurrentAssessmentDetails({ ...EMPTY_ASSESSMENT_DETAILS });
    setAttemptNumber(1);
    setMaxAttempts(null);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setAssessmentTimerActive(false);
    setTimeRemainingSeconds(0);
    setLoadingAssessment(true);
  };

  const resetChapterState = () => {
    setExerciseQuestionsState([]);
    setExerciseStates([]);
    setExerciseAnswers({});
    setExerciseGradedList({});
    setCurrentExerciseIndex(0);
    setSelectedExerciseOption(null);
    setIsExerciseGraded(false);
    setActiveChapterContent(null);
    setLoadingChapterContent(true);
  };

  const hasAttemptsLeft = useMemo(() => {
    if (!maxAttempts) return true;
    return attemptNumber < maxAttempts;
  }, [attemptNumber, maxAttempts]);

  const updateSummativeCompletion = (complete) => {
    setIsSummativeComplete(complete);
    setCompletedChapters((prev) => {
      const hasAssessment = prev.includes('assessment');
      if (complete) {
        return hasAssessment ? prev : [...prev, 'assessment'];
      }
      return hasAssessment ? prev.filter((id) => id !== 'assessment') : prev;
    });
  };

  const isSummativeAttempt = (att, assessmentId) => {
    if (Number(att.assessmentId) !== Number(assessmentId)) return false;
    const cat = String(att.category || att.assessment_category || '').toLowerCase();
    return cat !== 'formative';
  };

  const hydrateCompletedAssessmentResult = async ({
    type,
    attemptId,
    historyAttempt,
    questionCount,
    passingScore,
    token,
    exhaustedAttempts = false,
    currentItemId = null,
  }) => {
    if (!attemptId) return;

    let scorePct = parseFloat(historyAttempt?.percentage ?? historyAttempt?.score ?? 0);
    let passed = !!(historyAttempt?.isPassed || historyAttempt?.is_passed);
    let correct = 0;
    let wrong = 0;
    let answered = 0;
    let status = historyAttempt?.status || 'graded';

    if (token) {
      try {
        const resultsUrl = type === 'summative'
          ? `${API_BASE_URL}/api/summative-attempts/${attemptId}/results`
          : `${API_BASE_URL}/api/formative-attempts/${attemptId}/results`;
        const resultsRes = await fetch(resultsUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resultsRes.ok) {
          const resultsBody = await resultsRes.json();
          const finalResults = resultsBody.data || resultsBody;
          scorePct = parseFloat(
            finalResults.attempt?.percentage ??
            finalResults.attempt?.score ??
            historyAttempt?.percentage ??
            historyAttempt?.score ??
            0
          );
          passed = finalResults.attempt?.is_passed ?? finalResults.attempt?.isPassed ?? (scorePct >= passingScore);
          correct = finalResults.results?.correct_answers || 0;
          wrong = finalResults.results?.wrong_answers || 0;
          answered = finalResults.results?.pending_review || 0;
          status = finalResults.attempt?.status || status;
        }
      } catch (e) {
        console.error('Failed to hydrate completed assessment result:', e);
      }
    }

    if (!passed && scorePct >= passingScore) passed = true;

    const isSummative = type === 'summative';
    const nextItem = passed && !isSummative
      ? getNextOutlineItem(outlineWeeksState, currentItemId || activeChapterId, isSummativeComplete)
      : null;

    setAssessmentResult({
      score: `${Number(scorePct || 0).toFixed(1)}%`,
      headline: passed ? 'Congratulations!' : (answered > 0 ? 'Submitted for Review' : (isSummative ? 'Assessment Completed' : 'Quiz Completed')),
      summary: passed
        ? (isSummative
          ? 'You have passed the final summative assessment. You can now claim your certificate!'
          : 'You have passed the quiz assessment. Great job!')
        : exhaustedAttempts
          ? 'You have used all attempts for this assessment.'
          : answered > 0
            ? `Your essay/text answers will be reviewed by the instructor. Auto-graded score: ${Number(scorePct || 0).toFixed(1)}%`
            : 'You did not achieve the required passing score.',
      buttonLabel: passed
        ? (isSummative ? 'Claim Certificate' : (nextItem ? 'Continue' : ''))
        : (exhaustedAttempts ? 'No attempt left' : 'Retry Quiz'),
      continueChapterId: nextItem?.id || null,
      continueLabel: nextItem?.title || '',
      stats: [
        { value: String(questionCount || 0), label: 'Questions' },
        { value: String(correct), label: 'Correct' },
        { value: String(wrong), label: 'Wrong' },
        ...(answered > 0 ? [{ value: String(answered), label: 'Pending Review' }] : []),
        {
          value: passed ? 'Passed' : (answered > 0 ? 'Pending' : 'Failed'),
          label: 'Status',
          tone: passed ? 'success' : (answered > 0 ? '' : 'danger'),
        },
      ],
      status,
    });
  };

  const refreshSummativeCompletionStatus = async (courseId) => {
    if (!courseId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/summative-assessment`);
      if (!res.ok) {
        updateSummativeCompletion(false);
        return;
      }
      const data = extractBody(await res.json());
      if (!data?.id) {
        updateSummativeCompletion(false);
        return;
      }

      let historyList = [];
      if (token) {
        const perfRes = await fetch(`${API_BASE_URL}/api/profile/performance?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (perfRes.ok) {
          const perfBody = await perfRes.json();
          historyList = perfBody?.data?.assessmentHistory || [];
        }
      }

      const res2 = await fetch(`${API_BASE_URL}/api/summative-assessments/${data.id}`);
      if (!res2.ok) {
        updateSummativeCompletion(false);
        return;
      }
      const fullAssessment = extractBody(await res2.json());
      if (!fullAssessment) {
        updateSummativeCompletion(false);
        return;
      }

      const isPublished = fullAssessment.is_published ?? fullAssessment.isPublished ?? true;
      if (!isPublished) {
        updateSummativeCompletion(false);
        return;
      }

      const limitVal = fullAssessment.attempt_limit || fullAssessment.attemptLimit || 1;
      const passingScore = Number(fullAssessment.passingScore || fullAssessment.passing_score || 80);
      const myAttempts = historyList.filter((att) => isSummativeAttempt(att, data.id));
      const completedAttempts = myAttempts.filter((att) => att.status === 'submitted' || att.status === 'graded');
      const passedAttempt = completedAttempts.find((att) => {
        if (att.isPassed || att.is_passed) return true;
        const pct = parseFloat(att.percentage ?? att.score ?? 0);
        return pct >= passingScore;
      });

      if (passedAttempt || (limitVal && completedAttempts.length >= limitVal)) {
        updateSummativeCompletion(true);
      } else {
        updateSummativeCompletion(false);
      }
    } catch (err) {
      console.error('Failed to refresh summative completion status:', err);
      updateSummativeCompletion(false);
    }
  };

  // Countdown Timer Effect
  useEffect(() => {
    if (assessmentTimerActive && timeRemainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setAssessmentTimerActive(false);
            // Auto-submit on time expiry
            handleTimerExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [assessmentTimerActive, timeRemainingSeconds > 0]);

  const handleTimerExpiry = useCallback(() => {
    if (submitRef.current) {
      submitRef.current();
    }
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startAssessmentTimer = (durationMinutes, startTime) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (durationMinutes && durationMinutes > 0) {
      let initialSeconds = durationMinutes * 60;
      if (startTime) {
        // Calculate remaining seconds based on the attempt's start time
        const startTimeObj = new Date(startTime);
        const nowObj = new Date();
        const elapsedSeconds = Math.floor((nowObj.getTime() - startTimeObj.getTime()) / 1000);
        const actualElapsed = elapsedSeconds > 0 ? elapsedSeconds : 0;
        initialSeconds = Math.max(0, (durationMinutes * 60) - actualElapsed);
      }

      setTimeRemainingSeconds(initialSeconds);
      
      if (initialSeconds > 0) {
        setAssessmentTimerActive(true);
      } else {
        setAssessmentTimerActive(false);
        // If time already expired, immediately auto-submit
        handleTimerExpiry();
      }
    } else {
      // No time limit
      setTimeRemainingSeconds(0);
      setAssessmentTimerActive(false);
    }
  };

  const saveAnswerToBackend = async (questionId, answerVal) => {
    const token = localStorage.getItem('token');
    if (!token || !currentAttemptId) return;
    const isSummative = currentAssessmentDetails.type === 'summative';
    const url = isSummative 
      ? `${API_BASE_URL}/api/summative-attempts/${currentAttemptId}/submit-answer`
      : `${API_BASE_URL}/api/formative-attempts/${currentAttemptId}/submit-answer`;
    
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_id: questionId,
          answer: String(answerVal)
        })
      });
    } catch (err) {
      console.error("Failed to save answer to backend:", err);
    }
  };

  const updateLocalAnswer = (questionId, value, answerText) => {
    setAssessmentAnswers(prev => ({ ...prev, [questionId]: value }));
    
    setAssessmentTracker(prev => {
      const nextTracker = [...prev];
      const qIndex = assessmentQuestions.findIndex(q => q.id === questionId);
      if (qIndex >= 0) {
        const isEmpty = value === null || value === undefined || 
          (Array.isArray(value) && value.length === 0) || 
          (typeof value === 'string' && value.trim() === '');
        nextTracker[qIndex] = isEmpty ? 'pending' : 'answered';
      }
      return nextTracker;
    });

    saveAnswerToBackend(questionId, answerText);
  };

  const syncTextAnswer = () => {
    const currentQ = assessmentQuestions[currentAssessmentIndex];
    if (!currentQ) return;
    const isTextQ = currentQ.type === 'short_answer' || currentQ.type === 'essay';
    if (!isTextQ) return;
    
    const currentVal = assessmentTextAnswer;
    if (assessmentAnswers[currentQ.id] !== currentVal) {
      updateLocalAnswer(currentQ.id, currentVal, currentVal);
    }
  };

  // Restore saved answer when question index changes
  useEffect(() => {
    const currentQ = assessmentQuestions[currentAssessmentIndex];
    if (!currentQ) return;
    
    const savedAnswer = assessmentAnswers[currentQ.id];
    if (savedAnswer !== undefined && savedAnswer !== null) {
      if (currentQ.type === 'short_answer' || currentQ.type === 'essay') {
        setAssessmentTextAnswer(savedAnswer);
        setSelectedAssessmentOptions([]);
      } else {
        setSelectedAssessmentOptions(Array.isArray(savedAnswer) ? savedAnswer : [savedAnswer]);
        setAssessmentTextAnswer('');
      }
    } else {
      setSelectedAssessmentOptions([]);
      setAssessmentTextAnswer('');
    }
  }, [currentAssessmentIndex, assessmentQuestions]);

  const getTrackerItemClass = (idx) => {
    const isCurrent = idx === currentAssessmentIndex;
    let baseClass = 'learners-read-assessment-track-item';
    if (isCurrent) {
      baseClass += ' is-current';
    }
    
    if (isAssessmentReviewMode && currentAssessmentDetails.showCorrectAnswers) {
      const q = assessmentQuestions[idx];
      if (!q) return baseClass + ' is-pending';
      
      if (q.type === 'short_answer' || q.type === 'essay') {
        if (q.type === 'essay') {
          return baseClass + ' is-answered';
        }
        const savedAns = assessmentAnswers[q.id];
        const isCorrectText = savedAns && q.correctAnswer && 
          String(savedAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        return baseClass + (isCorrectText ? ' is-correct' : ' is-wrong');
      }
      
      const savedAns = assessmentAnswers[q.id] || [];
      const correctAnswers = q.correctAnswers || [];
      const isCorrect = savedAns.length === correctAnswers.length &&
        savedAns.every(val => correctAnswers.includes(val));
      
      return baseClass + (isCorrect ? ' is-correct' : ' is-wrong');
    }
    
    const state = assessmentTracker[idx] || 'pending';
    return `${baseClass} is-${state}`;
  };

  // Text answer state for short_answer / essay questions
  const [assessmentTextAnswer, setAssessmentTextAnswer] = useState('');

  // Debounced auto-save for short_answer and essay questions
  useEffect(() => {
    const currentQ = assessmentQuestions[currentAssessmentIndex];
    if (!currentQ) return;
    const isTextQ = currentQ.type === 'short_answer' || currentQ.type === 'essay';
    if (!isTextQ) return;

    const savedVal = assessmentAnswers[currentQ.id];
    const trimmedVal = assessmentTextAnswer;
    
    if (savedVal === undefined && trimmedVal === '') return;
    if (savedVal === trimmedVal) return;

    const handler = setTimeout(() => {
      updateLocalAnswer(currentQ.id, trimmedVal, trimmedVal);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [assessmentTextAnswer, currentAssessmentIndex, assessmentQuestions]);

  // Enrollment State
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [paymentChoices, setPaymentChoices] = useState([]);
  const [selectedPaymentValue, setSelectedPaymentValue] = useState('credit_card');
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);

  const inboundId = searchParams.get('id') || legacyStateId;
  const initialChapterId = searchParams.get('chapterId')
    || legacyChapterId
    || (inboundId ? getStoredChapterId(inboundId) : null);

  useEffect(() => {
    if (!inboundId || loadingCourse) return;
    if (searchParams.get('chapterId')) return;

    const storedChapterId = getStoredChapterId(inboundId);
    if (!storedChapterId) return;

    const next = new URLSearchParams(searchParams);
    next.set('id', String(inboundId));
    next.set('chapterId', storedChapterId);
    setSearchParams(next, { replace: true });
  }, [inboundId, loadingCourse, searchParams, setSearchParams]);

  useEffect(() => {
    if (!legacyStateId && !legacyChapterId) return;

    const next = new URLSearchParams(searchParams);
    let changed = false;

    if (legacyStateId && !next.get('id')) {
      next.set('id', String(legacyStateId));
      changed = true;
    }
    if (legacyChapterId && !next.get('chapterId')) {
      next.set('chapterId', String(legacyChapterId));
      changed = true;
    }

    if (changed) setSearchParams(next, { replace: true });
  }, [legacyChapterId, legacyStateId, searchParams, setSearchParams]);

  useEffect(() => {
    const urlChapterId = searchParams.get('chapterId');
    if (!urlChapterId || loadingCourse) return;

    setActiveChapterId((current) => (
      isSameOutlineItemId(current, urlChapterId) ? current : urlChapterId
    ));
  }, [loadingCourse, searchParams]);

  useEffect(() => {
    const urlChapterId = searchParams.get('chapterId');
    if (!urlChapterId || outlineWeeksState.length === 0) return;

    const weekId = findWeekIdForOutlineItem(outlineWeeksState, urlChapterId);
    if (weekId) {
      setExpandedWeeks((prev) => (prev[weekId] ? prev : { ...prev, [weekId]: true }));
    }
  }, [searchParams, outlineWeeksState]);

  const outlineUnlockKey = useMemo(
    () => iterateOutlineItems(outlineWeeksState, isSummativeComplete)
      .map((item) => `${item.id}:${item.completed ? 1 : 0}`)
      .join('|'),
    [outlineWeeksState, isSummativeComplete]
  );

  useEffect(() => {
    if (loadingCourse || !activeChapterId || outlineWeeksState.length === 0) return;

    const weeks = outlineWeeksRef.current;
    if (isOutlineItemUnlocked(weeks, activeChapterId, isSummativeCompleteRef.current)) {
      sequenceRedirectedToRef.current = null;
      return;
    }

    const allowed = getFirstUnlockedOutlineItem(weeks, isSummativeCompleteRef.current);
    if (!allowed || isSameOutlineItemId(allowed.id, activeChapterId)) return;

    const allowedId = String(allowed.id);
    if (sequenceRedirectedToRef.current === allowedId) return;

    sequenceRedirectedToRef.current = allowedId;
    setActiveChapterId(allowed.id);
    setContentReloadKey((k) => k + 1);

    const weekId = findWeekIdForOutlineItem(weeks, allowed.id);
    if (weekId) {
      setExpandedWeeks((prev) => ({ ...prev, [weekId]: true }));
    }

    if (inboundId) {
      setStoredChapterId(inboundId, allowed.id);
      const next = new URLSearchParams(searchParams);
      next.set('id', String(inboundId));
      next.set('chapterId', String(allowed.id));
      setSearchParams(next, { replace: true });
    }

    showToast('Complete earlier lessons to unlock this section.', 'error');
  }, [loadingCourse, activeChapterId, outlineUnlockKey, inboundId, searchParams, setSearchParams, outlineWeeksState.length]);

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

    const loadPaymentChoices = async () => {
      if (!courseMetaState?.title || isEnrolled) {
        setPaymentChoices([]);
        return;
      }

      const courseIsFree = isCourseFree(courseMetaState);
      if (courseIsFree) {
        const freeChoices = buildAvailablePaymentChoices([], true);
        if (!cancelled) {
          setPaymentChoices(freeChoices);
          setSelectedPaymentValue('free');
          setPaymentsLoading(false);
        }
        return;
      }

      setPaymentsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const methods = await fetchSavedPaymentMethods(API_BASE_URL, token);
        const choices = buildAvailablePaymentChoices(methods, false);
        if (!cancelled) {
          setSavedPaymentMethods(methods);
          setPaymentChoices(choices);
          setSelectedPaymentValue(pickDefaultPaymentValue(choices, methods));
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
        if (!cancelled) {
          setSavedPaymentMethods([]);
          setPaymentChoices([]);
          setSelectedPaymentValue('credit_card');
        }
      } finally {
        if (!cancelled) setPaymentsLoading(false);
      }
    };

    loadPaymentChoices();
    return () => { cancelled = true; };
  }, [courseMetaState.title, courseMetaState.isFree, courseMetaState.rawPrice, courseMetaState.price, isEnrolled]);

  const loadSummativeAssessment = async (courseId, loadToken) => {
    if (isStaleLoad(loadToken)) return;
    setLoadingAssessment(true);
    setAssessmentQuestions([]);
    setAssessmentTracker([]);
    setAssessmentAnswers({});
    setSelectedAssessmentOptions([]);
    setIsAssessmentComplete(false);
    setIsAssessmentStarted(false);
    setIsConfirmingSubmit(false);
    setAssessmentAttemptData(null);
    setAssessmentResult(EMPTY_ASSESSMENT_RESULT);
    setCurrentAssessmentDetails({ ...EMPTY_ASSESSMENT_DETAILS, type: 'summative' });
    updateSummativeCompletion(false);
    try {
      // 1. Fetch performance history first to know attempt status without starting!
      let historyList = [];
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const perfRes = await fetch(`${API_BASE_URL}/api/profile/performance?limit=1000`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (perfRes.ok) {
            const perfBody = await perfRes.json();
            historyList = perfBody?.data?.assessmentHistory || [];
          }
        } catch (e) {
          console.error("Failed to fetch performance history on load:", e);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/summative-assessment`);
      if (isStaleLoad(loadToken)) return;
      if (!res.ok) return;
      const body = await res.json();
      const data = extractBody(body);
      if (!data || !data.id) return;

      const res2 = await fetch(`${API_BASE_URL}/api/summative-assessments/${data.id}`);
      if (isStaleLoad(loadToken)) return;
      if (!res2.ok) return;
      const body2 = await res2.json();
      const fullAssessment = extractBody(body2);

      if (fullAssessment) {
        const limitVal = fullAssessment.attempt_limit || fullAssessment.attemptLimit || 1;
        const isPublished = fullAssessment.is_published ?? fullAssessment.isPublished ?? true;
        setCurrentAssessmentDetails({
          id: data.id,
          type: 'summative',
          title: fullAssessment.title || 'Summative Assessment',
          passingScore: Number(fullAssessment.passingScore || fullAssessment.passing_score || 80),
          durationMinutes: Number(fullAssessment.duration_minutes || fullAssessment.durationMinutes || 0),
          attemptLimit: limitVal,
          showCorrectAnswers: !!(fullAssessment.show_correct_answers ?? false),
          showScoreImmediately: !!(fullAssessment.show_score_immediately ?? true),
          randomizeQuestions: !!(fullAssessment.randomize_questions ?? false),
          isPublished: Boolean(isPublished),
        });

        setAssessmentAnswers({});
        setIsAssessmentReviewMode(false);
        setIsConfirmingSubmit(false);

        let finalQuestions = [];

        if (Array.isArray(fullAssessment.questions)) {
          const mappedQuestions = fullAssessment.questions.map((q, idx) => {
            let options = q.options;
            if (typeof options === 'string') {
              try { options = JSON.parse(options); } catch (e) { options = null; }
            }
            const optionLabels = Array.isArray(options) ? options.map(getOptionLabel) : (options || ['Option A', 'Option B']);
            const correctAnswers = extractCorrectAnswers(q, options, optionLabels);
            const qType = (q.question_type === 'multiple_choice' || q.question_type === 'checkbox' || q.question_type === 'multi')
              ? 'multi'
              : (q.question_type === 'true_false' || q.question_type === 'radio' || q.question_type === 'single') ? 'single'
              : q.question_type === 'short_answer' ? 'short_answer'
              : q.question_type === 'essay' ? 'essay'
              : 'multi';

            return {
              id: q.id,
              type: qType,
              questionType: q.question_type,
              prompt: q.question_text || 'Assessment Question',
              options: (qType === 'short_answer' || qType === 'essay') ? [] : optionLabels,
              correctAnswers,
              correctAnswer: q.correct_answer || null,
              explanation: q.explanation || null,
              points: Number(q.points) || 1,
            };
          });

          const processedQuestions = (fullAssessment.randomize_questions || fullAssessment.randomizeQuestions)
            ? shuffleArray(mappedQuestions)
            : mappedQuestions;

          finalQuestions = processedQuestions.map((q, idx) => ({
            ...q,
            number: idx + 1,
            progressText: `Question ${idx + 1} of ${processedQuestions.length}`,
          }));

          setAssessmentQuestions(finalQuestions);
          setAssessmentTracker(finalQuestions.map(() => 'pending'));
        }

        if (finalQuestions.length === 0 || !isPublished) {
          setIsAssessmentComplete(false);
          setIsAssessmentStarted(false);
          updateSummativeCompletion(false);
          return;
        }

        // 3. Determine attempt state based on history
        const myAttempts = historyList.filter(att => isSummativeAttempt(att, data.id));
        const completedAttempts = myAttempts.filter(att => att.status === 'submitted' || att.status === 'graded');
        const activeAttempt = myAttempts.find(att => att.status === 'in_progress');
        const passingScore = Number(fullAssessment.passingScore || fullAssessment.passing_score || 80);
        const passedAttempt = completedAttempts.find((att) => {
          if (att.isPassed || att.is_passed) return true;
          const pct = parseFloat(att.percentage ?? att.score ?? 0);
          return pct >= passingScore;
        });

        if (passedAttempt) {
          if (isStaleLoad(loadToken)) return;
          setCurrentAttemptId(passedAttempt.id);
          setAttemptNumber(passedAttempt.attemptNumber || 1);
          setMaxAttempts(limitVal);
          setIsAssessmentComplete(true);
          updateSummativeCompletion(true);
          await hydrateCompletedAssessmentResult({
            type: 'summative',
            attemptId: passedAttempt.id,
            historyAttempt: passedAttempt,
            questionCount: finalQuestions.length,
            passingScore,
            token,
            exhaustedAttempts: false,
          });
        } else if (limitVal && completedAttempts.length >= limitVal) {
          if (isStaleLoad(loadToken)) return;
          const latestAttempt = completedAttempts[0] || myAttempts[0];
          const attemptId = latestAttempt.id;
          setCurrentAttemptId(attemptId);
          setAttemptNumber(latestAttempt.attemptNumber || 1);
          setMaxAttempts(limitVal);
          setIsAssessmentComplete(true);
          updateSummativeCompletion(true);
          await hydrateCompletedAssessmentResult({
            type: 'summative',
            attemptId,
            historyAttempt: latestAttempt,
            questionCount: finalQuestions.length,
            passingScore,
            token,
            exhaustedAttempts: true,
          });
        } else if (activeAttempt) {
          // Active attempt exists: set up metadata for prep card
          setIsAssessmentStarted(false);
          setIsAssessmentComplete(false);
          updateSummativeCompletion(false);
          setAttemptNumber(activeAttempt.attemptNumber || 1);
          setMaxAttempts(limitVal);
          setCurrentAttemptId(activeAttempt.id);
          setAssessmentAttemptData({
            attempt_id: activeAttempt.id,
            attempt_number: activeAttempt.attemptNumber,
            start_time: activeAttempt.startTime
          });
        } else {
          // Fresh attempt: do not call start yet!
          setIsAssessmentStarted(false);
          setIsAssessmentComplete(false);
          updateSummativeCompletion(false);
          setAttemptNumber(completedAttempts.length + 1);
          setMaxAttempts(limitVal);
          setAssessmentAttemptData(null);
        }
      }
    } catch (err) {
      console.error("Failed to load summative assessment:", err);
    } finally {
      if (!isStaleLoad(loadToken)) setLoadingAssessment(false);
    }
  };

  const loadFormativeAssessment = async (assessmentId, loadToken) => {
    if (isStaleLoad(loadToken)) return;
    setLoadingAssessment(true);
    setAssessmentQuestions([]);
    setAssessmentTracker([]);
    setAssessmentAnswers({});
    setSelectedAssessmentOptions([]);
    setIsAssessmentComplete(false);
    setIsAssessmentStarted(false);
    setIsConfirmingSubmit(false);
    setAssessmentAttemptData(null);
    setAssessmentResult(EMPTY_ASSESSMENT_RESULT);
    setCurrentAssessmentDetails({ ...EMPTY_ASSESSMENT_DETAILS, type: 'formative' });
    try {
      // 1. Fetch performance history first to know attempt status without starting!
      let historyList = [];
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const perfRes = await fetch(`${API_BASE_URL}/api/profile/performance?limit=1000`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (perfRes.ok) {
            const perfBody = await perfRes.json();
            historyList = perfBody?.data?.assessmentHistory || [];
          }
        } catch (e) {
          console.error("Failed to fetch performance history on load:", e);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/formative-assessments/${assessmentId}`);
      if (isStaleLoad(loadToken)) return;
      if (!res.ok) return;
      const body = await res.json();
      const fullAssessment = extractBody(body);

      if (fullAssessment) {
        const limitVal = fullAssessment.attempt_limit || fullAssessment.attemptLimit || null;
        setCurrentAssessmentDetails({
          id: assessmentId,
          type: 'formative',
          title: fullAssessment.title || 'Quiz Assessment',
          passingScore: Number(fullAssessment.passingScore || fullAssessment.passing_score || 60),
          durationMinutes: Number(fullAssessment.duration_minutes || fullAssessment.durationMinutes || 0),
          attemptLimit: limitVal,
          showCorrectAnswers: !!(fullAssessment.show_correct_answers ?? true),
          showScoreImmediately: !!(fullAssessment.show_score_immediately ?? true),
          randomizeQuestions: !!(fullAssessment.randomize_questions ?? false),
        });

        setAssessmentAnswers({});
        setIsAssessmentReviewMode(false);
        setIsConfirmingSubmit(false);

        let finalQuestions = [];

        if (Array.isArray(fullAssessment.questions)) {
          const mappedQuestions = fullAssessment.questions.map((q, idx) => {
            let options = q.options;
            if (typeof options === 'string') {
              try { options = JSON.parse(options); } catch (e) { options = null; }
            }
            const optionLabels = Array.isArray(options) ? options.map(getOptionLabel) : (options || ['Option A', 'Option B']);
            const correctAnswers = extractCorrectAnswers(q, options, optionLabels);
            const qType = (q.question_type === 'multiple_choice' || q.question_type === 'checkbox' || q.question_type === 'multi')
              ? 'multi'
              : (q.question_type === 'true_false' || q.question_type === 'radio' || q.question_type === 'single') ? 'single'
              : q.question_type === 'short_answer' ? 'short_answer'
              : q.question_type === 'essay' ? 'essay'
              : 'multi';

            return {
              id: q.id,
              type: qType,
              questionType: q.question_type,
              prompt: q.question_text || 'Assessment Question',
              options: (qType === 'short_answer' || qType === 'essay') ? [] : optionLabels,
              correctAnswers,
              correctAnswer: q.correct_answer || null,
              explanation: q.explanation || null,
              points: Number(q.points) || 1,
            };
          });

          const processedQuestions = (fullAssessment.randomize_questions || fullAssessment.randomizeQuestions)
            ? shuffleArray(mappedQuestions)
            : mappedQuestions;

          finalQuestions = processedQuestions.map((q, idx) => ({
            ...q,
            number: idx + 1,
            progressText: `Question ${idx + 1} of ${processedQuestions.length}`,
          }));

          setAssessmentQuestions(finalQuestions);
          setAssessmentTracker(finalQuestions.map(() => 'pending'));
        } else {
          setAssessmentQuestions([]);
          setAssessmentTracker([]);
        }

        if (finalQuestions.length === 0) {
          setIsAssessmentComplete(false);
          setIsAssessmentStarted(false);
          // Force completed status to false in sidebar state
          setOutlineWeeksState(prev => prev.map(w => ({
            ...w,
            assessments: w.assessments ? w.assessments.map(a => {
              if (String(a.id) === `formative-${assessmentId}`) {
                return { ...a, completed: false };
              }
              return a;
            }) : []
          })));
          setCompletedChapters(prev => prev.filter(id => String(id) !== `formative-${assessmentId}`));
          return;
        }

        // 3. Determine attempt state based on history
        const myAttempts = historyList.filter(att => 
          Number(att.assessmentId) === Number(assessmentId) && att.category === 'formative'
        );
        const completedAttempts = myAttempts.filter(att => att.status === 'submitted' || att.status === 'graded');
        const activeAttempt = myAttempts.find(att => att.status === 'in_progress');
        const passingScore = Number(fullAssessment.passingScore || fullAssessment.passing_score || 60);
        const passedAttempt = completedAttempts.find((att) => {
          if (att.isPassed || att.is_passed) return true;
          const pct = parseFloat(att.percentage ?? att.score ?? 0);
          return pct >= passingScore;
        });

        if (passedAttempt) {
          setCurrentAttemptId(passedAttempt.id);
          setAttemptNumber(passedAttempt.attemptNumber || 1);
          setMaxAttempts(limitVal);
          setIsAssessmentComplete(true);
          await hydrateCompletedAssessmentResult({
            type: 'formative',
            attemptId: passedAttempt.id,
            historyAttempt: passedAttempt,
            questionCount: finalQuestions.length,
            passingScore,
            token,
            exhaustedAttempts: false,
          });
        } else if (limitVal && completedAttempts.length >= limitVal && myAttempts.length > 0) {
          const latestAttempt = completedAttempts[0] || myAttempts[0];
          const attemptId = latestAttempt.id;
          setCurrentAttemptId(attemptId);
          setAttemptNumber(latestAttempt.attemptNumber || 1);
          setMaxAttempts(limitVal);
          setIsAssessmentComplete(true);
          await hydrateCompletedAssessmentResult({
            type: 'formative',
            attemptId,
            historyAttempt: latestAttempt,
            questionCount: finalQuestions.length,
            passingScore,
            token,
            exhaustedAttempts: true,
          });
        } else if (activeAttempt) {
          // Active attempt exists: set up metadata for prep card
          setIsAssessmentStarted(false);
          setIsAssessmentComplete(false);
          setAttemptNumber(activeAttempt.attemptNumber || 1);
          setMaxAttempts(limitVal);
          setCurrentAttemptId(activeAttempt.id);
          setAssessmentAttemptData({
            attempt_id: activeAttempt.id,
            attempt_number: activeAttempt.attemptNumber,
            start_time: activeAttempt.startTime
          });
        } else {
          // Fresh attempt: do not call start yet!
          setIsAssessmentStarted(false);
          setIsAssessmentComplete(false);
          setAttemptNumber(completedAttempts.length + 1);
          setMaxAttempts(limitVal);
          setAssessmentAttemptData(null);
        }
      }
    } catch (err) {
      console.error("Failed to load formative assessment:", err);
    } finally {
      if (!isStaleLoad(loadToken)) setLoadingAssessment(false);
    }
  };

  const handleStartAssessment = async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentAssessmentDetails.id) return;
    
    setLoadingAssessment(true);
    try {
      const isFormative = currentAssessmentDetails.type === 'formative';
      const endpoint = isFormative 
        ? `${API_BASE_URL}/api/formative-assessments/${currentAssessmentDetails.id}/start`
        : `${API_BASE_URL}/api/summative-assessments/${currentAssessmentDetails.id}/start`;

      const startRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (startRes.ok) {
        const startBody = await startRes.json();
        const attemptData = startBody.data || startBody;
        if (attemptData && (attemptData.attempt_id || attemptData.id)) {
          const attemptId = attemptData.attempt_id || attemptData.id;
          setCurrentAttemptId(attemptId);
          setAttemptNumber(attemptData.attempt_number || 1);
          setAssessmentAttemptData(attemptData);

          // Restore saved answers if resumed attempt returned answers
          if (Array.isArray(attemptData.answers) && assessmentQuestions.length > 0) {
            const answersMap = {};
            const nextTracker = assessmentQuestions.map(() => 'pending');

            attemptData.answers.forEach(a => {
              const qIdx = assessmentQuestions.findIndex(q => q.id === a.question_id);
              if (qIdx >= 0) {
                const q = assessmentQuestions[qIdx];
                nextTracker[qIdx] = 'answered';
                if (q.type === 'short_answer' || q.type === 'essay') {
                  answersMap[q.id] = a.answer_text;
                } else {
                  const optTexts = String(a.answer_text).split(',').map(s => s.trim().toLowerCase());
                  const indices = optTexts.map(text => q.options.findIndex(opt => String(opt).trim().toLowerCase() === text)).filter(idx => idx >= 0);
                  answersMap[q.id] = indices;
                }
              }
            });
            setAssessmentAnswers(answersMap);
            setAssessmentTracker(nextTracker);
          }

          startAssessmentTimer(Number(currentAssessmentDetails.durationMinutes || 0), attemptData.start_time);
          setIsAssessmentStarted(true);
        }
      }
    } catch (e) {
      console.error("Failed to start assessment:", e);
    } finally {
      setLoadingAssessment(false);
    }
  };

  const issueCertificate = async (score) => {
    const token = localStorage.getItem('token');
    if (!token || !inboundId) return false;
    try {
      const totalHours = computeCertificateTotalHours(courseMetaState);
      const payload = {
        final_score: score,
        formative_score: score,
      };
      if (totalHours) payload.total_hours = totalHours;

      const res = await fetch(`${API_BASE_URL}/api/courses/${inboundId}/certificates/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) return true;
      const body = await res.json().catch(() => ({}));
      // Treat duplicate issue as already claimed
      if (/already issued/i.test(body?.message || '')) return true;
      return false;
    } catch (err) {
      console.error("Failed to automatically issue certificate:", err);
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadCourse = async (id) => {
      if (!id) return;
      setLoadingCourse(true);
      setCourseLoadError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load course');
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
          duration_weeks: courseData.duration_weeks || prev.duration_weeks,
          required_hours_per_week: courseData.required_hours_per_week || prev.required_hours_per_week,
          total_hours: courseData.total_hours || courseData.totalHours || prev.total_hours,
          weekly: courseData.required_hours_per_week ? `${courseData.required_hours_per_week} hours` : prev.weekly,
          level: courseData.level || prev.level,
          price: courseData.price ? `$${courseData.price}` : (courseData.is_free ? 'Free' : prev.price),
          rawPrice: Number(courseData.price) || 0,
          isFree: Boolean(courseData.is_free) || Number(courseData.price) === 0,
          intro: courseData.intro_message || courseData.description || prev.intro,
          audience: courseData.target_audience || prev.audience,
          category: courseData.category || prev.category,
        }));

        setCourseReader((prev) => ({
          ...prev,
          title: courseData.title || prev.title,
          author: courseData.instructor_name || prev.author,
        }));
        const chapters = Array.isArray(courseData.chapters) ? courseData.chapters : [];
        const apiWeeks = Array.isArray(courseData.weeks) ? courseData.weeks : [];

        if (apiWeeks.length > 0) {
          const weeksWithAssessments = await Promise.all(
            apiWeeks.map(async (w, idx) => {
              let weekAssessments = [];
              try {
                const resAss = await fetch(`${API_BASE_URL}/api/courses/${id}/weeks/${w.id}/formative-assessments`);
                if (resAss.ok) {
                  const bodyAss = await resAss.json();
                  const dataAss = extractBody(bodyAss);
                  weekAssessments = Array.isArray(dataAss?.assessments) ? dataAss.assessments : (Array.isArray(dataAss) ? dataAss : []);
                }
              } catch (e) {
                console.error("Error loading formative assessments for week:", w.id, e);
              }

              return {
                id: w.id || `week-${w.week_number || idx + 1}`,
                title: w.title || `Week ${w.week_number || idx + 1}`,
                completed: false,
                expanded: idx === 0,
                chapters: Array.isArray(w.chapters) ? w.chapters.map((c, ci) => ({
                  id: c.id || `ch-${idx}-${ci}`,
                  title: c.title || c.name || `Chapter ${ci + 1}`,
                  completed: false
                })) : [],
                assessments: weekAssessments.map((a, ai) => ({
                  id: `formative-${a.id}`,
                  assessmentId: a.id,
                  title: a.title || `Quiz ${ai + 1}`,
                  completed: false
                }))
              };
            })
          );

          setOutlineWeeksState(weeksWithAssessments);

          const { id: activeChId, weekId: targetWeekId } = resolveReaderChapterTarget(
            weeksWithAssessments,
            initialChapterId,
            false
          );

          if (activeChId) {
            setActiveChapterId(activeChId);
          }
          if (targetWeekId) {
            setExpandedWeeks((prev) => ({ ...prev, [targetWeekId]: true }));
          }

          // outcomes
          if (courseData.objectives) {
            let list = [];
            if (typeof courseData.objectives === 'string') list = courseData.objectives.split('\n');
            else if (Array.isArray(courseData.objectives)) list = courseData.objectives;
            setOutcomesState(list.map(stripHtml).filter(Boolean));
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

          const { id: activeChId, weekId: targetWeekId } = resolveReaderChapterTarget(
            mappedWeeks,
            initialChapterId,
            false
          );

          if (activeChId) {
            setActiveChapterId(activeChId);
          }
          if (targetWeekId) {
            setExpandedWeeks((prev) => ({ ...prev, [targetWeekId]: true }));
          }

          // outcomes
          if (courseData.objectives) {
            let list = [];
            if (typeof courseData.objectives === 'string') list = courseData.objectives.split('\n');
            else if (Array.isArray(courseData.objectives)) list = courseData.objectives;
            setOutcomesState(list.map(stripHtml).filter(Boolean));
          }
        }

        // load student progress and attempts for this course to reflect progress
        if (courseData.id || courseData.course_id || id) {
          const courseId = courseData.id || courseData.course_id || id;
          fetchCourseProgress(courseId).catch(() => { });
          fetchCourseStudentAttempts(courseId).catch(() => { });
          fetchCourseAvgScore(courseId).catch(() => { });
          refreshSummativeCompletionStatus(courseId).catch(() => { });
        }
      } catch (err) {
        if (!cancelled) {
          setCourseLoadError(err?.message || 'Could not load this course.');
        }
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
    video_url: '',
    introTitle: '',
    introBody: '',
    introLinkLabel: '',
    audienceTitle: '',
    audienceBody: '',
    attachments: null,
  };

  const activeContent = useMemo(() => {
    if (activeChapterId === 'assessment') {
      return {
        ...defaultContent,
        weekLabel: 'Final Week',
        chapterLabel: currentAssessmentDetails.title || 'Summative Assessment',
        progressLabel: isAssessmentComplete ? 'Completed' : 'In Progress',
        headline: currentAssessmentDetails.title || 'Summative Assessment',
        summary: 'Final assessment of the course',
      };
    }
    if (typeof activeChapterId === 'string' && activeChapterId.startsWith('formative-')) {
      const targetWeek = outlineWeeksState.find(w =>
        w.assessments && w.assessments.some(a => String(a.id) === String(activeChapterId))
      );
      const weekLabel = targetWeek ? stripHtml(targetWeek.title) : '';
      const assessmentItem = targetWeek?.assessments?.find(a => String(a.id) === String(activeChapterId));
      const title = assessmentItem ? assessmentItem.title : (currentAssessmentDetails.title || 'Formative Assessment');
      const completed = assessmentItem ? assessmentItem.completed : false;
      return {
        ...defaultContent,
        weekLabel: weekLabel,
        chapterLabel: title,
        progressLabel: completed ? 'Completed' : 'In Progress',
        headline: title,
        summary: 'Formative assessment / Quiz',
      };
    }
    return activeChapterContent || defaultContent;
  }, [activeChapterId, activeChapterContent, currentAssessmentDetails, outlineWeeksState, isAssessmentComplete]);

  const isCurrentChapterCompleted = useMemo(() => {
    if (activeChapterId === 'assessment') {
      return isSummativeComplete;
    }
    if (typeof activeChapterId === 'string' && activeChapterId.startsWith('formative-')) {
      const targetWeek = outlineWeeksState.find(w =>
        w.assessments && w.assessments.some(a => String(a.id) === String(activeChapterId))
      );
      const assessmentItem = targetWeek?.assessments?.find(a => String(a.id) === String(activeChapterId));
      return assessmentItem ? assessmentItem.completed : false;
    }
    return completedChapters.includes(activeChapterId) || completedChapters.includes(Number(activeChapterId));
  }, [activeChapterId, completedChapters, outlineWeeksState, isSummativeComplete]);

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

  const textPages = useMemo(() => {
    const html = activeContent.introBody || activeContent.summary || '';
    if (!html || html.trim() === '' || html.trim() === 'Chapter Content') return [];

    const hrRegex = /<hr\s*\/?>/i;
    if (hrRegex.test(html)) {
      return html.split(hrRegex).map(p => p.trim()).filter(Boolean);
    }

    if (typeof document === 'undefined') return [html];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const children = Array.from(tempDiv.childNodes);

    const pages = [];
    let currentPageHtml = '';
    let currentPageLength = 0;
    const maxCharsPerPage = 1200;

    children.forEach((node) => {
      const nodeHtml = node.outerHTML || node.textContent || '';
      const nodeTextLength = (node.textContent || '').length;

      if (currentPageLength + nodeTextLength > maxCharsPerPage && currentPageHtml !== '') {
        pages.push(currentPageHtml);
        currentPageHtml = nodeHtml;
        currentPageLength = nodeTextLength;
      } else {
        currentPageHtml += nodeHtml;
        currentPageLength += nodeTextLength;
      }
    });

    if (currentPageHtml.trim()) {
      pages.push(currentPageHtml);
    }

    return pages;
  }, [activeContent.introBody, activeContent.summary]);

  const isAssessmentView = activeChapterId === 'assessment' || (typeof activeChapterId === 'string' && activeChapterId.startsWith('formative-'));
  const hasOutline = Array.isArray(outlineWeeksState) && outlineWeeksState.length > 0;
  const hasOutcomes = Array.isArray(outcomesState) && outcomesState.length > 0;
  const showContentSections = !loadingCourse && inboundId && (hasOutline || hasOutcomes);

  const outlineProgress = useMemo(
    () => countOutlineProgress(outlineWeeksState, isSummativeComplete),
    [outlineWeeksState, isSummativeComplete]
  );

  const courseProgressPercent = useMemo(
    () => resolveCourseProgressPercent({
      progressPercentage: courseProgressPercentage,
      outlineProgress,
    }),
    [courseProgressPercentage, outlineProgress]
  );

  const nextAssessment = useMemo(
    () => getNextAssessment(outlineWeeksState, isSummativeComplete),
    [outlineWeeksState, isSummativeComplete]
  );

  const readerEnrollmentReturnPath = inboundId
    ? `/academia/learner/read-contents?id=${inboundId}`
    : '/academia/learner/courses';
  const requiresPaymentSetup = Boolean(
    inboundId
    && courseMetaState?.title
    && !isCourseFree(courseMetaState)
    && !paymentsLoading
    && !hasSavedPaymentMethods(savedPaymentMethods)
  );

  const toggleWeek = (weekId) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
  };
  const fetchCourseProgress = async (courseId) => {
    const token = localStorage.getItem('token');
    if (!token || !courseId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const body = await res.json();
        const data = extractBody(body) || {};
        const progressList = data.progress || [];
        const completedIds = progressList.map(p => Number(p.chapter_id));
        const completedAssessments = (data.completedAssessments || []).filter((id) => id !== 'assessment');
        const pct = data.progress_percentage ?? data.progressPercentage ?? data.course_progress_percentage;
        if (pct != null && !Number.isNaN(Number(pct))) {
          setCourseProgressPercentage(Number(pct));
        }
        
        setCompletedChapters((prev) => {
          const localMocks = prev.filter(id =>
            typeof id === 'string' &&
            id !== 'assessment' &&
            !completedAssessments.includes(id)
          );
          const merged = [...completedIds, ...completedAssessments, ...localMocks];
          
          // Update outline weeks state with completed status!
          setOutlineWeeksState((prevWeeks) => {
            return prevWeeks.map((w) => {
              const updatedChapters = w.chapters.map((ch) => ({
                ...ch,
                completed: merged.includes(ch.id) || merged.includes(Number(ch.id))
              }));
              const updatedAssessments = w.assessments ? w.assessments.map((ass) => ({
                ...ass,
                completed: merged.includes(ass.id) || merged.includes(String(ass.id))
              })) : [];
              const weekCompleted = updatedChapters.length > 0 && updatedChapters.every(ch => ch.completed) &&
                (updatedAssessments.length === 0 || updatedAssessments.every(ass => ass.completed));
              return {
                ...w,
                completed: weekCompleted,
                chapters: updatedChapters,
                assessments: updatedAssessments
              };
            });
          });
          
          return merged;
        });
      }
    } catch (err) {
      console.error("Failed to fetch course progress:", err);
    }
  };

  const fetchCourseAvgScore = async (courseId) => {
    const token = localStorage.getItem('token');
    if (!token || !courseId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/performance?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const body = await res.json();
        const list = body?.data?.assessmentHistory || [];
        const courseHistory = list.filter(item => 
          Number(item.courseId) === Number(courseId) && 
          item.percentage !== null && 
          item.percentage !== undefined
        );
        
        if (courseHistory.length > 0) {
          const sum = courseHistory.reduce((acc, item) => acc + parseFloat(item.percentage), 0);
          const avg = sum / courseHistory.length;
          setCourseAvgScore(`${avg.toFixed(1)}%`);
        } else {
          setCourseAvgScore('0.0%');
        }
      }
    } catch (err) {
      console.error("Failed to fetch course average score:", err);
    }
  };

  const markChapterCompleteOnBackend = async (chapterId) => {
    const token = localStorage.getItem('token');
    if (!token || !inboundId || !chapterId) return;
    
    // Skip mock/local chapter IDs and track locally
    const isMockId = typeof chapterId === 'string' && (chapterId.startsWith('ch-') || chapterId.startsWith('chapter-') || isNaN(Number(chapterId)));
    if (isMockId) {
      setCompletedChapters((prev) => {
        if (prev.includes(chapterId)) return prev;
        const next = [...prev, chapterId];
        
        // Update outline weeks state with completed status!
        setOutlineWeeksState((prevWeeks) => {
          return prevWeeks.map((w) => {
            const updatedChapters = w.chapters.map((ch) => ({
              ...ch,
              completed: next.includes(ch.id) || next.includes(Number(ch.id))
            }));
            const updatedAssessments = w.assessments ? w.assessments.map((ass) => ({
              ...ass,
              completed: next.includes(ass.id) || next.includes(String(ass.id))
            })) : [];
            const weekCompleted = updatedChapters.length > 0 && updatedChapters.every(ch => ch.completed) &&
              (updatedAssessments.length === 0 || updatedAssessments.every(ass => ass.completed));
            return {
              ...w,
              completed: weekCompleted,
              chapters: updatedChapters,
              assessments: updatedAssessments
            };
          });
        });
        
        return next;
      });
      showToast('Lesson marked complete.', 'success');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chapter_id: Number(chapterId),
          course_id: Number(inboundId)
        })
      });
      if (res.ok) {
        await fetchCourseProgress(inboundId);
        showToast('Lesson marked complete.', 'success');
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body?.message || 'Could not mark lesson complete.', 'error');
      }
    } catch (err) {
      console.error("Failed to mark chapter complete:", err);
      showToast('Could not mark lesson complete. Please try again.', 'error');
    }
  };

  const mapChapterToContent = (chapterId, chapterData, courseData = {}) => {
    const targetWeek = outlineWeeksState.find((w) =>
      w.chapters?.some((c) => String(c.id) === String(chapterId))
    );
    const chapterMeta = targetWeek?.chapters?.find((c) => String(c.id) === String(chapterId));
    const weekLabel = targetWeek?.title || (chapterData?.week_number ? `Week ${chapterData.week_number}` : '');
    const title = chapterData?.title || chapterData?.name || chapterMeta?.title || 'Chapter';
    const description = chapterData?.description || chapterData?.summary || '';
    const bodyContent = chapterData?.content || '';

    return {
      id: chapterId,
      weekLabel,
      chapterLabel: title,
      progressLabel: 'Viewed : 0%',
      headline: title,
      summary: description,
      image: chapterData?.thumbnail
        ? (chapterData.thumbnail.startsWith('/') ? `${API_BASE_URL}${chapterData.thumbnail}` : chapterData.thumbnail)
        : acOnImg,
      video_url: chapterData?.video_url || '',
      introTitle: 'Introduction',
      introBody: bodyContent || (description.length <= 400 ? description : ''),
      introLinkLabel: 'Read more',
      audienceTitle: 'Who is the course for?',
      audienceBody: chapterData?.target_audience || courseData?.target_audience || '',
      attachments: chapterData?.attachments || null,
    };
  };

  const fetchChapterExercises = async (chapterId, loadToken, attemptsList = studentAttempts) => {
    if (!chapterId || isStaleLoad(loadToken)) return;
    try {
      const isMockId = typeof chapterId === 'string' && (chapterId.startsWith('ch-') || chapterId.startsWith('chapter-') || isNaN(Number(chapterId)));
      let list = [];
      if (!isMockId) {
        const res = await fetch(`${API_BASE_URL}/api/chapters/${chapterId}/exercises`);
        if (isStaleLoad(loadToken)) return;
        if (res.ok) {
          const body = await res.json();
          const data = extractBody(body) || [];
          list = Array.isArray(data) ? data : (data.data || []);
        }
      }

      if (isStaleLoad(loadToken)) return;

      if (!list || !list.length) {
        setExerciseQuestionsState([]);
        setExerciseStates([]);
        setExerciseAnswers({});
        setExerciseGradedList({});
        return;
      }

      const mapped = list.map((ex, i) => {
        let options = ex.options;
        if (typeof options === 'string') {
          try { options = JSON.parse(options); } catch (e) { options = null; }
        }
        const optionLabels = Array.isArray(options) ? options.map(getOptionLabel) : (options || ['Option A', 'Option B']);
        const correctAnswers = extractCorrectAnswers(ex, options, optionLabels);
        const exType = (ex.type === 'multiple_choice' || ex.type === 'checkbox' || ex.type === 'multi') ? 'multi' : 'single';
        return {
          id: ex.id || ex.exercise_id || `ex-${i}`,
          number: ex.order_index || i + 1,
          type: exType,
          prompt: ex.question || ex.title || ex.prompt || 'Exercise',
          options: optionLabels,
          correctAnswers,
          points: ex.points || 1
        };
      });

      if (isStaleLoad(loadToken)) return;
      setExerciseQuestionsState(mapped);

      const answersMap = {};
      const gradedMap = {};
      const statesList = mapped.map((m) => {
        const att = attemptsList.find((a) => Number(a.exercise_id) === Number(m.id));
        if (att) {
          gradedMap[m.id] = true;
          const optIdx = att.answer !== null ? Number(att.answer) : null;
          answersMap[m.id] = isNaN(optIdx) ? null : optIdx;
          return att.is_correct ? 'correct' : 'wrong';
        }
        gradedMap[m.id] = false;
        answersMap[m.id] = null;
        return 'pending';
      });
      setExerciseAnswers(answersMap);
      setExerciseGradedList(gradedMap);
      setExerciseStates(statesList);
    } catch (err) {
      console.error("Failed to fetch chapter exercises:", err);
      if (!isStaleLoad(loadToken)) {
        setExerciseQuestionsState([]);
        setExerciseStates([]);
        setExerciseAnswers({});
        setExerciseGradedList({});
      }
    }
  };

  const loadChapterContent = async (chapterId, loadToken) => {
    if (!chapterId || isStaleLoad(loadToken)) return;
    setLoadingChapterContent(true);
    setChapterLoadError('');
    setActiveChapterContent(null);
    try {
      const isMockId = typeof chapterId === 'string' && (chapterId.startsWith('ch-') || chapterId.startsWith('chapter-') || isNaN(Number(chapterId)));
      let chapterData = null;
      if (!isMockId) {
        const res = await fetch(`${API_BASE_URL}/api/chapters/${chapterId}`);
        if (isStaleLoad(loadToken)) return;
        if (res.ok) {
          const body = await res.json();
          chapterData = extractBody(body);
        } else if (!isStaleLoad(loadToken)) {
          const body = await res.json().catch(() => ({}));
          setChapterLoadError(body?.message || 'Could not load this lesson.');
          return;
        }
      }

      if (isStaleLoad(loadToken)) return;

      const targetWeek = outlineWeeksState.find((w) =>
        w.chapters?.some((c) => String(c.id) === String(chapterId))
      );
      const chapterMeta = targetWeek?.chapters?.find((c) => String(c.id) === String(chapterId));

      setActiveChapterContent(mapChapterToContent(chapterId, chapterData || { title: chapterMeta?.title }, {}));

      let attemptsRes = [];
      if (inboundId) {
        const attRes = await fetch(`${API_BASE_URL}/api/courses/${inboundId}/exercise-attempts`);
        if (isStaleLoad(loadToken)) return;
        if (attRes.ok) {
          const body = await attRes.json();
          const data = extractBody(body) || [];
          attemptsRes = Array.isArray(data) ? data : (data.data || []);
          setStudentAttempts(attemptsRes);
        }
      }

      if (isStaleLoad(loadToken)) return;
      await fetchChapterExercises(chapterId, loadToken, attemptsRes);
    } catch (err) {
      console.error('Failed to load chapter content:', err);
      if (!isStaleLoad(loadToken)) {
        setActiveChapterContent(null);
        setChapterLoadError(err?.message || 'Could not load this lesson.');
      }
    } finally {
      if (!isStaleLoad(loadToken)) setLoadingChapterContent(false);
    }
  };

  const handleChapterSelect = (chapterId, { silent = false } = {}) => {
    const weeks = outlineWeeksRef.current;
    if (
      weeks.length > 0
      && !isOutlineItemUnlocked(weeks, chapterId, isSummativeCompleteRef.current)
    ) {
      if (!silent) {
        showToast(
          chapterId === 'assessment'
            ? 'Complete all lessons before the final assessment.'
            : 'Complete earlier lessons to unlock this section.',
          'error'
        );
      }
      return false;
    }

    let chapterChanged = false;
    setActiveChapterId((current) => {
      if (isSameOutlineItemId(current, chapterId)) return current;
      chapterChanged = true;
      return chapterId;
    });

    if (!chapterChanged) return true;

    setContentReloadKey((k) => k + 1);
    sequenceRedirectedToRef.current = null;

    const weekId = findWeekIdForOutlineItem(weeks, chapterId);
    if (weekId) {
      setExpandedWeeks((prev) => ({ ...prev, [weekId]: true }));
    }

    if (inboundId) {
      setStoredChapterId(inboundId, chapterId);
      const next = new URLSearchParams(searchParams);
      next.set('id', String(inboundId));
      next.set('chapterId', String(chapterId));
      setSearchParams(next, { replace: true });
    }
    if (window.innerWidth <= 991) setIsSidebarOpen(false);
    setIsAudienceExpanded(false);
    setActivePdfIndex(0);
    setActiveTextPageIndex(0);
    return true;
  };

  useEffect(() => {
    if (!activeChapterId || loadingCourse) return;

    const weeks = outlineWeeksRef.current;
    const loadToken = bumpLoadToken();
    const isSummative = activeChapterId === 'assessment';
    const isFormative = typeof activeChapterId === 'string' && activeChapterId.startsWith('formative-');

    if (isSummative) {
      if (!isOutlineItemUnlocked(weeks, 'assessment', isSummativeCompleteRef.current)) return;
      resetChapterState();
      setLoadingChapterContent(false);
      resetAssessmentState();
      if (inboundId) loadSummativeAssessment(inboundId, loadToken).catch(() => {});
      return;
    }

    if (isFormative) {
      if (!isOutlineItemUnlocked(weeks, activeChapterId, isSummativeCompleteRef.current)) return;
      resetChapterState();
      setLoadingChapterContent(false);
      resetAssessmentState();
      const assessmentId = activeChapterId.replace('formative-', '');
      loadFormativeAssessment(assessmentId, loadToken).catch(() => {});
      return;
    }

    resetAssessmentState();
    resetChapterState();
    if (!isOutlineItemUnlocked(weeks, activeChapterId, isSummativeCompleteRef.current)) return;
    loadChapterContent(activeChapterId, loadToken).catch(() => {});
  }, [activeChapterId, inboundId, loadingCourse, contentReloadKey]);

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
    const question = exerciseQuestionsState[currentExerciseIndex];
    if (!question) return;
    const isGraded = !!exerciseGradedList[question.id];
    if (isGraded) return;
    setExerciseAnswers(prev => ({ ...prev, [question.id]: idx }));
  };

  const handleExerciseAction = async () => {
    const question = exerciseQuestionsState[currentExerciseIndex];
    if (!question) return;
    const isGraded = !!exerciseGradedList[question.id];
    const selectedOption = exerciseAnswers[question.id];

    if (!isGraded) {
      if (selectedOption === null || selectedOption === undefined) return;
      const isCorrect = (question.correctAnswers || []).includes(selectedOption);
      const newStates = [...exerciseStates];
      newStates[currentExerciseIndex] = isCorrect ? 'correct' : 'wrong';
      setExerciseStates(newStates);
      
      const updatedGradedList = { ...exerciseGradedList, [question.id]: true };
      setExerciseGradedList(updatedGradedList);

      // Check if all exercises are graded, and mark chapter complete
      const allGraded = exerciseQuestionsState.every(q => updatedGradedList[q.id]);
      if (allGraded) {
        markChapterCompleteOnBackend(activeChapterId).catch(() => {});
      }

      // Save attempt to database
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/api/exercises/${question.id}/attempt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              answer: String(selectedOption),
              is_correct: isCorrect,
              score: isCorrect ? (question.points || 1) : 0
            })
          });
          if (inboundId) {
            fetchCourseStudentAttempts(inboundId).catch(() => {});
          }
        } catch (err) {
          console.error("Failed to record attempt:", err);
        }
      }
    } else {
      if (currentExerciseIndex < exerciseQuestionsState.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
      }
    }
  };

  // Assessment Logic
  const handleAssessmentOptionSelect = (optIdx, type) => {
    if (isAssessmentReviewMode) return; // Cannot change answers in review mode!
    
    const currentQ = assessmentQuestions[currentAssessmentIndex];
    if (!currentQ) return;
    
    let newOptions;
    if (type === 'single') {
      newOptions = [optIdx];
    } else {
      newOptions = selectedAssessmentOptions.includes(optIdx)
        ? selectedAssessmentOptions.filter(i => i !== optIdx)
        : [...selectedAssessmentOptions, optIdx];
    }
    
    setSelectedAssessmentOptions(newOptions);
    
    // Save answer text format for backend
    const answerText = newOptions.map(idx => currentQ.options[idx]).join(', ');
    updateLocalAnswer(currentQ.id, newOptions, answerText);
  };

  const handleAssessmentNavigation = (direction) => {
    // Sync text answer before moving
    syncTextAnswer();
    
    if (direction === 'next') {
      if (currentAssessmentIndex < assessmentQuestions.length - 1) {
        setCurrentAssessmentIndex(prev => prev + 1);
      }
    } else if (direction === 'prev') {
      if (currentAssessmentIndex > 0) {
        setCurrentAssessmentIndex(prev => prev - 1);
      }
    }
  };

  const handleAssessmentSubmit = async () => {
    // Sync text answer first
    syncTextAnswer();
    
    // Stop the timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setAssessmentTimerActive(false);

    const token = localStorage.getItem('token');
    if (!token || !currentAttemptId) {
      showToast("No active attempt found. Please try again.", "error");
      return;
    }

    const isSummative = currentAssessmentDetails.type === 'summative';
    const url = isSummative
      ? `${API_BASE_URL}/api/summative-attempts/${currentAttemptId}/submit`
      : `${API_BASE_URL}/api/formative-attempts/${currentAttemptId}/submit`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to finalize attempt");
      }
      
      const body = await res.json();
      const attemptData = body.data || body;
      
      // Fetch detailed results (correct, wrong, time, etc.)
      const resultsUrl = isSummative
        ? `${API_BASE_URL}/api/summative-attempts/${currentAttemptId}/results`
        : `${API_BASE_URL}/api/formative-attempts/${currentAttemptId}/results`;
        
      const resultsRes = await fetch(resultsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let finalResults = null;
      if (resultsRes.ok) {
        const resultsBody = await resultsRes.json();
        finalResults = resultsBody.data || resultsBody;
      }
      
      const scorePct = parseFloat(attemptData.percentage ?? attemptData.score ?? 0);
      const passingScore = currentAssessmentDetails.passingScore || 60;
      const passed = scorePct >= passingScore;

      // Populate results UI state
      const total = assessmentQuestions.length;
      let correct = 0;
      let wrong = 0;
      let answered = 0;

      if (finalResults && finalResults.results) {
        correct = finalResults.results.correct_answers || 0;
        wrong = finalResults.results.wrong_answers || 0;
        answered = finalResults.results.pending_review || 0;
      } else {
        // Fallback calculations locally
        assessmentQuestions.forEach((q) => {
          const savedAns = assessmentAnswers[q.id];
          if (q.type === 'essay') {
            answered++;
          } else if (q.type === 'short_answer') {
            const isCorrect = savedAns && q.correctAnswer && 
              String(savedAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
            if (isCorrect) correct++; else wrong++;
          } else {
            const savedOptions = savedAns || [];
            const correctOpts = q.correctAnswers || [];
            const isCorrect = savedOptions.length === correctOpts.length &&
              savedOptions.every(val => correctOpts.includes(val));
            if (isCorrect) correct++; else wrong++;
          }
        });
      }

      setAssessmentResult({
        score: `${scorePct.toFixed(1)}%`,
        headline: passed ? 'Congratulations!' : (answered > 0 ? 'Submitted for Review' : 'Keep practicing!'),
        summary: passed
          ? (currentAssessmentDetails.type === 'summative'
              ? 'You have passed the final summative assessment. You can now claim your certificate!'
              : 'You have passed the quiz assessment. Great job!')
          : answered > 0
            ? `Your essay/text answers will be reviewed by the instructor. Auto-graded score: ${scorePct.toFixed(1)}%`
            : 'You did not achieve the required passing score. Please try again.',
        buttonLabel: passed
          ? (currentAssessmentDetails.type === 'summative'
            ? 'Claim Certificate'
            : (getNextOutlineItem(outlineWeeksState, activeChapterId, isSummativeComplete) ? 'Continue' : ''))
          : (hasAttemptsLeft ? 'Retry Quiz' : 'No attempt left'),
        continueChapterId: passed && currentAssessmentDetails.type === 'formative'
          ? getNextOutlineItem(outlineWeeksState, activeChapterId, isSummativeComplete)?.id || null
          : null,
        continueLabel: passed && currentAssessmentDetails.type === 'formative'
          ? getNextOutlineItem(outlineWeeksState, activeChapterId, isSummativeComplete)?.title || ''
          : '',
        stats: [
          { value: String(total), label: 'Questions' },
          { value: String(correct), label: 'Correct' },
          { value: String(wrong), label: 'Wrong' },
          ...(answered > 0 ? [{ value: String(answered), label: 'Pending Review' }] : []),
          { value: passed ? 'Passed' : (answered > 0 ? 'Pending' : 'Failed'), label: 'Status', tone: passed ? 'success' : (answered > 0 ? '' : 'danger') },
        ],
        status: attemptData.status || finalStatus || 'submitted'
      });

      // Mark completed on sidebar/course reader backend
      if (currentAssessmentDetails.type === 'summative') {
        if (passed || !hasAttemptsLeft) {
          if (passed) {
            issueCertificate(scorePct).catch(() => {});
          }
          updateSummativeCompletion(true);
        }
      } else if (currentAssessmentDetails.type === 'formative') {
        const assKey = `formative-${currentAssessmentDetails.id}`;
        setCompletedChapters((prev) => {
          if (prev.includes(assKey)) return prev;
          const next = [...prev, assKey];
          
          // Mark completed in week list outline
          setOutlineWeeksState((prevWeeks) => {
            return prevWeeks.map((w) => {
              const updatedChapters = w.chapters.map((ch) => ({
                ...ch,
                completed: next.includes(ch.id) || next.includes(Number(ch.id))
              }));
              const updatedAssessments = w.assessments ? w.assessments.map((ass) => ({
                ...ass,
                completed: next.includes(ass.id) || next.includes(String(ass.id))
              })) : [];
              const weekCompleted = updatedChapters.length > 0 && updatedChapters.every(ch => ch.completed) &&
                (updatedAssessments.length === 0 || updatedAssessments.every(ass => ass.completed));
              return {
                ...w,
                completed: weekCompleted,
                chapters: updatedChapters,
                assessments: updatedAssessments
              };
            });
          });
          return next;
        });
      }

      if (inboundId) {
        fetchCourseAvgScore(inboundId).catch(() => {});
      }

      setIsAssessmentComplete(true);
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      showToast("Submission failed. Please check your connection and try again.", "error");
    }
  };

  submitRef.current = handleAssessmentSubmit;

  const handleAssessmentCompleteButton = () => {
    if (assessmentResult?.continueChapterId) {
      handleChapterSelect(assessmentResult.continueChapterId);
      resetAssessmentState();
      setIsAssessmentComplete(false);
      return;
    }
    setContentReloadKey((k) => k + 1);
  };

  const handleLessonComplete = async (chapterId) => {
    await markChapterCompleteOnBackend(chapterId);
    const nextItem = getNextOutlineItem(outlineWeeksState, chapterId, isSummativeComplete);
    if (nextItem?.id) {
      handleChapterSelect(nextItem.id);
    }
  };

  const handleEnrollFromReader = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Please sign in to enroll in this course.", "error");
      navigate('/academia/auth/signin');
      return;
    }

    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = (userObj.role || '').toLowerCase().trim();
    if (!isEnrollmentRoleAllowed(userRole)) {
      showToast("Only learner accounts can enroll in courses.", "error");
      return;
    }

    if (!isCourseFree(courseMetaState) && !hasSavedPaymentMethods(savedPaymentMethods)) {
      showToast('Add a payment method in Account before enrolling.', 'error');
      navigate(buildAccountPaymentHref(readerEnrollmentReturnPath));
      return;
    }

    setIsEnrolling(true);
    try {
      await enrollInCourse({
        apiBaseUrl: API_BASE_URL,
        token,
        courseId: inboundId,
        course: courseMetaState,
        selectedPaymentValue,
      });
      setIsEnrolled(true);
      showToast(`Enrollment confirmed via ${getPaymentMethodLabel(selectedPaymentValue)}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to enroll in the course.', "error");
    } finally {
      setIsEnrolling(false);
    }
  };

  useEffect(() => {
    const courseTitle = stripHtml(courseMetaState.title);
    const lessonTitle = stripHtml(activeContent?.headline);
    const tabTitle = lessonTitle && courseTitle
      ? `${lessonTitle} · ${courseTitle}`
      : (courseTitle || lessonTitle || 'Course reader');
    document.title = learnerPageTitle(tabTitle);
    return () => {
      document.title = LEARNER_PRODUCT_NAME;
    };
  }, [activeContent?.headline, courseMetaState.title, loadingCourse]);

  useEffect(() => {
    if (!inboundId || !isSummativeComplete || !isAssessmentComplete) return;
    if (outlineProgress.total > 0 && outlineProgress.completed >= outlineProgress.total) {
      if (!hasSeenCourseCelebration(inboundId)) {
        setShowCourseCelebration(true);
      }
    }
  }, [inboundId, isSummativeComplete, isAssessmentComplete, outlineProgress]);

  return (
    <LearnersPageShell>
      <section className="learners-read-contents-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Course reader</h1>
            <div className="learners-home-title-actions">
              <SavedLibraryButton />
              <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        <div className="filters-grid-b-h">
          <button type="button" onClick={() => navigate(`/academia/learner/course-part?id=${inboundId}`)}>
            <img src={acLe} alt="Left" />
          </button>
          <div>
            <p>{stripHtml(courseMetaState.category) || 'Course catalog'}</p>
            <span>/</span>
            <span>{stripHtml(courseMetaState.title)}</span>
            <span>/</span>
          </div>
        </div>

        <div className={`learners-read-contents-shell ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
          <Sidebar
            courseReader={{ ...courseReader, score: courseAvgScore }}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            outlineWeeksState={outlineWeeksState}
            expandedWeeks={expandedWeeks}
            toggleWeek={toggleWeek}
            activeChapterId={activeChapterId}
            handleChapterSelect={handleChapterSelect}
            stripHtml={stripHtml}
            isSummativeComplete={isSummativeComplete}
            outlineProgress={outlineProgress}
            loadingOutline={loadingCourse}
            nextAssessment={nextAssessment}
            courseProgressPercent={courseProgressPercent}
          />

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
                <p>Progress : {courseProgressPercent}%</p>
              </div>
            </section>

            <article className="learners-read-article">
              {!inboundId ? (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>Select a course</h3>
                  <p>Open a course from your library or catalog to start reading.</p>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                    Browse courses
                  </button>
                </div>
              ) : courseLoadError ? (
                <LearnerLoadError
                  title="Could not load course"
                  message={courseLoadError}
                  onRetry={() => {
                    setCourseLoadError('');
                    setContentReloadKey((k) => k + 1);
                  }}
                />
              ) : loadingCourse ? (
                <div className="learners-loading">Loading course content…</div>
              ) : showContentSections ? (
                <>
                  {loadingChapterContent && !isAssessmentView ? (
                    <div className="learners-loading">Loading chapter content…</div>
                  ) : chapterLoadError && !isAssessmentView ? (
                    <LearnerLoadError
                      title="Could not load lesson"
                      message={chapterLoadError}
                      onRetry={() => {
                        setChapterLoadError('');
                        setContentReloadKey((k) => k + 1);
                      }}
                    />
                  ) : (
                  <LessonView
                    activeContent={activeContent}
                    isEnrolled={isEnrolled}
                    isEnrolling={isEnrolling}
                    handleEnrollFromReader={handleEnrollFromReader}
                    navigate={navigate}
                    inboundId={inboundId}
                    isAssessmentView={isAssessmentView}
                    stripHtml={stripHtml}
                    paymentChoices={paymentChoices}
                    selectedPaymentValue={selectedPaymentValue}
                    onPaymentChange={setSelectedPaymentValue}
                    paymentsLoading={paymentsLoading}
                    courseIsFree={isCourseFree(courseMetaState)}
                    requiresPaymentSetup={requiresPaymentSetup}
                    accountHref={buildAccountPaymentHref(readerEnrollmentReturnPath)}
                  >
                    {isEnrolled && !isAssessmentView ? (
                      <LessonWorkspacePanels
                        key={activeChapterId}
                        activeContent={activeContent}
                        courseId={inboundId}
                        pdfUrl={pdfUrl}
                        pdfAttachments={pdfAttachments}
                        activePdfIndex={activePdfIndex}
                        setActivePdfIndex={setActivePdfIndex}
                        textPages={textPages}
                        activeTextPageIndex={activeTextPageIndex}
                        setActiveTextPageIndex={setActiveTextPageIndex}
                        formatHtmlContent={formatHtmlContent}
                        stripHtml={stripHtml}
                        attachmentsList={attachmentsList}
                        API_BASE_URL={API_BASE_URL}
                        exerciseQuestionsState={exerciseQuestionsState}
                        currentExerciseIndex={currentExerciseIndex}
                        setCurrentExerciseIndex={setCurrentExerciseIndex}
                        exerciseStates={exerciseStates}
                        exerciseAnswers={exerciseAnswers}
                        exerciseGradedList={exerciseGradedList}
                        handleExerciseOptionSelect={handleExerciseOptionSelect}
                        handleExerciseAction={handleExerciseAction}
                        isCurrentChapterCompleted={isCurrentChapterCompleted}
                        markChapterCompleteOnBackend={handleLessonComplete}
                        activeChapterId={activeChapterId}
                      />
                    ) : null}
                  </LessonView>
                  )}

                  <AssessmentView
                    key={activeChapterId}
                    isAssessmentView={isAssessmentView}
                    currentAssessmentDetails={currentAssessmentDetails}
                    courseId={inboundId}
                    courseMeta={courseMetaState}
                    showCourseCelebration={showCourseCelebration}
                    courseTitle={courseMetaState.title}
                    onDismissCourseCelebration={() => {
                      markCourseCelebrationSeen(inboundId);
                      setShowCourseCelebration(false);
                    }}
                    maxAttempts={maxAttempts}
                    attemptNumber={attemptNumber}
                    assessmentTimerActive={assessmentTimerActive}
                    timeRemainingSeconds={timeRemainingSeconds}
                    formatTimer={formatTimer}
                    assessmentTracker={assessmentTracker}
                    getTrackerItemClass={getTrackerItemClass}
                    syncTextAnswer={syncTextAnswer}
                    assessmentQuestions={assessmentQuestions}
                    setCurrentAssessmentIndex={setCurrentAssessmentIndex}
                    currentAssessmentIndex={currentAssessmentIndex}
                    isAssessmentComplete={isAssessmentComplete}
                    assessmentResult={assessmentResult}
                    assessmentTextAnswer={assessmentTextAnswer}
                    setAssessmentTextAnswer={setAssessmentTextAnswer}
                    isAssessmentReviewMode={isAssessmentReviewMode}
                    selectedAssessmentOptions={selectedAssessmentOptions}
                    handleAssessmentOptionSelect={handleAssessmentOptionSelect}
                    handleAssessmentNavigation={handleAssessmentNavigation}
                    handleAssessmentSubmit={handleAssessmentSubmit}
                    setIsAssessmentReviewMode={setIsAssessmentReviewMode}
                    setIsAssessmentComplete={setIsAssessmentComplete}
                    handleAssessmentCompleteButton={handleAssessmentCompleteButton}
                    hasAttemptsLeft={hasAttemptsLeft}
                    stripHtml={stripHtml}
                    loadingAssessment={loadingAssessment}
                    isAssessmentStarted={isAssessmentStarted}
                    setIsAssessmentStarted={setIsAssessmentStarted}
                    isConfirmingSubmit={isConfirmingSubmit}
                    setIsConfirmingSubmit={setIsConfirmingSubmit}
                    assessmentAttemptData={assessmentAttemptData}
                    startAssessmentTimer={startAssessmentTimer}
                    handleStartAssessment={handleStartAssessment}
                    showToast={showToast}
                  />
                </>
              ) : (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>No content published</h3>
                  <p className="visually-hidden">There are no chapters or learning outcomes for this course yet.</p>
                  <div>
                    <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                      Browse courses
                    </button>
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
    </LearnersPageShell>
  );
}

export default LearnersReadContents;

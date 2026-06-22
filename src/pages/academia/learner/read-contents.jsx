import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import Sidebar from './read-contents/Sidebar';
import LessonView from './read-contents/LessonView';
import WorkspaceModal from './read-contents/WorkspaceModal';
import AssessmentView from './read-contents/AssessmentView';

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
  status: 'graded'
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

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({ 'week-1': true });
  const [activeChapterId, setActiveChapterId] = useState('chapter-1');
  const [isAudienceExpanded, setIsAudienceExpanded] = useState(false);
  const [activePdfIndex, setActivePdfIndex] = useState(0);
  const [activeTextPageIndex, setActiveTextPageIndex] = useState(0);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

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
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [exerciseGradedList, setExerciseGradedList] = useState({});
  const [completedChapters, setCompletedChapters] = useState([]);

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
  const [currentAssessmentDetails, setCurrentAssessmentDetails] = useState({
    id: null,
    type: 'summative',
    title: '',
    passingScore: 80,
    durationMinutes: 0,
    attemptLimit: null,
    showCorrectAnswers: true,
    showScoreImmediately: true,
    randomizeQuestions: false,
  });
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

  const hasAttemptsLeft = useMemo(() => {
    if (!maxAttempts) return true;
    return attemptNumber < maxAttempts;
  }, [attemptNumber, maxAttempts]);

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

  const startAssessmentTimer = (durationMinutes) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (durationMinutes && durationMinutes > 0) {
      setTimeRemainingSeconds(durationMinutes * 60);
      setAssessmentTimerActive(true);
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

  const loadSummativeAssessment = async (courseId) => {
    setLoadingAssessment(true);
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

      if (fullAssessment) {
        setCurrentAssessmentDetails({
          id: data.id,
          type: 'summative',
          title: fullAssessment.title || 'Summative Assessment',
          passingScore: Number(fullAssessment.passingScore || fullAssessment.passing_score || 80),
          durationMinutes: Number(fullAssessment.duration_minutes || fullAssessment.durationMinutes || 0),
          attemptLimit: fullAssessment.attempt_limit || fullAssessment.attemptLimit || 1,
          showCorrectAnswers: !!(fullAssessment.show_correct_answers ?? false),
          showScoreImmediately: !!(fullAssessment.show_score_immediately ?? true),
          randomizeQuestions: !!(fullAssessment.randomize_questions ?? false),
        });

        setAssessmentAnswers({});
        setIsAssessmentReviewMode(false);

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

          // Randomize questions if flag is enabled
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

        // Start summative attempt on backend!
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const startRes = await fetch(`${API_BASE_URL}/api/summative-assessments/${data.id}/start`, {
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

                // Restore saved answers if resumed attempt returned answers
                if (Array.isArray(attemptData.answers) && finalQuestions.length > 0) {
                  const answersMap = {};
                  const nextTracker = finalQuestions.map(() => 'pending');

                  attemptData.answers.forEach(a => {
                    const qIdx = finalQuestions.findIndex(q => q.id === a.question_id);
                    if (qIdx >= 0) {
                      const q = finalQuestions[qIdx];
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

                // If attempt is already completed (limit reached), fetch and show results
                if (attemptData.limit_reached || attemptData.status === 'submitted' || attemptData.status === 'graded') {
                  setIsAssessmentComplete(true);
                  try {
                    const resultsRes = await fetch(`${API_BASE_URL}/api/summative-attempts/${attemptId}/results`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resultsRes.ok) {
                      const resultsBody = await resultsRes.json();
                      const finalResults = resultsBody.data || resultsBody;
                      
                      const scorePct = parseFloat(finalResults.attempt?.percentage ?? finalResults.attempt?.score ?? attemptData.percentage ?? 0);
                      const passed = finalResults.attempt?.is_passed ?? (scorePct >= (fullAssessment.passing_score ?? 80));
                      const total = finalQuestions.length;
                      const correct = finalResults.results?.correct_answers || 0;
                      const wrong = finalResults.results?.wrong_answers || 0;
                      const answered = finalResults.results?.pending_review || 0;

                      setAssessmentResult({
                        score: `${scorePct.toFixed(1)}%`,
                        headline: passed ? 'Congratulations!' : (answered > 0 ? 'Submitted for Review' : 'Assessment Completed'),
                        summary: passed
                          ? 'You have passed the summative assessment. Great job!'
                          : answered > 0
                            ? `Your essay/text answers will be reviewed by the instructor. Auto-graded score: ${scorePct.toFixed(1)}%`
                            : 'You did not achieve the required passing score.',
                        buttonLabel: passed ? 'Claim Certificate' : 'Retry Quiz',
                        stats: [
                          { value: String(total), label: 'Questions' },
                          { value: String(correct), label: 'Correct' },
                          { value: String(wrong), label: 'Wrong' },
                          ...(answered > 0 ? [{ value: String(answered), label: 'Pending Review' }] : []),
                          { value: passed ? 'Passed' : (answered > 0 ? 'Pending' : 'Failed'), label: 'Status', tone: passed ? 'success' : (answered > 0 ? '' : 'danger') },
                        ],
                        status: finalResults.attempt?.status || attemptData.status || 'graded'
                      });
                    } else {
                      const scorePct = parseFloat(attemptData.percentage ?? attemptData.score ?? 0);
                      const passed = attemptData.is_passed ?? (scorePct >= (fullAssessment.passing_score ?? 80));
                      setAssessmentResult({
                        score: `${scorePct.toFixed(1)}%`,
                        headline: passed ? 'Congratulations!' : 'Assessment Completed',
                        summary: 'You have used all attempts for this assessment.',
                        buttonLabel: 'Claim Certificate',
                        stats: [
                          { value: String(finalQuestions.length), label: 'Questions' },
                          { value: passed ? 'Passed' : 'Failed', label: 'Status', tone: passed ? 'success' : 'danger' }
                        ],
                        status: attemptData.status || 'graded'
                      });
                    }
                  } catch (e) {
                    console.error("Failed to load summative results:", e);
                    const scorePct = parseFloat(attemptData.percentage ?? attemptData.score ?? 0);
                    const passed = attemptData.is_passed ?? (scorePct >= (fullAssessment.passing_score ?? 80));
                    setAssessmentResult({
                      score: `${scorePct.toFixed(1)}%`,
                      headline: passed ? 'Congratulations!' : 'Assessment Completed',
                      summary: 'You have used all attempts for this assessment.',
                      buttonLabel: 'Claim Certificate',
                      stats: [
                        { value: String(finalQuestions.length), label: 'Questions' },
                        { value: passed ? 'Passed' : 'Failed', label: 'Status', tone: passed ? 'success' : 'danger' }
                      ],
                      status: attemptData.status || 'graded'
                    });
                  }
                } else {
                  // Active taking flow: Start countdown timer if status is in_progress
                  startAssessmentTimer(Number(fullAssessment.duration_minutes || fullAssessment.durationMinutes || 0));
                }
              }
            }
            // Get previous attempts count for max attempts display
            setMaxAttempts(fullAssessment.attempt_limit || fullAssessment.attemptLimit || 1);
          } catch (e) {
            console.error("Failed to start summative attempt:", e);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load summative assessment:", err);
    } finally {
      setLoadingAssessment(false);
    }
  };

  const loadFormativeAssessment = async (assessmentId) => {
    setLoadingAssessment(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/formative-assessments/${assessmentId}`);
      if (!res.ok) return;
      const body = await res.json();
      const fullAssessment = extractBody(body);

      if (fullAssessment) {
        setCurrentAssessmentDetails({
          id: assessmentId,
          type: 'formative',
          title: fullAssessment.title || 'Quiz Assessment',
          passingScore: Number(fullAssessment.passingScore || fullAssessment.passing_score || 60),
          durationMinutes: Number(fullAssessment.duration_minutes || fullAssessment.durationMinutes || 0),
          attemptLimit: fullAssessment.attempt_limit || fullAssessment.attemptLimit || null,
          showCorrectAnswers: !!(fullAssessment.show_correct_answers ?? true),
          showScoreImmediately: !!(fullAssessment.show_score_immediately ?? true),
          randomizeQuestions: !!(fullAssessment.randomize_questions ?? false),
        });

        setAssessmentAnswers({});
        setIsAssessmentReviewMode(false);

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

          // Randomize questions if flag is enabled
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

        // Start formative attempt on backend!
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const startRes = await fetch(`${API_BASE_URL}/api/formative-assessments/${assessmentId}/start`, {
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

                // Restore saved answers if resumed attempt returned answers
                if (Array.isArray(attemptData.answers) && finalQuestions.length > 0) {
                  const answersMap = {};
                  const nextTracker = finalQuestions.map(() => 'pending');

                  attemptData.answers.forEach(a => {
                    const qIdx = finalQuestions.findIndex(q => q.id === a.question_id);
                    if (qIdx >= 0) {
                      const q = finalQuestions[qIdx];
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

                // If attempt is already completed (limit reached), fetch and show results
                if (attemptData.limit_reached || attemptData.status === 'submitted' || attemptData.status === 'graded') {
                  setIsAssessmentComplete(true);
                  try {
                    const resultsRes = await fetch(`${API_BASE_URL}/api/formative-attempts/${attemptId}/results`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resultsRes.ok) {
                      const resultsBody = await resultsRes.json();
                      const finalResults = resultsBody.data || resultsBody;
                      
                      const scorePct = parseFloat(finalResults.attempt?.percentage ?? finalResults.attempt?.score ?? attemptData.percentage ?? 0);
                      const passed = finalResults.attempt?.is_passed ?? (scorePct >= (fullAssessment.passing_score ?? 60));
                      const total = finalQuestions.length;
                      const correct = finalResults.results?.correct_answers || 0;
                      const wrong = finalResults.results?.wrong_answers || 0;
                      const answered = finalResults.results?.pending_review || 0;

                      setAssessmentResult({
                        score: `${scorePct.toFixed(1)}%`,
                        headline: passed ? 'Congratulations!' : (answered > 0 ? 'Submitted for Review' : 'Quiz Completed'),
                        summary: passed
                          ? 'You have passed the quiz assessment. Great job!'
                          : answered > 0
                            ? `Your essay/text answers will be reviewed by the instructor. Auto-graded score: ${scorePct.toFixed(1)}%`
                            : 'You did not achieve the required passing score.',
                        buttonLabel: passed ? 'Continue Course' : 'Retry Quiz',
                        stats: [
                          { value: String(total), label: 'Questions' },
                          { value: String(correct), label: 'Correct' },
                          { value: String(wrong), label: 'Wrong' },
                          ...(answered > 0 ? [{ value: String(answered), label: 'Pending Review' }] : []),
                          { value: passed ? 'Passed' : (answered > 0 ? 'Pending' : 'Failed'), label: 'Status', tone: passed ? 'success' : (answered > 0 ? '' : 'danger') },
                        ],
                        status: finalResults?.attempt?.status || attemptData.status || 'graded'
                      });
                    } else {
                      const scorePct = parseFloat(attemptData.percentage ?? attemptData.score ?? 0);
                      const passed = attemptData.is_passed ?? (scorePct >= (fullAssessment.passing_score ?? 60));
                      setAssessmentResult({
                        score: `${scorePct.toFixed(1)}%`,
                        headline: passed ? 'Congratulations!' : 'Quiz Completed',
                        summary: 'You have used all attempts for this assessment.',
                        buttonLabel: 'Continue Course',
                        stats: [
                          { value: String(finalQuestions.length), label: 'Questions' },
                          { value: passed ? 'Passed' : 'Failed', label: 'Status', tone: passed ? 'success' : 'danger' }
                        ],
                        status: attemptData.status || 'graded'
                      });
                    }
                  } catch (e) {
                    console.error("Failed to load formative results:", e);
                    const scorePct = parseFloat(attemptData.percentage ?? attemptData.score ?? 0);
                    const passed = attemptData.is_passed ?? (scorePct >= (fullAssessment.passing_score ?? 60));
                    setAssessmentResult({
                      score: `${scorePct.toFixed(1)}%`,
                      headline: passed ? 'Congratulations!' : 'Quiz Completed',
                      summary: 'You have used all attempts for this assessment.',
                      buttonLabel: 'Continue Course',
                      stats: [
                        { value: String(finalQuestions.length), label: 'Questions' },
                        { value: passed ? 'Passed' : 'Failed', label: 'Status', tone: passed ? 'success' : 'danger' }
                      ]
                    });
                  }
                } else {
                  // Active taking flow: Start countdown timer if status is in_progress
                  startAssessmentTimer(Number(fullAssessment.duration_minutes || fullAssessment.durationMinutes || 0));
                }
              }
            }
            // Set max attempts display
            setMaxAttempts(fullAssessment.attempt_limit || fullAssessment.attemptLimit || null);
          } catch (e) {
            console.error("Failed to start formative attempt:", e);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load formative assessment:", err);
    } finally {
      setLoadingAssessment(false);
    }
  };

  const issueCertificate = async (score) => {
    const token = localStorage.getItem('token');
    if (!token || !inboundId) return;
    try {
      await fetch(`${API_BASE_URL}/api/courses/${inboundId}/certificates/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          final_score: score,
          formative_score: score,
          total_hours: 10
        })
      });
    } catch (err) {
      console.error("Failed to automatically issue certificate:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;

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

          let activeChId = initialChapterId;
          let targetWeekId = null;
          if (activeChId) {
            const foundWeek = weeksWithAssessments.find(w =>
              w.chapters.some(c => String(c.id) === String(activeChId)) ||
              (w.assessments && w.assessments.some(a => String(a.id) === String(activeChId)))
            );
            if (foundWeek) {
              targetWeekId = foundWeek.id;
            } else {
              const firstWeekWithCh = weeksWithAssessments.find(w => w.chapters && w.chapters.length > 0);
              activeChId = firstWeekWithCh ? firstWeekWithCh.chapters[0].id : (chapters[0]?.id || `ch-0`);
              if (firstWeekWithCh) targetWeekId = firstWeekWithCh.id;
            }
          } else {
            const firstWeekWithCh = weeksWithAssessments.find(w => w.chapters && w.chapters.length > 0);
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
                  id: cid,
                  weekId: w.id,
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
                  exercises: c.exercises || [],
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
                      type: (ex.type === 'multiple_choice' || ex.type === 'checkbox' || ex.type === 'multi') ? 'multi' : 'single',
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

          if (activeChId) {
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
              id: cid,
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
              exercises: c.exercises || [],
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
                  type: (ex.type === 'multiple_choice' || ex.type === 'checkbox' || ex.type === 'multi') ? 'multi' : 'single',
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
          if (activeChId) {
            fetchChapterExercises(activeChId).catch(() => { });
          }
        }

        // load summative assessment
        await loadSummativeAssessment(courseData.id || id);

        // load student progress and attempts for this course to reflect progress
        if (courseData.id || courseData.course_id || id) {
          const courseId = courseData.id || courseData.course_id || id;
          fetchCourseProgress(courseId).catch(() => { });
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
    return chapterContentMapState[activeChapterId] || defaultContent;
  }, [activeChapterId, chapterContentMapState, currentAssessmentDetails, outlineWeeksState, isAssessmentComplete]);

  const isCurrentChapterCompleted = useMemo(() => {
    if (activeChapterId === 'assessment') {
      return isAssessmentComplete;
    }
    if (typeof activeChapterId === 'string' && activeChapterId.startsWith('formative-')) {
      const targetWeek = outlineWeeksState.find(w =>
        w.assessments && w.assessments.some(a => String(a.id) === String(activeChapterId))
      );
      const assessmentItem = targetWeek?.assessments?.find(a => String(a.id) === String(activeChapterId));
      return assessmentItem ? assessmentItem.completed : false;
    }
    return completedChapters.includes(activeChapterId) || completedChapters.includes(Number(activeChapterId));
  }, [activeChapterId, completedChapters, outlineWeeksState, isAssessmentComplete]);

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
  const showContentSections = !loadingCourse && (hasOutline || hasOutcomes);

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
        const completedAssessments = data.completedAssessments || [];
        
        setCompletedChapters((prev) => {
          const localMocks = prev.filter(id => typeof id === 'string' && !completedAssessments.includes(id));
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
        // Refresh progress!
        await fetchCourseProgress(inboundId);
      }
    } catch (err) {
      console.error("Failed to mark chapter complete:", err);
    }
  };

  const handleChapterSelect = (chapterId) => {
    setActiveChapterId(chapterId);
    if (window.innerWidth <= 991) setIsSidebarOpen(false);

    // Reset States
    setIsAudienceExpanded(false);
    setActivePdfIndex(0);
    setActiveTextPageIndex(0);
    setIsWorkspaceOpen(false);

    const isSummative = chapterId === 'assessment';
    const isFormative = typeof chapterId === 'string' && chapterId.startsWith('formative-');

    if (isSummative || isFormative) {
      setCurrentAttemptId(null);
      setCurrentAssessmentIndex(0);
      setSelectedAssessmentOptions([]);
      setIsAssessmentGraded(false);
      setIsAssessmentComplete(false);
      setAssessmentTextAnswer('');
      setAssessmentAnswers({});
      setIsAssessmentReviewMode(false);
      // Stop any running timer from previous assessment
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setAssessmentTimerActive(false);
      setTimeRemainingSeconds(0);

      if (isFormative) {
        const assessmentId = chapterId.replace('formative-', '');
        loadFormativeAssessment(assessmentId).catch(() => {});
      } else {
        if (inboundId) {
          loadSummativeAssessment(inboundId).catch(() => {});
        }
      }
    } else {
      setCurrentExerciseIndex(0);
      setSelectedExerciseOption(null);
      setIsExerciseGraded(false);
      setExerciseStates([]);
      setExerciseAnswers({});
      setExerciseGradedList({});
      
      // fetch exercises for the selected chapter from backend
      if (chapterId) {
        fetchChapterExercises(chapterId).catch(() => { });
      }
    }
  };

  // Fetch exercises for a chapter from backend and set state
  const fetchChapterExercises = async (chapterId) => {
    if (!chapterId) return;
    try {
      const isMockId = typeof chapterId === 'string' && (chapterId.startsWith('ch-') || chapterId.startsWith('chapter-') || isNaN(Number(chapterId)));
      let list = [];
      if (!isMockId) {
        const res = await fetch(`${API_BASE_URL}/api/chapters/${chapterId}/exercises`);
        if (res.ok) {
          const body = await res.json();
          const data = extractBody(body) || [];
          list = Array.isArray(data) ? data : (data.data || []);
        }
      }

      // Fallback to local content map if empty
      if (!list || !list.length) {
        const localChapter = chapterContentMapState[chapterId] || Object.values(chapterContentMapState).find(c => String(c.id) === String(chapterId));
        list = localChapter?.exercises || [];
      }

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

      setExerciseQuestionsState(mapped);

      // Restore states based on student attempts
      const answersMap = {};
      const gradedMap = {};
      const statesList = mapped.map((m) => {
        const att = studentAttempts.find(a => Number(a.exercise_id) === Number(m.id));
        if (att) {
          gradedMap[m.id] = true;
          const optIdx = att.answer !== null ? Number(att.answer) : null;
          answersMap[m.id] = isNaN(optIdx) ? null : optIdx;
          return att.is_correct ? 'correct' : 'wrong';
        } else {
          gradedMap[m.id] = false;
          answersMap[m.id] = null;
          return 'pending';
        }
      });
      setExerciseAnswers(answersMap);
      setExerciseGradedList(gradedMap);
      setExerciseStates(statesList);
    } catch (err) {
      console.error("Failed to fetch chapter exercises:", err);
      const localChapter = chapterContentMapState[chapterId] || Object.values(chapterContentMapState).find(c => String(c.id) === String(chapterId));
      const list = localChapter?.exercises || [];
      if (list && list.length) {
        const mapped = list.map((ex, i) => {
          let options = ex.options;
          if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch (e) { options = null; }
          }
          const optionLabels = Array.isArray(options) ? options.map(getOptionLabel) : (options || ['Option A', 'Option B']);
          const correctAnswers = extractCorrectAnswers(ex, options, optionLabels);
          return {
            id: ex.id || ex.exercise_id || `ex-${i}`,
            number: ex.order_index || i + 1,
            type: (ex.type === 'multiple_choice' || ex.type === 'checkbox' || ex.type === 'multi') ? 'multi' : 'single',
            prompt: ex.question || ex.title || ex.prompt || 'Exercise',
            options: optionLabels,
            correctAnswers,
            points: ex.points || 1
          };
        });
        setExerciseQuestionsState(mapped);
        setExerciseAnswers({});
        setExerciseGradedList({});
        setExerciseStates(mapped.map(() => 'pending'));
      } else {
        setExerciseQuestionsState([]);
        setExerciseStates([]);
        setExerciseAnswers({});
        setExerciseGradedList({});
      }
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
      alert("No active attempt found. Please try again.");
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
          ? (currentAssessmentDetails.type === 'summative' ? 'Claim Certificate' : 'Continue Course')
          : 'Retry Quiz',
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
        if (passed) {
          issueCertificate(scorePct).catch(() => {});
          setCompletedChapters((prev) => {
            if (prev.includes('assessment')) return prev;
            return [...prev, 'assessment'];
          });
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

      setIsAssessmentComplete(true);
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      alert("Submission failed. Please check your connection and try again.");
    }
  };

  submitRef.current = handleAssessmentSubmit;

  const handleAssessmentCompleteButton = () => {
    const statusStat = assessmentResult.stats?.find(s => s.label === 'Status');
    const passed = statusStat?.value === 'Passed';

    if (passed) {
      if (currentAssessmentDetails.type === 'summative') {
        navigate('/academia/learner/certificates');
      } else {
        // Formative assessment passed: find next item in timeline!
        let nextChapterId = null;
        let foundCurrent = false;
        for (const week of outlineWeeksState) {
          // Check chapters
          if (week.chapters) {
            for (const ch of week.chapters) {
              if (foundCurrent) {
                nextChapterId = ch.id;
                break;
              }
              if (String(ch.id) === String(activeChapterId)) {
                foundCurrent = true;
              }
            }
          }
          if (nextChapterId) break;

          // Check assessments
          if (week.assessments) {
            for (const ass of week.assessments) {
              if (foundCurrent) {
                nextChapterId = ass.id;
                break;
              }
              if (String(ass.id) === String(activeChapterId)) {
                foundCurrent = true;
              }
            }
          }
          if (nextChapterId) break;
        }

        if (nextChapterId) {
          handleChapterSelect(nextChapterId);
        } else {
          setIsAssessmentComplete(false);
          setIsAssessmentReviewMode(false);
          setIsAssessmentGraded(false);
        }
      }
    } else {
      setCurrentAssessmentIndex(0);
      setSelectedAssessmentOptions([]);
      setAssessmentTextAnswer('');
      setIsAssessmentGraded(false);
      setIsAssessmentComplete(false);
      setAssessmentAnswers({});
      setIsAssessmentReviewMode(false);
      setAssessmentTracker(assessmentQuestions.map(() => 'pending'));
      
      // Re-start attempt on retry
      if (currentAssessmentDetails.type === 'formative' && currentAssessmentDetails.id) {
        loadFormativeAssessment(currentAssessmentDetails.id).catch(() => {});
      } else if (currentAssessmentDetails.type === 'summative' && inboundId) {
        loadSummativeAssessment(inboundId).catch(() => {});
      }
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
          <Sidebar
            courseReader={courseReader}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            outlineWeeksState={outlineWeeksState}
            expandedWeeks={expandedWeeks}
            toggleWeek={toggleWeek}
            activeChapterId={activeChapterId}
            handleChapterSelect={handleChapterSelect}
            stripHtml={stripHtml}
            isAssessmentComplete={isAssessmentComplete}
            completedChapters={completedChapters}
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
                <p>{stripHtml(activeContent.progressLabel)}</p>
              </div>
            </section>

            <article className="learners-read-article">
              {loadingCourse ? (
                <div className="learners-loading">Loading course content…</div>
              ) : showContentSections ? (
                <>
                  <LessonView
                    activeContent={activeContent}
                    isEnrolled={isEnrolled}
                    isEnrolling={isEnrolling}
                    handleEnrollFromReader={handleEnrollFromReader}
                    navigate={navigate}
                    inboundId={inboundId}
                    isAssessmentView={isAssessmentView}
                    setIsWorkspaceOpen={setIsWorkspaceOpen}
                    stripHtml={stripHtml}
                  />

                  <WorkspaceModal
                    isWorkspaceOpen={isWorkspaceOpen}
                    setIsWorkspaceOpen={setIsWorkspaceOpen}
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
                    markChapterCompleteOnBackend={markChapterCompleteOnBackend}
                    activeChapterId={activeChapterId}
                  />

                  <AssessmentView
                    isAssessmentView={isAssessmentView}
                    currentAssessmentDetails={currentAssessmentDetails}
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
                  />
                </>
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

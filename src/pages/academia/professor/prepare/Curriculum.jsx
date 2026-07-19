import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Curriculum = ({ courseId, setActiveStep, pushFeedback }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);

  // --- Local State ---
  const [currentWeekIndex, setCurrentWeekIndex] = useState(1);
  const [savedStructure, setSavedStructure] = useState([]); // Holds the fetched weeks & chapters
  const [weekMode, setWeekMode] = useState('new'); // 'new' or 'existing'
  const [selectedWeekId, setSelectedWeekId] = useState('');
  const [chapterMode, setChapterMode] = useState('new'); // 'new' or 'existing'
  const [selectedChapterId, setSelectedChapterId] = useState('');

  const [weekDraft, setWeekDraft] = useState({
    title: 'Week 1',
    description: '',
    weekNumber: 1,
    durationDays: 7,
    learningObjectives: ''
  });
  const [chapterDraft, setChapterDraft] = useState({
    title: '',
    subtitle: '',
    intro_message: '',
    description: '',
    video_url: '',
    duration: 0
  });

  const [chapterThumbnail, setChapterThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const chapterFileInputRef = useRef(null);

  // --- Attachments & Quill Ref ---
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const attachmentFileInputRef = useRef(null);
  const quillRef = useRef(null);

  const [bufferedExercises, setBufferedExercises] = useState([]);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [selectedExerciseIndexes, setSelectedExerciseIndexes] = useState(() => new Set());
  const [exerciseMode, setExerciseMode] = useState('checkbox');
  const [exerciseText, setExerciseText] = useState('');
  const [exercisePoints, setExercisePoints] = useState(1);
  const [answers, setAnswers] = useState([
    { id: 1, text: '', isCorrect: true },
    { id: 2, text: '', isCorrect: false },
  ]);

  // --- Quill Configuration ---
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [3, 4, false] }],
      ['bold', 'italic', 'underline', 'code'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['code-block'],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  }), []);

  // --- Fetch Course Structure ---
  const loadCourseStructure = async (suggestNext = false) => {
    if (!courseId) return;
    setIsLoadingStructure(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
      const data = await res.json();
      const course = data.data || data;

      if (course.weeks && course.weeks.length > 0) {
        setSavedStructure(course.weeks);
        if (suggestNext) {
          // Automatically suggest the next week number
          const highestWeek = Math.max(...course.weeks.map(w => w.week_number));
          setWeekDraft(prev => ({
            ...prev,
            title: `Week ${highestWeek + 1}`,
            weekNumber: highestWeek + 1,
            description: '',
            learningObjectives: ''
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load curriculum structure", error);
    } finally {
      setIsLoadingStructure(false);
    }
  };

  useEffect(() => {
    loadCourseStructure(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchChapterExercises = async (chapterId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chapters/${chapterId}/exercises`);
      if (!res.ok) return;
      const body = await res.json();
      const data = body?.data || body || [];
      const list = Array.isArray(data) ? data : (data.data || []);
      const mapped = list.map((ex, i) => {
        let options = ex.options;
        if (typeof options === 'string') {
          try { options = JSON.parse(options); } catch (e) { }
        }
        return {
          id: ex.id || ex.exercise_id,
          question: ex.question || ex.title,
          type: ex.type || 'radio',
          options: Array.isArray(options) ? options.map(o => ({ text: o.label || o.value || String(o), isCorrect: !!o.is_correct })) : [],
          points: ex.points || 1,
          isExisting: true
        };
      });
      setBufferedExercises(mapped);
    } catch (err) {
      console.error("Failed to fetch exercises:", err);
    }
  };

  const handleSelectChapter = (weekId, chapter) => {
    setWeekMode('existing');
    setSelectedWeekId(String(weekId));

    const w = savedStructure.find(item => String(item.id) === String(weekId));
    if (w) {
      setWeekDraft({
        title: w.title,
        description: w.description || '',
        weekNumber: w.week_number || 1,
        durationDays: w.duration_days || 7,
        learningObjectives: Array.isArray(w.learning_objectives)
          ? w.learning_objectives.join(', ')
          : ''
      });
    }

    setChapterMode('existing');
    setSelectedChapterId(String(chapter.id));
    setChapterDraft({
      title: chapter.title || '',
      subtitle: chapter.subtitle || '',
      intro_message: chapter.intro_message || '',
      description: chapter.description || '',
      video_url: chapter.video_url || '',
      duration: chapter.duration || 0
    });
    setThumbnailPreview(chapter.thumbnail ? (chapter.thumbnail.startsWith('http') ? chapter.thumbnail : `${API_BASE_URL}${chapter.thumbnail}`) : '');

    let existingAtts = [];
    if (chapter.attachments) {
      try {
        existingAtts = typeof chapter.attachments === 'string' ? JSON.parse(chapter.attachments) : chapter.attachments;
      } catch (e) {
        console.error("Failed to parse attachments", e);
      }
    }
    setUploadedAttachments(Array.isArray(existingAtts) ? existingAtts : []);
    setPendingAttachments([]);

    fetchChapterExercises(chapter.id);
  };

  // --- UI Handlers ---
  const handleWeekChange = (field, value) => setWeekDraft(prev => ({ ...prev, [field]: value }));
  const handleChapterDraftChange = (field, value) => setChapterDraft(prev => ({ ...prev, [field]: value }));

  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
    if (e.dataTransfer.files?.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setChapterThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
      } else {
        pushFeedback('Please upload a valid image file.', 'error');
      }
    }
  };

  const handleThumbnailSelect = (e) => {
    if (e.target.files?.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setChapterThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
      } else {
        pushFeedback('Please upload a valid image file.', 'error');
      }
    }
  };

  const handleAttachmentSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setPendingAttachments(prev => [...prev, ...selectedFiles]);
      e.target.value = '';
    }
  };

  const insertImageInline = (url) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    const position = range ? range.index : quill.getLength();
    quill.insertEmbed(position, 'image', url);
    quill.setSelection(position + 1);
  };

  // --- Exercise Handlers ---
  const toggleAnswerCorrectness = (id) => {
    setAnswers(answers.map(ans => {
      if (ans.id === id) return { ...ans, isCorrect: !ans.isCorrect };
      if (exerciseMode === 'radio') return { ...ans, isCorrect: false };
      return ans;
    }));
  };

  const removeAnswer = (id) => setAnswers(answers.filter(ans => ans.id !== id));

  const handleAddAnswer = () => {
    const newId = answers.length > 0 ? Math.max(...answers.map(a => a.id)) + 1 : 1;
    setAnswers([...answers, { id: newId, text: '', isCorrect: false }]);
  };

  const resetExerciseForm = () => {
    setExerciseText('');
    setExercisePoints(1);
    setExerciseMode('checkbox');
    setAnswers([{ id: 1, text: '', isCorrect: true }, { id: 2, text: '', isCorrect: false }]);
    setEditingExerciseIndex(null);
  };

  const loadExerciseIntoEditor = (ex, index) => {
    // Clicking the active question again cancels edit mode
    if (editingExerciseIndex === index) {
      resetExerciseForm();
      return;
    }
    setEditingExerciseIndex(index);
    setExerciseText(ex.question || '');
    setExercisePoints(Number(ex.points) || 1);
    const mode = ex.type === 'text' ? 'optional' : (ex.type === 'radio' || ex.type === 'checkbox' ? ex.type : 'checkbox');
    setExerciseMode(mode);
    if (mode === 'optional') {
      setAnswers([{ id: 1, text: '', isCorrect: false }, { id: 2, text: '', isCorrect: false }]);
      return;
    }
    const opts = Array.isArray(ex.options) ? ex.options : [];
    if (opts.length === 0) {
      setAnswers([{ id: 1, text: '', isCorrect: true }, { id: 2, text: '', isCorrect: false }]);
      return;
    }
    setAnswers(opts.map((opt, i) => ({
      id: i + 1,
      text: opt.label || opt.value || opt.text || '',
      isCorrect: Boolean(opt.is_correct ?? opt.isCorrect),
    })));
  };

  const addExerciseToBuffer = () => {
    if (!exerciseText.trim()) return pushFeedback('Please type an exercise question.', 'error');
    const newExercise = {
      question: exerciseText,
      type: exerciseMode === 'optional' ? 'text' : exerciseMode,
      options: exerciseMode !== 'optional' ? answers.map(a => ({ label: a.text, value: a.text, is_correct: a.isCorrect })) : null,
      correct_answer: exerciseMode !== 'optional' ? answers.filter(a => a.isCorrect).map(a => a.text).join(', ') : null,
      points: Number(exercisePoints) || 1
    };

    if (editingExerciseIndex != null) {
      setBufferedExercises((prev) => prev.map((ex, i) => (i === editingExerciseIndex ? newExercise : ex)));
      resetExerciseForm();
      pushFeedback('Exercise updated.', 'success');
      return;
    }

    setBufferedExercises((prev) => [...prev, newExercise]);
    resetExerciseForm();
    pushFeedback('Task added to Chapter buffer.', 'success');
  };

  const removeBufferedExercise = (index) => {
    setBufferedExercises((prev) => prev.filter((_, i) => i !== index));
    setSelectedExerciseIndexes((prev) => {
      const next = new Set();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
    if (editingExerciseIndex === index) resetExerciseForm();
    else if (editingExerciseIndex != null && editingExerciseIndex > index) {
      setEditingExerciseIndex((current) => current - 1);
    }
  };

  const toggleExerciseSelected = (index, event) => {
    event.stopPropagation();
    setSelectedExerciseIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleSelectAllExercises = () => {
    setSelectedExerciseIndexes((prev) => {
      if (prev.size === bufferedExercises.length) return new Set();
      return new Set(bufferedExercises.map((_, i) => i));
    });
  };

  const removeSelectedExercises = () => {
    if (selectedExerciseIndexes.size === 0) return;
    setBufferedExercises((prev) => prev.filter((_, i) => !selectedExerciseIndexes.has(i)));
    if (editingExerciseIndex != null && selectedExerciseIndexes.has(editingExerciseIndex)) {
      resetExerciseForm();
    } else if (editingExerciseIndex != null) {
      const removedBefore = [...selectedExerciseIndexes].filter((i) => i < editingExerciseIndex).length;
      setEditingExerciseIndex(editingExerciseIndex - removedBefore);
    }
    setSelectedExerciseIndexes(new Set());
    pushFeedback('Selected exercises removed.', 'success');
  };

  // --- API Submission Flow ---
  const saveWeekAndChapter = async (advanceStep = false) => {
    if (!courseId) {
      return pushFeedback('Course ID is missing. Please go back to Step 1 and hit Save.', 'error');
    }

    if (!weekDraft.title.trim()) {
      return pushFeedback('Week title is required.', 'error');
    }
    if (weekMode === 'existing' && !selectedWeekId) {
      return pushFeedback('Please select an existing week.', 'error');
    }
    if (chapterMode === 'existing' && !selectedChapterId) {
      return pushFeedback('Please select a chapter to edit.', 'error');
    }
    if (!chapterDraft.title.trim()) {
      return pushFeedback('Chapter title is required.', 'error');
    }
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      let weekId = selectedWeekId;
      let weekNumber = weekDraft.weekNumber;

      const weekPayload = {
        title: weekDraft.title,
        description: weekDraft.description || 'Weekly objectives',
        learning_objectives: weekDraft.learningObjectives
          ? weekDraft.learningObjectives.split(',').map((o) => o.trim()).filter(Boolean)
          : [weekDraft.description || 'Weekly objectives'],
        week_number: Number(weekDraft.weekNumber),
        duration_days: Number(weekDraft.durationDays) || 7,
      };

      if (weekMode === 'new') {
        // 1. Create Week (Pure JSON)
        const weekRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/weeks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(weekPayload),
        });
        const weekData = await weekRes.json();
        if (!weekRes.ok) throw new Error(weekData.message || 'Failed to create week.');
        weekId = weekData?.data?.id || weekData?.id;
        weekNumber = Number(weekDraft.weekNumber);
      } else {
        // 1b. Update existing week details
        const weekRes = await fetch(`${API_BASE_URL}/api/weeks/${weekId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(weekPayload),
        });
        const weekData = await weekRes.json().catch(() => ({}));
        if (!weekRes.ok) throw new Error(weekData.message || 'Failed to update week.');
        weekNumber = Number(weekDraft.weekNumber);
      }

      // 2. Create or Update Chapter (FormData allowed)
      const formData = new FormData();
      formData.append('title', chapterDraft.title);
      formData.append('subtitle', chapterDraft.subtitle || "Chapter Subtitle");
      formData.append('description', chapterDraft.description || "Chapter Content");
      formData.append('intro_message', chapterDraft.intro_message || "");
      formData.append('video_url', chapterDraft.video_url || "");
      formData.append('duration', Number(chapterDraft.duration) || 0);
      formData.append('week_number', Number(weekNumber));
      formData.append('week_id', Number(weekId));
      if (chapterThumbnail) formData.append('thumbnail', chapterThumbnail);

      // Append retained uploaded attachments as JSON string
      formData.append('attachments', JSON.stringify(uploadedAttachments));

      // Append newly selected files
      pendingAttachments.forEach(file => {
        formData.append('files', file);
      });

      let chapterRes;
      if (chapterMode === 'new') {
        chapterRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/chapters`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
        });
      } else {
        chapterRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/chapters/${selectedChapterId}`, {
          method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: formData
        });
      }

      const chapterData = await chapterRes.json();
      if (!chapterRes.ok) throw new Error(chapterData.message || 'Failed to save chapter.');
      const newChapterId = chapterMode === 'new' ? (chapterData?.data?.id || chapterData?.id) : selectedChapterId;

      // 3. Post Exercises (Pure JSON) - Only POST newly added exercises
      let finalExercises = [...bufferedExercises];
      if (exerciseText.trim()) {
        const correctAnswersStr = answers.filter(a => a.isCorrect).map(a => a.text).join(', ');
        finalExercises.push({
          question: exerciseText,
          type: exerciseMode === 'optional' ? 'text' : exerciseMode,
          options: exerciseMode !== 'optional' ? answers.map(a => ({ label: a.text, value: a.text, is_correct: a.isCorrect })) : null,
          correct_answer: exerciseMode !== 'optional' ? correctAnswersStr : null,
          points: Number(exercisePoints) || 1,
          isExisting: false
        });
      }

      const newExercises = finalExercises.filter(ex => !ex.isExisting);

      if (newChapterId && newExercises.length > 0) {
        for (let i = 0; i < newExercises.length; i++) {
          const exPayload = {
            question: newExercises[i].question,
            type: newExercises[i].type,
            options: newExercises[i].options,
            correct_answer: newExercises[i].correct_answer,
            points: newExercises[i].points,
            order_index: i + 1
          };

          const exRes = await fetch(`${API_BASE_URL}/api/chapters/${newChapterId}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(exPayload)
          });

          if (!exRes.ok) {
            const errData = await exRes.json().catch(() => ({}));
            console.error("Exercise Save Error:", errData);
            throw new Error(errData.message || `Failed to save task ${i + 1}.`);
          }
        }
      }

      // 4. Reload Structure and Reset Drafts
      await loadCourseStructure(false);

      setChapterDraft({ title: '', subtitle: '', intro_message: '', description: '', video_url: '', duration: 0 });
      setChapterThumbnail(null);
      setThumbnailPreview('');
      setBufferedExercises([]);
      setExerciseText('');
      setExercisePoints(1);
      setChapterMode('new');
      setSelectedChapterId('');
      setUploadedAttachments([]);
      setPendingAttachments([]);

      pushFeedback(chapterMode === 'new' ? 'Content added to Curriculum successfully.' : 'Chapter updated successfully.', 'success');
      if (advanceStep) {
        setActiveStep('pricing');
      } else {
        if (weekMode === 'new' && weekId) {
          setWeekMode('existing');
          setSelectedWeekId(String(weekId));
          setWeekDraft({
            title: weekDraft.title,
            description: weekDraft.description || '',
            weekNumber: Number(weekDraft.weekNumber),
            durationDays: Number(weekDraft.durationDays) || 7,
            learningObjectives: weekDraft.learningObjectives || ''
          });
        }
      }

    } catch (error) {
      pushFeedback(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWeek = savedStructure.find(w => String(w.id) === String(selectedWeekId));
  const chaptersInWeek = selectedWeek ? (selectedWeek.chapters || []) : [];

  return (
    <div className="prof-step-pane is-active animate-fade-in">
      <div className="prof-grid-two-unequal">

        {/* Left Column: Form to Add Chapter */}
        <div className="prof-editor-pane">
          <div className="prof-settings-panel-premium">
            <h4 className="prof-settings-panel-title">Week Settings</h4>

            {savedStructure.length > 0 && (
              <div className="prof-segment-control" role="group" aria-label="Week mode">
                <button
                  type="button"
                  className={`prof-segment-btn ${weekMode === 'new' ? 'is-active' : ''}`}
                  onClick={() => {
                    setWeekMode('new');
                    const highestWeek = savedStructure.length > 0 ? Math.max(...savedStructure.map(w => w.week_number)) : 0;
                    setWeekDraft({
                      title: `Week ${highestWeek + 1}`,
                      description: '',
                      weekNumber: highestWeek + 1,
                      durationDays: 7,
                      learningObjectives: ''
                    });
                    setSelectedWeekId('');
                    // Reset Chapter Form
                    setChapterMode('new');
                    setSelectedChapterId('');
                    setChapterDraft({ title: '', subtitle: '', intro_message: '', description: '', video_url: '', duration: 0 });
                    setChapterThumbnail(null);
                    setThumbnailPreview('');
                    setBufferedExercises([]);
                    setUploadedAttachments([]);
                    setPendingAttachments([]);
                  }}
                >
                  Create New Week
                </button>
                <button
                  type="button"
                  className={`prof-segment-btn ${weekMode === 'existing' ? 'is-active' : ''}`}
                  onClick={() => {
                    setWeekMode('existing');
                    if (savedStructure.length > 0) {
                      const firstWeek = savedStructure[0];
                      setSelectedWeekId(String(firstWeek.id));
                      setWeekDraft({
                        title: firstWeek.title,
                        description: firstWeek.description || '',
                        weekNumber: firstWeek.week_number || 1,
                        durationDays: firstWeek.duration_days || 7,
                        learningObjectives: Array.isArray(firstWeek.learning_objectives)
                          ? firstWeek.learning_objectives.join(', ')
                          : ''
                      });
                      // Reset Chapter Form
                      setChapterMode('new');
                      setSelectedChapterId('');
                      setChapterDraft({ title: '', subtitle: '', intro_message: '', description: '', video_url: '', duration: 0 });
                      setChapterThumbnail(null);
                      setThumbnailPreview('');
                      setBufferedExercises([]);
                      setUploadedAttachments([]);
                      setPendingAttachments([]);
                    }
                  }}
                >
                  Add to Existing Week
                </button>
              </div>
            )}

            {weekMode === 'existing' && (
              <div className="prof-field-group" style={{ marginBottom: '16px' }}>
                <label className="prof-field-label">Select Existing Week</label>
                <div className="dropdown prof-generic-dropdown">
                  <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="prof-dropdown-value">
                      {savedStructure.find(w => String(w.id) === String(selectedWeekId))?.title || '-- Select an Existing Week --'}
                    </span>
                    <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <ul className="dropdown-menu prof-dropdown-menu-premium" style={{ width: '100%' }}>
                    {savedStructure.map(w => (
                      <li key={w.id}>
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => {
                            setSelectedWeekId(String(w.id));
                            setWeekDraft({
                              title: w.title,
                              description: w.description || '',
                              weekNumber: w.week_number || 1,
                              durationDays: w.duration_days || 7,
                              learningObjectives: Array.isArray(w.learning_objectives)
                                ? w.learning_objectives.join(', ')
                                : ''
                            });
                            // Reset Chapter Form
                            setChapterMode('new');
                            setSelectedChapterId('');
                            setChapterDraft({ title: '', subtitle: '', intro_message: '', description: '', video_url: '', duration: 0 });
                            setChapterThumbnail(null);
                            setThumbnailPreview('');
                            setBufferedExercises([]);
                            setUploadedAttachments([]);
                            setPendingAttachments([]);
                          }}
                        >
                          {w.title} (Week {w.week_number})
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="prof-field-group" style={{ margin: 0 }}>
                <label className="prof-field-label">Week Name</label>
                <input className="prof-step-input-premium" type="text" placeholder="e.g. Week 1: Basics" value={weekDraft.title} onChange={(e) => handleWeekChange('title', e.target.value)} />
              </div>
              <div className="prof-field-group" style={{ margin: 0 }}>
                <label className="prof-field-label">Week Number</label>
                <input className="prof-step-input-premium" type="number" min="1" value={weekDraft.weekNumber} onChange={(e) => handleWeekChange('weekNumber', e.target.value)} />
              </div>
              <div className="prof-field-group" style={{ margin: 0 }}>
                <label className="prof-field-label">Duration (Days)</label>
                <input className="prof-step-input-premium" type="number" min="1" value={weekDraft.durationDays} onChange={(e) => handleWeekChange('durationDays', e.target.value)} />
              </div>
            </div>

            <div className="prof-field-group" style={{ margin: '0 0 16px 0' }}>
              <label className="prof-field-label">Week Description</label>
              <textarea className="prof-step-input-premium" rows="2" placeholder="Brief summary of this week..." value={weekDraft.description} onChange={(e) => handleWeekChange('description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>

            <div className="prof-field-group" style={{ margin: 0 }}>
              <label className="prof-field-label">Learning Objectives (Comma separated)</label>
              <input className="prof-step-input-premium" type="text" placeholder="e.g. Understand JS context, Master loops, Learn scopes" value={weekDraft.learningObjectives} onChange={(e) => handleWeekChange('learningObjectives', e.target.value)} />
            </div>
          </div>

          <h4 className="prof-section-divider-title">1. Chapter Content</h4>

          {weekMode === 'existing' && selectedWeekId && chaptersInWeek.length > 0 && (
            <div className="prof-segment-control" role="group" aria-label="Chapter mode">
              <button
                type="button"
                className={`prof-segment-btn ${chapterMode === 'new' ? 'is-active' : ''}`}
                onClick={() => {
                  setChapterMode('new');
                  setChapterDraft({ title: '', subtitle: '', intro_message: '', description: '', video_url: '', duration: 0 });
                  setChapterThumbnail(null);
                  setThumbnailPreview('');
                  setBufferedExercises([]);
                  setSelectedChapterId('');
                  setUploadedAttachments([]);
                  setPendingAttachments([]);
                }}
              >
                Create New Chapter
              </button>
              <button
                type="button"
                className={`prof-segment-btn ${chapterMode === 'existing' ? 'is-active' : ''}`}
                onClick={() => {
                  setChapterMode('existing');
                  if (chaptersInWeek.length > 0) {
                    const firstChap = chaptersInWeek[0];
                    handleSelectChapter(selectedWeekId, firstChap);
                  }
                }}
              >
                Edit Existing Chapter
              </button>
            </div>
          )}

          {chapterMode === 'existing' && weekMode === 'existing' && selectedWeekId && chaptersInWeek.length > 0 && (
            <div className="prof-field-group" style={{ marginBottom: '16px' }}>
              <label className="prof-field-label">Select Existing Chapter</label>
              <div className="dropdown prof-generic-dropdown">
                <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="prof-dropdown-value">
                    {chaptersInWeek.find(c => String(c.id) === String(selectedChapterId))?.title || '-- Select an Existing Chapter --'}
                  </span>
                  <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <ul className="dropdown-menu prof-dropdown-menu-premium" style={{ width: '100%' }}>
                  {chaptersInWeek.map(c => (
                    <li key={c.id}>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => {
                          handleSelectChapter(selectedWeekId, c);
                        }}
                      >
                        {c.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="prof-field-group">
            <label className="prof-field-label">Chapter Thumbnail (Optional)</label>
            {thumbnailPreview ? (
              <div className="prof-chapter-thumbnail-card">
                <img src={thumbnailPreview} alt="Preview" className="prof-chapter-thumbnail-image" />
                <button
                  type="button"
                  className="prof-chapter-thumbnail-remove"
                  onClick={() => {
                    setChapterThumbnail(null);
                    setThumbnailPreview('');
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <div
                className={`prof-chapter-upload-dropzone ${isDraggingThumbnail ? 'is-dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingThumbnail(true); }}
                onDragLeave={() => setIsDraggingThumbnail(false)}
                onDrop={handleThumbnailDrop}
                onClick={() => chapterFileInputRef.current?.click()}
              >
                <input type="file" ref={chapterFileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleThumbnailSelect} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Upload cover picture</span>
              </div>
            )}
          </div>

          <div className="prof-grid-two">
            <div className="prof-field-group">
              <label className="prof-field-label">Chapter Title</label>
              <input className="prof-step-input-premium" type="text" placeholder="e.g. Understanding Variables" value={chapterDraft.title} onChange={(e) => handleChapterDraftChange('title', e.target.value)} />
            </div>
            <div className="prof-field-group">
              <label className="prof-field-label">Chapter Subtitle</label>
              <input className="prof-step-input-premium" type="text" placeholder="e.g. Variables and Memory Scopes" value={chapterDraft.subtitle} onChange={(e) => handleChapterDraftChange('subtitle', e.target.value)} />
            </div>
          </div>

          <div className="prof-grid-two">
            <div className="prof-field-group">
              <label className="prof-field-label">Video URL (Optional)</label>
              <input className="prof-step-input-premium" type="text" placeholder="e.g. https://youtube.com/..." value={chapterDraft.video_url} onChange={(e) => handleChapterDraftChange('video_url', e.target.value)} />
            </div>
            <div className="prof-field-group">
              <label className="prof-field-label">Duration (Minutes)</label>
              <input className="prof-step-input-premium" type="number" min="0" value={chapterDraft.duration} onChange={(e) => handleChapterDraftChange('duration', e.target.value)} />
            </div>
          </div>

          <div className="prof-field-group">
            <label className="prof-field-label">Chapter Welcome / Intro Message</label>
            <div className="prof-quill-wrapper-premium">
              <ReactQuill
                theme="snow"
                modules={quillModules}
                value={chapterDraft.intro_message}
                onChange={(val) => handleChapterDraftChange('intro_message', val)}
                placeholder="Welcome message for this chapter..."
              />
            </div>
          </div>

          <div className="prof-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="prof-field-label" style={{ margin: 0 }}>Chapter Lesson (Reading / Video Description)</label>
              <div>
                <button
                  type="button"
                  className="prof-btn-add-attachment"
                  onClick={() => attachmentFileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'transparent',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: '#4B5563',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  Add an attachment
                </button>
                <input
                  type="file"
                  ref={attachmentFileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  onChange={handleAttachmentSelect}
                />
              </div>
            </div>
            <div className="prof-quill-wrapper-premium">
              <ReactQuill 
                ref={quillRef}
                theme="snow" 
                modules={quillModules} 
                value={chapterDraft.description} 
                onChange={(val) => handleChapterDraftChange('description', val)} 
                placeholder="Type the main lesson content..." 
              />
            </div>
          </div>

          {/* Attachments Section */}
          {(uploadedAttachments.length > 0 || pendingAttachments.length > 0) && (
            <div className="prof-attachments-section">
              <label className="prof-field-label">Attachments ({uploadedAttachments.length + pendingAttachments.length})</label>
              <div className="prof-attachments-grid">
                
                {/* Uploaded attachments */}
                {uploadedAttachments.map((file, idx) => {
                  const isImage = file.file_type?.startsWith('image/');
                  const fileUrlString = file.file_path.startsWith('http') ? file.file_path : `${API_BASE_URL}${file.file_path}`;
                  return (
                    <div key={`uploaded-${idx}`} className="prof-attachment-card">
                      <div className="prof-attachment-preview">
                        {isImage ? (
                          <img src={fileUrlString} alt={file.file_name} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#7483A4' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                              {file.file_type?.split('/')[1] || 'FILE'}
                            </span>
                          </div>
                        )}
                        
                        <button
                          type="button"
                          className="prof-attachment-remove"
                          onClick={() => {
                            setUploadedAttachments(prev => prev.filter((_, i) => i !== idx));
                          }}
                          title="Remove attachment"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="prof-attachment-info">
                        <span className="prof-attachment-name" title={file.file_name}>
                          {file.file_name}
                        </span>
                        {isImage && (
                          <button
                            type="button"
                            className="prof-attachment-insert-inline"
                            onClick={() => insertImageInline(fileUrlString)}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Insert inline
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Pending attachments */}
                {pendingAttachments.map((file, idx) => {
                  const isImage = file.type?.startsWith('image/');
                  const previewUrl = isImage ? URL.createObjectURL(file) : '';
                  return (
                    <div key={`pending-${idx}`} className="prof-attachment-card">
                      <div className="prof-attachment-preview">
                        {isImage ? (
                          <img src={previewUrl} alt={file.name} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#7483A4' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                              {file.type?.split('/')[1] || 'FILE'}
                            </span>
                          </div>
                        )}
                        
                        <div className="prof-attachment-pending-badge">
                          Pending
                        </div>

                        <button
                          type="button"
                          className="prof-attachment-remove"
                          onClick={() => {
                            setPendingAttachments(prev => prev.filter((_, i) => i !== idx));
                          }}
                          title="Remove attachment"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="prof-attachment-info">
                        <span className="prof-attachment-name" title={file.name}>
                          {file.name}
                        </span>
                        {isImage && (
                          <button
                            type="button"
                            className="prof-attachment-insert-inline"
                            onClick={() => {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                insertImageInline(e.target.result);
                              };
                              reader.readAsDataURL(file);
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Insert inline
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

          <h4 className="prof-section-divider-title">2. Chapter Exercises</h4>

          {bufferedExercises.length > 0 && (
            <div className="prof-exercises-buffer-list">
              <div className="prof-exercises-buffer-toolbar">
                <label className="prof-exercises-buffer-select-all">
                  <input
                    type="checkbox"
                    checked={selectedExerciseIndexes.size > 0 && selectedExerciseIndexes.size === bufferedExercises.length}
                    onChange={toggleSelectAllExercises}
                  />
                  <span>
                    {selectedExerciseIndexes.size > 0
                      ? `${selectedExerciseIndexes.size} selected`
                      : `${bufferedExercises.length} question${bufferedExercises.length === 1 ? '' : 's'}`}
                  </span>
                </label>
                {selectedExerciseIndexes.size > 0 ? (
                  <button type="button" className="prof-exercises-buffer-bulk-remove" onClick={removeSelectedExercises}>
                    Delete selected
                  </button>
                ) : (
                  <span className="prof-exercises-buffer-hint">Click to edit · click again to cancel</span>
                )}
              </div>

              {bufferedExercises.map((ex, idx) => {
                const isEditing = editingExerciseIndex === idx;
                const isSelected = selectedExerciseIndexes.has(idx);
                return (
                  <div
                    key={idx}
                    className={`prof-exercise-buffer-card${isEditing ? ' is-editing' : ''}${isSelected ? ' is-selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => loadExerciseIntoEditor(ex, idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        loadExerciseIntoEditor(ex, idx);
                      }
                    }}
                  >
                    <label className="prof-exercise-buffer-check" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleExerciseSelected(idx, e)}
                        aria-label={`Select exercise ${idx + 1}`}
                      />
                    </label>
                    <div className="prof-exercise-buffer-content">
                      <span className="prof-exercise-type-tag">{ex.type} ({ex.points} pts)</span>
                      <p>{ex.question}</p>
                      {isEditing ? <span className="prof-exercise-editing-badge">Editing</span> : null}
                    </div>
                    <div className="prof-exercise-buffer-actions">
                      <button
                        type="button"
                        className="prof-exercise-buffer-edit"
                        title={isEditing ? 'Cancel edit' : 'Edit question'}
                        onClick={(e) => {
                          e.stopPropagation();
                          loadExerciseIntoEditor(ex, idx);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="prof-exercise-buffer-remove"
                        title="Delete question"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBufferedExercise(idx);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={`prof-exercise-creator-card${editingExerciseIndex != null ? ' is-editing-form' : ''}`}>
            <div className="prof-field-group">
              <label className="prof-field-label">
                {editingExerciseIndex != null ? `Edit Question #${editingExerciseIndex + 1}` : 'New Question'}
              </label>
              <textarea className="prof-step-textarea-premium" rows="2" placeholder="Type the exercise question..." value={exerciseText} onChange={(e) => setExerciseText(e.target.value)}></textarea>
            </div>

            <div className="prof-grid-two" style={{ gap: '16px', marginBottom: '16px' }}>
              <div className="prof-field-group" style={{ margin: 0 }}>
                <label className="prof-field-label">Question Type</label>
                <div className="prof-exercise-type-selector" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className={`prof-type-pill ${exerciseMode === 'checkbox' ? 'is-active' : ''}`}
                    onClick={() => setExerciseMode('checkbox')}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                  >
                    MCQ
                  </button>
                  <button
                    type="button"
                    className={`prof-type-pill ${exerciseMode === 'radio' ? 'is-active' : ''}`}
                    onClick={() => setExerciseMode('radio')}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                  >
                    SCQ
                  </button>
                  <button
                    type="button"
                    className={`prof-type-pill ${exerciseMode === 'optional' ? 'is-active' : ''}`}
                    onClick={() => setExerciseMode('optional')}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                  >
                    Written
                  </button>
                </div>
              </div>
              <div className="prof-field-group" style={{ margin: 0 }}>
                <label className="prof-field-label">Points</label>
                <input
                  className="prof-step-input-premium"
                  type="number"
                  min="1"
                  value={exercisePoints}
                  onChange={(e) => setExercisePoints(Number(e.target.value) || 1)}
                />
              </div>
            </div>

            {exerciseMode !== 'optional' && (
              <div className="prof-exercise-options-list">
                {answers.map((ans) => (
                  <div key={ans.id} className={`prof-exercise-option-item ${ans.isCorrect ? 'is-correct' : ''}`}>
                    <input
                      type={exerciseMode === 'radio' ? 'radio' : 'checkbox'}
                      name={exerciseMode === 'radio' ? 'prof-ex-answer' : `prof-ex-answer-${ans.id}`}
                      checked={ans.isCorrect}
                      onChange={() => toggleAnswerCorrectness(ans.id)}
                      className="prof-exercise-option-checkbox"
                      title="Mark as correct answer"
                    />
                    <input
                      type="text"
                      placeholder="Type option value here..."
                      value={ans.text}
                      onChange={(e) => setAnswers(answers.map(a => a.id === ans.id ? { ...a, text: e.target.value } : a))}
                      className="prof-exercise-option-input"
                    />
                    <button type="button" className="prof-exercise-option-remove" onClick={() => removeAnswer(ans.id)} title="Remove Option">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="prof-exercise-creator-actions">
              {exerciseMode !== 'optional' ? (
                <button type="button" onClick={handleAddAnswer} className="prof-btn-add-option">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Add Option
                </button>
              ) : <div></div>}

              <div className="prof-exercise-creator-actions-right">
                {editingExerciseIndex != null ? (
                  <button type="button" onClick={resetExerciseForm} className="prof-btn-cancel-edit">
                    Cancel edit
                  </button>
                ) : null}
                <button type="button" onClick={addExerciseToBuffer} className="prof-btn-attach-question">
                  {editingExerciseIndex != null ? 'Update Question' : 'Attach Question'}
                </button>
              </div>
            </div>
          </div>

          <button type="button" onClick={() => saveWeekAndChapter(false)} disabled={isSubmitting} className="prof-btn-publish-chapter">
            {isSubmitting
              ? 'Saving to Database...'
              : chapterMode === 'existing'
                ? 'Save Chapter Details'
                : 'Publish Chapter to Database'}
          </button>
        </div>

        {/* Right Column: LIVE Dynamic Curriculum Viewer */}
        <div className="prof-structure-pane">
          <div className="prof-sidebar-card-premium">
            <h4 className="prof-structure-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Course Structure
            </h4>

            {isLoadingStructure ? (
              <p className="prof-structure-loading">Loading saved curriculum...</p>
            ) : savedStructure.length > 0 ? (
              <div className="prof-structure-tree">
                {savedStructure.map((week) => (
                  <div key={week.id} className="prof-tree-week">
                    <div
                      className={`prof-tree-week-header ${weekMode === 'existing' && String(selectedWeekId) === String(week.id) ? 'is-selected-week' : ''}`}
                      onClick={() => {
                        setWeekMode('existing');
                        setSelectedWeekId(String(week.id));
                        setWeekDraft({
                          title: week.title,
                          description: week.description || '',
                          weekNumber: week.week_number || 1,
                          durationDays: week.duration_days || 7,
                          learningObjectives: Array.isArray(week.learning_objectives)
                            ? week.learning_objectives.join(', ')
                            : ''
                        });
                        if (String(selectedWeekId) !== String(week.id)) {
                          setChapterMode('new');
                          setSelectedChapterId('');
                          setChapterDraft({ title: '', subtitle: '', intro_message: '', description: '', video_url: '', duration: 0 });
                          setChapterThumbnail(null);
                          setThumbnailPreview('');
                          setBufferedExercises([]);
                          setUploadedAttachments([]);
                          setPendingAttachments([]);
                        }
                      }}
                    >
                      <svg className="prof-tree-folder-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <strong>{week.title}</strong>
                    </div>
                    {week.chapters && week.chapters.length > 0 ? (
                      <div className="prof-tree-chapters-list">
                        {week.chapters.map(chap => (
                          <div
                            key={chap.id}
                            className={`prof-tree-chapter-item ${chapterMode === 'existing' && String(selectedChapterId) === String(chap.id) ? 'is-selected-chapter' : ''}`}
                            onClick={() => handleSelectChapter(week.id, chap)}
                          >
                            <svg className="prof-tree-file-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span>{chap.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="prof-tree-empty-chapters">No chapters yet</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="prof-structure-empty">
                Your curriculum is currently empty. Use the form on the left to add your first Week and Chapter.
              </p>
            )}

            <div className="prof-structure-helper">
              When you are done building all weeks and chapters, click below to set pricing.
            </div>
          </div>
        </div>
      </div>

      <div className="prof-actions-footer-premium">
        <button type="button" className="prof-btn-primary-premium" onClick={() => setActiveStep('basic')}>Back to Course Profile</button>
        <button type="button" className="prof-btn-primary-premium" onClick={() => setActiveStep('pricing')}>
          Done Building Curriculum &rarr; Go to Pricing
        </button>
      </div>
    </div>
  );
};

export default Curriculum;
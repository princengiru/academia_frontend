import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './prepare-course.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CATEGORIES = [
  { id: 1, name: 'Web Development' },
  { id: 2, name: 'Mobile Development' },
  { id: 3, name: 'Data Science' },
  { id: 4, name: 'Programming Basics' },
  { id: 6, name: 'Mathematics and Science' }
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'RWF'];

const PrepareCourse = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  const feedbackTimerRef = useRef(null);

  const quillModules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const [feedback, setFeedback] = useState({ message: '', tone: 'success', visible: false });

  const pushFeedback = (message, tone = 'success') => {
    setFeedback({ message, tone, visible: true });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback({ message: '', tone: 'success', visible: false });
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const [activeStep, setActiveStep] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track created entity IDs
  const [courseId, setCourseId] = useState(null); 
  const [syllabusId, setSyllabusId] = useState(null);

  const stepOrder = ['basic', 'syllabus', 'weeks', 'pricing', 'review'];
  const getStepIcon = (stepName) => {
    const currentIndex = stepOrder.indexOf(activeStep);
    const thisIndex = stepOrder.indexOf(stepName);
    return thisIndex <= currentIndex ? '/assets/icons/check-circle.svg' : '/assets/icons/no-check-circle.svg';
  };

  // ==========================================
  // STEP 1: BASIC INFO
  // ==========================================
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    categoryId: CATEGORIES[0].id,
    categoryName: CATEGORIES[0].name,
    level: LEVELS[0],
    durationWeeks: 4,
    requiredHours: 6,
    audience: '',
    goals: '',
  });

  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState('');
  const courseFileInputRef = useRef(null);

  // ==========================================
  // STEP 2: SYLLABUS & OUTLINES
  // ==========================================
  const [syllabusDesc, setSyllabusDesc] = useState('');
  const [bufferedOutlines, setBufferedOutlines] = useState([]);
  const [outlineDraft, setOutlineDraft] = useState({ title: '', abstract: '', explanation: '', file: null, thumbnail: null, thumbnailPreview: '' });
  const [isDraggingOutlineFile, setIsDraggingOutlineFile] = useState(false); 
  
  const outlineFileInputRef = useRef(null);
  const outlineThumbnailInputRef = useRef(null);
  const [currentOutlineIndex, setCurrentOutlineIndex] = useState(1);

  // ==========================================
  // STEP 3: CURRICULUM BUILDER
  // ==========================================
  const [currentWeekIndex, setCurrentWeekIndex] = useState(1);
  const [weekDraft, setWeekDraft] = useState({ title: 'Week 1', description: '', weekNumber: 1 });
  const [chapterDraft, setChapterDraft] = useState({ title: '', subtitle: '', intro_message: '', description: '' });
  
  const [chapterThumbnail, setChapterThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const chapterFileInputRef = useRef(null); 

  const [bufferedExercises, setBufferedExercises] = useState([]);
  const [exerciseMode, setExerciseMode] = useState('checkbox');
  const [exerciseText, setExerciseText] = useState('');
  const [answers, setAnswers] = useState([
    { id: 1, text: '', isCorrect: true },
    { id: 2, text: '', isCorrect: false },
  ]);

  // ==========================================
  // STEP 4: PRICING
  // ==========================================
  const [pricing, setPricing] = useState({ isFree: false, amount: 50, currency: CURRENCIES[0] });

  // --- Handlers ---
  const handleBasicInfoChange = (field, value) => setBasicInfo(prev => ({ ...prev, [field]: value }));
  const handleWeekChange = (field, value) => setWeekDraft(prev => ({ ...prev, [field]: value }));
  const handleChapterDraftChange = (field, value) => setChapterDraft(prev => ({ ...prev, [field]: value }));
  const handleOutlineDraftChange = (field, value) => setOutlineDraft(prev => ({ ...prev, [field]: value }));

  const processImageFile = (file, setFile, setPreview) => {
    if (file && file.type.startsWith('image/')) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      pushFeedback('Please upload a valid image file.', 'error');
    }
  };

  const handleOutlineFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingOutlineFile(false);
    if (e.dataTransfer.files?.length > 0) setOutlineDraft(prev => ({ ...prev, file: e.dataTransfer.files[0] }));
  };

  const handleOutlineFileSelect = (e) => {
    if (e.target.files?.length > 0) setOutlineDraft(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const addOutlineToBuffer = () => {
    if (!outlineDraft.title.trim()) return pushFeedback('Topic title is required.', 'error');
    setBufferedOutlines(prev => [...prev, { ...outlineDraft }]);
    setOutlineDraft({ title: '', abstract: '', explanation: '', file: null, thumbnail: null, thumbnailPreview: '' });
    if (outlineFileInputRef.current) outlineFileInputRef.current.value = '';
    if (outlineThumbnailInputRef.current) outlineThumbnailInputRef.current.value = '';
    setCurrentOutlineIndex(prev => prev + 1);
    pushFeedback('Topic added to Syllabus buffer.', 'success');
  };
  const removeBufferedOutline = (idx) => setBufferedOutlines(prev => prev.filter((_, i) => i !== idx));

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
  const addExerciseToBuffer = () => {
    if (!exerciseText.trim()) return pushFeedback('Please type an exercise question.', 'error');
    const newExercise = {
      question: exerciseText, 
      type: exerciseMode === 'optional' ? 'text' : exerciseMode, 
      options: exerciseMode !== 'optional' ? answers.map(a => ({ label: a.text, value: a.text, is_correct: a.isCorrect })) : null,
      correct_answer: exerciseMode !== 'optional' ? answers.filter(a => a.isCorrect).map(a => a.text).join(', ') : null,
      points: 1
    };
    setBufferedExercises(prev => [...prev, newExercise]);
    setExerciseText('');
    setAnswers([{ id: 1, text: '', isCorrect: false }, { id: 2, text: '', isCorrect: false }]);
    pushFeedback('Task added to Chapter buffer.', 'success');
  };
  const removeBufferedExercise = (index) => setBufferedExercises(prev => prev.filter((_, i) => i !== index));

  // ==========================================
  // API SUBMISSION FLOW
  // ==========================================

  const saveBasicInfo = async () => {
    if (!basicInfo.title || basicInfo.title.trim() === '') {
      return pushFeedback('Course title is required.', 'error');
    }
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      // 1. MUST SEND JSON FIRST to bypass "Title is Required" error and get the ID!
      const payload = {
        title: basicInfo.title,
        category_id: Number(basicInfo.categoryId),
        category: basicInfo.categoryName,
        level: basicInfo.level.toLowerCase(),
        education_level: basicInfo.level,
        duration_weeks: Number(basicInfo.durationWeeks),
        required_hours_per_week: Number(basicInfo.requiredHours),
        target_audience: basicInfo.audience,
        objectives: basicInfo.goals,
        status: 'draft'
      };

      const res = await fetch(courseId ? `${API_BASE_URL}/api/courses/${courseId}` : `${API_BASE_URL}/api/courses`, {
        method: courseId ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }, 
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create course.');

      const extractedId = courseId || data?.data?.id || data?.id || data?.course?.id;
      console.log("🔥 STEP 1: Course ID generated successfully:", extractedId);

      if (!extractedId) {
        throw new Error("Backend did not return a valid Course ID.");
      }
      setCourseId(extractedId);

      // 2. NOW THAT WE HAVE THE ID, attach the thumbnail via FormData
      if (courseThumbnail && extractedId) {
        try {
          const thumbData = new FormData();
          thumbData.append('thumbnail', courseThumbnail);
          // Note: In many backends, updating with a file requires a PUT request or POST with a _method flag.
          thumbData.append('_method', 'PUT'); 

          await fetch(`${API_BASE_URL}/api/courses/${extractedId}`, {
            method: 'POST', // Using POST to accommodate standard multipart form updates
            headers: { Authorization: `Bearer ${token}` }, 
            body: thumbData
          });
          console.log("🔥 STEP 1B: Thumbnail submitted successfully.");
        } catch (e) { 
          console.warn("Thumbnail upload encountered an issue:", e); 
        }
      }
      
      pushFeedback('Course basics saved successfully.');
      setActiveStep('syllabus');
    } catch (error) { 
      pushFeedback(error.message, 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const saveSyllabusAndOutlines = async (advanceStep = true) => {
    if (!courseId) {
      return pushFeedback('Course ID is missing. Please go back to Step 1 and hit Save.', 'error');
    }

    if (bufferedOutlines.length === 0 && !outlineDraft.title.trim()) {
      return pushFeedback('Please add at least one topic to the syllabus.', 'error');
    }
    
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      let activeSylId = syllabusId;
      
      // JSON Payload for Syllabus Wrapper
      const sylPayload = {
        course_id: Number(courseId),
        title: `${basicInfo.title} - Syllabus`,
        content: syllabusDesc || "Course outline and topics.",
        version: 1,
        description: syllabusDesc || "Complete guide to the course.",
        category_id: Number(basicInfo.categoryId),
        education_level: basicInfo.level,
        target_audience: basicInfo.audience || "Students",
        objectives: basicInfo.goals || "Learning objectives",
        subscription_price: 0,
        price: 0
      };

      const sylRes = await fetch(activeSylId ? `${API_BASE_URL}/api/syllabuses/${activeSylId}` : `${API_BASE_URL}/api/syllabuses`, {
        method: activeSylId ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(sylPayload)
      });

      const sylData = await sylRes.json();
      if (!sylRes.ok) throw new Error(sylData.message || 'Failed to save syllabus.');
      
      activeSylId = activeSylId || sylData?.data?.id || sylData?.id;
      if (!syllabusId && activeSylId) setSyllabusId(activeSylId);

      const outlinesToSave = [...bufferedOutlines];
      if (outlineDraft.title.trim()) outlinesToSave.push({ ...outlineDraft });

      // Post Outlines (FormData allowed here per DB schema)
      for (let i = 0; i < outlinesToSave.length; i++) {
        const outline = outlinesToSave[i];
        const outData = new FormData();
        
        outData.append('title', outline.title);
        outData.append('description', outline.abstract); 
        outData.append('explanation', outline.explanation); 
        outData.append('order_index', Number(i + 1)); 
        
        if (outline.file) outData.append('file', outline.file); 
        if (outline.thumbnail) outData.append('thumbnail', outline.thumbnail);

        await fetch(`${API_BASE_URL}/api/syllabuses/${activeSylId}/outlines`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: outData
        });
      }

      setBufferedOutlines([]);
      setOutlineDraft({ title: '', abstract: '', explanation: '', file: null, thumbnail: null, thumbnailPreview: '' });

      pushFeedback('Syllabus configured successfully.');
      if (advanceStep) {
        setActiveStep('weeks');
      } else {
        setCurrentOutlineIndex(prev => prev + outlinesToSave.length);
      }
    } catch (error) { 
      pushFeedback(error.message, 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const saveWeekAndChapter = async (advanceStep = false) => {
    if (!courseId) {
      return pushFeedback('Course ID is missing. Please go back to Step 1 and hit Save.', 'error');
    }

    if (!weekDraft.title.trim() || !chapterDraft.title.trim()) {
      return pushFeedback('Week title and Chapter title are required.', 'error');
    }
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      // 1. Create Week (Pure JSON)
      const weekRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/weeks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          title: weekDraft.title, 
          description: weekDraft.description, 
          learning_objectives: weekDraft.description, 
          week_number: Number(weekDraft.weekNumber)
        }) 
      });
      const weekData = await weekRes.json();
      if (!weekRes.ok) throw new Error(weekData.message || 'Failed to create week.');
      const weekId = weekData?.data?.id;
      
      // 2. Create Chapter (FormData allowed)
      const formData = new FormData();
      formData.append('title', chapterDraft.title);
      formData.append('subtitle', chapterDraft.subtitle);
      formData.append('description', chapterDraft.description);
      formData.append('intro_message', chapterDraft.intro_message);
      formData.append('week_number', weekDraft.weekNumber); 
      formData.append('week_id', weekId); 
      if (chapterThumbnail) formData.append('thumbnail', chapterThumbnail);

      const chapterRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/chapters`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      const chapterData = await chapterRes.json();
      if (!chapterRes.ok) throw new Error(chapterData.message || 'Failed to save chapter.');
      const newChapterId = chapterData?.data?.id;

      // 3. Post Exercises (Pure JSON)
      let finalExercises = [...bufferedExercises];
      if (exerciseText.trim()) {
        finalExercises.push({
          question: exerciseText,
          type: exerciseMode === 'optional' ? 'text' : exerciseMode,
          options: exerciseMode !== 'optional' ? answers.map(a => ({ label: a.text, value: a.text, is_correct: a.isCorrect })) : null,
          correct_answer: exerciseMode !== 'optional' ? answers.filter(a => a.isCorrect).map(a => a.text).join(', ') : null,
          points: 1
        });
      }

      if (newChapterId && finalExercises.length > 0) {
        for (let i = 0; i < finalExercises.length; i++) {
          const exPayload = {
            ...finalExercises[i],
            options: finalExercises[i].options ? JSON.stringify(finalExercises[i].options) : null
          };
          const exRes = await fetch(`${API_BASE_URL}/api/chapters/${newChapterId}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(exPayload)
          });
          if (!exRes.ok) throw new Error(`Failed to save exercise #${i + 1}.`);
        }
      }

      setChapterDraft({ title: '', subtitle: '', intro_message: '', description: '' });
      setWeekDraft(prev => ({ ...prev, title: `Week ${Number(prev.weekNumber) + 1}`, weekNumber: Number(prev.weekNumber) + 1, description: '' }));
      setChapterThumbnail(null); setThumbnailPreview('');
      setBufferedExercises([]); setExerciseText('');
      
      pushFeedback('Content added to Curriculum successfully.');
      if (advanceStep) setActiveStep('pricing');
      else setCurrentWeekIndex(prev => prev + 1);
      
    } catch (error) { pushFeedback(error.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const savePricing = async () => {
    if (!courseId) {
      return pushFeedback('Course ID is missing. Please go back to Step 1 and hit Save.', 'error');
    }
    
    setIsSubmitting(true);
    try {
      const payload = { 
        is_free: pricing.isFree, 
        price: pricing.isFree ? 0 : pricing.amount, 
        subscription_price: pricing.isFree ? 0 : pricing.amount,
        currency: pricing.currency 
      };
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save pricing.');
      setActiveStep('review');
    } catch (error) { pushFeedback(error.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const publishCourse = async () => {
    if (!courseId) return pushFeedback('Course ID missing.', 'error');

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/publish`, {
        method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to publish course.');
      navigate('/academia/professor');
    } catch (error) { pushFeedback(error.message, 'error'); } finally { setIsSubmitting(false); }
  };

  return (
    <ProfessorLayout currentPage="prepare-course">
      <section className="prof-page">
        <section className="prof-prepare">
          
          {feedback.visible && (
            <div className={`learners-account-feedback learners-account-feedback-floating is-${feedback.tone}`}>
              {feedback.message}
            </div>
          )}

          <section className="learners-home-title">
            <div className="learners-home-title-top">
              <h1>Prepare Online Course</h1>
              <div className="learners-home-title-actions">
                <a className="learners-btn learners-btn-primary" href="/academia" onClick={(e) => { e.preventDefault(); navigate('/academia'); }}>
                  <span>Exit Builder</span>
                  <img src="/assets/icons/exit-right.svg" alt="" />
                </a>
              </div>
            </div>
          </section>

          <form className={`prof-prepare-card prof-step-${activeStep}`} onSubmit={preventDefault}>
            <div className="prof-prepare-card-head">
              <h2>{courseId ? `Editing: ${basicInfo.title}` : 'Course Builder Workspace'}</h2>
            </div>

            <div className="prof-prepare-steps" aria-label="Steps" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div className={`prof-prepare-step ${activeStep === 'basic' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('basic')} alt="" />
                <span>1. Course Profile</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'syllabus' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('syllabus')} alt="" />
                <span>2. Public Syllabus</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'weeks' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('weeks')} alt="" />
                <span>3. Curriculum Builder</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'pricing' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('pricing')} alt="" />
                <span>4. Pricing</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'review' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('review')} alt="" />
                <span>5. Review & Publish</span>
              </div>
            </div>

            <div className="prof-prepare-body" style={{ padding: '32px' }}>
              
              {/* ========================================== */}
              {/* STEP 1: COURSE PROFILE                     */}
              {/* ========================================== */}
              <div className={`prof-step-pane ${activeStep === 'basic' ? 'is-active' : ''}`}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '8px' }}>Course Marketing Profile</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>This information will be visible on the public course landing page. Make it compelling to attract students.</p>
                </div>

                <div className="prof-field-group">
                  <label style={{ display: 'block', color: '#0F172A', fontWeight: 500, marginBottom: '8px' }}>Course Cover Image</label>
                  <div 
                    className="prof-upload-dropzone" 
                    style={{ border: `1px dashed #CBD5E1`, background: '#fff', borderRadius: '8px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) processImageFile(e.dataTransfer.files[0], setCourseThumbnail, setCourseThumbnailPreview); }}
                    onClick={() => courseFileInputRef.current?.click()}
                  >
                    <input type="file" ref={courseFileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => { if (e.target.files?.length) processImageFile(e.target.files[0], setCourseThumbnail, setCourseThumbnailPreview) }} />
                    <div style={{ background: '#F3E8FF', padding: '12px', borderRadius: '8px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div>
                      {courseThumbnailPreview ? <img src={courseThumbnailPreview} alt="Preview" style={{ maxHeight: '60px', objectFit: 'contain' }} /> : (
                        <>
                          <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.9rem' }}>Drop image here or click to upload.</strong>
                          <span style={{ color: '#64748B', fontSize: '0.8rem' }}>1920x1080 resolution recommended.</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="prof-field-group">
                  <label>Course Title</label>
                  <input className="learners-settings-field-control prof-step-input" type="text" placeholder="e.g. Complete React Developer Course" value={basicInfo.title} onChange={(e) => handleBasicInfoChange('title', e.target.value)} />
                </div>
                
                <div className="prof-grid-two prof-basic-grid">
                  <div className="prof-field-group">
                    <label>Category</label>
                    <div className="dropdown prof-generic-dropdown">
                      <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle prof-step-input" type="button" data-bs-toggle="dropdown">
                        <span className="prof-dropdown-value">{basicInfo.categoryName}</span>
                        <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" />
                      </button>
                      <ul className="dropdown-menu prof-dropdown-menu">
                        {CATEGORIES.map(cat => <li key={cat.id}><button className="dropdown-item" type="button" onClick={() => { handleBasicInfoChange('categoryName', cat.name); handleBasicInfoChange('categoryId', cat.id); }}>{cat.name}</button></li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="prof-field-group">
                    <label>Difficulty Level</label>
                    <div className="dropdown prof-generic-dropdown">
                      <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle prof-step-input" type="button" data-bs-toggle="dropdown">
                        <span className="prof-dropdown-value">{basicInfo.level}</span>
                        <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" />
                      </button>
                      <ul className="dropdown-menu prof-dropdown-menu">
                        {LEVELS.map(lvl => <li key={lvl}><button className="dropdown-item" type="button" onClick={() => handleBasicInfoChange('level', lvl)}>{lvl}</button></li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="prof-grid-two prof-basic-grid">
                  <div className="prof-field-group">
                    <label>Total Duration (Weeks)</label>
                    <input className="learners-settings-field-control prof-step-input" type="number" min="1" value={basicInfo.durationWeeks} onChange={(e) => handleBasicInfoChange('durationWeeks', e.target.value)} />
                  </div>
                  <div className="prof-field-group">
                    <label>Time Commitment (Hours/Week)</label>
                    <input className="learners-settings-field-control prof-step-input" type="number" min="1" value={basicInfo.requiredHours} onChange={(e) => handleBasicInfoChange('requiredHours', e.target.value)} />
                  </div>
                </div>
                
                <div className="prof-field-group">
                  <label>Target Audience (Who is this for?)</label>
                  <ReactQuill theme="snow" modules={quillModules} value={basicInfo.audience} onChange={(val) => handleBasicInfoChange('audience', val)} placeholder="e.g. Beginners wanting to learn web development..." />
                </div>
                <div className="prof-field-group">
                  <label>Course Objectives (What will they learn?)</label>
                  <ReactQuill theme="snow" modules={quillModules} value={basicInfo.goals} onChange={(val) => handleBasicInfoChange('goals', val)} placeholder="By the end of this course, students will be able to..." />
                </div>

                <div className="prof-lesson-actions-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button type="button" className="btn btn-primary" onClick={saveBasicInfo} disabled={isSubmitting} style={{ background: '#450468', color: '#fff', padding: '10px 32px', borderRadius: '8px', border: 'none', fontWeight: 600 }}>
                    {isSubmitting ? 'Saving...' : 'Save & Continue to Syllabus'}
                  </button>
                </div>
              </div>

              {/* ========================================== */}
              {/* STEP 2: PUBLIC SYLLABUS BUILDER            */}
              {/* ========================================== */}
              <div className={`prof-step-pane ${activeStep === 'syllabus' ? 'is-active' : ''}`}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '8px' }}>Public Syllabus Overview</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>This is the high-level roadmap students read before purchasing. Define the major topics you will cover.</p>
                </div>

                <div className="prof-field-group">
                  <label>Brief Syllabus Intro (Optional)</label>
                  <ReactQuill theme="snow" modules={quillModules} value={syllabusDesc} onChange={setSyllabusDesc} placeholder="A short welcoming summary of the curriculum..." />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '2rem 0' }} />

                <div style={{ display: 'flex', gap: '2rem' }}>
                  {/* Left Column: The Public Syllabus Tree */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', color: '#0F172A', marginBottom: '1rem' }}>Your Syllabus Topics</h4>
                    {bufferedOutlines.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
                        No topics added yet. Build your syllabus using the form on the right.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {bufferedOutlines.map((out, idx) => (
                          <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', position: 'relative' }}>
                            <button type="button" onClick={() => removeBufferedOutline(idx)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#450468', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topic {idx + 1}</span>
                            <h4 style={{ margin: '4px 0 8px 0', color: '#0F172A', fontSize: '1.05rem' }}>{out.title}</h4>
                            {out.file && <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> {out.file.name}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Form to Add a Topic */}
                  <div style={{ flex: 1, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', alignSelf: 'start', position: 'sticky', top: '20px' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0F172A' }}>Add New Topic</h4>
                    
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Topic Title</label>
                    <input className="learners-settings-field-control prof-step-input" type="text" placeholder="e.g. DOM Manipulation" value={outlineDraft.title} onChange={(e) => handleOutlineDraftChange('title', e.target.value)} style={{ marginBottom: '1rem' }} />
                    
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Short Summary</label>
                    <ReactQuill theme="snow" modules={quillModules} value={outlineDraft.abstract} onChange={(val) => handleOutlineDraftChange('abstract', val)} placeholder="A quick summary of what will be learned..." />
                    
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500, marginTop: '1rem' }}>Optional Presentation File (PDF/PPT)</label>
                    <input type="file" ref={outlineFileInputRef} accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => { if (e.target.files?.length) setOutlineDraft(p => ({...p, file: e.target.files[0]})) }} style={{ fontSize: '0.85rem', color: '#64748B', width: '100%' }} />

                    <button type="button" onClick={addOutlineToBuffer} style={{ width: '100%', marginTop: '1.5rem', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '8px', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}>
                      + Add Topic to Syllabus
                    </button>
                  </div>
                </div>

                <div className="prof-lesson-actions-row" style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveStep('basic')} style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}>Back</button>
                  <button type="button" className="btn btn-primary" onClick={saveSyllabusAndOutlines} disabled={isSubmitting} style={{ flex: 3, background: '#450468', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600 }}>
                    {isSubmitting ? 'Saving Syllabus...' : 'Save Syllabus & Continue to Curriculum'}
                  </button>
                </div>
              </div>

              {/* ========================================== */}
              {/* STEP 3: PRIVATE CURRICULUM BUILDER         */}
              {/* ========================================== */}
              <div className={`prof-step-pane ${activeStep === 'weeks' ? 'is-active' : ''}`}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '8px' }}>Classroom Curriculum Builder</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>This is the actual classroom content enrolled students will consume. Organize your course into Weeks, Chapters, and Exercises.</p>
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                  
                  {/* Left Column: Form to Add Chapter */}
                  <div style={{ flex: 1.2 }}>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#450468', margin: '0 0 12px 0' }}>Week Settings</h4>
                      <div className="prof-grid-two prof-basic-grid" style={{ marginBottom: 0 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Week Name</label>
                          <input className="learners-settings-field-control prof-step-input" type="text" placeholder="e.g. Week 1: Basics" value={weekDraft.title} onChange={(e) => handleWeekChange('title', e.target.value)} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Week Number</label>
                          <input className="learners-settings-field-control prof-step-input" type="number" min="1" value={weekDraft.weekNumber} onChange={(e) => handleWeekChange('weekNumber', e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: '#0F172A', marginBottom: '16px' }}>1. Chapter Content</h4>
                    
                    <div className="prof-field-group">
                      <label>Chapter Title</label>
                      <input className="learners-settings-field-control prof-step-input" type="text" placeholder="e.g. Understanding Variables" value={chapterDraft.title} onChange={(e) => handleChapterDraftChange('title', e.target.value)} />
                    </div>

                    <div className="prof-field-group">
                      <label>Chapter Lesson (Reading / Video Description)</label>
                      <ReactQuill theme="snow" modules={quillModules} value={chapterDraft.description} onChange={(val) => handleChapterDraftChange('description', val)} placeholder="Type the main lesson content..." />
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: '#0F172A', marginBottom: '16px', marginTop: '32px' }}>2. Chapter Exercises</h4>
                    
                    {bufferedExercises.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {bufferedExercises.map((ex, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F1F5F9', padding: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                              <span style={{ fontSize: '0.9rem', color: '#0F172A' }}>{ex.question}</span>
                              <button type="button" onClick={() => removeBufferedExercise(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.85rem' }}>Remove</button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>New Question</label>
                      <textarea className="learners-settings-textarea" rows="2" placeholder="Type the exercise question..." value={exerciseText} onChange={(e) => setExerciseText(e.target.value)} style={{ marginBottom: '1rem' }}></textarea>

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input type="radio" checked={exerciseMode === 'checkbox'} onChange={() => setExerciseMode('checkbox')} /> Multiple Choice
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input type="radio" checked={exerciseMode === 'radio'} onChange={() => setExerciseMode('radio')} /> Single Choice
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input type="radio" checked={exerciseMode === 'optional'} onChange={() => setExerciseMode('optional')} /> Written Reply
                        </label>
                      </div>
                      
                      {exerciseMode !== 'optional' && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {answers.map((ans) => (
                            <li key={ans.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input type={exerciseMode === 'radio' ? 'radio' : 'checkbox'} name={exerciseMode === 'radio' ? 'prof-ex-answer' : `prof-ex-answer-${ans.id}`} checked={ans.isCorrect} onChange={() => toggleAnswerCorrectness(ans.id)} />
                              <input type="text" placeholder="Option text..." value={ans.text} onChange={(e) => setAnswers(answers.map(a => a.id === ans.id ? { ...a, text: e.target.value } : a))} style={{ flex: 1, padding: '6px 8px', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '0.85rem' }} />
                              <button type="button" onClick={() => removeAnswer(ans.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {exerciseMode !== 'optional' ? (
                          <button type="button" onClick={handleAddAnswer} style={{ background: 'none', border: 'none', color: '#450468', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>+ Add Option</button>
                        ) : <div></div>}
                        <button type="button" onClick={addExerciseToBuffer} style={{ background: '#0F172A', color: '#fff', fontSize: '0.85rem', padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Attach Question</button>
                      </div>
                    </div>

                    <button type="button" onClick={() => saveWeekAndChapter(false)} style={{ width: '100%', marginTop: '24px', background: '#F3E8FF', color: '#450468', border: '1px solid #E9D5FF', padding: '14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                      Publish Chapter to Database
                    </button>
                  </div>

                  {/* Right Column: Mini Curriculum Viewer */}
                  <div style={{ flex: 0.8 }}>
                    <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', position: 'sticky', top: '20px' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        Course Structure
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>You are currently adding content to <strong>Week {currentWeekIndex}</strong>. Fill out the form on the left and hit "Publish Chapter" to save it.</p>
                      
                      <div style={{ padding: '12px', background: '#fff', border: '1px dashed #CBD5E1', borderRadius: '8px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                        When you are done building all weeks and chapters, click below to set pricing.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prof-lesson-actions-row" style={{ display: 'flex', gap: '16px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveStep('syllabus')} style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}>Back to Syllabus</button>
                  <button type="button" className="btn btn-primary" onClick={() => setActiveStep('pricing')} style={{ flex: 3, background: '#450468', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600 }}>
                    Done Building Curriculum - Go to Pricing
                  </button>
                </div>
              </div>

              {/* ========================================== */}
              {/* STEP 4: PRICING                            */}
              {/* ========================================== */}
              <div className={`prof-step-pane ${activeStep === 'pricing' ? 'is-active' : ''}`}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '8px' }}>Pricing & Monetization</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Set the cost for a student to enroll in this course.</p>
                </div>

                <div className="prof-field-group">
                  <label>Pricing Model</label>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={pricing.isFree} onChange={() => setPricing({...pricing, isFree: true})} style={{ accentColor: '#450468' }} />
                      <span style={{ fontWeight: 500, color: '#0F172A' }}>Free Course</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginLeft: '24px' }}>
                      <input type="radio" checked={!pricing.isFree} onChange={() => setPricing({...pricing, isFree: false})} style={{ accentColor: '#450468' }} />
                      <span style={{ fontWeight: 500, color: '#0F172A' }}>Paid Course</span>
                    </label>
                  </div>
                </div>

                {!pricing.isFree && (
                  <div className="prof-grid-two prof-basic-grid">
                    <div className="prof-field-group">
                      <label>Course Price</label>
                      <input className="learners-settings-field-control prof-step-input" type="number" min="1" value={pricing.amount} onChange={(e) => setPricing({...pricing, amount: e.target.value})} />
                    </div>
                    <div className="prof-field-group">
                      <label>Currency</label>
                      <div className="dropdown prof-generic-dropdown">
                        <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle prof-step-input" type="button" data-bs-toggle="dropdown">
                          <span className="prof-dropdown-value">{pricing.currency}</span>
                          <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" />
                        </button>
                        <ul className="dropdown-menu prof-dropdown-menu">
                          {CURRENCIES.map(curr => <li key={curr}><button className="dropdown-item" type="button" onClick={() => setPricing({...pricing, currency: curr})}>{curr}</button></li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="prof-lesson-actions-row" style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveStep('weeks')} style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}>Back to Curriculum</button>
                  <button type="button" className="btn btn-primary" onClick={savePricing} disabled={isSubmitting} style={{ flex: 3, background: '#450468', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600 }}>
                    {isSubmitting ? 'Saving...' : 'Save Pricing & Review'}
                  </button>
                </div>
              </div>

              {/* ========================================== */}
              {/* STEP 5: REVIEW & PUBLISH                   */}
              {/* ========================================== */}
              <div className={`prof-step-pane ${activeStep === 'review' ? 'is-active' : ''}`}>
                <div style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: '8px', fontSize: '1.5rem' }}>{basicInfo.title || 'Untitled Course'}</h3>
                      <span style={{ display: 'inline-block', background: '#E0E7FF', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Ready to Publish</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ display: 'block', fontSize: '1.5rem', color: '#450468' }}>{pricing.isFree ? 'FREE' : `${pricing.amount} ${pricing.currency}`}</strong>
                      <span style={{ color: '#64748B', fontSize: '0.85rem' }}>{basicInfo.categoryName} ({basicInfo.level})</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</strong>
                      <span style={{ color: '#0F172A', fontWeight: 500 }}>{basicInfo.durationWeeks} Weeks</span>
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commitment</strong>
                      <span style={{ color: '#0F172A', fontWeight: 500 }}>{basicInfo.requiredHours} Hours / Week</span>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 1rem 0', color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>Curriculum Overview</h4>
                  <ul style={{ margin: '0 0 1.5rem 0', paddingLeft: '1.2rem', color: '#475569' }}>
                    {bufferedOutlines.length > 0 ? bufferedOutlines.map((o, i) => <li key={i} style={{ marginBottom: '8px' }}>{o.title}</li>) : <li>No public topics buffered.</li>}
                  </ul>

                  <h4 style={{ margin: '0 0 1rem 0', color: '#0F172A' }}>Weekly Content Prepared</h4>
                  <p style={{ margin: 0, color: '#475569' }}><strong>Week {currentWeekIndex}:</strong> {chapterDraft.title || 'Untitled Chapter'}</p>
                </div>

                <div className="prof-lesson-actions-row" style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveStep('pricing')} style={{ flex: 1, padding: '14px', borderRadius: '8px', fontWeight: 600 }}>Go Back</button>
                  <button type="button" className="btn btn-primary" onClick={publishCourse} disabled={isSubmitting} style={{ flex: 3, background: '#22C55E', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1.1rem' }}>
                    {isSubmitting ? 'Publishing to Database...' : 'Launch Course!'}
                  </button>
                </div>
              </div>

            </div>
          </form>
        </section>
      </section>
    </ProfessorLayout>
  );
};

export default PrepareCourse;
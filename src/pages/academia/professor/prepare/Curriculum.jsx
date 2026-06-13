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

  const quillModules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

  // --- Fetch Course Structure ---
  const loadCourseStructure = async () => {
    if (!courseId) return;
    setIsLoadingStructure(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
      const data = await res.json();
      const course = data.data || data;
      
      if (course.weeks && course.weeks.length > 0) {
        setSavedStructure(course.weeks);
        // Automatically suggest the next week number
        const highestWeek = Math.max(...course.weeks.map(w => w.week_number));
        setWeekDraft(prev => ({ 
          ...prev, 
          title: `Week ${highestWeek}`, 
          weekNumber: highestWeek 
        }));
      }
    } catch (error) {
      console.error("Failed to load curriculum structure", error);
    } finally {
      setIsLoadingStructure(false);
    }
  };

  useEffect(() => {
    loadCourseStructure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

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

  // --- API Submission Flow ---
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
          description: weekDraft.description || "Weekly objectives", 
          learning_objectives: weekDraft.description || "Weekly objectives", 
          week_number: Number(weekDraft.weekNumber)
        }) 
      });
      const weekData = await weekRes.json();
      if (!weekRes.ok) throw new Error(weekData.message || 'Failed to create week.');
      const weekId = weekData?.data?.id || weekData?.id;
      
      // 2. Create Chapter (FormData allowed)
      const formData = new FormData();
      formData.append('title', chapterDraft.title);
      formData.append('subtitle', chapterDraft.subtitle || "Chapter Subtitle");
      formData.append('description', chapterDraft.description || "Chapter Content");
      formData.append('intro_message', chapterDraft.intro_message || "");
      formData.append('week_number', Number(weekDraft.weekNumber)); 
      formData.append('week_id', Number(weekId)); 
      if (chapterThumbnail) formData.append('thumbnail', chapterThumbnail);

      const chapterRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/chapters`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      const chapterData = await chapterRes.json();
      if (!chapterRes.ok) throw new Error(chapterData.message || 'Failed to save chapter.');
      const newChapterId = chapterData?.data?.id || chapterData?.id;

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
          
          // Sending options as raw array to let the backend ORM handle the JSON encoding
          const exPayload = {
            question: finalExercises[i].question,
            type: finalExercises[i].type,
            options: finalExercises[i].options, 
            correct_answer: finalExercises[i].correct_answer,
            points: finalExercises[i].points,
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
      await loadCourseStructure();
      
      setChapterDraft({ title: '', subtitle: '', intro_message: '', description: '' });
      setChapterThumbnail(null); 
      setThumbnailPreview('');
      setBufferedExercises([]); 
      setExerciseText('');
      
      pushFeedback('Content added to Curriculum successfully.', 'success');
      if (advanceStep) {
        setActiveStep('pricing');
      } else {
        setCurrentWeekIndex(prev => prev + 1);
      }
      
    } catch (error) { 
      pushFeedback(error.message, 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="prof-step-pane is-active animate-fade-in">
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
            <label style={{ display: 'block', color: '#0F172A', fontWeight: 500, marginBottom: '8px' }}>Chapter Thumbnail (Optional)</label>
            <div 
              className="prof-upload-dropzone" 
              style={{ border: `2px dashed ${isDraggingThumbnail ? '#4F46E5' : '#CBD5E1'}`, background: isDraggingThumbnail ? '#EEF2FF' : '#F8FAFC', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '20px', borderRadius: '8px', transition: 'all 0.2s' }}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingThumbnail(true); }}
              onDragLeave={() => setIsDraggingThumbnail(false)}
              onDrop={handleThumbnailDrop}
              onClick={() => chapterFileInputRef.current?.click()}
            >
              <input type="file" ref={chapterFileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleThumbnailSelect} />
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" style={{ maxHeight: '120px', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', marginBottom: '8px' }}><img src="/assets/icons/file.svg" alt="Upload" width="24" /></span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Drop image here or click to upload.<br /><small>JPG, PNG, WEBP allowed.</small></span>
                </div>
              )}
            </div>
          </div>

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
            <textarea className="learners-settings-textarea" rows="2" placeholder="Type the exercise question..." value={exerciseText} onChange={(e) => setExerciseText(e.target.value)} style={{ marginBottom: '1rem', width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px' }}></textarea>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', background: '#F8FAFC', padding: '8px', borderRadius: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input 
                  type="radio" 
                  checked={exerciseMode === 'checkbox'} 
                  onChange={() => setExerciseMode('checkbox')} 
                  style={{ accentColor: '#450468', transform: 'scale(1.1)' }} 
                /> 
                Multiple Choice
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input 
                  type="radio" 
                  checked={exerciseMode === 'radio'} 
                  onChange={() => setExerciseMode('radio')} 
                  style={{ accentColor: '#450468', transform: 'scale(1.1)' }} 
                /> 
                Single Choice
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input 
                  type="radio" 
                  checked={exerciseMode === 'optional'} 
                  onChange={() => setExerciseMode('optional')} 
                  style={{ accentColor: '#450468', transform: 'scale(1.1)' }} 
                /> 
                Written Reply
              </label>
            </div>
            
            {exerciseMode !== 'optional' && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {answers.map((ans) => (
                  <li key={ans.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div className="custom-checkbox-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={exerciseMode === 'radio' ? 'radio' : 'checkbox'} 
                        name={exerciseMode === 'radio' ? 'prof-ex-answer' : `prof-ex-answer-${ans.id}`} 
                        checked={ans.isCorrect} 
                        onChange={() => toggleAnswerCorrectness(ans.id)} 
                        style={{ accentColor: '#450468', width: '18px', height: '18px', cursor: 'pointer' }}
                        title="Mark as correct answer"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Type option here..." 
                      value={ans.text} 
                      onChange={(e) => setAnswers(answers.map(a => a.id === ans.id ? { ...a, text: e.target.value } : a))} 
                      style={{ flex: 1, padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.85rem', outline: 'none' }} 
                    />
                    <button type="button" onClick={() => removeAnswer(ans.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }} title="Remove Option">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {exerciseMode !== 'optional' ? (
                <button type="button" onClick={handleAddAnswer} style={{ background: 'none', border: 'none', color: '#450468', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Option
                </button>
              ) : <div></div>}
              <button type="button" onClick={addExerciseToBuffer} style={{ background: '#0F172A', color: '#fff', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Attach Question
              </button>
            </div>
          </div>

          <button type="button" onClick={() => saveWeekAndChapter(false)} disabled={isSubmitting} style={{ width: '100%', marginTop: '24px', background: '#F3E8FF', color: '#450468', border: '1px solid #E9D5FF', padding: '14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
            {isSubmitting ? 'Saving to Database...' : 'Publish Chapter to Database'}
          </button>
        </div>

        {/* Right Column: LIVE Dynamic Curriculum Viewer */}
        <div style={{ flex: 0.8 }}>
          <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', position: 'sticky', top: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Course Structure
            </h4>
            
            {isLoadingStructure ? (
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Loading saved curriculum...</p>
            ) : savedStructure.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                {savedStructure.map((week) => (
                  <div key={week.id} style={{ borderLeft: '2px solid #450468', paddingLeft: '12px' }}>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0F172A', marginBottom: '8px' }}>
                      {week.title}
                    </strong>
                    {week.chapters && week.chapters.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: '#475569' }}>
                        {week.chapters.map(chap => (
                          <li key={chap.id} style={{ marginBottom: '4px' }}>{chap.title}</li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>No chapters yet</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px', padding: '12px', background: '#fff', border: '1px dashed #CBD5E1', borderRadius: '8px' }}>
                Your curriculum is currently empty. Use the form on the left to add your first Week and Chapter.
              </p>
            )}
            
            <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
              When you are done building all weeks and chapters, click below to set pricing.
            </div>
          </div>
        </div>
      </div>

      <div className="prof-lesson-actions-row" style={{ display: 'flex', gap: '16px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveStep('syllabus')} style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}>Back to Syllabus</button>
        <button type="button" className="btn btn-primary" onClick={() => setActiveStep('pricing')} style={{ flex: 3, background: '#450468', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600 }}>
          Done Building Curriculum &rarr; Go to Pricing
        </button>
      </div>
    </div>
  );
};

export default Curriculum;
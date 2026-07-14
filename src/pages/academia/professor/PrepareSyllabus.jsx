import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import LearnerLoadError from '../learner/LearnerLoadError';
import './prepare-course.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const PrepareSyllabus = () => {
  const navigate = useNavigate();
  const feedbackTimerRef = useRef(null);

  // --- Central Wizard State ---
  const [activeStep, setActiveStep] = useState('profile'); // 'profile' or 'outlines'
  const [syllabusId, setSyllabusId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', tone: 'success', visible: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // --- Data Lists ---
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);

  // --- Syllabus Profile Fields ---
  const [profile, setProfile] = useState({
    title: '',
    description: '',
    categoryId: '',
    categoryName: '',
    subcategoryId: '',
    subcategoryName: '',
    level: LEVELS[0],
    audience: '',
    goals: ''
  });

  // --- Outlines State ---
  const [bufferedOutlines, setBufferedOutlines] = useState([]);
  const [outlineDraft, setOutlineDraft] = useState({
    title: '',
    abstract: '',
    explanation: '',
    topicId: '',
    topicName: '',
    file: null
  });

  const outlineFileInputRef = useRef(null);

  // --- Quill Config ---
  const quillModules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }), []);

  const pushFeedback = (message, tone = 'success') => {
    setFeedback({ message, tone, visible: true });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback({ message: '', tone: 'success', visible: false });
    }, tone === 'error' ? 8000 : 5000);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          const filtered = data.data.filter(cat => cat.type === 'syllabus' || cat.type === 'general');
          if (filtered.length === 0) {
            setCategoriesError('No syllabus categories are available right now.');
            setCategories([]);
            return;
          }
          setCategories(filtered);
        } else {
          setCategories([]);
          setCategoriesError(data.message || 'Could not load categories.');
        }
      } catch (err) {
        setCategories([]);
        setCategoriesError(err.message || 'Could not load categories.');
      }
    };
    fetchCategories();
  }, [categoriesReloadKey]);

  // Fetch Subcategories when Category changes
  const handleCategorySelect = async (catId, catName) => {
    setProfile(prev => ({
      ...prev,
      categoryId: catId,
      categoryName: catName,
      subcategoryId: '',
      subcategoryName: ''
    }));
    setSubcategories([]);
    setTopics([]);
    setOutlineDraft(prev => ({ ...prev, topicId: '', topicName: '' }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${catId}/subcategories`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setSubcategories(data.data);
      } else {
        pushFeedback(data.message || 'Could not load subcategories.', 'error');
      }
    } catch (err) {
      pushFeedback(err.message || 'Could not load subcategories.', 'error');
    }
  };

  // Fetch Topics when Subcategory changes
  const handleSubcategorySelect = async (subCatId, subCatName) => {
    setProfile(prev => ({
      ...prev,
      subcategoryId: subCatId,
      subcategoryName: subCatName
    }));
    setTopics([]);
    setOutlineDraft(prev => ({ ...prev, topicId: '', topicName: '' }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/subcategories/${subCatId}/topics`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setTopics(data.data);
      } else {
        pushFeedback(data.message || 'Could not load topics.', 'error');
      }
    } catch (err) {
      pushFeedback(err.message || 'Could not load topics.', 'error');
    }
  };

  // --- Handlers ---
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleDraftChange = (field, value) => {
    setOutlineDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files?.length > 0) {
      handleDraftChange('file', e.dataTransfer.files[0]);
    }
  };

  const addOutlineToBuffer = () => {
    if (!outlineDraft.title.trim()) {
      return pushFeedback('Outline topic title is required.', 'error');
    }
    setBufferedOutlines(prev => [...prev, { ...outlineDraft }]);
    setOutlineDraft({ title: '', abstract: '', explanation: '', topicId: '', topicName: '', file: null });
    if (outlineFileInputRef.current) outlineFileInputRef.current.value = '';
    pushFeedback('Topic outline added to buffer.', 'success');
  };

  const removeBufferedOutline = (idx) => {
    setBufferedOutlines(prev => prev.filter((_, i) => i !== idx));
  };

  // --- Save / Create Step 1 ---
  const saveSyllabusProfile = async () => {
    if (!profile.title.trim()) {
      return pushFeedback('Syllabus title is required.', 'error');
    }
    if (!profile.categoryId) {
      return pushFeedback('Syllabus category is required.', 'error');
    }
    if (!profile.subcategoryId) {
      return pushFeedback('Syllabus subcategory is required.', 'error');
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        title: profile.title,
        description: profile.description,
        category_id: Number(profile.categoryId),
        subcategory_id: Number(profile.subcategoryId),
        education_level: profile.level,
        target_audience: profile.audience,
        objectives: profile.goals,
        subscription_price: 0,
        price: 0
      };

      const endpoint = syllabusId ? `${API_BASE_URL}/api/syllabuses/${syllabusId}` : `${API_BASE_URL}/api/syllabuses`;
      const method = syllabusId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save syllabus profile.');

      const activeSylId = syllabusId || data?.data?.id || data?.id;
      setSyllabusId(activeSylId);

      pushFeedback('Syllabus profile saved successfully.', 'success');
      setActiveStep('outlines');
    } catch (err) {
      pushFeedback(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Publish Step 2 ---
  const publishSyllabusAndOutlines = async () => {
    if (!syllabusId) {
      return pushFeedback('Syllabus ID is missing. Save profile first.', 'error');
    }
    if (bufferedOutlines.length === 0 && !outlineDraft.title.trim()) {
      return pushFeedback('Please add at least one topic outline to publish.', 'error');
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      // Collect outlines
      const outlinesToSave = [...bufferedOutlines];
      if (outlineDraft.title.trim()) {
        outlinesToSave.push({ ...outlineDraft });
      }

      for (let i = 0; i < outlinesToSave.length; i++) {
        const outline = outlinesToSave[i];
        const outData = new FormData();

        outData.append('title', outline.title);
        outData.append('description', outline.abstract);
        outData.append('explanation', outline.explanation || outline.abstract);
        outData.append('order_index', Number(i + 1));
        if (outline.topicId) {
          outData.append('topic_id', Number(outline.topicId));
        }
        if (outline.file) {
          outData.append('file', outline.file);
        }

        const res = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabusId}/outlines`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: outData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to save topic outline: ${outline.title}`);
        }
      }

      // Publish Syllabus
      const pubRes = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabusId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'published' })
      });

      if (!pubRes.ok) {
        const pubErr = await pubRes.json().catch(() => ({}));
        throw new Error(pubErr.message || 'Failed to publish syllabus.');
      }

      navigate('/academia/professor', { state: { toastMessage: 'Syllabus successfully published!', toastTone: 'success' } });
    } catch (err) {
      pushFeedback(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'profile', label: 'Syllabus Profile' },
    { id: 'outlines', label: 'Syllabus Outlines' }
  ];

  return (
      <section className="prof-page">
        <section className="prof-prepare">
          {feedback.visible && (
            <div className={`learners-account-feedback learners-account-feedback-floating is-${feedback.tone}`}>
              {feedback.message}
            </div>
          )}

          <section className="learners-home-title">
            <div className="learners-home-title-top">
              <h1>Prepare Course Syllabus</h1>
              <div className="learners-home-title-actions">
                <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/professor')} style={{ border: 'none', cursor: 'pointer' }}>
                  <span>Exit Builder</span>
                  <img src="/assets/icons/exit-right.svg" alt="" />
                </button>
              </div>
            </div>
          </section>

          <div className={`prof-prepare-card prof-step-${activeStep}`}>
            <div className="prof-prepare-card-head">
              <h2>Syllabus Builder Workspace</h2>
              <span className="prof-prepare-card-subtitle">Define the high-level roadmap and outline details for your syllabus.</span>
            </div>

            {/* Stepper */}
            <div className="prof-prepare-steps" aria-label="Steps" style={{ maxWidth: '400px', margin: '0 auto 32px' }}>
              {steps.map((step, idx) => {
                const isActive = activeStep === step.id;
                const isCompleted = activeStep === 'outlines' && step.id === 'profile';
                return (
                  <div
                    key={step.id}
                    className={`prof-prepare-step ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
                    onClick={() => {
                      if (syllabusId || step.id === 'profile') {
                        setActiveStep(step.id);
                      }
                    }}
                  >
                    <div className="prof-step-number-bubble">
                      {isCompleted ? (
                        <svg className="prof-step-check-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : idx + 1}
                    </div>
                    <span className="prof-step-label">{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Step Panes */}
            <div className="prof-prepare-body">
              {categoriesError ? (
                <LearnerLoadError
                  title="Could not load categories"
                  message={categoriesError}
                  onRetry={() => setCategoriesReloadKey((key) => key + 1)}
                />
              ) : null}

              {activeStep === 'profile' && (
                <div className="prof-step-pane is-active animate-fade-in">
                  <div className="prof-step-header">
                    <h3>Syllabus Profile Details</h3>
                    <p>Describe what this syllabus covers, the subject domain, and who it is targetted at.</p>
                  </div>

                  {/* Title */}
                  <div className="prof-field-group">
                    <label className="prof-field-label">Syllabus Title</label>
                    <input
                      className="prof-step-input-premium"
                      type="text"
                      placeholder="e.g. Master Web Development Fundamentals"
                      value={profile.title}
                      onChange={(e) => handleProfileChange('title', e.target.value)}
                    />
                  </div>

                  {/* Categories Grid */}
                  <div className="prof-grid-two">
                    {/* Category Dropdown */}
                    <div className="prof-field-group">
                      <label className="prof-field-label">Category</label>
                      <div className="dropdown prof-generic-dropdown">
                        <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="prof-dropdown-value">{profile.categoryName || '-- Select Category --'}</span>
                          <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        <ul className="dropdown-menu prof-dropdown-menu-premium" style={{ width: '100%' }}>
                          {categories.map(cat => (
                            <li key={cat.id}>
                              <button className="dropdown-item" type="button" onClick={() => handleCategorySelect(cat.id, cat.name)}>
                                {cat.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Subcategory Dropdown */}
                    <div className="prof-field-group">
                      <label className="prof-field-label">Subcategory</label>
                      <div className="dropdown prof-generic-dropdown">
                        <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown" disabled={!profile.categoryId} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="prof-dropdown-value">{profile.subcategoryName || '-- Select Subcategory --'}</span>
                          <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        <ul className="dropdown-menu prof-dropdown-menu-premium" style={{ width: '100%' }}>
                          {subcategories.map(sub => (
                            <li key={sub.id}>
                              <button className="dropdown-item" type="button" onClick={() => handleSubcategorySelect(sub.id, sub.name)}>
                                {sub.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="prof-field-group">
                    <label className="prof-field-label">Target Education Level</label>
                    <div className="dropdown prof-generic-dropdown">
                      <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="prof-dropdown-value">{profile.level}</span>
                        <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      <ul className="dropdown-menu prof-dropdown-menu-premium" style={{ width: '100%' }}>
                        {LEVELS.map(lvl => (
                          <li key={lvl}>
                            <button className="dropdown-item" type="button" onClick={() => handleProfileChange('level', lvl)}>
                              {lvl}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Intro Description */}
                  <div className="prof-field-group">
                    <label className="prof-field-label">Syllabus Intro / Summary</label>
                    <div className="prof-quill-wrapper-premium">
                      <ReactQuill
                        theme="snow"
                        modules={quillModules}
                        value={profile.description}
                        onChange={(val) => handleProfileChange('description', val)}
                        placeholder="Provide an overview of the syllabus roadmap..."
                      />
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="prof-field-group">
                    <label className="prof-field-label">Target Audience</label>
                    <textarea
                      className="prof-step-input-premium"
                      rows="3"
                      placeholder="Who should read this syllabus? e.g. Self-taught coders, high school graduates..."
                      value={profile.audience}
                      onChange={(e) => handleProfileChange('audience', e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Objectives */}
                  <div className="prof-field-group">
                    <label className="prof-field-label">Learning Objectives (What will they achieve?)</label>
                    <textarea
                      className="prof-step-input-premium"
                      rows="3"
                      placeholder="e.g. Master clean coding, build responsive layouts, set up scalable databases..."
                      value={profile.goals}
                      onChange={(e) => handleProfileChange('goals', e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Footer Actions */}
                  <div className="prof-actions-footer-premium">
                    <button type="button" className="prof-btn-back-premium" onClick={() => navigate('/academia/professor')}>
                      Cancel
                    </button>
                    <button type="button" className="prof-btn-primary-premium" onClick={saveSyllabusProfile} disabled={isSubmitting}>
                      {isSubmitting ? 'Saving Profile...' : 'Save & Continue to Outlines'}
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 'outlines' && (
                <div className="prof-step-pane is-active animate-fade-in">
                  <div className="prof-step-header">
                    <h3>Syllabus Outline Topics</h3>
                    <p>Map out the individual learning topics and attach learning resources or document guides.</p>
                  </div>

                  <div className="prof-grid-two-unequal">
                    {/* Outline List (Left) */}
                    <div className="prof-timeline-pane">
                      <h4 className="prof-pane-title">Syllabus Content Checklist</h4>
                      {bufferedOutlines.length === 0 ? (
                        <div className="prof-empty-timeline-card">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <span>Syllabus checklist is currently empty. Use the right form to build your outlines.</span>
                        </div>
                      ) : (
                        <div className="prof-timeline-container">
                          {bufferedOutlines.map((out, idx) => (
                            <div key={idx} className="prof-timeline-card">
                              <div className="prof-timeline-badge">
                                <span>{idx + 1}</span>
                              </div>
                              <div className="prof-timeline-content">
                                <h4>{out.title}</h4>
                                {out.topicName && (
                                  <span style={{ fontSize: '11px', background: '#ecefbd', color: '#686004', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' }}>
                                    Topic: {out.topicName}
                                  </span>
                                )}
                                {out.abstract && (
                                  <div className="prof-timeline-abstract" dangerouslySetInnerHTML={{ __html: out.abstract }} />
                                )}
                                {out.file && (
                                  <div className="prof-timeline-file-attachment">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <span>{out.file.name}</span>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                className="prof-timeline-remove-btn"
                                onClick={() => removeBufferedOutline(idx)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Topic Builder Form (Right) */}
                    <div className="prof-sidebar-card-premium">
                      <h4>Compose Outline Topic</h4>

                      {/* Outline Title */}
                      <div className="prof-field-group">
                        <label className="prof-field-label">Outline Title</label>
                        <input
                          className="prof-step-input-premium"
                          type="text"
                          placeholder="e.g. HTML structural layout"
                          value={outlineDraft.title}
                          onChange={(e) => handleDraftChange('title', e.target.value)}
                        />
                      </div>

                      {/* Topic Selector */}
                      <div className="prof-field-group">
                        <label className="prof-field-label">Select Database Topic</label>
                        <div className="dropdown prof-generic-dropdown">
                          <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown" disabled={topics.length === 0} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="prof-dropdown-value">{outlineDraft.topicName || '-- Select Topic --'}</span>
                            <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                          <ul className="dropdown-menu prof-dropdown-menu-premium" style={{ width: '100%' }}>
                            {topics.map(tp => (
                              <li key={tp.id}>
                                <button className="dropdown-item" type="button" onClick={() => {
                                  handleDraftChange('topicId', tp.id);
                                  handleDraftChange('topicName', tp.name);
                                }}>
                                  {tp.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Abstract / Summary */}
                      <div className="prof-field-group">
                        <label className="prof-field-label">Short Explanation</label>
                        <div className="prof-quill-wrapper-premium">
                          <ReactQuill
                            theme="snow"
                            modules={quillModules}
                            value={outlineDraft.abstract}
                            onChange={(val) => handleDraftChange('abstract', val)}
                            placeholder="Provide a detailed brief explanation of this topic..."
                          />
                        </div>
                      </div>

                      {/* Document File Dropzone */}
                      <div className="prof-field-group">
                        <label className="prof-field-label">Topic Presentation Material (PDF/PPT)</label>
                        <div
                          className={`prof-outline-file-dropzone ${isDraggingFile ? 'is-dragging' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                          onDragLeave={() => setIsDraggingFile(false)}
                          onDrop={handleFileDrop}
                          onClick={() => outlineFileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={outlineFileInputRef}
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            style={{ display: 'none' }}
                            onChange={(e) => { if (e.target.files?.length) handleDraftChange('file', e.target.files[0]) }}
                          />
                          <svg className="prof-dropzone-cloud-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          {outlineDraft.file ? (
                            <span className="prof-dropzone-filename">✓ {outlineDraft.file.name}</span>
                          ) : (
                            <span className="prof-dropzone-prompt">Click or drag file here</span>
                          )}
                        </div>
                      </div>

                      {/* Add Outline Button */}
                      <button type="button" className="prof-btn-secondary-premium" onClick={addOutlineToBuffer} style={{ width: '100%' }}>
                        + Add Outline Topic
                      </button>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="prof-actions-footer-premium">
                    <button type="button" className="prof-btn-back-premium" onClick={() => setActiveStep('profile')}>
                      Back to Profile
                    </button>
                    <button type="button" className="prof-btn-primary-premium" onClick={publishSyllabusAndOutlines} disabled={isSubmitting}>
                      {isSubmitting ? 'Publishing...' : 'Publish & Finalize Syllabus'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
  );
};

export default PrepareSyllabus;

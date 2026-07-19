import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Syllabus = ({ courseId, syllabusId, setSyllabusId, setActiveStep, pushFeedback }) => {
  // --- UI & Loading State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // --- Form Data State ---
  const [syllabusDesc, setSyllabusDesc] = useState('');
  const [bufferedOutlines, setBufferedOutlines] = useState([]);

  useEffect(() => {
    if (!courseId) return;
    const fetchSyllabus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/syllabus`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const syllabus = data.data;
          setSyllabusId(syllabus.id);
          setSyllabusDesc(syllabus.description || '');
          if (syllabus.outlines && syllabus.outlines.length > 0) {
            setBufferedOutlines(syllabus.outlines.map(out => ({
              title: out.title,
              abstract: out.description || '', // abstract maps to description in DB
              explanation: out.explanation || '',
              file: out.file_url ? { name: out.file_name || out.file_url.split('/').pop() } : null
            })));
          }
        }
      } catch (err) {
        console.error("Error fetching syllabus:", err);
      }
    };
    fetchSyllabus();
  }, [courseId, setSyllabusId]);
  const [outlineDraft, setOutlineDraft] = useState({
    title: '',
    abstract: '',
    explanation: '',
    file: null
  });

  const outlineFileInputRef = useRef(null);

  // --- Quill Configuration ---
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [3, 4, false] }],
      ['bold', 'italic', 'underline', 'code'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['code-block'],
      ['link', 'clean'],
    ],
  }), []);

  // ==========================================
  // HANDLERS
  // ==========================================

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
      return pushFeedback('Topic title is required to add an outline.', 'error');
    }

    // Add to buffer
    setBufferedOutlines(prev => [...prev, { ...outlineDraft }]);

    // Reset draft form for the next topic
    setOutlineDraft({ title: '', abstract: '', explanation: '', file: null });
    if (outlineFileInputRef.current) outlineFileInputRef.current.value = '';

    pushFeedback('Topic added to Syllabus buffer.', 'success');
  };

  const removeBufferedOutline = (idx) => {
    setBufferedOutlines(prev => prev.filter((_, i) => i !== idx));
  };

  // ==========================================
  // API SUBMISSION FLOW
  // ==========================================

  const saveSyllabusAndOutlines = async () => {
    // 1. Guardrails
    if (!courseId) {
      return pushFeedback('Course ID is missing. Please go back to Step 1 and hit Save.', 'error');
    }
    if (bufferedOutlines.length === 0 && !outlineDraft.title.trim()) {
      return pushFeedback('Please add at least one topic to the syllabus.', 'error');
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      // PHASE 1: Fetch Course Details (to grab category, level, etc. for the Syllabus wrapper)
      const courseRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courseDataJson = await courseRes.json();
      const course = courseDataJson.data || courseDataJson;

      if (!course) throw new Error("Could not retrieve course details from the database.");

      // PHASE 2: Create/Update the Syllabus Wrapper (Pure JSON)
      let activeSylId = syllabusId;
      const sylPayload = {
        course_id: Number(courseId),
        title: `${course.title} - Syllabus`,
        content: syllabusDesc || "Course outline and topics.",
        version: 1,
        description: syllabusDesc || "Complete guide to the course.",
        category_id: Number(course.category_id || 1),
        education_level: course.education_level || "Beginner",
        target_audience: course.target_audience || "Students",
        objectives: course.objectives || "Learning objectives",
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
      if (!sylRes.ok) throw new Error(sylData.message || 'Failed to save syllabus wrapper.');

      activeSylId = activeSylId || sylData?.data?.id || sylData?.id;
      if (!syllabusId && activeSylId) setSyllabusId(activeSylId); // Lock it in state

      // PHASE 3: Upload the Topics/Outlines (FormData)
      // Combine whatever is in the buffer + whatever they just typed but forgot to press "Add"
      const outlinesToSave = [...bufferedOutlines];
      if (outlineDraft.title.trim()) outlinesToSave.push({ ...outlineDraft });

      // We use a for-loop here intentionally so the backend assigns order_index sequentially
      for (let i = 0; i < outlinesToSave.length; i++) {
        const outline = outlinesToSave[i];
        const outData = new FormData();

        outData.append('title', outline.title);
        outData.append('description', outline.abstract);
        outData.append('explanation', outline.explanation || outline.abstract);
        outData.append('order_index', Number(i + 1));

        if (outline.file) outData.append('file', outline.file);

        await fetch(`${API_BASE_URL}/api/syllabuses/${activeSylId}/outlines`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: outData
        });
      }


      // Cleanup & Progress
      setBufferedOutlines([]);
      setOutlineDraft({ title: '', abstract: '', explanation: '', file: null });

      pushFeedback('Syllabus configured successfully.', 'success');
      setActiveStep('weeks'); // Move to Step 3

    } catch (error) {
      pushFeedback(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Destructure draft state for clean HTML
  const { title, abstract, file } = outlineDraft;

  return (
    <div className="prof-step-pane is-active animate-fade-in">

      <div className="prof-step-header">
        <h3>Public Syllabus Overview</h3>
        <p>
          This is the high-level roadmap students read before purchasing. Define the major topics you will cover.
        </p>
      </div>

      <div className="prof-field-group">
        <label className="prof-field-label">Brief Syllabus Intro (Optional)</label>
        <div className="prof-quill-wrapper-premium">
          <ReactQuill
            theme="snow"
            modules={quillModules}
            value={syllabusDesc || ''}
            onChange={setSyllabusDesc}
            placeholder="A short welcoming summary of the curriculum..."
          />
        </div>
      </div>

      <hr className="prof-divider" />

      <div className="prof-grid-two-unequal">

        {/* --- LEFT COLUMN: SYLLABUS TREE --- */}
        <div className="prof-timeline-pane">
          <h4 className="prof-pane-title">Your Syllabus Topics</h4>

          {bufferedOutlines.length === 0 ? (
            <div className="prof-empty-timeline-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>No topics added yet. Build your syllabus using the form on the right.</span>
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
                    title="Remove Topic"
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

        {/* --- RIGHT COLUMN: ADD TOPIC FORM --- */}
        <div className="prof-sidebar-card-premium">
          <h4>Add New Topic</h4>

          <div className="prof-field-group">
            <label className="prof-field-label">Topic Title</label>
            <input
              className="prof-step-input-premium"
              type="text"
              placeholder="e.g. DOM Manipulation"
              value={title}
              onChange={(e) => handleDraftChange('title', e.target.value)}
            />
          </div>

          <div className="prof-field-group">
            <label className="prof-field-label">Short Summary</label>
            <div className="prof-quill-wrapper-premium">
              <ReactQuill
                theme="snow"
                modules={quillModules}
                value={abstract || ''}
                onChange={(val) => handleDraftChange('abstract', val)}
                placeholder="A quick summary of what will be learned..."
              />
            </div>
          </div>

          <div className="prof-field-group">
            <label className="prof-field-label">Presentation File (PDF/PPT)</label>

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
              {file ? (
                <span className="prof-dropzone-filename">✓ {file.name}</span>
              ) : (
                <span className="prof-dropzone-prompt">Click or drag file here</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="prof-btn-secondary-premium"
            onClick={addOutlineToBuffer}
          >
            + Add Topic to Syllabus
          </button>
        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="prof-actions-footer-premium">
        <button
          type="button"
          className="prof-btn-back-premium"
          onClick={() => setActiveStep('basic')}
        >
          Back
        </button>
        <button
          type="button"
          className="prof-btn-primary-premium"
          onClick={saveSyllabusAndOutlines}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving Syllabus...' : 'Save Syllabus & Continue to Curriculum'}
        </button>
      </div>
    </div>
  );
};

export default Syllabus;
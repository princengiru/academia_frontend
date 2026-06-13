import React, { useState, useRef, useMemo } from 'react';
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
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
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

      console.log("🔥 STEP 2A: Sending Syllabus Wrapper:", sylPayload);

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

      console.log(`🔥 STEP 2B: Successfully uploaded ${outlinesToSave.length} outlines.`);

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
      
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '8px' }}>Public Syllabus Overview</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          This is the high-level roadmap students read before purchasing. Define the major topics you will cover.
        </p>
      </div>

      <div className="prof-field-group">
        <label>Brief Syllabus Intro (Optional)</label>
        <ReactQuill 
          theme="snow" 
          modules={quillModules} 
          value={syllabusDesc || ''} 
          onChange={setSyllabusDesc} 
          placeholder="A short welcoming summary of the curriculum..." 
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '2rem 0' }} />

      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* --- LEFT COLUMN: SYLLABUS TREE --- */}
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
                  <button 
                    type="button" 
                    onClick={() => removeBufferedOutline(idx)} 
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                    title="Remove Topic"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#450468', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Topic {idx + 1}
                  </span>
                  <h4 style={{ margin: '4px 0 8px 0', color: '#0F172A', fontSize: '1.05rem' }}>{out.title}</h4>
                  
                  {out.file && (
                    <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {out.file.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: ADD TOPIC FORM --- */}
        <div style={{ flex: 1, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', alignSelf: 'start', position: 'sticky', top: '20px' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0F172A' }}>Add New Topic</h4>
          
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Topic Title</label>
          <input 
            className="learners-settings-field-control prof-step-input" 
            type="text" 
            placeholder="e.g. DOM Manipulation" 
            value={title} 
            onChange={(e) => handleDraftChange('title', e.target.value)} 
            style={{ marginBottom: '1rem' }} 
          />
          
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Short Summary</label>
          <ReactQuill 
            theme="snow" 
            modules={quillModules} 
            value={abstract || ''} 
            onChange={(val) => handleDraftChange('abstract', val)} 
            placeholder="A quick summary of what will be learned..." 
          />
          
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500, marginTop: '1.5rem' }}>Optional Presentation File (PDF/PPT)</label>
          
          {/* Pro Drag-and-Drop for Outline File */}
          <div 
            style={{ 
              border: `1px dashed ${isDraggingFile ? '#450468' : '#CBD5E1'}`, 
              background: isDraggingFile ? '#F3E8FF' : '#F8FAFC', 
              borderRadius: '6px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
            }}
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
            {file ? (
              <span style={{ fontSize: '0.85rem', color: '#450468', fontWeight: 500 }}>✓ {file.name}</span>
            ) : (
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Click or drag file here</span>
            )}
          </div>

          <button 
            type="button" 
            onClick={addOutlineToBuffer} 
            style={{ width: '100%', marginTop: '1.5rem', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '10px', borderRadius: '8px', color: '#0F172A', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            + Add Topic to Syllabus
          </button>
        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="prof-lesson-actions-row" style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
        <button 
          type="button" 
          className="btn btn-outline-secondary" 
          onClick={() => setActiveStep('basic')} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}
        >
          Back
        </button>
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={saveSyllabusAndOutlines} 
          disabled={isSubmitting} 
          style={{ flex: 3, background: '#450468', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600 }}
        >
          {isSubmitting ? 'Saving Syllabus...' : 'Save Syllabus & Continue to Curriculum'}
        </button>
      </div>
    </div>
  );
};

export default Syllabus;
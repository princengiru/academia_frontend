import React, { useState, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CATEGORIES = [
  { id: 1, name: 'Web Development' },
  { id: 2, name: 'Mobile Development' },
  { id: 3, name: 'Data Science' },
  { id: 4, name: 'Programming Basics' },
  { id: 6, name: 'Mathematics and Science' }
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const BasicInfo = ({ courseId, setCourseId, setActiveStep, pushFeedback }) => {
  // --- UI & Loading State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- Form Data State ---
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

  // --- File Upload State ---
  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState('');
  const courseFileInputRef = useRef(null);

  // --- Quill Configuration ---
  const quillModules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleInputChange = (field, value) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
  };

  const processImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setCourseThumbnail(file);
      setCourseThumbnailPreview(URL.createObjectURL(file));
    } else {
      pushFeedback('Invalid file format. Please upload an image (JPG, PNG, WEBP).', 'error');
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // ==========================================
  // API SUBMISSION (THE TWO-STEP SAVE)
  // ==========================================

  const saveBasicInfo = async () => {
    // 1. Client-Side Validation
    if (!basicInfo.title || basicInfo.title.trim() === '') {
      return pushFeedback('Course title is required to proceed.', 'error');
    }
    if (basicInfo.durationWeeks <= 0 || basicInfo.requiredHours <= 0) {
      return pushFeedback('Duration and required hours must be greater than zero.', 'error');
    }
    
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      // ---------------------------------------------------------
      // STEP 1: Send Pure JSON to establish the course record
      // ---------------------------------------------------------
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

      const endpoint = courseId ? `${API_BASE_URL}/api/courses/${courseId}` : `${API_BASE_URL}/api/courses`;
      const method = courseId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }, 
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create course.');

      const extractedId = courseId || data?.data?.id || data?.id || data?.course?.id;
      
      if (!extractedId) {
        throw new Error("Backend did not return a valid Course ID.");
      }
      
      setCourseId(extractedId); // Lock the ID into parent state

      // ---------------------------------------------------------
      // STEP 2: Attach Thumbnail via FormData (If provided)
      // ---------------------------------------------------------
      if (courseThumbnail && extractedId) {
        try {
          const thumbData = new FormData();
          thumbData.append('thumbnail', courseThumbnail);
          thumbData.append('_method', 'PUT'); // Backend routing flag for updates

          await fetch(`${API_BASE_URL}/api/courses/${extractedId}/thumbnail`, {
            method: 'POST', // Sent as POST, but backend treats as PUT due to _method flag
            headers: { Authorization: `Bearer ${token}` }, 
            body: thumbData
          });
        } catch (e) { 
          console.warn("Thumbnail upload issue:", e); 
          // We don't throw an error here, because the main course data was successfully saved.
        }
      }
      
      pushFeedback('Course basics saved successfully.', 'success');
      setActiveStep('syllabus'); 

    } catch (error) { 
      pushFeedback(error.message, 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Destructure for cleaner HTML below
  const { title, categoryName, level, durationWeeks, requiredHours, audience, goals } = basicInfo;

  return (
    <div className="prof-step-pane is-active animate-fade-in">
      
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '8px' }}>Course Marketing Profile</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          This information will be visible on the public course landing page. Make it compelling to attract students.
        </p>
      </div>

      {/* --- IMAGE UPLOAD --- */}
      <div className="prof-field-group">
        <label style={{ display: 'block', color: '#0F172A', fontWeight: 500, marginBottom: '8px' }}>
          Course Cover Image
        </label>
        <div 
          className="prof-upload-dropzone" 
          style={{ 
            border: `2px dashed ${isDragging ? '#450468' : '#CBD5E1'}`, 
            background: isDragging ? '#F3E8FF' : '#fff', 
            borderRadius: '8px', 
            padding: '16px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            marginBottom: '1.5rem',
            transition: 'all 0.2s ease-in-out'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => courseFileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={courseFileInputRef} 
            style={{ display: 'none' }} 
            accept="image/png, image/jpeg, image/webp" 
            onChange={(e) => { if (e.target.files?.length) processImageFile(e.target.files[0]) }} 
          />
          
          <div style={{ background: '#F3E8FF', padding: '12px', borderRadius: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          
          <div>
            {courseThumbnailPreview ? (
              <img src={courseThumbnailPreview} alt="Course Preview" style={{ maxHeight: '60px', borderRadius: '4px', objectFit: 'contain' }} />
            ) : (
              <>
                <strong style={{ display: 'block', color: '#0F172A', fontSize: '0.9rem' }}>
                  {isDragging ? "Drop it right here!" : "Drop image here or click to upload."}
                </strong>
                <span style={{ color: '#64748B', fontSize: '0.8rem' }}>1920x1080 resolution recommended. (JPG, PNG, WEBP)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- FORM FIELDS --- */}
      <div className="prof-field-group">
        <label>Course Title</label>
        <input 
          className="learners-settings-field-control prof-step-input" 
          type="text" 
          placeholder="e.g. Complete React Developer Course" 
          value={title} 
          onChange={(e) => handleInputChange('title', e.target.value)} 
        />
      </div>
      
      <div className="prof-grid-two prof-basic-grid">
        <div className="prof-field-group">
          <label>Category</label>
          <div className="dropdown prof-generic-dropdown">
            <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle prof-step-input" type="button" data-bs-toggle="dropdown">
              <span className="prof-dropdown-value">{categoryName}</span>
              <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" />
            </button>
            <ul className="dropdown-menu prof-dropdown-menu">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <button 
                    className="dropdown-item" 
                    type="button" 
                    onClick={() => { 
                      handleInputChange('categoryName', cat.name); 
                      handleInputChange('categoryId', cat.id); 
                    }}>
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="prof-field-group">
          <label>Difficulty Level</label>
          <div className="dropdown prof-generic-dropdown">
            <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle prof-step-input" type="button" data-bs-toggle="dropdown">
              <span className="prof-dropdown-value">{level}</span>
              <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" />
            </button>
            <ul className="dropdown-menu prof-dropdown-menu">
              {LEVELS.map(lvl => (
                <li key={lvl}>
                  <button className="dropdown-item" type="button" onClick={() => handleInputChange('level', lvl)}>
                    {lvl}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="prof-grid-two prof-basic-grid">
        <div className="prof-field-group">
          <label>Total Duration (Weeks)</label>
          <input 
            className="learners-settings-field-control prof-step-input" 
            type="number" 
            min="1" 
            value={durationWeeks} 
            onChange={(e) => handleInputChange('durationWeeks', e.target.value)} 
          />
        </div>
        <div className="prof-field-group">
          <label>Time Commitment (Hours/Week)</label>
          <input 
            className="learners-settings-field-control prof-step-input" 
            type="number" 
            min="1" 
            value={requiredHours} 
            onChange={(e) => handleInputChange('requiredHours', e.target.value)} 
          />
        </div>
      </div>
      
      {/* --- RICH TEXT EDITORS --- */}
      <div className="prof-field-group">
        <label>Target Audience (Who is this for?)</label>
        <ReactQuill 
          theme="snow" 
          modules={quillModules} 
          value={audience} 
          onChange={(val) => handleInputChange('audience', val)} 
          placeholder="e.g. Beginners wanting to learn web development..." 
        />
      </div>

      <div className="prof-field-group">
        <label>Course Objectives (What will they learn?)</label>
        <ReactQuill 
          theme="snow" 
          modules={quillModules} 
          value={goals} 
          onChange={(val) => handleInputChange('goals', val)} 
          placeholder="By the end of this course, students will be able to..." 
        />
      </div>

      {/* --- SUBMIT --- */}
      <div className="prof-lesson-actions-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={saveBasicInfo} 
          disabled={isSubmitting} 
          style={{ background: '#450468', color: '#fff', padding: '10px 32px', borderRadius: '8px', border: 'none', fontWeight: 600, transition: 'background 0.2s' }}
        >
          {isSubmitting ? 'Saving...' : 'Save & Continue to Syllabus'}
        </button>
      </div>
      
    </div>
  );
};

export default BasicInfo;
import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 
import LearnerLoadError from '../../learner/LearnerLoadError';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Web Development' },
  { id: 2, name: 'Mobile Development' },
  { id: 3, name: 'Data Science' },
  { id: 4, name: 'Programming Basics' },
  { id: 6, name: 'Mathematics and Science' }
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LANGUAGES = ['English', 'French', 'Spanish', 'Swahili', 'Kinyarwanda'];

const BasicInfo = ({ courseId, setCourseId, setActiveStep, pushFeedback }) => {
  // --- UI & Loading State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [categoriesError, setCategoriesError] = useState('');
  const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);
  const [courseLoadError, setCourseLoadError] = useState('');
  const [courseReloadKey, setCourseReloadKey] = useState(0);

  // --- Form Data State ---
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    subtitle: '',
    description: '',
    intro_message: '',
    categoryId: FALLBACK_CATEGORIES[0].id,
    categoryName: FALLBACK_CATEGORIES[0].name,
    level: LEVELS[0],
    language: 'English',
    durationWeeks: 4,
    requiredHours: 6,
    audience: '',
    goals: '',
  });

  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          const filtered = data.data.filter(cat => cat.type === 'course' || cat.type === 'general');
          if (filtered.length === 0) {
            setCategoriesError('No course categories are available right now.');
            return;
          }
          setCategories(filtered);
          setBasicInfo(prev => {
            if (!prev.categoryId || prev.categoryId === FALLBACK_CATEGORIES[0].id) {
              return {
                ...prev,
                categoryId: filtered[0].id,
                categoryName: filtered[0].name
              };
            }
            return prev;
          });
        } else {
          setCategoriesError(data.message || 'Could not load categories.');
        }
      } catch (err) {
        setCategoriesError(err.message || 'Could not load categories.');
      }
    };
    fetchCategories();
  }, [categoriesReloadKey]);

  // Fetch course details if courseId exists
  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      setCourseLoadError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const course = data.data;
          setBasicInfo({
            title: course.title || '',
            subtitle: course.subtitle || '',
            description: course.description || '',
            intro_message: course.intro_message || '',
            categoryId: course.category_id || FALLBACK_CATEGORIES[0].id,
            categoryName: course.category || FALLBACK_CATEGORIES[0].name,
            level: course.level ? (course.level.charAt(0).toUpperCase() + course.level.slice(1)) : LEVELS[0],
            language: course.language || 'English',
            durationWeeks: course.duration_weeks || 4,
            requiredHours: course.required_hours_per_week || 6,
            audience: course.target_audience || '',
            goals: course.objectives || '',
          });
          if (course.thumbnail_url) {
            setCourseThumbnailPreview(course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `${API_BASE_URL}${course.thumbnail_url}`);
          }
        } else {
          setCourseLoadError(data.message || 'Could not load course details.');
        }
      } catch (err) {
        setCourseLoadError(err.message || 'Could not load course details.');
      }
    };
    fetchCourse();
  }, [courseId, courseReloadKey]);

  // --- File Upload State ---
  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState('');
  const courseFileInputRef = useRef(null);

  // --- Quill Configuration ---
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [3, 4, false] }],
      ['bold', 'italic', 'underline', 'code'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['code-block'],
      [{ align: [] }],
      ['link'],
      ['clean'],
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
        subtitle: basicInfo.subtitle,
        description: basicInfo.description,
        intro_message: basicInfo.intro_message,
        category_id: Number(basicInfo.categoryId),
        category: basicInfo.categoryName,
        level: basicInfo.level.toLowerCase(),
        education_level: basicInfo.level,
        language: basicInfo.language,
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
      setActiveStep('weeks'); 

    } catch (error) { 
      pushFeedback(error.message, 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Destructure for cleaner HTML below
  const { title, subtitle, description, intro_message, categoryName, level, language, durationWeeks, requiredHours, audience, goals } = basicInfo;

  return (
    <div className="prof-step-pane is-active animate-fade-in">
      {categoriesError ? (
        <LearnerLoadError
          title="Could not load categories"
          message={categoriesError}
          onRetry={() => setCategoriesReloadKey((key) => key + 1)}
        />
      ) : null}

      {courseLoadError ? (
        <LearnerLoadError
          title="Could not load course"
          message={courseLoadError}
          onRetry={() => setCourseReloadKey((key) => key + 1)}
        />
      ) : null}

      {/* --- IMAGE UPLOAD --- */}
      <div className="prof-field-group">
        <label className="prof-field-label">Course Cover Image</label>
        {courseThumbnailPreview ? (
          <div className="prof-cover-preview-card">
            <img src={courseThumbnailPreview} alt="Course Preview" className="prof-cover-preview-image" />
            <div className="prof-cover-preview-overlay">
              <button 
                type="button" 
                className="prof-cover-change-btn"
                onClick={() => courseFileInputRef.current?.click()}
              >
                Change Image
              </button>
              <button 
                type="button" 
                className="prof-cover-remove-btn"
                onClick={() => {
                  setCourseThumbnail(null);
                  setCourseThumbnailPreview('');
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={`prof-upload-dropzone ${isDragging ? 'is-dragging' : ''}`} 
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
            
            <div className="prof-upload-dropzone-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            
            <div className="prof-upload-dropzone-text">
              <strong>Drag & drop a course cover, or <span>browse files</span></strong>
              <small>Recommend 16:9 aspect ratio. JPG, PNG or WEBP.</small>
            </div>
          </div>
        )}
      </div>

      {/* --- FORM FIELDS --- */}
      <div className="prof-field-group">
        <label className="prof-field-label">Course Title</label>
        <input 
          className="prof-step-input-premium" 
          type="text" 
          placeholder="e.g. Complete React Developer Course" 
          value={title} 
          onChange={(e) => handleInputChange('title', e.target.value)} 
        />
      </div>

      <div className="prof-field-group">
        <label className="prof-field-label">Course Subtitle</label>
        <input 
          className="prof-step-input-premium" 
          type="text" 
          placeholder="e.g. Master React, Redux, Hooks, and GraphQL from scratch" 
          value={subtitle} 
          onChange={(e) => handleInputChange('subtitle', e.target.value)} 
        />
      </div>
      
      <div className="prof-grid-two">
        <div className="prof-field-group">
          <label className="prof-field-label">Category</label>
          <div className="dropdown prof-generic-dropdown">
            <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown">
              <span className="prof-dropdown-value">{categoryName}</span>
              <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <ul className="dropdown-menu prof-dropdown-menu-premium">
              {categories.map(cat => (
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
          <label className="prof-field-label">Difficulty Level</label>
          <div className="dropdown prof-generic-dropdown">
            <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown">
              <span className="prof-dropdown-value">{level}</span>
              <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <ul className="dropdown-menu prof-dropdown-menu-premium">
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="prof-field-group" style={{ marginBottom: 0 }}>
          <label className="prof-field-label">Language</label>
          <div className="dropdown prof-generic-dropdown">
            <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown">
              <span className="prof-dropdown-value">{language}</span>
              <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <ul className="dropdown-menu prof-dropdown-menu-premium">
              {LANGUAGES.map(lang => (
                <li key={lang}>
                  <button className="dropdown-item" type="button" onClick={() => handleInputChange('language', lang)}>
                    {lang}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="prof-field-group" style={{ marginBottom: 0 }}>
          <label className="prof-field-label">Total Duration (Weeks)</label>
          <input 
            className="prof-step-input-premium" 
            type="number" 
            min="1" 
            value={durationWeeks} 
            onChange={(e) => handleInputChange('durationWeeks', e.target.value)} 
          />
        </div>
        
        <div className="prof-field-group" style={{ marginBottom: 0 }}>
          <label className="prof-field-label">Time Commitment (Hours/Week)</label>
          <input 
            className="prof-step-input-premium" 
            type="number" 
            min="1" 
            value={requiredHours} 
            onChange={(e) => handleInputChange('requiredHours', e.target.value)} 
          />
        </div>
      </div>

      {/* --- RICH TEXT EDITORS (match seed HTML: description, intro, audience, objectives) --- */}
      <div className="prof-field-group">
        <label className="prof-field-label">Course Description</label>
        <div className="prof-quill-wrapper-premium">
          <ReactQuill
            theme="snow"
            modules={quillModules}
            value={description}
            onChange={(val) => handleInputChange('description', val)}
            placeholder="Provide a rich overview of the course (headings, lists, emphasis)..."
          />
        </div>
      </div>

      <div className="prof-field-group">
        <label className="prof-field-label">Welcome / Intro Message for Enrolled Students</label>
        <div className="prof-quill-wrapper-premium">
          <ReactQuill
            theme="snow"
            modules={quillModules}
            value={intro_message}
            onChange={(val) => handleInputChange('intro_message', val)}
            placeholder="A welcome message students see when they enroll..."
          />
        </div>
      </div>

      <div className="prof-field-group">
        <label className="prof-field-label">Target Audience (Who is this for?)</label>
        <div className="prof-quill-wrapper-premium">
          <ReactQuill 
            theme="snow" 
            modules={quillModules} 
            value={audience} 
            onChange={(val) => handleInputChange('audience', val)} 
            placeholder="e.g. Beginners wanting to learn web development..." 
          />
        </div>
      </div>

      <div className="prof-field-group">
        <label className="prof-field-label">Course Objectives (What will they learn?)</label>
        <div className="prof-quill-wrapper-premium">
          <ReactQuill 
            theme="snow" 
            modules={quillModules} 
            value={goals} 
            onChange={(val) => handleInputChange('goals', val)} 
            placeholder="By the end of this course, students will be able to..." 
          />
        </div>
      </div>

      {/* --- SUBMIT --- */}
      <div className="prof-actions-footer-premium">
        <button 
          type="button" 
          className="prof-btn-primary-premium" 
          onClick={saveBasicInfo} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving Profile...' : 'Save & Continue to Curriculum'}
        </button>
      </div>
      
    </div>
  );
};

export default BasicInfo;
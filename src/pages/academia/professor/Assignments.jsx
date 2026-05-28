import React, { useState, useRef, useEffect } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './assignments.css';

// Reusable SVG Toolbar Component
const RichTextToolbar = () => (
  <div className="prof-toolbar" aria-hidden="true">
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Bold"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Italic"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13"/><path d="M8 3h4"/><path d="M4 13h4"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Underline"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3"/><path d="M4 13h8"/></svg></button>
    <span className="prof-toolbar-sep"></span>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Bulleted List"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="4" cy="6" r="1.5"/><line x1="7" y1="6" x2="13" y2="6"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Numbered List"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><text x="2" y="7.5" fontSize="6" fill="#64748B">1.</text><line x1="7" y1="6" x2="13" y2="6"/></svg></button>
    <span className="prof-toolbar-sep"></span>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Align Left"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="3" y1="5" x2="13" y2="5"/><line x1="3" y1="8" x2="9" y2="8"/><line x1="3" y1="11" x2="13" y2="11"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Align Center"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="5" y1="5" x2="11" y2="5"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="5" y1="11" x2="11" y2="11"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Align Right"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="3" y1="5" x2="13" y2="5"/><line x1="7" y1="8" x2="13" y2="8"/><line x1="3" y1="11" x2="13" y2="11"/></svg></button>
  </div>
);

const Assignments = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Table Data & Pagination State ---
  const allRows = [
    { id: 1, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '231', score: '34.67', time: '90 Min', certs: '21', status: 'Completed' },
    { id: 2, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '23', score: '35.45', time: '90 Min', certs: '12', status: 'Not-Checked' },
    { id: 3, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '---', score: '---', time: '90 Min', certs: '---', status: 'Not-Published' },
    { id: 4, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '123', score: '19.52', time: '90 Min', certs: '1', status: 'Completed' },
    { id: 5, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '4', score: '67.43', time: '90 Min', certs: '1', status: 'Completed' },
    { id: 6, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '4', score: '67.43', time: '90 Min', certs: '1', status: 'Completed' },
    { id: 7, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '331', score: '67.43', time: '90 Min', certs: '33', status: 'Completed' },
    { id: 8, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '4', score: '67.43', time: '90 Min', certs: '3', status: 'Completed' },
    { id: 9, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '4', score: '67.43', time: '90 Min', certs: '4', status: 'Completed' },
    { id: 10, title: 'Javascript Fundamental Quiz', type: 'Objective Assessment', attempts: '4', score: '67.43', time: '90 Min', certs: '3', status: 'Completed' },
  ];

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allRows.length / pageSize);
  
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = allRows.slice(startIndex, startIndex + pageSize);

  // --- Table Selection State ---
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const selectAllRef = useRef(null);

  const isAllVisibleSelected = currentRows.length > 0 && currentRows.every(row => selectedRowIds.has(row.id));
  const isSomeVisibleSelected = currentRows.some(row => selectedRowIds.has(row.id));

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = new Set(selectedRowIds);
    currentRows.forEach(row => {
      if (isChecked) newSelection.add(row.id);
      else newSelection.delete(row.id);
    });
    setSelectedRowIds(newSelection);
  };

  const handleSelectRow = (id) => {
    const newSelection = new Set(selectedRowIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedRowIds(newSelection);
  };

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
    }
  }, [isSomeVisibleSelected, isAllVisibleSelected]);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('basic'); // basic, lesson, pricing
  const stepOrder = ['basic', 'lesson', 'pricing'];

  const getStepIcon = (stepName) => {
    const currentIndex = stepOrder.indexOf(modalStep);
    const thisIndex = stepOrder.indexOf(stepName);
    return thisIndex <= currentIndex ? '/assets/icons/check-circle.svg' : '/assets/icons/no-check-circle.svg';
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) setIsModalOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // --- Modal Form State ---
  const [assessmentType, setAssessmentType] = useState('formative');
  const [answerMode, setAnswerMode] = useState('checkbox'); // checkbox, radio, optional
  
  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  return (
    <ProfessorLayout currentPage="assignments">
      <section className="prof-page assessments-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Home</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/van.svg" alt="" />
                <span>View Analytics</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="#" onClick={preventDefault}>
                <span>Go to website</span>
                <img src="/assets/icons/exit-right.svg" alt="" />
              </a>
            </div>
          </div>
        </section>

        <section className="assessments-hero">
          <div className="assessments-hero-copy">
            <h2>Assessments</h2>
            <p>Tests and Exams</p>
          </div>

          <div className="assessments-hero-actions">
            <div className="assessments-search">
              <img src="/assets/icons/magnifier.svg" alt="Search" />
              <input type="search" placeholder="Search Assignments..." aria-label="Search Assignments" />
            </div>

            <button type="button" className="assessments-create-btn" onClick={() => { setModalStep('basic'); setIsModalOpen(true); }}>
              <img src="/assets/icons/plus.svg" alt="" aria-hidden="true" />
              <span>Create new test</span>
            </button>
          </div>
        </section>

        <div className="assessments-table-wrap">
          <div className="table-responsive">
            <table className="assessments-table">
              <thead>
                <tr>
                  <th className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select all assignments">
                      <input type="checkbox" ref={selectAllRef} checked={isAllVisibleSelected} onChange={handleSelectAll} />
                      <span></span>
                    </label>
                  </th>
                  <th>
                    <span>Assignment Details ({allRows.length})</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Assignment Type</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Students Attempts</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Avg. Score</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Time Attempt (Min)</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Certificates</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Status</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => {
                  const statusClass = row.status.toLowerCase().replace(/ /g, '-');
                  return (
                    <tr key={row.id}>
                      <td className="is-checkbox">
                        <label className="prof-table-checkbox" aria-label={`Select assignment ${row.id}`}>
                          <input type="checkbox" checked={selectedRowIds.has(row.id)} onChange={() => handleSelectRow(row.id)} />
                          <span></span>
                        </label>
                      </td>
                      <td>
                        <div className="assessments-details">
                          <h4>{row.title}</h4>
                          <p>12 Jan 2024</p>
                        </div>
                      </td>
                      <td>
                        <div className="assessments-type">
                          <span>{row.type}</span>
                          <p>Question</p>
                        </div>
                      </td>
                      <td>{row.attempts}</td>
                      <td>{row.score}</td>
                      <td>{row.time}</td>
                      <td>{row.certs}</td>
                      <td>
                        <span className={`assessments-status assessments-status--${statusClass}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="assessments-footer">
            <div className="assessments-per-page">
              <span>Show</span>
              <div className="dropdown assessments-per-page-dropdown">
                <button type="button" className="dropdown-toggle assessments-per-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                  <img src="/assets/icons/drop.svg" alt="" />
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPageSize(5); setCurrentPage(1); }}>5</a></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPageSize(10); setCurrentPage(1); }}>10</a></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPageSize(25); setCurrentPage(1); }}>25</a></li>
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="assessments-pagination">
              <span>{Math.min(startIndex + 1, allRows.length)}-{Math.min(startIndex + pageSize, allRows.length)} of {allRows.length}</span>
              <button type="button" className="assessments-page-nav" aria-label="Previous" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button 
                  key={num} 
                  type="button" 
                  className={`assessments-page-num ${currentPage === num ? 'is-active' : ''}`} 
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}
              <button type="button" className="assessments-page-nav" aria-label="Next" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- ASSESSMENTS MODAL --- */}
      <div className={`assessments-modal ${isModalOpen ? 'is-open' : ''}`} aria-hidden={!isModalOpen}>
        <div className="assessments-modal__backdrop" onClick={() => setIsModalOpen(false)}></div>
        <div className="assessments-modal__dialog" role="dialog" aria-modal="true">
          <div className="assessments-modal__header">
            <h2>Prepare Assessment</h2>
            <button type="button" className="assessments-modal__close" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
              <img src="/assets/icons/popup-close.svg" alt="" />
            </button>
          </div>

          <div className="assessments-modal__body">
            <div className="prof-prepare-steps assessments-modal-steps" aria-label="Steps">
              <div className={`prof-prepare-step ${modalStep === 'basic' ? 'is-active' : ''}`} onClick={() => setModalStep('basic')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('basic')} alt="" aria-hidden="true" />
                <span>Test Information</span>
              </div>
              <div className={`prof-prepare-step ${modalStep === 'lesson' ? 'is-active' : ''}`} onClick={() => setModalStep('lesson')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('lesson')} alt="" aria-hidden="true" />
                <span>Question Preparations</span>
              </div>
              <div className={`prof-prepare-step ${modalStep === 'pricing' ? 'is-active' : ''}`} onClick={() => setModalStep('pricing')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('pricing')} alt="" aria-hidden="true" />
                <span>Assigning</span>
              </div>
            </div>

            {/* MODAL STEP 1: BASIC */}
            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'basic' ? 'is-active' : ''}`}>
              <div className="assessments-modal-modes">
                <label className={`assessments-modal-radio ${assessmentType === 'formative' ? 'is-selected' : ''}`}>
                  <input type="radio" name="assessmentType" checked={assessmentType === 'formative'} onChange={() => setAssessmentType('formative')} />
                  <span className="assessments-modal-radio__ui"></span>
                  <span>Formative Assessment</span>
                  <small>i</small>
                </label>
                <label className={`assessments-modal-radio ${assessmentType === 'summative' ? 'is-selected' : ''}`}>
                  <input type="radio" name="assessmentType" checked={assessmentType === 'summative'} onChange={() => setAssessmentType('summative')} />
                  <span className="assessments-modal-radio__ui"></span>
                  <span>Summative Assessment</span>
                  <small>i</small>
                </label>
              </div>

              <div className="assessments-modal-grid">
                <label className="assessments-modal-field">
                  <span>Title / Subject</span>
                  <input type="text" defaultValue="Engineering Project Site map - Quiz" />
                </label>
                <label className="assessments-modal-field">
                  <span>Required Minutes</span>
                  <input type="number" defaultValue="60" min="1" />
                </label>
              </div>

              <label className="assessments-modal-field">
                <span>Average Minimum Score</span>
                <input type="text" defaultValue="80%" />
              </label>

              <div className="prof-field-group">
                <label>Introduction Message / Rules</label>
                <RichTextToolbar />
                <textarea className="learners-settings-textarea" rows="2" placeholder="Type something..."></textarea>
              </div>

              <button type="button" className="assessments-modal-next" onClick={() => setModalStep('lesson')}>Next</button>
            </div>

            {/* MODAL STEP 2: LESSON / QUESTIONS */}
            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'lesson' ? 'is-active' : ''}`}>
              <div className="learners-read-assessment-strip">
                <div className="learners-read-assessment-strip-top">
                  <div className="learners-read-assessment-strip-title">
                    <div className="learners-read-assessment-badge" aria-hidden="true">
                      <img src="/assets/icons/le-tec.svg" alt="" />
                    </div>
                    <h3>Assessment</h3>
                  </div>
                  <div className="assessments-strip-actions">
                    <p className="learners-read-assessment-time">Time Required : <strong>2:00</strong></p>
                    <button type="button" className="assessments-edit-meta" onClick={preventDefault}>
                      <img src="/assets/icons/b-pencil.svg" alt="" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <div className="learners-read-assessment-tracker" aria-label="Question list">
                  <button type="button" className="learners-read-assessment-track-item is-current" onClick={preventDefault}>1</button>
                  <button type="button" className="learners-read-assessment-track-item" onClick={preventDefault}>2</button>
                  <button type="button" className="learners-read-assessment-track-item" onClick={preventDefault}>3</button>
                  <button type="button" className="learners-read-assessment-track-item" onClick={preventDefault}>4</button>
                  <button type="button" className="learners-read-assessment-track-item is-pending" onClick={preventDefault}>5</button>
                  <button type="button" className="learners-read-assessment-track-item is-add" onClick={preventDefault}>+</button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                className={`prof-upload-dropzone ${isDragOver ? 'is-dragover' : ''} ${uploadedFiles.length > 0 ? 'has-files' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={(e) => { if (!e.target.closest('.assessments-upload-list')) fileInputRef.current.click(); }}
              >
                <input type="file" ref={fileInputRef} className="assessments-upload-input" multiple onChange={(e) => handleFiles(e.target.files)} />
                
                {uploadedFiles.length === 0 ? (
                  <div className="assessments-upload-empty">
                    <span className="prof-upload-icon"><img src="/assets/icons/file.svg" alt="Upload" /></span>
                    <span className="prof-upload-text">Drop files here or click to upload.<br /><small>Upload case files, if any.</small></span>
                  </div>
                ) : (
                  <div className="assessments-upload-list">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="assessments-upload-file">
                        <div className="assessments-upload-file-thumb">
                          <img src="/assets/icons/file.svg" alt="" />
                        </div>
                        <div className="assessments-upload-file-name" title={file.name}>
                          {file.name.length > 10 ? file.name.substring(0, 7) + '...' : file.name}
                        </div>
                      </div>
                    ))}
                    <button type="button" className="assessments-upload-add" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                      <span>+</span>
                      <small>Add file</small>
                    </button>
                  </div>
                )}
              </div>

              <div className="prof-field-group">
                <label>Question Title (8)</label>
                <div className="prof-toolbar" aria-hidden="true">
                  <button type="button" className="prof-toolbar-btn" tabIndex="-1"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z"/></svg></button>
                  <button type="button" className="prof-toolbar-btn" tabIndex="-1"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13"/><path d="M8 3h4"/><path d="M4 13h4"/></svg></button>
                </div>
                <textarea className="learners-settings-textarea" rows="3" placeholder="Type here....."></textarea>
              </div>

              <div className="prof-field-group assessments-exercise-group">
                <div className="prof-exercise-head">
                  <label>Answers</label>
                  <div className="prof-ex-controls-top">
                    <div className="prof-ex-mode">
                      <label className={`prof-ex-mode-btn ${answerMode === 'checkbox' ? 'is-active' : ''}`}>
                        <input className="prof-ex-mode-radio" type="radio" name="assessmentAnswerMode" checked={answerMode === 'checkbox'} onChange={() => setAnswerMode('checkbox')} />
                        <span>Checkbox</span><small>i</small>
                      </label>
                      <label className={`prof-ex-mode-btn ${answerMode === 'radio' ? 'is-active' : ''}`}>
                        <input className="prof-ex-mode-radio" type="radio" name="assessmentAnswerMode" checked={answerMode === 'radio'} onChange={() => setAnswerMode('radio')} />
                        <span>Radio Choose</span><small>i</small>
                      </label>
                      <label className={`prof-ex-mode-btn ${answerMode === 'optional' ? 'is-active' : ''}`}>
                        <input className="prof-ex-mode-radio" type="radio" name="assessmentAnswerMode" checked={answerMode === 'optional'} onChange={() => setAnswerMode('optional')} />
                        <span>Optional Reply</span><small>i</small>
                      </label>
                    </div>
                  </div>
                </div>

                <RichTextToolbar />
                <textarea id="assessmentAnswers" className="learners-settings-textarea" rows="2" placeholder="Type a question..."></textarea>

                <ul className={`prof-exercise-answers assessments-exercise-answers mode-${answerMode}`}>
                  <li>
                    <span className="assessments-ex-answer-copy">
                      {answerMode !== 'optional' && <input className="assessments-ex-answer-input" type={answerMode === 'radio' ? 'radio' : 'checkbox'} name="ans1" />}
                      <span><u>Preparation:</u> Establishing policies, training the incident response team...</span>
                    </span>
                    <span className="prof-ex-answer-actions">
                      <button type="button" aria-label="Correct"><img src="/assets/icons/as2.svg" alt="Correct" /></button>
                      <button type="button" aria-label="Update"><img src="/assets/icons/b-pencil.svg" alt="Update" /></button>
                    </span>
                  </li>
                  <li>
                    <span className="assessments-ex-answer-copy">
                      {answerMode !== 'optional' && <input className="assessments-ex-answer-input" type={answerMode === 'radio' ? 'radio' : 'checkbox'} name="ans1" />}
                      <span><u>Identification:</u> Monitoring systems to detect potential breaches...</span>
                    </span>
                    <span className="prof-ex-answer-actions">
                      <button type="button" aria-label="Wrong"><img src="/assets/icons/as4.svg" alt="Wrong" /></button>
                      <button type="button" aria-label="Update"><img src="/assets/icons/b-pencil.svg" alt="Update" /></button>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="assessments-modal-step-actions assessments-modal-step-actions--lesson">
                <button type="button" className="assessments-modal-secondary" onClick={preventDefault}>Save Draft</button>
                <button type="button" className="assessments-modal-next" onClick={() => setModalStep('pricing')}>Next</button>
                <button type="button" className="assessments-modal-secondary is-disabled" disabled>Done</button>
              </div>
            </div>

            {/* MODAL STEP 3: ASSIGNING */}
            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'pricing' ? 'is-active' : ''}`}>
              <div className="assessments-assign-pane">
                <div className="assessments-assign-block">
                  <label>Assign the assessment to</label>
                  <div className="assessments-assign-search-wrap">
                    <img src="/assets/icons/magnifier.svg" alt="" aria-hidden="true" />
                    <input type="text" placeholder="@ - Course name..." />
                    <img className="assessments-assign-caret" src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                  </div>
                  <div className="assessments-assign-selected">
                    <span className="assessments-assign-dot" aria-hidden="true"></span>
                    <span>Cyber Security</span>
                    <button type="button" aria-label="Remove assignment" onClick={preventDefault}>&times;</button>
                  </div>
                </div>

                <div className="assessments-assign-grid">
                  <label className="assessments-modal-field assessments-assign-field">
                    <span>Status</span>
                    <div className="assessments-assign-input-wrap">
                      <input type="text" defaultValue="Draft" aria-label="Assessment status" />
                      <img src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                    </div>
                  </label>
                  <label className="assessments-modal-field assessments-assign-field">
                    <span>Maximum Attempts</span>
                    <div className="assessments-assign-input-wrap">
                      <input type="number" defaultValue="3" min="1" aria-label="Maximum attempts" />
                    </div>
                  </label>
                </div>

                <div className="prof-field-group assessments-thanks-group">
                  <label>Thanks Message!</label>
                  <RichTextToolbar />
                  <textarea className="learners-settings-textarea" rows="4" placeholder="Type something..."></textarea>
                </div>
              </div>

              <div className="assessments-modal-step-actions assessments-modal-step-actions--pricing">
                <button type="button" className="assessments-modal-next assessments-modal-next--done" onClick={() => { setModalStep('basic'); setIsModalOpen(false); }}>Done</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default Assignments;
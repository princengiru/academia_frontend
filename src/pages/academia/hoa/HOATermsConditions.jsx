import React, { useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-terms-conditions.css';

// Reusing standard project icons
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoarules from '../../../assets/icons/hoarules.svg';
import hoaeditrule from '../../../assets/icons/hoaeditrule.svg';
import hoaattach from '../../../assets/icons/hoaattach.svg';
import rule_image1 from '../../../assets/imgs/rule-image1.png';
import rule_image2 from '../../../assets/imgs/rule-image2.png';

// Custom Inline SVGs
const IconPlus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const IconRuleBook = () => (
<img src={hoarules} alt="Rule Book" />
);

const IconPencil = () => (
<img src={hoaeditrule} alt="Edit Rule" />
);

const IconChevronRight = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const IconChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const IconClose = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const IconAttachment = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
);

const HOATermsConditions = () => {
    // State to toggle between grid and detail views
    const [currentView, setCurrentView] = useState('grid'); // 'grid' | 'detail'
    // State to toggle the edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Dummy data for the grid
    const rulesData = [
        { id: 1, title: 'User Regulations', status: 'Not-Approved', tags: ['Team Crew', 'Learners', 'Visitor', 'Authors', 'Project Uploaders', 'Store Clients'] },
        { id: 2, title: "Learner's Rules", status: 'Active', tags: ['Team Crew', 'Learners', 'Visitor', 'Authors', 'Project Uploaders', 'Store Clients'] },
        { id: 3, title: "Tutor's Rules", status: 'In-Review', tags: ['Team Crew', 'Learners', 'Visitor', 'Authors', 'Project Uploaders', 'Store Clients'] },
        { id: 4, title: 'Community Engagement', status: 'Active', tags: ['Team Crew', 'Learners', 'Visitor', 'Authors', 'Project Uploaders', 'Store Clients'] },
        { id: 5, title: 'Certificates Regulations', status: 'Active', tags: ['Team Crew', 'Learners', 'Visitor', 'Authors', 'Project Uploaders', 'Store Clients'] },
        { id: 6, title: 'Projects Regulations', status: 'Active', tags: ['Team Crew', 'Learners', 'Visitor', 'Authors', 'Project Uploaders', 'Store Clients'] },
    ];

    const openDetailView = () => setCurrentView('detail');
    const goBackToGrid = () => setCurrentView('grid');

    return (
        <HOALayout currentPage="terms-conditions">
            <div className="hoatc-page-wrapper">
                
                {/* Page Header (Persistent) */}
                <div className="hoatc-page-header">
                    <h1>Terms & Conditions</h1>
                    <div className="hoatc-header-actions">
                        <button className="hoatc-btn-outline">
                            <IconPlus /> Add New Rule
                        </button>
                        <button className="hoatc-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* =========================================
                    VIEW 1: GRID VIEW
                ========================================= */}
                {currentView === 'grid' && (
                    <div className="hoatc-view-fade-in">
                        <div className="hoatc-section-header">
                            <h3>ACADEMIA RULES</h3>
                        </div>

                        <div className="hoatc-grid">
                            {rulesData.map((rule) => (
                                <div key={rule.id} className="hoatc-card">
                                    <div className="hoatc-card-header">
                                        <div className="hoatc-card-icon-wrapper">
                                            <IconRuleBook />
                                        </div>
                                        <div className="hoatc-card-actions">
                                            <span className={`hoatc-status-pill hoatc-status-${rule.status.toLowerCase().replace('-', '')}`}>
                                                <span className="hoatc-dot"></span> {rule.status}
                                            </span>
                                            <button className="hoatc-icon-btn"><IconPencil /></button>
                                        </div>
                                    </div>
                                    <div className="hoatc-card-body">
                                        <h4>{rule.title}</h4>
                                        <p className="hoatc-card-desc">A Broad Perspective on Our Comprehensive Security Features and Policies.</p>
                                        <div className="hoatc-tags-list">
                                            {rule.tags.map((tag, idx) => (
                                                <span key={idx} className="hoatc-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hoatc-card-footer">
                                        <button className="hoatc-btn-continue" onClick={openDetailView}>
                                            Continue <IconChevronRight />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* =========================================
                    VIEW 2: DETAIL VIEW
                ========================================= */}
                {currentView === 'detail' && (
                    <div className="hoatc-view-fade-in">
                        
                        {/* Detail Header / Breadcrumbs */}
                        <div className="hoatc-detail-header-row">
                            <div className="hoatc-breadcrumbs-wrapper">
                                <button className="hoatc-btn-back" onClick={goBackToGrid}>
                                    <IconChevronLeft />
                                </button>
                                <span className="hoatc-breadcrumb-text">
                                    <strong>Academia Rules</strong> <span className="hoatc-divider">/</span> Learner's Rules
                                </span>
                            </div>
                            <div className="hoatc-detail-actions">
                                <span className="hoatc-view-count">Viewed : 31 %</span>
                                <button className="hoatc-btn-outline-small" onClick={() => setIsEditModalOpen(true)}>
                                    <IconPencil /> Edit
                                </button>
                            </div>
                        </div>

                        {/* Detail Content */}
                        <div className="hoatc-detail-content">
                            <h2 className="hoatc-detail-title">Learner's Rules</h2>
                            
                            <p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
                            
                            <p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
                            
                            <h3 className="hoatc-detail-subtitle">1. How to Login and verify your number ~ Not Receiving the code</h3>
                            
                            <p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
                            
                            <p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>

                            {/* Images mockup wrapper */}
                            <div className="hoatc-detail-images">
                                <div className="hoatc-image-placeholder">
                                    <img src={rule_image1} alt="Screenshot 1" />
                                </div>
                                <div className="hoatc-image-placeholder">
                                    <img src={rule_image2} alt="Screenshot 2" />
                                </div>
                            </div>

                            <h3 className="hoatc-detail-subtitle">2. How to get started in courses and syllabus</h3>
                            
                            <p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
                            
                            <p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data.</p>
                        </div>
                    </div>
                )}

                {/* =========================================
                    MODAL: EDIT RULES
                ========================================= */}
                <div className={`hoatc-modal-overlay ${isEditModalOpen ? 'open' : ''}`} onClick={() => setIsEditModalOpen(false)}>
                    <div className="hoatc-modal-content" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="hoatc-modal-header">
                            <h2>Edit Rules</h2>
                            <button className="hoatc-modal-close" onClick={() => setIsEditModalOpen(false)}>
                                <IconClose />
                            </button>
                        </div>

                        <div className="hoatc-modal-body">
                            
                            <div className="hoatc-input-group">
                                <label>Title / Subject</label>
                                <input type="text" defaultValue="Learner's Rules" />
                            </div>

                            <div className="hoatc-input-group">
                                <label>Add Tags</label>
                                <div className="hoatc-input-with-icon">
                                    <input type="text" placeholder="Add Tags" />
                                    <button className="hoatc-add-tag-btn"><IconPlus /></button>
                                </div>
                                <div className="hoatc-active-tags">
                                    <span className="hoatc-tag-pill">Authors <button>×</button></span>
                                    <span className="hoatc-tag-pill">Learners <button>×</button></span>
                                </div>
                            </div>

                            <div className="hoatc-input-group">
                                <label>Describe the Rules</label>
                                <div className="hoatc-rich-text-editor">
                                    <div className="hoatc-rt-toolbar">
                                        <div className="hoatc-rt-tools-left">
                                            {/* Mocking rich text toolbar icons with simple text/symbols for structure */}
                                            <button className="hoatc-rt-tool"><b>B</b></button>
                                            <button className="hoatc-rt-tool"><i>I</i></button>
                                            <button className="hoatc-rt-tool"><u>U</u></button>
                                            <button className="hoatc-rt-tool"><s>S</s></button>
                                            <span className="hoatc-rt-divider"></span>
                                            <button className="hoatc-rt-tool">≣</button>
                                            <button className="hoatc-rt-tool">≡</button>
                                            <button className="hoatc-rt-tool">⍂</button>
                                            <button className="hoatc-rt-tool">⍃</button>
                                        </div>
                                        <button className="hoatc-btn-attachment">
                                            <IconAttachment /> Add an attachment
                                        </button>
                                    </div>
                                    
                                    <div className="hoatc-rt-textarea" contentEditable="true" suppressContentEditableWarning={true}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#450468' }}>Learner's Rules</h4>
                                        <p style={{ margin: '0 0 16px 0' }}>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings</p>
                                        
                                        <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#78829D' }}>1. How to Login and verify your number ~ Not Receiving the code</h5>
                                        <p style={{ margin: '0 0 16px 0' }}>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
                                        
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                            <div style={{ width: '80px', height: '60px', background: '#F1F1F4', borderRadius: '4px', position: 'relative' }}>
                                                <svg style={{ position: 'absolute', bottom: '4px', right: '4px', opacity: 0.5 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                                            </div>
                                            <div style={{ width: '80px', height: '60px', background: '#F1F1F4', borderRadius: '4px', position: 'relative' }}>
                                                <svg style={{ position: 'absolute', bottom: '4px', right: '4px', opacity: 0.5 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                                            </div>
                                        </div>

                                        <p style={{ margin: '0 0 16px 0' }}>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
                                        <p style={{ margin: 0 }}>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="hoatc-modal-footer">
                            <button className="hoatc-btn-done" onClick={() => setIsEditModalOpen(false)}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </HOALayout>
    );
};

export default HOATermsConditions;
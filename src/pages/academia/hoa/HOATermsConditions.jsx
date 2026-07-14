import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { HOA_RULES } from './hoaTermsRules';
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    const [currentView, setCurrentView] = useState('grid');
    const [selectedRuleId, setSelectedRuleId] = useState(HOA_RULES[1]?.id ?? 1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const selectedRule = HOA_RULES.find((rule) => rule.id === selectedRuleId) || HOA_RULES[0];

    const openDetailView = (ruleId) => {
        setSelectedRuleId(ruleId);
        setCurrentView('detail');
    };
    const goBackToGrid = () => setCurrentView('grid');

    return (
        <HOALayout currentPage="terms-conditions">
            <div className="hoatc-page-wrapper">
                
                {/* Page Header (Persistent) */}
                <div className="hoatc-page-header">
                    <h1>Terms & Conditions</h1>
                    <div className="hoatc-header-actions">
                        <Link to="/academia/terms" className="hoatc-btn-outline" target="_blank" rel="noreferrer">
                            Public terms
                        </Link>
                        <button type="button" className="hoatc-btn-outline" disabled title="Coming soon">
                            <IconPlus /> Add New Rule
                        </button>
                        <button type="button" className="hoatc-btn-primary" onClick={() => window.open('/academia/terms', '_blank')}>
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
                            {HOA_RULES.map((rule) => (
                                <div key={rule.id} className="hoatc-card">
                                    <div className="hoatc-card-header">
                                        <div className="hoatc-card-icon-wrapper">
                                            <IconRuleBook />
                                        </div>
                                        <div className="hoatc-card-actions">
                                            <span className={`hoatc-status-pill hoatc-status-${rule.status.toLowerCase().replace('-', '')}`}>
                                                <span className="hoatc-dot"></span> {rule.status}
                                            </span>
                                            <button type="button" className="hoatc-icon-btn" disabled title="Coming soon"><IconPencil /></button>
                                        </div>
                                    </div>
                                    <div className="hoatc-card-body">
                                        <h4>{rule.title}</h4>
                                        <p className="hoatc-card-desc">{rule.description}</p>
                                        <div className="hoatc-tags-list">
                                            {rule.tags.map((tag) => (
                                                <span key={tag} className="hoatc-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hoatc-card-footer">
                                        <button type="button" className="hoatc-btn-continue" onClick={() => openDetailView(rule.id)}>
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
                                    <strong>Academia Rules</strong> <span className="hoatc-divider">/</span> {selectedRule.title}
                                </span>
                            </div>
                            <div className="hoatc-detail-actions">
                                <span className="hoatc-view-count">Status: {selectedRule.status}</span>
                                <button type="button" className="hoatc-btn-outline-small" onClick={() => setIsEditModalOpen(true)} disabled title="Coming soon">
                                    <IconPencil /> Edit
                                </button>
                            </div>
                        </div>

                        <div className="hoatc-detail-content">
                            <h2 className="hoatc-detail-title">{selectedRule.title}</h2>
                            <p>{selectedRule.description}</p>
                            <p>
                                These HOA rules complement the public{' '}
                                <Link to="/academia/terms" target="_blank" rel="noreferrer">Academia Terms and Conditions</Link>.
                            </p>

                            {selectedRule.sections.map((section) => (
                                <div key={section.heading}>
                                    <h3 className="hoatc-detail-subtitle">{section.heading}</h3>
                                    <p>{section.body}</p>
                                </div>
                            ))}

                            {selectedRule.id === 2 ? (
                            <div className="hoatc-detail-images">
                                <div className="hoatc-image-placeholder">
                                    <img src={rule_image1} alt="Sign-in screenshot" />
                                </div>
                                <div className="hoatc-image-placeholder">
                                    <img src={rule_image2} alt="Course enrollment screenshot" />
                                </div>
                            </div>
                            ) : null}
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
                                <input type="text" defaultValue={selectedRule.title} readOnly />
                            </div>

                            <div className="hoatc-input-group">
                                <label>Add Tags</label>
                                <div className="hoatc-input-with-icon">
                                    <input type="text" placeholder="Add Tags" />
                                    <button className="hoatc-add-tag-btn"><IconPlus /></button>
                                </div>
                                <div className="hoatc-active-tags">
                                    {selectedRule.tags.map((tag) => (
                                        <span key={tag} className="hoatc-tag-pill">{tag}</span>
                                    ))}
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
                                    
                                    <div className="hoatc-rt-textarea" contentEditable="false" suppressContentEditableWarning={true}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#450468' }}>{selectedRule.title}</h4>
                                        <p style={{ margin: '0 0 16px 0' }}>{selectedRule.description}</p>
                                        {selectedRule.sections.map((section) => (
                                            <div key={section.heading} style={{ marginBottom: '16px' }}>
                                                <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#78829D' }}>{section.heading}</h5>
                                                <p style={{ margin: 0 }}>{section.body}</p>
                                            </div>
                                        ))}
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
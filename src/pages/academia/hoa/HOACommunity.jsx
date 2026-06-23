import React, { useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-community.css';

// Reusing standard project icons where applicable
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoawhiteadd from '../../../assets/icons/hoawhiteadd.svg';
import hoatotalstories from '../../../assets/icons/hoatotalstories.svg';
import hoatotallikes from '../../../assets/icons/hoatotallikes.svg';
import hoafeedbacks from '../../../assets/icons/hoafeedbacks.svg';
import hoatotalshares from '../../../assets/icons/hoatotalshares.svg';
import hoatotalreads from '../../../assets/icons/hoatotalreads.svg';
import hoacalendar2 from '../../../assets/icons/hoacalendar2.svg';
import hoafilter2 from '../../../assets/icons/hoafilter2.svg';
import hoaissues from '../../../assets/icons/hoaissues.svg';
import hoaadmin from '../../../assets/icons/hoaadmin.svg';
import hoamessages from '../../../assets/icons/hoamessages.svg';
import hoacalendar from '../../../assets/icons/hoacalendar.svg';
import hoagoback from '../../../assets/icons/hoagoback.svg';
import hoaadmin2 from '../../../assets/icons/hoaadmin2.svg';
import hoainstagram from '../../../assets/icons/hoainstagram.svg';
import hoatiktok from '../../../assets/icons/hoatiktok.svg';
import hoawhatsapp from '../../../assets/icons/hoawhatsapp.svg';
import hoafacebook from '../../../assets/icons/hoafacebook.svg';

// Custom inline SVGs for the Community page
const IconDownCaret = ({ width = 12, height = 8, className = "", style = {} }) => (
    <svg width={width} height={height} viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <polyline points="2 2 8 8 14 2"></polyline>
    </svg>
);

const IconStories = () => (
    <img src={hoatotalstories} alt="Total Stories" />
);

const IconThumbsUp = () => (
    <img src={hoatotallikes} alt="Total Likes" />
);

const IconChat = () => (
    <img src={hoafeedbacks} alt="Total Feedbacks" />
);

const IconShare = () => (
    <img src={hoatotalshares} alt="Total Shares" />
);

const IconEye = () => (
    <img src={hoatotalreads} alt="Total Reads" />
);

const IconCalendar = () => (
    <img src={hoacalendar2} alt="Calendar" />
);

const IconMoreVertical = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="12" r="1"></circle>
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
    </svg>
);

const IconUser = () => (
    <img src={hoaadmin2} alt="User" />
);

const IconCloseDrawer = () => (
    <img src={hoagoback} alt="Close" />
);

const IconReply = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
    </svg>
);

const HOACommunity = () => {
    // Top-level state
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [selectedDateFilter, setSelectedDateFilter] = useState('All Time');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'comments'
    
    // Comments state
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState({});
    const [replies, setReplies] = useState({});

    // Dummy data for stories grid
    const storiesData = Array(12).fill({
        title: 'Build your dream software & engineering career',
        excerpt: 'A small river named Duden flows by their place and supplies it with the necessary regelialia.',
        author: 'ADMIN',
        comments: 3,
        date: 'Oct 19, 2025 07:50 AM',
    }).map((story, idx) => {
        const images = [
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=600&auto=format&fit=crop'
        ];
        return { ...story, id: idx + 1, img: images[idx % images.length] };
    });

    // Updated dummy data for Comments tab to include an actual avatar image
    const commentsData = Array(6).fill({
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
        name: 'Mrs. Anderson',
        timeAgo: '1 Day ago',
        text: 'What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences abo...',
        date: 'Apr 23, 2025',
        replies: 0
    }).map((comment, idx) => ({ ...comment, id: idx + 1 }));

    return (
        <HOALayout currentPage="community">
            <div className="hoac-community-page">
                {/* Keep existing page header, stats, filters, grid markup unchanged */}
                <div className="hoac-page-header">
                    <h1>Community</h1>
                    <div className="hoac-header-actions">
                        <button className="hoac-btn-outline hoac-btn-report">
                            <img src={hoaissues} alt="Issues" /> Having Issues? Report
                        </button>
                        <button className="hoac-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                <div className="hoac-stats-container">
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconStories /></div>
                        <div className="hoac-stat-text">
                            <h3>21</h3>
                            <p>Total Stories</p>
                        </div>
                    </div>
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconThumbsUp /></div>
                        <div className="hoac-stat-text">
                            <h3>21</h3>
                            <p>Total Likes</p>
                        </div>
                    </div>
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconChat /></div>
                        <div className="hoac-stat-text">
                            <h3>+ 2.8K</h3>
                            <p>Total Feedbacks</p>
                        </div>
                    </div>
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconShare /></div>
                        <div className="hoac-stat-text">
                            <h3>157</h3>
                            <p>Total Shares</p>
                        </div>
                    </div>
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconEye /></div>
                        <div className="hoac-stat-text">
                            <h3>1.8K</h3>
                            <p>Total Reads</p>
                        </div>
                    </div>
                </div>

                <div className="hoac-sub-header">
                    <div className="hoac-sub-title">
                        <h2>Community Stories</h2>
                        <p>3,461 Stories</p>
                    </div>
                    <div className="hoac-add-actions">
                        <button className="hoac-btn-primary"><img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Add New Story</button>
                    </div>
                </div>

                <div className="hoac-filters-row">
                    <div className="hoac-filter-container">
                        <div className="hoac-category-trigger" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                            <img src={hoafilter2} alt="Filter" style={{ width: 16 }} />
                            {selectedCategory}
                            <IconDownCaret width={14} height={8} style={{ transform: isCategoryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }} />
                        </div>
                        {isCategoryOpen && (
                            <div className="hoac-dropdown-menu">
                                {['All Categories', 'Software', 'Engineering', 'Lifestyle'].map(opt => (
                                    <button
                                        key={opt}
                                        className="hoac-dropdown-item"
                                        onClick={() => {
                                            setSelectedCategory(opt);
                                            setIsCategoryOpen(false);
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="hoac-search-bar-wrapper">
                        <div className="hoac-search-input">
                            <img src={hoasearch} alt="Search" style={{ opacity: 0.5, width: 14 }} />
                            <input type="text" placeholder="Search any Stories..." />
                        </div>
                        <div className="hoac-v-divider" />
                        <div className="hoac-filter-container hoac-date-filter-container">
                            <div
                                className="hoac-date-filter"
                                onClick={() => setIsDateOpen(!isDateOpen)}
                                role="button"
                                tabIndex={0}
                                aria-haspopup="listbox"
                                aria-expanded={isDateOpen}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setIsDateOpen(!isDateOpen);
                                    }
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <img src={hoacalendar2} alt="calendar" /> {selectedDateFilter}
                                </span>
                                <IconDownCaret
                                    width={12}
                                    height={8}
                                    style={{
                                        color: '#6B7280',
                                        transform: isDateOpen ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.2s',
                                    }}
                                />
                            </div>
                            {isDateOpen && (
                                <div className="hoac-dropdown-menu hoac-date-dropdown-menu">
                                    {['Today', 'This Week', 'This Month', 'All Time'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            className={`hoac-dropdown-item${selectedDateFilter === opt ? ' active' : ''}`}
                                            onClick={() => {
                                                setSelectedDateFilter(opt);
                                                setIsDateOpen(false);
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="hoac-grid">
                    {storiesData.map(story => (
                        <div key={story.id} className="hoac-card" onClick={() => setIsModalOpen(true)}>
                            <img src={story.img} alt={story.title} className="hoac-card-img" />
                            <div className="hoac-card-body">
                                <div className="hoac-card-top-meta">
                                    <span><img src={hoaadmin} alt="Admin" /> {story.author}</span>
                                    <span className="hoac-card-comments"><img src={hoamessages} alt="Comments" /> {story.comments}</span>
                                </div>
                                <h4 className="hoac-card-title">{story.title}</h4>
                                <p className="hoac-card-excerpt">{story.excerpt}</p>
                                <div className="hoac-card-footer">
                                    <span className="hoac-card-date"><img src={hoacalendar} alt="Calendar" /> {story.date}</span>
                                    <button className="hoac-icon-btn"><IconMoreVertical /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hoac-pagination-container">
                    <button className="hoac-page-nav" style={{ color: '#D8D8E5' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button className="hoac-page-num">1</button>
                    <button className="hoac-page-num active">2</button>
                    <button className="hoac-page-num">3</button>
                    <button className="hoac-page-num">4</button>
                    <button className="hoac-page-num">5</button>
                    <span style={{ margin: '0 4px', color: '#4B5675' }}>...</span>
                    <button className="hoac-page-nav" style={{ color: '#78829D' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>

                {/* MODAL OVERLAY */}
                <div className={`hoac-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
                    <div className="hoac-modal-drawer" onClick={e => e.stopPropagation()}>
                        <div className="hoac-modal-top-header">
                            <button className="hoac-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                                <IconCloseDrawer />
                            </button>
                            <h2>Story Preview</h2>
                            <span className="hoac-update-status">
                                <img src={hoarefresh} alt="Refresh" className="hoac-sync-icon" />
                                Data updated every 1 hr
                                <span className="hoac-dot"></span>
                            </span>
                        </div>

                        <div className="hoac-modal-content-area">
                            <div className="hoac-drawer-header-row">
                                <div className="hoac-drawer-title-info">
                                    <div className="hoac-avatar-placeholder"><IconUser /></div>
                                    <span className="hoac-owner-name">Admin</span>
                                    <span className="hoac-owner-dot">•</span>
                                    <span className="hoac-project-title">Build your software & engineering dream career</span>
                                </div>
                                <div className="hoac-drawer-actions">
                                    <span className="hoac-status-pill published">Published</span>
                                    <button className="hoac-btn-icon-light"><IconMoreVertical /></button>
                                </div>
                            </div>

                            <hr className="hoac-divider" />

                            <div className="hoac-drawer-tabs-row">
                                <div className="hoac-toggle-tabs">
                                    <button className={`hoac-pill-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                                        Overview
                                    </button>
                                    <button className={`hoac-pill-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                                        <IconChat /> Comments
                                    </button>
                                </div>
                                <div className="hoac-drawer-right-stats">
                                    <span><IconEye /> 675.4K Reads</span>
                                    <span><IconThumbsUp /> 47K Likes</span>
                                    <span><IconShare /> 907 Shares</span>
                                </div>
                            </div>

                            <div className="hoac-tab-content-container">
                                {/* OVERVIEW TAB */}
                                {activeTab === 'overview' && (
                                    <div className="hoac-overview-content">
                                        <h2 className="hoac-article-title">Build your dream software & engineering career</h2>
                                        <div className="hoac-article-meta">
                                            <strong>5 mins read</strong>
                                            <span className="hoac-divider-vert">|</span>
                                            <span>Oct 21, 2025 07:51 AM</span>
                                        </div>
                                        <div className="hoac-article-hero-container">
                                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" alt="Hero" className="hoac-article-hero" />
                                            <div className="hoac-author-block">
                                                <div className="hoac-author-profile">
                                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Author" className="hoac-author-avatar" />
                                                    <div className="hoac-author-details">
                                                        <h4>Esther Howard</h4>
                                                        <p>Admin</p>
                                                    </div>
                                                </div>
                                                <div className="hoac-author-actions">
                                                    <div className="hoac-social-icons">
                                                        <button><img src={hoatiktok} alt="Tiktok" /></button>
                                                        <button><img src={hoawhatsapp} alt="Whatsapp" /></button>
                                                        <button><img src={hoafacebook} alt="Facebook" /></button>
                                                        <button><img src={hoainstagram} alt="Instagram" /></button>
                                                    </div>
                                                    <button className="hoac-btn-share"><IconShare /> Share</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hoac-article-body">
                                            <p>Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.</p>
                                            <p>Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.</p>
                                        </div>

                                        <div className="hoac-article-gallery">
                                            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=500&auto=format&fit=crop" alt="Gallery 1" />
                                            <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=500&auto=format&fit=crop" alt="Gallery 2" />
                                        </div>
                                    </div>
                                )}

                                {/* COMMENTS TAB (UPDATED SECTION) */}
                                {activeTab === 'comments' && (
                                    <div className="hoac-comments-content">
                                     <div className='hoac-comments-header-container'>
                                        <div className="hoac-comments-header">
                                            <h3>Comments <span>231</span></h3>
                                        </div>

                                        {/* Input Box Redesign */}
                                        <div className="hoac-comment-input-box">
                                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="Current User" className="hoac-current-avatar" />
                                            <div className="hoac-input-wrapper">
                                                <input 
                                                    type="text" 
                                                    placeholder="| Your comment.." 
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                />
                                                <button 
                                                    className="hoac-inline-send-btn"
                                                    onClick={() => {
                                                        if (newComment.trim()) {
                                                            setNewComment('');
                                                        }
                                                    }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="9 18 15 12 9 6"></polyline>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                       </div>    

                                        {/* Comment List Redesign */}
                                        <div className="hoac-comments-list">
                                            {commentsData.map((comment) => (
                                                <div key={comment.id} className="hoac-comment-item">
                                                    <div className="hoac-comment-avatar">
                                                        <img src={comment.avatar} alt={comment.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                                    </div>
                                                    <div className="hoac-comment-body">
                                                        <div className="hoac-comment-meta">
                                                            <h4>{comment.name}</h4>
                                                            <span>{comment.timeAgo}</span>
                                                        </div>
                                                        <p className="hoac-comment-text">
                                                            {comment.text} <span className="hoac-read-more">Read more</span>
                                                        </p>
                                                        <div className="hoac-comment-actions">
                                                            <button 
                                                                className="hoac-reply-btn"
                                                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                            >
                                                                <IconReply /> {comment.replies + (replies[comment.id]?.length || 0)} View Replies
                                                            </button>
                                                            <span className="hoac-posted-date">Sent on <strong>{comment.date}</strong></span>
                                                        </div>
                                                        
                                                        {/* Reply Section */}
                                                        {replyingTo === comment.id && (
                                                            <div className="hoac-reply-section">
                                                                <div className="hoac-reply-input-wrapper">
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Write a reply..." 
                                                                        value={replyText[comment.id] || ''}
                                                                        onChange={(e) => setReplyText({...replyText, [comment.id]: e.target.value})}
                                                                    />
                                                                    <button 
                                                                        className="hoac-reply-submit-btn"
                                                                        onClick={() => {
                                                                            if (replyText[comment.id]?.trim()) {
                                                                                setReplies({
                                                                                    ...replies,
                                                                                    [comment.id]: [
                                                                                        ...(replies[comment.id] || []),
                                                                                        {
                                                                                            id: Date.now(),
                                                                                            name: 'You',
                                                                                            timeAgo: 'Just now',
                                                                                            text: replyText[comment.id]
                                                                                        }
                                                                                    ]
                                                                                });
                                                                                setReplyText({...replyText, [comment.id]: ''});
                                                                            }
                                                                        }}
                                                                    >
                                                                        Reply
                                                                    </button>
                                                                </div>
                                                                
                                                                {/* Replies List */}
                                                                {(replies[comment.id] || []).length > 0 && (
                                                                    <div className="hoac-replies-list">
                                                                        {replies[comment.id].map((reply) => (
                                                                            <div key={reply.id} className="hoac-reply-item">
                                                                                <div className="hoac-reply-avatar">
                                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                                                </div>
                                                                                <div className="hoac-reply-content">
                                                                                    <div className="hoac-reply-meta">
                                                                                        <h5>{reply.name}</h5>
                                                                                        <span>{reply.timeAgo}</span>
                                                                                    </div>
                                                                                    <p className="hoac-reply-text">{reply.text}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="hoac-pagination-container">
                                            <button className="hoac-page-nav" style={{ color: '#D8D8E5' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                            </button>
                                            <button className="hoac-page-num">1</button>
                                            <button className="hoac-page-num active">2</button>
                                            <button className="hoac-page-num">3</button>
                                            <button className="hoac-page-num">4</button>
                                            <button className="hoac-page-num">5</button>
                                            <span style={{ margin: '0 4px', color: '#4B5675' }}>...</span>
                                            <button className="hoac-page-nav" style={{ color: '#78829D' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </HOALayout>
    );
};

export default HOACommunity;
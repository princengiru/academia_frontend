import React, { useState, useEffect } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import CreateStoryModal from '../../../components/HOACommunity/CreateStoryModal';
import './hoa-community.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatHtmlContent = (html) => {
  if (!html) return '';
  let cleanHtml = html
    .replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`)
    .replace(/href="\/uploads\//g, `href="${API_BASE_URL}/uploads/`);
  
  cleanHtml = cleanHtml.replace(/<a\s+(href="[^"]*")/gi, (match, hrefPart) => {
    if (/target=/i.test(match)) {
      return match;
    }
    return `<a target="_blank" rel="noopener noreferrer" ${hrefPart}`;
  });
  
  return cleanHtml;
};

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

const resolveYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  let videoId = '';
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts[1]) {
      videoId = parts[1].split(/[?#]/)[0];
    }
  } else if (url.includes('v=')) {
    const parts = url.split('v=');
    if (parts[1]) {
      videoId = parts[1].split(/[&#]/)[0];
    }
  } else if (url.includes('youtube.com/v/')) {
    const parts = url.split('youtube.com/v/');
    if (parts[1]) {
      videoId = parts[1].split(/[?#]/)[0];
    }
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const HOACommunity = () => {
    // Top-level state
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [selectedDateFilter, setSelectedDateFilter] = useState('All Time');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'comments'
    
    // Comments state
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState({});
    const [replies, setReplies] = useState({});

    // Stories data state
    const [storiesData, setStoriesData] = useState([]);
    const [allStories, setAllStories] = useState([]); // Store all stories for client-side filtering
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalStories: 0,
        totalLikes: 0,
        totalFeedbacks: 0,
        totalShares: 0,
        totalReads: 0
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStoriesCount, setTotalStoriesCount] = useState(0);
    const storiesPerPage = 12;

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [selectedStory, setSelectedStory] = useState(null);
    const [loadingStory, setLoadingStory] = useState(false);

    // Fetch all community stories from backend
    const fetchStories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Fetch all stories without pagination for client-side filtering
            const response = await fetch(`${API_BASE_URL}/api/admin/community-stories?page=1&limit=100`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch community stories');
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                // Transform backend data to match frontend structure
                const transformedStories = result.data.map((story, idx) => ({
                    id: story.id,
                    title: story.title,
                    excerpt: story.description || 'No description available',
                    author: story.uploaded_by_name || 'ADMIN',
                    comments: 0,
                    date: new Date(story.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    rawDate: new Date(story.created_at), // Store raw date for filtering
                    img: story.thumbnail_url.startsWith('http') 
                        ? story.thumbnail_url 
                        : `${API_BASE_URL}${story.thumbnail_url}`,
                    status: story.status,
                    youtube_url: story.youtube_url
                }));
                
                setAllStories(transformedStories);
                setTotalStoriesCount(result.data.length);
                
                // Update stats based on real data
                setStats({
                    totalStories: result.data.length,
                    totalLikes: Math.floor(Math.random() * 100) + 10, // Placeholder until backend provides
                    totalFeedbacks: '+ 2.8K', // Placeholder
                    totalShares: Math.floor(Math.random() * 500) + 100, // Placeholder
                    totalReads: '1.8K' // Placeholder
                });
            }
        } catch (err) {
            console.error('Error fetching community stories:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    // Client-side filtering
    useEffect(() => {
        let filtered = [...allStories];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(story =>
                story.title.toLowerCase().includes(query) ||
                story.excerpt.toLowerCase().includes(query)
            );
        }

        // Apply category filter (mock - since backend doesn't have category field)
        if (selectedCategory !== 'All Categories') {
            // For now, this is a placeholder - you'd need a category field in the database
            // We'll just filter by title containing the category name as a demo
            const categoryLower = selectedCategory.toLowerCase();
            filtered = filtered.filter(story =>
                story.title.toLowerCase().includes(categoryLower) ||
                story.excerpt.toLowerCase().includes(categoryLower)
            );
        }

        // Apply date filter
        if (selectedDateFilter !== 'All Time') {
            const now = new Date();
            const storyDate = story => new Date(story.rawDate);
            
            switch (selectedDateFilter) {
                case 'Today':
                    filtered = filtered.filter(story => {
                        const diff = now - storyDate(story);
                        return diff < 24 * 60 * 60 * 1000;
                    });
                    break;
                case 'This Week':
                    filtered = filtered.filter(story => {
                        const diff = now - storyDate(story);
                        return diff < 7 * 24 * 60 * 60 * 1000;
                    });
                    break;
                case 'This Month':
                    filtered = filtered.filter(story => {
                        const diff = now - storyDate(story);
                        return diff < 30 * 24 * 60 * 60 * 1000;
                    });
                    break;
            }
        }

        // Update total pages based on filtered results
        setTotalPages(Math.ceil(filtered.length / storiesPerPage));
        
        // Reset to page 1 when filters change
        setCurrentPage(1);
        
        // Apply pagination
        const startIndex = 0;
        const paginatedStories = filtered.slice(startIndex, startIndex + storiesPerPage);
        
        setStoriesData(paginatedStories);
    }, [allStories, searchQuery, selectedCategory, selectedDateFilter]);

    // Pagination effect (separate from filters)
    useEffect(() => {
        let filtered = [...allStories];

        // Re-apply filters
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(story =>
                story.title.toLowerCase().includes(query) ||
                story.excerpt.toLowerCase().includes(query)
            );
        }

        if (selectedCategory !== 'All Categories') {
            const categoryLower = selectedCategory.toLowerCase();
            filtered = filtered.filter(story =>
                story.title.toLowerCase().includes(categoryLower) ||
                story.excerpt.toLowerCase().includes(categoryLower)
            );
        }

        if (selectedDateFilter !== 'All Time') {
            const now = new Date();
            const storyDate = story => new Date(story.rawDate);
            
            switch (selectedDateFilter) {
                case 'Today':
                    filtered = filtered.filter(story => {
                        const diff = now - storyDate(story);
                        return diff < 24 * 60 * 60 * 1000;
                    });
                    break;
                case 'This Week':
                    filtered = filtered.filter(story => {
                        const diff = now - storyDate(story);
                        return diff < 7 * 24 * 60 * 60 * 1000;
                    });
                    break;
                case 'This Month':
                    filtered = filtered.filter(story => {
                        const diff = now - storyDate(story);
                        return diff < 30 * 24 * 60 * 60 * 1000;
                    });
                    break;
            }
        }

        // Apply pagination
        const startIndex = (currentPage - 1) * storiesPerPage;
        const paginatedStories = filtered.slice(startIndex, startIndex + storiesPerPage);
        
        setStoriesData(paginatedStories);
    }, [currentPage]);

    // Handle successful story creation
    const handleCreateSuccess = (message) => {
        // Refetch stories to include the new/updated one
        fetchStories();
        showToast(message || 'Story saved successfully!', 'success');
    };

    // Fetch comments for a story
    const fetchComments = async (storyId) => {
        try {
            setCommentsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/community-stories/stories/${storyId}/comments`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const result = await response.json();
            if (result.success && result.data) {
                setComments(result.data);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setCommentsLoading(false);
        }
    };

    // Submit a new comment
    const handleSubmitComment = async () => {
        if (!newComment.trim() || !selectedStory) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/community-stories/stories/${selectedStory.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    story_id: selectedStory.id,
                    content: newComment.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit comment');
            }

            setNewComment('');
            fetchComments(selectedStory.id);
        } catch (err) {
            console.error('Error submitting comment:', err);
        }
    };

    // Submit a reply
    const handleSubmitReply = async (commentId) => {
        if (!replyText[commentId]?.trim() || !selectedStory) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/community-stories/stories/${selectedStory.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    story_id: selectedStory.id,
                    parent_comment_id: commentId,
                    content: replyText[commentId].trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit reply');
            }

            setReplyText({ ...replyText, [commentId]: '' });
            setReplyingTo(null);
            fetchComments(selectedStory.id);
        } catch (err) {
            console.error('Error submitting reply:', err);
        }
    };

    // Fetch replies for a comment
    const fetchReplies = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/community-stories/comments/${commentId}/replies`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                throw new Error('Failed to fetch replies');
            }

            const result = await response.json();
            if (result.success && result.data) {
                setReplies({ ...replies, [commentId]: result.data });
            }
        } catch (err) {
            console.error('Error fetching replies:', err);
        }
    };

    // Fetch single story details for modal
    const handleStoryClick = async (storyId) => {
        try {
            setLoadingStory(true);
            setIsModalOpen(true);
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/community-stories/${storyId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch story details');
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const story = result.data;
                setSelectedStory({
                    id: story.id,
                    title: story.title,
                    description: story.description || 'No description available',
                    contents: story.contents || null,
                    excerpt: story.description ? story.description.substring(0, 150) + '...' : 'No description available',
                    thumbnail: story.thumbnail_url.startsWith('http') 
                        ? story.thumbnail_url 
                        : `${API_BASE_URL}${story.thumbnail_url}`,
                    youtube_url: story.youtube_url,
                    author: story.uploaded_by_name || 'Admin',
                    authorAvatar: story.uploaded_by_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
                    date: new Date(story.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    status: story.status
                });

                // Fetch comments for this story
                fetchComments(storyId);
            }
        } catch (err) {
            console.error('Error fetching story details:', err);
            setError(err.message);
        } finally {
            setLoadingStory(false);
        }
    };

    const handleStatusChange = async (storyId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/community-stories/${storyId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update story status');
            }

            const result = await response.json();
            if (result.success) {
                // Update selectedStory locally
                setSelectedStory(prev => ({ ...prev, status: newStatus }));
                // Update storiesData locally to reflect status changes in the grid
                setStoriesData(prev => prev.map(s => s.id === storyId ? { ...s, status: newStatus } : s));
                setAllStories(prev => prev.map(s => s.id === storyId ? { ...s, status: newStatus } : s));
            }
        } catch (err) {
            console.error('Error updating story status:', err);
            alert(err.message);
        }
    };

    const handleDeleteStory = async (storyId) => {
        if (!window.confirm('Are you sure you want to delete this story?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/community-stories/${storyId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete story');
            }

            const result = await response.json();
            if (result.success) {
                // Close modal and refresh list
                setIsModalOpen(false);
                setSelectedStory(null);
                setAllStories(prev => prev.filter(s => s.id !== storyId));
            }
        } catch (err) {
            console.error('Error deleting story:', err);
            alert(err.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/community-stories/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            const result = await response.json();
            if (result.success) {
                // Remove comment from local comments list
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert(err.message);
        }
    };

    const handleDeleteReply = async (commentId, replyId) => {
        if (!window.confirm('Are you sure you want to delete this reply?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/community-stories/comments/${replyId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete reply');
            }

            const result = await response.json();
            if (result.success) {
                // Update local replies state
                setReplies(prev => ({
                    ...prev,
                    [commentId]: (prev[commentId] || []).filter(r => r.id !== replyId)
                }));
                // Decrease reply_count in comments list
                setComments(prev => prev.map(c => c.id === commentId ? { ...c, reply_count: Math.max(0, (c.reply_count || 1) - 1) } : c));
            }
        } catch (err) {
            console.error('Error deleting reply:', err);
            alert(err.message);
        }
    };

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
                            <h3>{loading ? '...' : stats.totalStories}</h3>
                            <p>Total Stories</p>
                        </div>
                    </div>
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconThumbsUp /></div>
                        <div className="hoac-stat-text">
                            <h3>{loading ? '...' : stats.totalLikes}</h3>
                            <p>Total Likes</p>
                        </div>
                    </div>
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconChat /></div>
                        <div className="hoac-stat-text">
                            <h3>{loading ? '...' : stats.totalFeedbacks}</h3>
                            <p>Total Feedbacks</p>
                        </div>
                    </div>
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconShare /></div>
                        <div className="hoac-stat-text">
                            <h3>{loading ? '...' : stats.totalShares}</h3>
                            <p>Total Shares</p>
                        </div>
                    </div>
                    <div className="hoac-stat-block">
                        <div className="hoac-stat-icon "><IconEye /></div>
                        <div className="hoac-stat-text">
                            <h3>{loading ? '...' : stats.totalReads}</h3>
                            <p>Total Reads</p>
                        </div>
                    </div>
                </div>

                <div className="hoac-sub-header">
                    <div className="hoac-sub-title">
                        <h2>Community Stories</h2>
                        <p>{loading ? 'Loading...' : `${totalStoriesCount} Stories`}</p>
                    </div>
                    <div className="hoac-add-actions">
                        <button className="hoac-btn-primary" onClick={() => { setEditingStory(null); setIsCreateModalOpen(true); }}><img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Add New Story</button>
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
                            <input 
                                type="text" 
                                placeholder="Search any Stories..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
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
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                            <p>Loading community stories...</p>
                        </div>
                    ) : error ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: '#EF4444' }}>Error: {error}</p>
                        </div>
                    ) : storiesData.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                            <p>No community stories found.</p>
                        </div>
                    ) : (
                        storiesData.map(story => (
                            <div key={story.id} className="hoac-card" onClick={() => handleStoryClick(story.id)}>
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
                        ))
                    )}
                </div>

                <div className="hoac-pagination-container">
                    <button 
                        className="hoac-page-nav" 
                        style={{ color: currentPage === 1 ? '#D8D8E5' : '#78829D' }}
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                            <button
                                key={pageNum}
                                className={`hoac-page-num ${currentPage === pageNum ? 'active' : ''}`}
                                onClick={() => setCurrentPage(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    
                    {totalPages > 5 && <span style={{ margin: '0 4px', color: '#4B5675' }}>...</span>}
                    
                    <button 
                        className="hoac-page-nav" 
                        style={{ color: currentPage === totalPages ? '#D8D8E5' : '#78829D' }}
                        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
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

                        {loadingStory ? (
                            <div className="hoac-modal-content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                                <p>Loading story details...</p>
                            </div>
                        ) : selectedStory ? (
                            <div className="hoac-modal-content-area">
                                <div className="hoac-drawer-header-row">
                                    <div className="hoac-drawer-title-info">
                                        <div className="hoac-avatar-placeholder"><IconUser /></div>
                                        <span className="hoac-owner-name">{selectedStory.author}</span>
                                        <span className="hoac-owner-dot">•</span>
                                        <span className="hoac-project-title">{selectedStory.title}</span>
                                    </div>
                                    <div className="hoac-drawer-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className={`hoac-status-pill ${selectedStory.status}`}>{selectedStory.status}</span>
                                        {selectedStory.status === 'draft' && (
                                            <button 
                                                className="hoac-btn-primary" 
                                                onClick={() => handleStatusChange(selectedStory.id, 'published')}
                                                style={{ padding: '6px 12px', fontSize: '12px', height: 'auto', minHeight: 'unset' }}
                                            >
                                                Publish
                                            </button>
                                        )}
                                        {selectedStory.status === 'published' && (
                                            <button 
                                                className="hoac-btn-outline" 
                                                onClick={() => handleStatusChange(selectedStory.id, 'draft')}
                                                style={{ padding: '6px 12px', fontSize: '12px', height: 'auto', minHeight: 'unset', borderColor: '#450468', color: '#450468' }}
                                            >
                                                Revert to Draft
                                            </button>
                                        )}
                                        {selectedStory.status !== 'archived' && (
                                            <button 
                                                className="hoac-btn-outline" 
                                                onClick={() => handleStatusChange(selectedStory.id, 'archived')}
                                                style={{ padding: '6px 12px', fontSize: '12px', height: 'auto', minHeight: 'unset' }}
                                            >
                                                Archive
                                            </button>
                                        )}
                                        {selectedStory.status === 'archived' && (
                                            <button 
                                                className="hoac-btn-primary" 
                                                onClick={() => handleStatusChange(selectedStory.id, 'published')}
                                                style={{ padding: '6px 12px', fontSize: '12px', height: 'auto', minHeight: 'unset' }}
                                            >
                                                Publish
                                            </button>
                                        )}
                                        <button 
                                            className="hoac-btn-outline" 
                                            onClick={() => {
                                                setEditingStory(selectedStory);
                                                setIsCreateModalOpen(true);
                                            }}
                                            style={{ padding: '6px 12px', fontSize: '12px', height: 'auto', minHeight: 'unset', borderColor: '#450468', color: '#450468', fontWeight: 600 }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="hoac-btn-danger" 
                                            onClick={() => handleDeleteStory(selectedStory.id)}
                                            style={{ padding: '6px 12px', fontSize: '12px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Delete
                                        </button>
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
                                            <h2 className="hoac-article-title">{selectedStory.title}</h2>
                                            <div className="hoac-article-meta">
                                                <strong>5 mins read</strong>
                                                <span className="hoac-divider-vert">|</span>
                                                <span>{selectedStory.date}</span>
                                            </div>
                                            <div className="hoac-article-hero-container">
                                                <img src={selectedStory.thumbnail} alt="Hero" className="hoac-article-hero" />
                                                <div className="hoac-author-block">
                                                    <div className="hoac-author-profile">
                                                        <img src={selectedStory.authorAvatar} alt="Author" className="hoac-author-avatar" />
                                                        <div className="hoac-author-details">
                                                            <h4>{selectedStory.author}</h4>
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
                                                {selectedStory.contents ? (
                                                    <div dangerouslySetInnerHTML={{ __html: formatHtmlContent(selectedStory.contents) }} />
                                                ) : (
                                                    <p>{selectedStory.description}</p>
                                                )}
                                            </div>

                                            {selectedStory.youtube_url && (
                                                <div className="hoac-article-gallery">
                                                    <iframe
                                                        width="100%"
                                                        height="400"
                                                        src={resolveYoutubeEmbedUrl(selectedStory.youtube_url)}
                                                        title="YouTube video"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                {/* COMMENTS TAB (UPDATED SECTION) */}
                                {activeTab === 'comments' && (
                                    <div className="hoac-comments-content">
                                     <div className='hoac-comments-header-container'>
                                        <div className="hoac-comments-header">
                                            <h3>Comments <span>{comments.length}</span></h3>
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
                                                    onClick={handleSubmitComment}
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
                                            {commentsLoading ? (
                                                <div className="comment comment-empty">
                                                    <div className="comment-text">
                                                        <p>Loading comments…</p>
                                                    </div>
                                                </div>
                                            ) : comments.length > 0 ? (
                                                comments.map((comment) => (
                                                    <div key={comment.id} className="hoac-comment-item">
                                                        <div className="hoac-comment-avatar">
                                                            <img 
                                                                src={comment.user_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop'} 
                                                                alt={comment.user_name} 
                                                                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} 
                                                            />
                                                        </div>
                                                        <div className="hoac-comment-body">
                                                            <div className="hoac-comment-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <h4>{comment.user_name}</h4>
                                                                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleDeleteComment(comment.id)} 
                                                                    style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '2px 6px', fontSize: '12px' }}
                                                                    title="Delete Comment"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                            <p className="hoac-comment-text">
                                                                {comment.content}
                                                            </p>
                                                            <div className="hoac-comment-actions">
                                                                <button 
                                                                    className="hoac-reply-btn"
                                                                    onClick={() => {
                                                                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                                                        if (!replies[comment.id]) {
                                                                            fetchReplies(comment.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <IconReply /> {comment.reply_count || 0} View Replies
                                                                </button>
                                                                <span className="hoac-posted-date">Sent on <strong>{new Date(comment.created_at).toLocaleDateString()}</strong></span>
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
                                                                            onClick={() => handleSubmitReply(comment.id)}
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
                                                                                        <img 
                                                                                            src={reply.user_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop'} 
                                                                                            alt={reply.user_name} 
                                                                                            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} 
                                                                                        />
                                                                                    </div>
                                                                                    <div className="hoac-reply-content">
                                                                                         <div className="hoac-reply-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                                                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                 <h5>{reply.user_name}</h5>
                                                                                                 <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                                             </div>
                                                                                             <button 
                                                                                                 onClick={() => handleDeleteReply(comment.id, reply.id)} 
                                                                                                 style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '2px 6px', fontSize: '11px' }}
                                                                                                 title="Delete Reply"
                                                                                             >
                                                                                                 Delete
                                                                                             </button>
                                                                                         </div>
                                                                                        <p className="hoac-reply-text">{reply.content}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="comment comment-empty">
                                                    <div className="comment-text">
                                                        <h6>No comments yet</h6>
                                                        <p>Be the first to leave a comment on this story.</p>
                                                    </div>
                                                </div>
                                            )}
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
                        ) : null}
                    </div>
                </div>

                <CreateStoryModal
                    key={editingStory ? `edit-${editingStory.id}` : 'new'}
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditingStory(null);
                    }}
                    onSuccess={handleCreateSuccess}
                    story={editingStory}
                />

            </div>
        </HOALayout>
    );
};

export default HOACommunity;
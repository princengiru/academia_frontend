import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './CreateStoryModal.css';
import Toast from '../Toast/Toast';

import { useEffect } from 'react';

const CreateStoryModal = ({ isOpen, onClose, onSuccess, story = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        contents: '',
        youtube_url: '',
        status: 'draft'
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Populate data when in edit mode
    useEffect(() => {
        if (isOpen) {
            if (story) {
                setFormData({
                    title: story.title || '',
                    description: story.description || story.excerpt || '',
                    contents: story.contents || '',
                    youtube_url: story.youtube_url || '',
                    status: story.status || 'draft'
                });
                setThumbnailPreview(story.thumbnail);
                setThumbnail(null);
            } else {
                setFormData({
                    title: '',
                    description: '',
                    contents: '',
                    youtube_url: '',
                    status: 'draft'
                });
                setThumbnailPreview(null);
                setThumbnail(null);
            }
        }
    }, [story, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentsChange = (value) => {
        setFormData(prev => ({
            ...prev,
            contents: value
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setToast({ message: 'Title is required', type: 'error' });
            return;
        }

        // The thumbnail must be there in both creation and edit mode
        if (!thumbnail && !thumbnailPreview) {
            setToast({ message: 'Thumbnail image is required', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('contents', formData.contents);
            formDataToSend.append('youtube_url', formData.youtube_url);
            formDataToSend.append('status', formData.status);
            
            if (thumbnail) {
                formDataToSend.append('thumbnail', thumbnail);
            }

            const token = localStorage.getItem('token');
            const url = story 
                ? `${API_BASE_URL}/api/admin/community-stories/${story.id}`
                : `${API_BASE_URL}/api/admin/community-stories`;
            
            const method = story ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formDataToSend
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${story ? 'update' : 'create'} story`);
            }

            const result = await response.json();
            
            if (result.success) {
                setToast({ message: `Story ${story ? 'updated' : 'created'} successfully!`, type: 'success' });
                setTimeout(() => {
                    onSuccess(story ? 'Story updated successfully!' : 'Story created successfully!');
                    handleClose();
                }, 1500);
            }
        } catch (err) {
            setToast({ message: err.message || `Failed to ${story ? 'update' : 'create'} story`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            contents: '',
            youtube_url: '',
            status: 'draft'
        });
        setThumbnail(null);
        setThumbnailPreview(null);
        setToast(null);
        onClose();
    };

    if (!isOpen) return null;

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
        ]
    };

    return (
        <div className="create-story-modal-overlay" onClick={handleClose}>
            <div className="create-story-modal-content" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={handleClose}
                    className="create-story-modal-close"
                >
                    ×
                </button>

                <div className="create-story-modal-header">
                    <h2>{story ? 'Edit Community Story' : 'Create Community Story'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="create-story-form">
                    <div className="create-story-form-group">
                        <label className="create-story-form-label required">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter story title"
                            className="create-story-form-input"
                            required
                        />
                    </div>

                    <div className="create-story-form-group">
                        <label className="create-story-form-label">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of the story"
                            rows={3}
                            className="create-story-form-textarea"
                        />
                    </div>

                    <div className="create-story-form-group">
                        <label className="create-story-form-label">
                            Content (Rich Text)
                        </label>
                        <div className="create-story-quill-container">
                            <ReactQuill
                                key={story ? `edit-${story.id}` : 'new'}
                                value={formData.contents}
                                onChange={handleContentsChange}
                                modules={quillModules}
                                theme="snow"
                            />
                        </div>
                    </div>

                    <div className="create-story-form-group">
                        <label className="create-story-form-label required">
                            Thumbnail Image
                        </label>
                        <div className="create-story-thumbnail-upload" onClick={() => fileInputRef.current?.click()}>
                            {thumbnailPreview ? (
                                <div className="create-story-thumbnail-preview">
                                    <img 
                                        src={thumbnailPreview} 
                                        alt="Thumbnail preview" 
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setThumbnail(null);
                                            setThumbnailPreview(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="create-story-thumbnail-remove"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="create-story-thumbnail-placeholder">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    <p>Click to upload thumbnail</p>
                                    <small>PNG, JPG up to 5MB</small>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="create-story-form-group">
                        <label className="create-story-form-label">
                            YouTube URL (Optional)
                        </label>
                        <input
                            type="url"
                            name="youtube_url"
                            value={formData.youtube_url}
                            onChange={handleChange}
                            placeholder="https://youtube.com/embed/..."
                            className="create-story-form-input"
                        />
                    </div>

                    <div className="create-story-form-group">
                        <label className="create-story-form-label">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="create-story-form-select"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div className="create-story-form-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="create-story-btn create-story-btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="create-story-btn create-story-btn-primary"
                        >
                            {story ? (loading ? 'Saving...' : 'Save Changes') : (loading ? 'Creating...' : 'Create Story')}
                        </button>
                    </div>
                </form>

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={3000}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default CreateStoryModal;

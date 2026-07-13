import React, { useEffect } from 'react';
import './ProfilePhotoViewModal.css';

const ProfilePhotoViewModal = ({ isOpen, imageSrc, userName, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="learners-profile-photo-view"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={userName ? `${userName} profile photo` : 'Profile photo'}
    >
      <button
        type="button"
        className="learners-profile-photo-view-close"
        onClick={onClose}
        aria-label="Close profile photo"
      >
        ×
      </button>

      <div
        className="learners-profile-photo-view-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="learners-profile-photo-view-frame">
          <img src={imageSrc} alt={userName || 'Profile'} />
        </div>
        {userName ? <p className="learners-profile-photo-view-name">{userName}</p> : null}
      </div>
    </div>
  );
};

export default ProfilePhotoViewModal;

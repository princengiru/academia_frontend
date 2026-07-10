import React, { useCallback, useEffect, useRef, useState } from 'react';
import { exportCroppedProfilePhoto, PROFILE_PHOTO_EXPORT_SIZE } from './profilePhotoUtils';

const VIEWPORT_SIZE = 280;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const ProfilePhotoCropModal = ({ isOpen, imageSrc, onClose, onConfirm, exporting = false }) => {
  const imageRef = useRef(null);
  const dragStartRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');

  const clampOffset = useCallback((nextOffset, nextScale, image) => {
    if (!image) return nextOffset;

    const scaledWidth = image.naturalWidth * nextScale;
    const scaledHeight = image.naturalHeight * nextScale;
    const maxX = Math.max((scaledWidth - VIEWPORT_SIZE) / 2, 0);
    const maxY = Math.max((scaledHeight - VIEWPORT_SIZE) / 2, 0);

    return {
      x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
    };
  }, []);

  const resetCropState = useCallback((image) => {
    if (!image) return;

    const fitScale = Math.max(
      VIEWPORT_SIZE / image.naturalWidth,
      VIEWPORT_SIZE / image.naturalHeight
    );

    setMinScale(fitScale);
    setScale(fitScale);
    setOffset({ x: 0, y: 0 });
    setImageLoaded(true);
    setError('');
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setIsConfirming(false);
      setError('');
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      resetCropState(image);
    };
    image.onerror = () => {
      setError('Could not load this image. Try another file.');
      setImageLoaded(false);
    };
    image.src = imageSrc;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [imageSrc, isOpen, resetCropState]);

  const handlePointerDown = (event) => {
    if (!imageLoaded) return;
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragStartRef.current || !imageRef.current) return;

    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    const nextOffset = clampOffset(
      {
        x: dragStartRef.current.offsetX + deltaX,
        y: dragStartRef.current.offsetY + deltaY,
      },
      scale,
      imageRef.current
    );
    setOffset(nextOffset);
  };

  const handlePointerUp = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStartRef.current = null;
  };

  const handleZoomChange = (event) => {
    const nextScale = Number(event.target.value);
    if (!imageRef.current) return;
    setScale(nextScale);
    setOffset((current) => clampOffset(current, nextScale, imageRef.current));
  };

  const handleConfirm = async () => {
    if (!imageRef.current || isConfirming) return;

    try {
      setIsConfirming(true);
      setError('');
      const blob = await exportCroppedProfilePhoto({
        image: imageRef.current,
        viewportSize: VIEWPORT_SIZE,
        offsetX: offset.x,
        offsetY: offset.y,
        scale,
        exportSize: PROFILE_PHOTO_EXPORT_SIZE,
      });
      await onConfirm(blob);
    } catch (exportError) {
      setError(exportError.message || 'Could not prepare profile photo.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  const image = imageRef.current;
  const scaledWidth = image ? image.naturalWidth * scale : 0;
  const scaledHeight = image ? image.naturalHeight * scale : 0;

  return (
    <div className="hoas-photo-crop-backdrop" role="presentation" onClick={onClose}>
      <div
        className="hoas-photo-crop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hoas-photo-crop-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="hoas-photo-crop-header">
          <h3 id="hoas-photo-crop-title">Crop your new profile picture</h3>
          <button type="button" className="hoas-photo-crop-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div
          className="hoas-photo-crop-stage"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="hoas-photo-crop-viewport">
            {imageLoaded && image && (
              <img
                src={imageSrc}
                alt=""
                draggable={false}
                className="hoas-photo-crop-image"
                style={{
                  width: `${scaledWidth}px`,
                  height: `${scaledHeight}px`,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            )}
            <div className="hoas-photo-crop-mask" aria-hidden="true" />
          </div>
        </div>

        <div className="hoas-photo-crop-controls">
          <label className="hoas-photo-crop-zoom-label" htmlFor="profile-photo-zoom">
            Zoom
          </label>
          <input
            id="profile-photo-zoom"
            type="range"
            min={minScale}
            max={Math.max(minScale * MAX_ZOOM, minScale + 0.01)}
            step="0.01"
            value={scale}
            onChange={handleZoomChange}
            disabled={!imageLoaded || exporting || isConfirming}
          />
        </div>

        {error && <p className="hoas-photo-crop-error">{error}</p>}

        <button
          type="button"
          className="hoas-photo-crop-submit"
          onClick={handleConfirm}
          disabled={!imageLoaded || exporting || isConfirming}
        >
          {exporting || isConfirming ? 'Uploading...' : 'Set new profile picture'}
        </button>
      </div>
    </div>
  );
};

export default ProfilePhotoCropModal;

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const AvatarCropModal = ({ image, onComplete, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [imageRef, setImageRef] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    // Only reset position when image is first loaded
    if (imageRef) {
      setPosition({ x: 0, y: 0 });
    }
  }, [imageRef]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleComplete = () => {
    if (!imageRef || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const finalSize = 500;
    canvas.width = finalSize;
    canvas.height = finalSize;
    
    const ctx = canvas.getContext('2d');

    // Get the natural dimensions of the image
    const naturalWidth = imageRef.naturalWidth;
    const naturalHeight = imageRef.naturalHeight;

    // Calculate the displayed dimensions of the image
    const displayWidth = imageRef.width;
    const displayHeight = imageRef.height;

    // Calculate the scale between natural and displayed sizes, accounting for zoom
    const scaleX = (naturalWidth / displayWidth) / zoom;
    const scaleY = (naturalHeight / displayHeight) / zoom;

    // Calculate the crop size in natural coordinates
    // Use the smaller dimension to ensure we get a square crop
    const cropSize = Math.min(naturalWidth, naturalHeight) / zoom;

    // Calculate the center point in natural coordinates
    const centerX = (naturalWidth / 2) - (position.x * scaleX);
    const centerY = (naturalHeight / 2) - (position.y * scaleY);

    // Calculate the crop coordinates
    const sourceX = centerX - (cropSize / 2);
    const sourceY = centerY - (cropSize / 2);

    // Draw the image
    ctx.drawImage(
      imageRef,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      finalSize,
      finalSize
    );

    canvas.toBlob((blob) => {
      onComplete(blob);
    }, 'image/jpeg', 0.9);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragStart || !containerRef.current || !imageRef) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const imageRect = imageRef.getBoundingClientRect();
      
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // Calculate boundaries based on zoomed image size
      const maxX = Math.max(0, (imageRect.width * zoom - containerRect.width) / 2);
      const maxY = Math.max(0, (imageRect.height * zoom - containerRect.height) / 2);

      // Constrain movement
      newX = Math.max(-maxX, Math.min(maxX, newX));
      newY = Math.max(-maxY, Math.min(maxY, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleGlobalMouseMove = (e) => {
      if (dragStart) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      setDragStart(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragStart, zoom, imageRef]);

  const handleZoom = (newZoom) => {
    // Calculate the new position to maintain the same center point
    const oldZoom = zoom;
    const scale = newZoom / oldZoom;
    
    setZoom(newZoom);
    setPosition(prev => ({
      x: prev.x * scale,
      y: prev.y * scale
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">Adjust Profile Picture</h3>
        <div className="relative flex flex-col items-center">
          <div className="w-full max-h-[50vh] overflow-hidden relative">
            <div 
              ref={containerRef}
              className="relative cursor-move" 
              style={{ 
                width: '400px',
                height: '400px',
                margin: '0 auto',
                userSelect: 'none',
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden'
              }}
              onMouseDown={handleMouseDown}
            >
              <Image
                src={image}
                alt="Profile picture being cropped"
                ref={setImageRef}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `translate(-50%, -50%) scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center',
                  cursor: dragStart ? 'grabbing' : 'grab'
                }}
                width={400}
                height={400}
                draggable="false"
                unoptimized
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center w-full">
            <label className="mr-2 text-sm">Zoom:</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => handleZoom(parseFloat(e.target.value))}
              className="w-48"
            />
            <span className="ml-2 text-sm">{Math.round(zoom * 100)}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Click and drag to adjust the image position
          </p>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropModal;

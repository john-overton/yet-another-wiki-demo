'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import SecretQuestionsFormContent from './SecretQuestionsFormContent';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropModal = ({ image, onComplete, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [imageRef, setImageRef] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!dragStart || !containerRef.current || !imageRef) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.getBoundingClientRect();
    
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Calculate boundaries
    const maxX = (imageRect.width * zoom - containerRect.width) / 2;
    const maxY = (imageRect.height * zoom - containerRect.height) / 2;

    // Constrain movement
    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleComplete = () => {
    if (!imageRef) return;

    const canvas = document.createElement('canvas');
    const finalSize = 500; // Final output size
    canvas.width = finalSize;
    canvas.height = finalSize;
    
    const ctx = canvas.getContext('2d');
    
    // Create circular clip
    ctx.beginPath();
    ctx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // Calculate the scale factor between the displayed image and its natural size
    const displayToNaturalRatio = imageRef.naturalWidth / imageRef.width;
    
    // Calculate the center and size of the crop in the natural image coordinates
    const cropSize = Math.min(imageRef.naturalWidth, imageRef.naturalHeight) / zoom;
    const sourceX = (imageRef.naturalWidth - cropSize) / 2 - (position.x * displayToNaturalRatio);
    const sourceY = (imageRef.naturalHeight - cropSize) / 2 - (position.y * displayToNaturalRatio);

    // Apply sharpening
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
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

    // Apply additional sharpening
    const imageData = ctx.getImageData(0, 0, finalSize, finalSize);
    const sharpenKernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    const newImageData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    
    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < imageData.width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * imageData.width + (x + kx)) * 4 + c;
              sum += imageData.data[idx] * sharpenKernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          const idx = (y * imageData.width + x) * 4 + c;
          newImageData.data[idx] = Math.max(0, Math.min(255, sum));
        }
      }
    }
    ctx.putImageData(newImageData, 0, 0);

    canvas.toBlob((blob) => {
      onComplete(blob);
    }, 'image/jpeg', 0.9);
  };

  useEffect(() => {
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
  }, [dragStart]);

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
              <img
                src={image}
                ref={setImageRef}
                style={{
                  transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.1s ease',
                  cursor: dragStart ? 'grabbing' : 'grab'
                }}
                draggable="false"
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
              onChange={(e) => setZoom(parseFloat(e.target.value))}
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

// Rest of the UserSettingsModal component remains unchanged
const UserSettingsModal = ({ user, isOpen, onClose }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSecretQuestions, setShowSecretQuestions] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cropImage, setCropImage] = useState(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar || null);
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      // Reset states when modal closes
      setShowPasswordReset(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: '', content: '' });
      setCropImage(null);
      // Reset name and email to user values
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Create a new HTMLImageElement
        const htmlImg = document.createElement('img');
        htmlImg.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const scaleSize = MAX_WIDTH / htmlImg.width;
          canvas.width = MAX_WIDTH;
          canvas.height = htmlImg.height * scaleSize;

          const ctx = canvas.getContext('2d');
          // Apply sharpening
          ctx.filter = 'contrast(1.2) saturate(1.1)';
          ctx.drawImage(htmlImg, 0, 0, canvas.width, canvas.height);
          
          // Apply additional sharpening using convolution
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const sharpenKernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
          ];
          const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
          );
          
          for (let y = 1; y < imageData.height - 1; y++) {
            for (let x = 1; x < imageData.width - 1; x++) {
              for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * imageData.width + (x + kx)) * 4 + c;
                    sum += imageData.data[idx] * sharpenKernel[(ky + 1) * 3 + (kx + 1)];
                  }
                }
                const idx = (y * imageData.width + x) * 4 + c;
                newImageData.data[idx] = Math.max(0, Math.min(255, sum));
              }
            }
          }
          ctx.putImageData(newImageData, 0, 0);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.9);
        };
        htmlImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob) => {
    setIsUploading(true);
    setCropImage(null);
    
    try {
      const resizedFile = await resizeImage(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
      const formData = new FormData();
      formData.append('avatar', resizedFile);
      formData.append('userId', user.id);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      setAvatarPreview(data.avatar);
      setTimestamp(Date.now()); // Force refresh preview
      setMessage({ type: 'success', content: 'Avatar updated successfully' });
      
      // Force refresh user data
      const event = new Event('user-avatar-updated');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarPreview(user?.avatar || null);
      setMessage({ type: 'error', content: 'Failed to upload avatar' });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', content: 'New passwords do not match' });
      return;
    }

    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          currentPassword,
          newPassword
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }

      setMessage({ type: 'success', content: 'Password updated successfully' });
      setShowPasswordReset(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', content: error.message || 'Failed to update password' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          name,
          email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user settings');
      }

      setMessage({ type: 'success', content: 'Settings updated successfully' });
      
      // Dispatch event to update avatar in UserButton
      const event = new Event('user-avatar-updated');
      window.dispatchEvent(event);
      
      // Close the modal after successful update
      onClose();
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', content: 'Failed to update settings' });
    }
  };

  const getAvatarSrc = () => {
    if (!avatarPreview) return null;
    if (avatarPreview.startsWith('data:')) return avatarPreview;
    
    // Add timestamp to force refresh
    return avatarPreview.startsWith('http')
      ? `${avatarPreview}?t=${timestamp}`
      : `/user-avatars/${avatarPreview.split('/').pop()}?t=${timestamp}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">User Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {message.content && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {message.content}
          </div>
        )}

        {cropImage && (
          <ImageCropModal
            image={cropImage}
            onComplete={handleCropComplete}
            onCancel={() => setCropImage(null)}
          />
        )}

        {showSecretQuestions ? (
          <SecretQuestionsFormContent
            onComplete={() => {
              setShowSecretQuestions(false);
              setMessage({ type: 'success', content: 'Security questions updated successfully' });
            }}
          />
        ) : showPasswordReset ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowPasswordReset(false)}
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <i className="ri-lock-password-line"></i>
                Update Password
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {avatarPreview ? (
                  <div className="h-24 w-24 rounded-full overflow-hidden relative">
                    <Image 
                      src={getAvatarSrc()}
                      alt={user?.name || 'User avatar'}
                      className="object-cover"
                      fill
                      sizes="96px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <i className="ri-user-line text-3xl text-gray-500 dark:text-gray-400"></i>
                  </div>
                )}
                <label 
                  htmlFor="avatar" 
                  className={`absolute bottom-0 right-0 bg-white dark:bg-gray-400 rounded-full p-2 shadow-lg cursor-pointer ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {isUploading ? (
                    <i className="ri-loader-4-line animate-spin text-gray-600 dark:text-gray-300"></i>
                  ) : (
                    <i className="ri-camera-line p-1 text-gray-600 dark:text-gray-300"></i>
                  )}
                </label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 mb-4"
            >
              <i className="ri-lock-password-line"></i>
              Change Password
            </button>

            <button
              type="button"
              onClick={() => setShowSecretQuestions(true)}
              className="w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 mb-4"
            >
              <i className="ri-shield-keyhole-line"></i>
              Update Security Questions
            </button>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <i className="ri-save-line"></i>
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default UserSettingsModal;

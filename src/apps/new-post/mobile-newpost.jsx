import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { X, Image, Check, Eye } from '@phosphor-icons/react';
import Editor from '@monaco-editor/react';
import axios from '../../axios';
import './newpost.scss';

const MobileNewPost = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1); // 1: заголовок, 2: фото, 3: описание
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPostId, setCreatedPostId] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setStep(3);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Введите заголовок';
    if (!image) newErrors.image = 'Добавьте изображение';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const imageResponse = await fetch(image);
      const blob = await imageResponse.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('image', file);
      const response = await axios.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data && response.data._id) {
        window.location.href = `/posts/${response.data._id}`;
      }
    } catch (err) {
      alert('Ошибка при создании поста: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onClose();
    window.location.reload();
  };

  const handleViewPost = () => {
    if (createdPostId) {
      // Открываем пост в новой вкладке
      window.open(`/post/${createdPostId}`, '_blank');
    }
    handleCloseSuccess();
  };

  const handleReloadPage = () => {
    handleCloseSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-modal-overlay">
      <div className="mobile-modal-window">
        <div className="mobile-modal-header">
          <h2>Новый пост</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="mobile-modal-content">
          {step === 1 && (
            <div className="mobile-form-step">
              <div className="input-group">
                <label>Заголовок</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите заголовок"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <div className="error-message">{errors.title}</div>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mobile-image-step">
              <div className="mobile-image-upload" onClick={() => document.getElementById('mobile-image-input').click()}>
                {image ? (
                  <img src={image} alt="Preview" />
                ) : (
                  <>
                    <Image size={32} />
                    <p>Добавьте фото</p>
                  </>
                )}
                <input
                  id="mobile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              {errors.image && <div className="error-message">{errors.image}</div>}
            </div>
          )}
        </div>

        <div className="mobile-modal-footer">
          {step === 1 ? (
            <button className="btn-primary" onClick={() => setStep(2)} disabled={!title.trim()}>
              Далее
            </button>
          ) : step === 2 ? (
            <>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Назад
              </button>
              <button className="btn-primary" onClick={() => setStep(3)} disabled={!image}>
                Далее
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setStep(2)}>
                Назад
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Создание...' : 'Создать пост'}
              </button>
            </>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="success-modal">
          <div className="modal-window">
            <Check size={48} color="#00c853" />
            <h3>Пост создан!</h3>
            <p>Ваш пост успешно опубликован</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexDirection: 'column' }}>
              {createdPostId && (
                <button 
                  className="btn-primary" 
                  onClick={handleViewPost}
                  style={{
                    backgroundColor: '#9c27b0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Eye size={16} />
                  Посмотреть пост
                </button>
              )}
              <button 
                className="btn-primary" 
                onClick={handleReloadPage}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNewPost; 
import React, { useState, useEffect } from 'react';
import axios from '../../axios';
import { useTheme } from '@mui/material/styles';
import { X, Image, Check, Warning, Info, Eye } from '@phosphor-icons/react';
import MobileNewPost from './mobile-newpost';
import './newpost.scss';

const NewPost = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [rateLimitError, setRateLimitError] = useState(false);
  const [createdPostId, setCreatedPostId] = useState(null);

  // Функция для генерации случайного контента
  const generateRandomContent = (type) => {
    const descriptions = [
      "Интересная идея, которой хочу поделиться с сообществом!",
      "Новый проект, над которым работаю. Хочу услышать ваше мнение!",
      "Поделюсь своими мыслями и находками в этой области.",
      "Открытие, которое может быть полезно другим разработчикам.",
      "Креативное решение проблемы, с которой столкнулся."
    ];

    const contents = [
      "## Введение\n\nСегодня хочу поделиться интересной находкой, которая может быть полезна сообществу.\n\n## Основная идея\n\nЭто решение помогло мне оптимизировать процесс разработки и улучшить качество кода.\n\n## Заключение\n\nНадеюсь, эта информация будет полезна и другим разработчикам!",
      
      "## Проблема\n\nСтолкнулся с интересной задачей, которая потребовала нестандартного подхода.\n\n## Решение\n\nПосле нескольких попыток нашел элегантное решение, которым хочу поделиться.\n\n## Результат\n\nРезультат превзошел ожидания и теперь использую этот подход регулярно.",
      
      "## Контекст\n\nРаботая над проектом, обнаружил полезную технику, которая может пригодиться многим.\n\n## Детали\n\nПодробно разберем, как это работает и почему это эффективно.\n\n## Применение\n\nЭта техника может быть адаптирована под различные проекты и задачи."
    ];

    const tagSets = [
      ["разработка", "программирование", "технологии"],
      ["проект", "идея", "инновации"],
      ["опыт", "обучение", "советы"],
      ["код", "алгоритм", "оптимизация"],
      ["креатив", "дизайн", "творчество"]
    ];

    switch (type) {
      case 'description':
        return descriptions[Math.floor(Math.random() * descriptions.length)];
      case 'content':
        return contents[Math.floor(Math.random() * contents.length)];
      case 'tags':
        return tagSets[Math.floor(Math.random() * tagSets.length)];
      default:
        return '';
    }
  };

  useEffect(() => {
    if (window.monaco) {
      window.monaco.editor.defineTheme('custom-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': theme.palette.background.default,
          'editor.foreground': theme.palette.text.primary,
        }
      });

      window.monaco.editor.defineTheme('custom-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': theme.palette.background.default,
          'editor.foreground': theme.palette.text.primary,
        }
      });
    }
  }, [theme.palette.mode]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <MobileNewPost isOpen={isOpen} onClose={onClose} />;
  }

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (errors.image) {
        setErrors({ ...errors, image: '' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Пожалуйста, добавьте заголовок поста!');
      return;
    }
    if (isLoading) {
      return;
    }
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
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
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        className="modal-window pinterest-style" 
        style={{ 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'all 0.3s ease',
          color: theme.palette.text.primary
        }}
      >
        <div className="modal-header" style={{ 
          borderBottomColor: theme.palette.divider,
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px 12px 0 0'
        }}>
          <h2 style={{ color: theme.palette.text.primary }}>Создание поста</h2>
          <button className="close-button" onClick={onClose} style={{ color: theme.palette.text.secondary }}>×</button>
        </div>
        
        <div className="modal-content pinterest-layout">
          <div className="form-section">
            <div className="input-group">
              <label style={{ color: theme.palette.text.primary }}>Заголовок *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="Добавьте заголовок"
                className={errors.title ? 'error' : ''}
                style={{
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                  borderColor: errors.title ? theme.palette.error.main : theme.palette.divider,
                  color: theme.palette.text.primary
                }}
              />
              {errors.title && <div className="error-message" style={{ color: theme.palette.error.main }}>{errors.title}</div>}
            </div>
          </div>

          <div className="image-section">
            <div 
              className={`image-upload ${selectedFile ? 'has-image' : ''} ${errors.image ? 'error' : ''}`}
              onClick={() => document.getElementById('file-input').click()}
              style={{
                borderColor: errors.image ? theme.palette.error.main : theme.palette.divider,
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <input
                type="file"
                id="file-input"
                hidden
                onChange={handleFileChange}
                accept="image/*"
              />
              {selectedFile ? (
                <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
              ) : (
                <>
                  <svg className="upload-icon" viewBox="0 0 24 24" fill="currentColor" style={{ color: theme.palette.text.secondary }}>
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                  <p style={{ color: theme.palette.text.secondary }}>Нажмите для загрузки изображения (необязательно)</p>
                </>
              )}
              {errors.image && <div className="error-message" style={{ color: theme.palette.error.main }}>{errors.image}</div>}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ 
          borderTopColor: theme.palette.divider,
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0 0 12px 12px'
        }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || rateLimitError}
            className="btn-primary"
            style={{
              background: rateLimitError ? theme.palette.error.main : theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              opacity: (isLoading || rateLimitError) ? 0.7 : 1,
              cursor: (isLoading || rateLimitError) ? 'not-allowed' : 'pointer'
            }}
          >
            {rateLimitError ? 'Подождите 30 сек...' : (isLoading ? 'Создание поста...' : 'Создать пост')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
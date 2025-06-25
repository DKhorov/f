import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Notifications as Bell, 
  Close as X, 
  Star, 
  CardGiftcard as Gift, 
  Info, 
  TrendingUp as TrendUp, 
  PlayArrow as Play, 
  Pause, 
  SkipNext as SkipForward 
} from '@mui/icons-material';

// Компонент пуш-уведомления
const PushNotification = ({ notification, onClose, onAction }) => {
  const theme = useTheme();
  
  const getIcon = () => {
    switch (notification.type) {
      case 'welcome':
        return <Star sx={{ fontSize: 20 }} />;
      case 'promo':
        return <Gift sx={{ fontSize: 20 }} />;
      case 'update':
        return <TrendUp sx={{ fontSize: 20 }} />;
      case 'music':
        return notification.isPlaying ? <Pause sx={{ fontSize: 20 }} /> : <Play sx={{ fontSize: 20 }} />;
      default:
        return <Info sx={{ fontSize: 20 }} />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'welcome':
        return {
          background: theme.palette.mode === 'dark' ? '#065f46' : '#d1fae5',
          border: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
          icon: '#10b981'
        };
      case 'promo':
        return {
          background: theme.palette.mode === 'dark' ? '#7c2d12' : '#fef3c7',
          border: theme.palette.mode === 'dark' ? '#f59e0b' : '#d97706',
          icon: '#f59e0b'
        };
      case 'update':
        return {
          background: theme.palette.mode === 'dark' ? '#1e3a8a' : '#dbeafe',
          border: theme.palette.mode === 'dark' ? '#3b82f6' : '#2563eb',
          icon: '#3b82f6'
        };
      case 'music':
        return {
          background: theme.palette.mode === 'dark' ? '#1f2937' : '#f8fafc',
          border: theme.palette.mode === 'dark' ? '#6366f1' : '#8b5cf6',
          icon: '#6366f1'
        };
      default:
        return {
          background: theme.palette.mode === 'dark' ? '#374151' : '#f3f4f6',
          border: theme.palette.mode === 'dark' ? '#6b7280' : '#d1d5db',
          icon: '#6b7280'
        };
    }
  };

  const colors = getColors();

  // Специальный рендер для музыкальных уведомлений
  if (notification.type === 'music') {
    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '16px',
          maxWidth: '380px',
          width: '90vw',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 10000,
          animation: 'slideInRight 0.3s ease-out',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          {/* Обложка трека */}
          <img
            src={notification.coverImage || 'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large?v=v2&px=999'}
            alt="Cover"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
            onError={(e) => {
              e.target.src = 'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large?v=v2&px=999';
            }}
          />
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#1f2937',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {notification.title}
            </div>
            <div style={{
              color: theme.palette.mode === 'dark' ? '#d1d5db' : '#4b5563',
              fontSize: '13px',
              lineHeight: '1.4',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {notification.artist}
            </div>
            
            {/* Кнопки управления */}
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => onAction({ ...notification, action: 'play_pause' })}
                style={{
                  background: colors.icon,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                {notification.isPlaying ? <Pause sx={{ fontSize: 16 }} /> : <Play sx={{ fontSize: 16 }} />}
              </button>
              
              <button
                onClick={() => onAction({ ...notification, action: 'next' })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.icon,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SkipForward sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
        
        <style jsx>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    );
  }

  // Обычное уведомление
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '16px',
        maxWidth: '380px',
        width: '90vw',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 10000,
        animation: 'slideInRight 0.3s ease-out',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <div style={{
          color: colors.icon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          flexShrink: 0
        }}>
          {getIcon()}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#1f2937',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '4px'
          }}>
            {notification.title}
          </div>
          <div style={{
            color: theme.palette.mode === 'dark' ? '#d1d5db' : '#4b5563',
            fontSize: '13px',
            lineHeight: '1.4',
            marginBottom: notification.actionText ? '8px' : '0'
          }}>
            {notification.message}
          </div>
          
          {notification.actionText && (
            <button
              onClick={() => onAction(notification)}
              style={{
                background: colors.icon,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              {notification.actionText || 'Подробнее'}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>
      </div>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

// Основной компонент системы уведомлений
const PushNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Проверяем, первый ли это визит
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisited', 'true');
      
      // Показываем приветственное уведомление через 2 секунды
      setTimeout(() => {
        addNotification({
          id: 'welcome',
          type: 'welcome',
          title: 'Добро пожаловать в AtomGlide! 🎉',
          message: 'Добро пожаловать в наше сообщество! Здесь вы можете делиться идеями, находить единомышленников и создавать удивительные проекты.',
          actionText: 'Начать',
          action: 'explore'
        });
      }, 2000);
    }

    // Показываем промо-уведомление через 10 секунд
    setTimeout(() => {
      addNotification({
        id: 'promo',
        type: 'promo',
        title: '🎁 Специальное предложение!',
        message: 'Создайте свой первый пост и получите бонусные баллы!',
        actionText: 'Создать пост',
        action: 'create_post'
      });
    }, 10000);

    // Показываем уведомление об обновлении через 30 секунд
    setTimeout(() => {
      addNotification({
        id: 'update',
        type: 'update',
        title: '🆕 Новые функции!',
        message: 'Добавлен новый спотлайт поиск и улучшенный интерфейс. Попробуйте прямо сейчас!',
        actionText: 'Узнать больше',
        action: 'features'
      });
    }, 30000);

    // Добавляем глобальную функцию для музыкальных уведомлений
    window.showMusicNotification = (track, isPlaying = true) => {
      addNotification({
        id: `music-${track._id}-${Date.now()}`,
        type: 'music',
        title: track.title,
        artist: track.artist,
        coverImage: track.coverImage ? `https://atomglidedev.ru/uploads/${track.coverImage.replace(/^\/+/,'')}` : null,
        isPlaying,
        action: 'music_control'
      });
    };

    // Добавляем глобальную функцию для уведомления о следующем треке
    window.showNextTrackNotification = (track) => {
      addNotification({
        id: `next-track-${track._id}-${Date.now()}`,
        type: 'music',
        title: `Следующий трек: ${track.title}`,
        artist: track.artist,
        coverImage: track.coverImage ? `https://atomglidedev.ru/uploads/${track.coverImage.replace(/^\/+/,'')}` : null,
        isPlaying: true,
        action: 'music_control'
      });
    };

  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Автоматически удаляем уведомление через 8 секунд (для музыки - 12 секунд)
    const timeout = notification.type === 'music' ? 12000 : 8000;
    setTimeout(() => {
      removeNotification(notification.id);
    }, timeout);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (notification) => {
    switch (notification.action) {
      case 'explore':
        // Прокрутка к началу страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'create_post':
        // Здесь можно добавить открытие модала создания поста
        console.log('Открыть создание поста');
        break;
      case 'features':
        // Прокрутка к спотлайту или показ информации о функциях
        console.log('Показать функции');
        break;
      case 'music_control':
        // Управление музыкой через глобальное событие
        window.dispatchEvent(new CustomEvent('musicControl', { 
          detail: { action: 'play_pause' } 
        }));
        break;
      case 'play_pause':
        // Управление воспроизведением
        window.dispatchEvent(new CustomEvent('musicControl', { 
          detail: { action: 'play_pause' } 
        }));
        break;
      case 'next':
        // Следующий трек
        window.dispatchEvent(new CustomEvent('musicControl', { 
          detail: { action: 'next' } 
        }));
        break;
      default:
        break;
    }
    removeNotification(notification.id);
  };

  return (
    <>
      {notifications.map((notification) => (
        <PushNotification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          onAction={handleAction}
        />
      ))}
    </>
  );
};

export default PushNotifications; 
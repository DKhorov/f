import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts, fetchTags } from '../../redux/slices/posts';
import { selectIsAuth } from '../../redux/slices/auth';
import { BsImage, BsTextParagraph } from 'react-icons/bs';
import { BookmarkBorder, Bookmark } from '@mui/icons-material';
import '../../style/work/work.scss';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import useSettings from '../hooks/useSettings';
import axios from '../../axios';
import PushNotifications from '../../components/PushNotifications';
import useMediaQuery from '@mui/material/useMediaQuery';

const Time = () => {
  const { mode } = useSettings();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, tags } = useSelector(state => state.posts);
  const isAuth = useSelector(selectIsAuth);
  const userData = useSelector(state => state.auth.data);
  const searchInputRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visiblePosts, setVisiblePosts] = useState(1000);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showOnlyImages, setShowOnlyImages] = useState(true);
  const [viewMode, setViewMode] = useState('withImage'); // 'withImage' или 'textOnly'
  const isMobile = useMediaQuery('(max-width:600px)');

  const colors = {
    background: mode === 'dark' ? '#0d1117' : '#f0f2f5',
    card: mode === 'dark' ? '#161b22' : '#ffffff',
    text: mode === 'dark' ? '#ffffff' : '#000000',
    secondaryText: mode === 'dark' ? '#e2e8f0' : '#2d3748',
    border: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
    accent: mode === 'dark' ? '#60a5fa' : '#2563eb',
    welcomeBg: mode === 'dark' ? '#1f2937' : '#ffffff',
    welcomeBorder: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchPosts());
        await dispatch(fetchTags());
        // Загружаем избранное пользователя
        if (userData) {
          try {
            console.log('Loading favorites for user:', userData._id);
            const { data } = await axios.get('/auth/favorites', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            console.log('Favorites API response in time.jsx:', data);
            const favoriteIds = new Set(data.favorites?.map(post => post._id) || []);
            console.log('Processed favorite IDs:', Array.from(favoriteIds));
            setFavorites(favoriteIds);
          } catch (err) {
            console.error('Error loading favorites in time.jsx:', err);
            console.error('Error response:', err.response?.data);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, userData]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const githubPanels = [
    {
      icon: '🏪',
      color: '#4CAF50',
      title: 'AtomGlide Store',
      description:'Магазин проектов пользователей и их проекты,программы'
    },
    {
      icon: '📻',
      color: '#2196F3',
      title: 'AtomGlide Music',
      description:'Музыкальный сервис от AtomGlide без ограничений в высоком качестве'
    },
    {
      icon: '⚡',
      color: '#9C27B0',
      title: 'Popular Post',
      description: 'Топ чарт самых поплуряных постов за все время!'
    },
    {
      icon: '❤️‍🔥',
      color: '#FF9800',
      title: 'Live-Chat',
      description: 'Форум,живой чат'
    }
  ];

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisiblePosts(prev => prev + 20);
      setIsLoadingMore(false);
    }, 500);
  };

  // Фильтруем невалидные посты
  const validPosts = Array.isArray(posts?.items) ? posts.items.filter(post => 
    post && 
    post._id && 
    post.title && 
    post.createdAt && 
    !post.isDeleted && 
    post.user
  ) : [];

  // Сортируем по дате создания
  const sortedValidPosts = [...validPosts].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Фильтруем по поиску и ограничиваем количество видимых постов
  const filteredPosts = sortedValidPosts
    .filter(post => {
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        post.title?.toLowerCase().includes(searchLower) || 
        post.text?.toLowerCase().includes(searchLower) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .filter(post => !showOnlyImages || post.imageUrl);

  const hasMorePosts = false;

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 0);
    }
  };
  

  const processImageUrl = (url) => 
    url?.startsWith('http') ? url : `https://atomglidedev.ru${url}`;

  const handleFavoriteToggle = async (postId, e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!userData) {
      alert('Для этого действия нужно авторизоваться');
      return;
    }

    try {
      const isFavorite = favorites.has(postId);
      if (isFavorite) {
        await axios.delete(`/auth/favorites/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(postId);
          return newFavorites;
        });
      } else {
        await axios.post(`/auth/favorites/${postId}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setFavorites(prev => new Set([...prev, postId]));
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
      alert('Ошибка при обновлении избранного: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!window.localStorage.getItem('token') && !isAuth) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <Box className="mepost-main">
        <Box className="post-main">
          {[...Array(5)].map((_, index) => (
            <Box key={`skeleton-${index}`} className="photo-skeleton" />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      className="mepost-main"
      sx={{
        marginLeft: '120px',
        width: "100%",
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box 
        className="main-container"
        sx={{
          height: '100%',
          overflowY: 'auto',
          width: '100%',
          padding: '0',
          margin: '0',
          position: 'relative',
          left: '0',
          right: '0',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '0px',
          },
        }}
      >
        {isMobile ? (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0'}}>
            <span style={{fontSize: 22, fontWeight: 500, color: colors.text, letterSpacing: 1}}>AtomGlide</span>
          </div>
        ) : (
          <Box 
            className="welcome-section"
            sx={{
              background: mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '10px 10px',
              marginBottom: 0,
              marginTop: '12px',
              boxShadow: mode === 'dark' 
                ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease',
              zIndex: 10,
              width: '100%',
              marginLeft: 0,
              marginRight: 0,
              alignSelf: 'flex-start',
            }}
          >
            <Box 
              className="welcome-header"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '8px'
              }}
            >
              {/* 3D Кубик */}
              <Box
                className="cube-container"
                sx={{
                  width: '32px',
                  height: '32px',
                  perspective: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  className="cube"
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    animation: 'rotate 3s infinite linear',
                    '@keyframes rotate': {
                      '0%': {
                        transform: 'rotateX(0deg) rotateY(0deg)'
                      },
                      '100%': {
                        transform: 'rotateX(360deg) rotateY(360deg)'
                      }
                    }
                  }}
                >
                  {/* Передняя грань */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      background: mode === 'dark' 
                        ? 'linear-gradient(45deg, #60a5fa, #3b82f6)' 
                        : 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                      transform: 'rotateY(0deg) translateZ(16px)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                  {/* Задняя грань */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      background: mode === 'dark' 
                        ? 'linear-gradient(45deg, #8b5cf6, #7c3aed)' 
                        : 'linear-gradient(45deg, #7c3aed, #5b21b6)',
                      transform: 'rotateY(180deg) translateZ(16px)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                  {/* Правая грань */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      background: mode === 'dark' 
                        ? 'linear-gradient(45deg, #10b981, #059669)' 
                        : 'linear-gradient(45deg, #059669, #047857)',
                      transform: 'rotateY(90deg) translateZ(16px)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                  {/* Левая грань */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      background: mode === 'dark' 
                        ? 'linear-gradient(45deg, #f59e0b, #d97706)' 
                        : 'linear-gradient(45deg, #d97706, #b45309)',
                      transform: 'rotateY(-90deg) translateZ(16px)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                  {/* Верхняя грань */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      background: mode === 'dark' 
                        ? 'linear-gradient(45deg, #ef4444, #dc2626)' 
                        : 'linear-gradient(45deg, #dc2626, #b91c1c)',
                      transform: 'rotateX(90deg) translateZ(16px)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                  {/* Нижняя грань */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      background: mode === 'dark' 
                        ? 'linear-gradient(45deg, #ec4899, #db2777)' 
                        : 'linear-gradient(45deg, #db2777, #be185d)',
                      transform: 'rotateX(-90deg) translateZ(16px)',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />
                </Box>
              </Box>

              {/* Информация рядом с кубом */}
              <Box 
                className="welcome-info"
                sx={{
                  display: 'flex',
                  
                  flex: 1
                }}
              >
                {/* Текст приветствия */}
                <Box sx={{ flex: 1 , marginLeft: '20px' }}>
                  <Box 
                    className="welcome-text"
                    sx={{ 
                      color: mode === 'dark' ? '#ffffff' : '#1a202c',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '0.2px',
                      marginBottom: 0
                    }}
                  >
                    Привет, {userData?.fullName || 'User'}! 👋
                  </Box>
                  <Box 
                    className="welcome-name"
                    sx={{ 
                      color: mode === 'dark' ? '#a0aec0' : '#4a5568',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      letterSpacing: '0.1px'
                    }}
                  >
                    AtomGlide 8.0 Beta 2
                  </Box>
                </Box>
              </Box>

              {/* Центральная часть - время */}
              <Box 
                className="current-time"
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 12px',
                  background: mode === 'dark' 
                    ? 'rgba(96, 165, 250, 0.1)' 
                    : 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: `1px solid ${mode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                  minWidth: '70px'
                }}
              >
                <Box sx={{ 
                  color: mode === 'dark' ? '#60a5fa' : '#3b82f6',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}>
                  {formatTime(currentTime)}
                </Box>
                <Box sx={{ 
                  color: mode === 'dark' ? '#a0aec0' : '#4a5568',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  marginTop: '1px'
                }}>
                  {new Date().toLocaleDateString('ru-RU', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Box>
              </Box>

              {/* Правая часть - кнопки действий */}
              <Box sx={{ 
                display: 'flex', 
                gap: '6px',
                alignItems: 'center'
              }}>
                <Tooltip title={showOnlyImages ? "Показать все посты" : "Показать только посты с фото"}>
                  <IconButton 
                    onClick={() => setShowOnlyImages(!showOnlyImages)}
                    sx={{ 
                      color: showOnlyImages ? colors.accent : colors.secondaryText,
                      background: showOnlyImages 
                        ? (mode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)')
                        : 'transparent',
                      borderRadius: '8px',
                      padding: '6px',
                      '&:hover': { 
                        color: colors.accent,
                        background: mode === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.15)'
                      }
                    }}
                  >
                    <BsImage size={16} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={viewMode === 'withImage' ? "Текстовый просмотр" : "Просмотр с изображениями"}>
                  <IconButton 
                    onClick={() => setViewMode(viewMode === 'withImage' ? 'textOnly' : 'withImage')}
                    sx={{ 
                      color: viewMode === 'withImage' ? colors.accent : colors.secondaryText,
                      background: viewMode === 'withImage' 
                        ? (mode === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)')
                        : 'transparent',
                      borderRadius: '8px',
                      padding: '6px',
                      '&:hover': { 
                        color: colors.accent,
                        background: mode === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.15)'
                      }
                    }}
                  >
                    <BsTextParagraph size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        )}

        {showSearch && (
          <Box
            component="input"
            type="text"
            className="search-input"
            ref={searchInputRef}
            placeholder="Введите запрос..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              backgroundColor: colors.welcomeBg,
              color: mode === 'dark' ? '#ffffff' : '#000000',
              border: `1px solid ${colors.welcomeBorder}`,
              borderRadius: '8px',
              padding: '12px 16px',
              width: '100%',
              marginBottom: '20px',
              fontSize: '1rem',
              fontWeight: 500,
              letterSpacing: '0.2px',
              boxShadow: mode === 'dark' 
                ? '0 2px 4px rgba(0, 0, 0, 0.2)' 
                : '0 1px 2px rgba(0, 0, 0, 0.1)',
              '&::placeholder': {
                color: mode === 'dark' ? '#cbd5e0' : '#4a5568',
                fontWeight: 500
              },
              '&:focus': {
                outline: 'none',
                borderColor: mode === 'dark' ? '#60a5fa' : '#2563eb',
                boxShadow: mode === 'dark'
                  ? '0 0 0 2px rgba(96, 165, 250, 0.3)'
                  : '0 0 0 2px rgba(37, 99, 235, 0.3)'
              }
            }}
          />
        )}

        <Box 
          className="pinterest-masonry"
          sx={{
            width: '100%',
            padding: '0',
            margin: '0'
          }}
        >
          {filteredPosts.map((post) => (
            post.imageUrl ? (
              <Box
                key={post._id}
                sx={{
                  position: 'relative',
                  marginBottom: '16px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => navigate(`/posts/${post._id}`)}
              >
                <img
                  src={processImageUrl(post.imageUrl)}
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '20px'
                  }}
                />
                {/* Кнопка "Сохранить в избранное" при наведении */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    '.MuiBox-root:hover &': {
                      opacity: 1
                    }
                  }}
                >
                  <IconButton
                    onClick={(e) => handleFavoriteToggle(post._id, e)}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: favorites.has(post._id) ? '#ff6b6b' : '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: favorites.has(post._id) ? '#ff5252' : '#ffffff'
                      }
                    }}
                  >
                    {favorites.has(post._id) ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                </Box>
              </Box>
            ) : null
          ))}
        </Box>
      </Box>
      
      {/* Система пуш-уведомлений */}
      <PushNotifications />
    </Box>
  );
}

export default Time; 
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Dialog,
  Box,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  InputAdornment,
  Typography
} from '@mui/material';
import {
  Search,
  Close,
  Person,
  Group,
  Favorite,
  AccountBalanceWallet,
  Settings,
  MusicNote,
  Home,
  Store,
  Apps
} from '@mui/icons-material';
import { BsImage, BsTextParagraph, BsMusicNote } from 'react-icons/bs';
import axios from '../axios';
import useSettings from '../apps/hooks/useSettings';

const Spotlight = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { mode } = useSettings();
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const isAuth = useSelector(state => state.auth.isAuth);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  // Загрузка данных при открытии
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем посты
      console.log('Loading posts for spotlight...');
      const postsResponse = await axios.get('/posts');
      console.log('Posts response:', postsResponse.data);
      setPosts(postsResponse.data);

      // Загружаем музыку
      console.log('Loading music for spotlight...');
      const musicResponse = await axios.get('/music');
      console.log('Music response:', musicResponse.data);
      setMusic(musicResponse.data);
    } catch (error) {
      console.error('Ошибка загрузки данных для спотлайта:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const processImageUrl = (url) => 
    url?.startsWith('http') ? url : `https://atomglidedev.ru${url}`;

  // Основные действия
  const spotlightActions = [
    {
      id: 'home',
      title: 'Главная',
      description: 'Перейти на главную страницу',
      icon: <Home />,
      action: () => {
        onClose();
        navigate('/');
      }
    },
    {
      id: 'profile',
      title: 'Профиль',
      description: 'Открыть профиль пользователя',
      icon: <Person />,
      action: () => {
        onClose();
        navigate('/account/profile');
      }
    },
    {
      id: 'groups',
      title: 'Группы',
      description: 'Просмотр групп',
      icon: <Group />,
      action: () => {
        onClose();
        navigate('/groups');
      }
    },
    {
      id: 'music',
      title: 'Музыка',
      description: 'Открыть музыкальный раздел',
      icon: <MusicNote />,
      action: () => {
        onClose();
        navigate('/music');
      }
    },
    {
      id: 'store',
      title: 'Магазин',
      description: 'Открыть магазин',
      icon: <Store />,
      action: () => {
        onClose();
        navigate('/store');
      }
    },
    {
      id: 'apps',
      title: 'Приложения',
      description: 'Открыть мини-приложения',
      icon: <Apps />,
      action: () => {
        onClose();
        navigate('/mini-apps');
      }
    },
    {
      id: 'favorites',
      title: 'Избранное',
      description: 'Просмотр избранных постов',
      icon: <Favorite />,
      action: () => {
        onClose();
        window.dispatchEvent(new CustomEvent('openFavoritesModal'));
      }
    },
    {
      id: 'wallet',
      title: 'Кошелек',
      description: 'Открыть кошелек',
      icon: <AccountBalanceWallet />,
      action: () => {
        onClose();
        window.dispatchEvent(new CustomEvent('openWalletModal'));
      }
    },
    {
      id: 'settings',
      title: 'Настройки',
      description: 'Открыть настройки',
      icon: <Settings />,
      action: () => {
        onClose();
        navigate('/settings');
      }
    }
  ];

  // Поиск постов
  const searchPosts = (query) => {
    if (!query.trim()) return [];
    
    const searchLower = query.toLowerCase();
    return posts
      .filter(post => 
        post.title?.toLowerCase().includes(searchLower) ||
        post.text?.toLowerCase().includes(searchLower) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
      .slice(0, 5)
      .map(post => ({
        id: `post-${post._id}`,
        title: post.title,
        description: post.text?.substring(0, 60) + (post.text?.length > 60 ? '...' : ''),
        icon: post.imageUrl ? <BsImage /> : <BsTextParagraph />,
        action: () => {
          onClose();
          navigate(`/posts/${post._id}`);
        },
        isPost: true,
        post: post
      }));
  };

  // Поиск музыки
  const searchMusic = (query) => {
    if (!query.trim()) return [];
    
    console.log('Searching music for query:', query);
    console.log('Available music tracks:', music);
    
    const searchLower = query.toLowerCase();
    const filteredMusic = music.filter(track => 
      track.title?.toLowerCase().includes(searchLower) ||
      track.artist?.toLowerCase().includes(searchLower) ||
      track.genre?.toLowerCase().includes(searchLower)
    );
    
    console.log('Filtered music results:', filteredMusic);
    
    return filteredMusic
      .slice(0, 5)
      .map(track => ({
        id: `music-${track._id}`,
        title: track.title,
        description: `${track.artist || 'Unknown Artist'} • ${track.genre || 'Unknown Genre'}`,
        icon: <BsMusicNote />,
        action: () => {
          onClose();
          navigate('/music');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('playMusicTrack', { 
              detail: { trackId: track._id } 
            }));
          }, 100);
        },
        isMusic: true,
        track: track
      }));
  };

  // Фильтрация действий
  const filteredActions = spotlightActions.filter(action =>
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.description.toLowerCase().includes(query.toLowerCase())
  );

  // Объединяем все результаты
  const allResults = [
    ...filteredActions,
    ...searchPosts(query),
    ...searchMusic(query)
  ];

  console.log('All spotlight results:', allResults);
  console.log('Query:', query);
  console.log('Filtered actions:', filteredActions);
  console.log('Posts results:', searchPosts(query));
  console.log('Music results:', searchMusic(query));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          boxShadow: mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'all 0.3s ease'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Заголовок */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 2,
          background: mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          padding: '12px 16px'
        }}>
        
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: mode === 'dark' ? '#a0aec0' : '#4a5568',
              '&:hover': {
                background: mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.1)'
              }
            }}
          >
            <Close />
          </IconButton>
          AtomWiki
        </Box>

        {/* Поле поиска */}
        <TextField
          ref={inputRef}
          fullWidth
          placeholder="Поиск действий, постов и музыки..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ 
                  color: mode === 'dark' ? '#a0aec0' : '#4a5568' 
                }} />
              </InputAdornment>
            ),
            sx: {
              background: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.2)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' ? '#60a5fa' : '#3b82f6'
              }
            }
          }}
          sx={{
            mb: 2,
            '& .MuiInputBase-input': {
              color: mode === 'dark' ? '#ffffff' : '#1a202c',
              fontSize: '1rem',
              fontWeight: 500
            },
            '& .MuiInputBase-input::placeholder': {
              color: mode === 'dark' ? '#a0aec0' : '#4a5568',
              opacity: 1
            }
          }}
        />

        {/* Список результатов */}
        <List sx={{ p: 0 }}>
          {allResults.length > 0 ? (
            allResults.map((result) => (
              <ListItem
                key={result.id}
                button
                onClick={result.action}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  background: mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(255, 255, 255, 0.4)',
                    transform: 'translateX(4px)',
                    borderColor: mode === 'dark' 
                      ? 'rgba(96, 165, 250, 0.3)' 
                      : 'rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: mode === 'dark' ? '#60a5fa' : '#3b82f6',
                  minWidth: '40px'
                }}>
                  {result.isPost && result.post.imageUrl ? (
                    <Box
                      component="img"
                      src={processImageUrl(result.post.imageUrl)}
                      alt={result.title}
                      sx={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        objectFit: 'cover',
                        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                      }}
                    />
                  ) : result.isMusic && result.track.image ? (
                    <Box
                      component="img"
                      src={processImageUrl(result.track.image)}
                      alt={result.title}
                      sx={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        objectFit: 'cover',
                        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                      }}
                    />
                  ) : (
                    result.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ 
                      color: mode === 'dark' ? '#ffffff' : '#1a202c',
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      {result.title}
                      {result.isPost && (
                        <Chip
                          label="Пост"
                          size="small"
                          sx={{
                            background: mode === 'dark' 
                              ? 'rgba(16, 185, 129, 0.1)' 
                              : 'rgba(16, 185, 129, 0.1)',
                            color: mode === 'dark' ? '#10b981' : '#059669',
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            height: '18px',
                            border: `1px solid ${mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                          }}
                        />
                      )}
                      {result.isMusic && (
                        <Chip
                          label="Музыка"
                          size="small"
                          sx={{
                            background: mode === 'dark' 
                              ? 'rgba(168, 85, 247, 0.1)' 
                              : 'rgba(168, 85, 247, 0.1)',
                            color: mode === 'dark' ? '#a855f7' : '#9333ea',
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            height: '18px',
                            border: `1px solid ${mode === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ 
                      color: mode === 'dark' ? '#a0aec0' : '#4a5568',
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 0.5
                    }}>
                      {result.description}
                    </Box>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: mode === 'dark' ? '#a0aec0' : '#4a5568'
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {query ? 'Ничего не найдено' : 'Начните вводить для поиска'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {query ? 'Попробуйте изменить запрос' : 'Поиск по действиям, постам и музыке'}
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Dialog>
  );
};

export default Spotlight; 
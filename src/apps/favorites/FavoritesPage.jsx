import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../axios';
import { Post } from '../post/post';
import { Box, CircularProgress, Typography, Dialog, IconButton } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { MdFullscreen, MdClose, MdFullscreenExit } from 'react-icons/md';
import { useSnackbar } from 'notistack';
import useSettings from '../hooks/useSettings';
import withAuth from '../sys-tool/withAuth';

const FavoritesPage = ({ open, onClose }) => {
  const { mode } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const userData = useSelector(state => state.auth.data);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/auth/favorites');
      console.log('Favorites API response:', data); // Отладочная информация
      
      // Проверяем разные возможные форматы ответа
      let favorites = [];
      if (data.favorites) {
        favorites = data.favorites;
      } else if (Array.isArray(data)) {
        favorites = data;
      } else if (data.posts) {
        favorites = data.posts;
      }
      
      console.log('Processed favorites:', favorites); // Отладочная информация
      setFavoritePosts(favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      enqueueSnackbar('Ошибка при загрузке избранного', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (userData && open) fetchFavorites();
  }, [userData, fetchFavorites, open]);

  const removeFromFavorites = useCallback(async (postId) => {
    try {
      await axios.delete(`/auth/favorites/${postId}`);
      setFavoritePosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      enqueueSnackbar('Ошибка при удалении из избранного', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  if (!userData) {
    return (
      <Dialog open={open} onClose={onClose} fullScreen={isFullScreen} maxWidth="lg" fullWidth>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          px: 2, 
          py: 1, 
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          borderTopLeftRadius: 8, 
          borderTopRightRadius: 8,
          boxShadow: mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'all 0.3s ease'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookmarkIcon fontSize="large" style={{ marginRight: 8, verticalAlign: 'middle' }} />
            <span style={{ fontWeight: 600, color: '#fff', fontSize: 18 }}>Мои сохраненные посты</span>
          </Box>
          <Box>
            <IconButton onClick={() => setIsFullScreen(f => !f)} size="small" sx={{ color: '#fff', mr: 1 }}>
              {isFullScreen ? <MdFullscreenExit /> : <MdFullscreen />}
            </IconButton>
            <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
              <MdClose />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 'calc(100vh - 200px)',
          color: '#c9d1d9',
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'all 0.3s ease',
          p: 4
        }}>
          <Typography variant="h6" gutterBottom>
            Для просмотра избранного необходимо авторизоваться
          </Typography>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isFullScreen} maxWidth="lg" fullWidth>
      {/* Кастомная панель сверху */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 2, 
        py: 1, 
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        borderTopLeftRadius: 8, 
        borderTopRightRadius: 8,
        boxShadow: mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
        transition: 'all 0.3s ease'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookmarkIcon fontSize="large" style={{ marginRight: 8, verticalAlign: 'middle' }} />
          <span style={{ fontWeight: 600, color: '#fff', fontSize: 18 }}>Мои сохраненные посты</span>
        </Box>
        <Box>
          <IconButton onClick={() => setIsFullScreen(f => !f)} size="small" sx={{ color: '#fff', mr: 1 }}>
            {isFullScreen ? <MdFullscreenExit /> : <MdFullscreen />}
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
            <MdClose />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ 
        padding: '20px',
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
        transition: 'all 0.3s ease',
        minHeight: isFullScreen ? '100vh' : 'calc(100vh - 200px)',
        overflow: 'auto'
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: 'calc(100vh - 300px)'
          }}>
            <CircularProgress />
          </Box>
        ) : favoritePosts.length > 0 ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {favoritePosts.map(post => (
              <Box 
                key={post._id} 
                sx={{
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    transition: 'transform 0.2s'
                  }
                }}
              >
                <Post 
                  {...post}
                  isFavorite={true}
                  onFavoriteToggle={removeFromFavorites}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 'calc(100vh - 300px)',
            color: '#8b949e'
          }}>
            <BookmarkIcon sx={{ fontSize: '60px', marginBottom: '20px' }} />
            <Typography variant="h6" align="center">
              У вас пока нет сохраненных постов<br />
              Нажмите на значок закладки, чтобы сохранить понравившиеся посты
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default withAuth(FavoritesPage);
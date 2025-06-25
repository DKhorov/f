import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia, Typography, Box, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import useSettings from '../../hooks/useSettings';

const MusicItem = ({ item, onPlay, isCurrent, isPlaying, onToggleFavorite, isFavorite, showArtist, mode }) => {
  const getCoverImage = () => {
    if (item.coverImage) {
      const cleanPath = item.coverImage
        .replace(/^\/?uploads\/?/, '')
        .replace(/^\/?music\/?/, '');
      return `https://atomglidedev.ru/uploads/music/${cleanPath}?v=${new Date().getTime()}`;
    }
    return "https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large?v=v2&px=999";
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Предотвращаем воспроизведение при клике на кнопку
    onToggleFavorite(item._id);
  };

  return (
    <Card 
      onClick={() => onPlay(item)}
      sx={{ 
        position: 'relative',
        width: '100%',
        backgroundColor: mode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(255, 255, 255)',
        color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: mode === 'dark' 
            ? '0 8px 24px rgba(0, 0, 0, 0.5)'
            : '0 8px 24px rgba(0, 0, 0, 0.2)'
        }
      }}
    >
      <CardMedia
        component="img"
        image={getCoverImage()}
        alt={item.title}
        sx={{
          width: '100%',
          aspectRatio: '1/1',
          objectFit: 'cover'
        }}
      />
      
      {/* Кнопка избранного */}
      <IconButton
        onClick={handleFavoriteClick}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: isFavorite ? '#ff4081' : 'white',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: isFavorite ? '#ff4081' : '#ff4081'
          },
          zIndex: 2
        }}
      >
        {isFavorite ? <Favorite /> : <FavoriteBorder />}
      </IconButton>

      <Box sx={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '10px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
        textAlign: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <Typography 
          variant="subtitle1" 
          component="div" 
          sx={{ 
            fontWeight: 600,
            color: 'rgb(255, 255, 255)',
            mb: 0.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {item.title}
        </Typography>
        {showArtist && item.artist && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgb(255, 255, 255)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontSize: '0.875rem',
              opacity: 0.8,
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {item.artist}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default MusicItem;
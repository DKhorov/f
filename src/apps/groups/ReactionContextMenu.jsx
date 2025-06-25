import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../contexts/ThemeContext';

const REACTIONS = [
  { emoji: '👍', label: 'Нравится' },
  { emoji: '❤️', label: 'Любовь' },
  { emoji: '😂', label: 'Смех' },
  { emoji: '😮', label: 'Удивление' },
  { emoji: '😢', label: 'Грусть' },
  { emoji: '😡', label: 'Злость' },
  { emoji: '👏', label: 'Аплодисменты' },
  { emoji: '🙏', label: 'Молитва' },
  { emoji: '🔥', label: 'Огонь' },
  { emoji: '💯', label: '100' },
  { emoji: '💪', label: 'Сила' },
  { emoji: '🎉', label: 'Праздник' },
  { emoji: '🤔', label: 'Задумчивость' },
  { emoji: '😍', label: 'Влюбленность' },
  { emoji: '🤯', label: 'Взрыв мозга' },
  { emoji: '🥳', label: 'Веселье' },
  { emoji: '😴', label: 'Сон' },
  { emoji: '🤮', label: 'Тошнота' },
  { emoji: '👻', label: 'Призрак' },
  { emoji: '🤖', label: 'Робот' },
  { emoji: '👽', label: 'Инопланетянин' },
  { emoji: '🤡', label: 'Клоун' },
  { emoji: '💩', label: 'Какашка' },
  { emoji: '🦄', label: 'Единорог' }
];

const ReactionContextMenu = ({ 
  open,
  onClose, 
  onReactionSelect, 
  currentReaction = null,
  userReactionsCount = 0
}) => {
  const { mode } = useTheme();
  const [error, setError] = useState('');
  
  const isDark = mode === 'dark';
  const bgColor = isDark ? '#23272b' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#3b3a39' : '#e0e0e0';
  const hoverColor = isDark ? '#404040' : '#f5f5f5';
  
  const handleReactionClick = (emoji) => {
    // Проверяем лимит реакций
    if (userReactionsCount >= 3 && !currentReaction) {
      setError('Максимум 3 реакции на сообщение');
      return;
    }
    
    setError('');
    onReactionSelect(emoji);
    onClose();
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: bgColor,
          color: textColor,
          minWidth: 400,
          maxWidth: 600
        }
      }}
    >
      {/* Кастомная панель сверху */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 2, 
        py: 1, 
        bgcolor: bgColor, 
        borderTopLeftRadius: 8, 
        borderTopRightRadius: 8,
        borderBottom: `1px solid ${borderColor}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddReactionIcon sx={{ fontSize: 22, mr: 1, color: '#0078d4' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: textColor }}>
            Выбор реакции
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          size="small" 
          sx={{ 
            color: textColor,
            '&:hover': {
              backgroundColor: hoverColor
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        backgroundColor: bgColor,
        p: 3
      }}>
        {error && (
          <Alert severity="error" sx={{ 
            backgroundColor: 'rgba(211, 47, 47, 0.1)', 
            color: '#ff6b6b',
            border: '1px solid rgba(211, 47, 47, 0.3)'
          }}>
            {error}
          </Alert>
        )}
        
        {currentReaction && (
          <Alert severity="info" sx={{ 
            backgroundColor: 'rgba(0, 120, 212, 0.1)', 
            color: '#0078d4',
            border: '1px solid rgba(0, 120, 212, 0.3)'
          }}>
            Текущая реакция: {currentReaction}
          </Alert>
        )}
        
        <Typography variant="body2" sx={{ 
          color: textColor, 
          opacity: 0.7, 
          mb: 1,
          textAlign: 'center'
        }}>
          Выберите реакцию для сообщения
        </Typography>
        
        <Typography variant="caption" sx={{ 
          color: textColor, 
          opacity: 0.6, 
          textAlign: 'center',
          mb: 2
        }}>
          Реакций: {userReactionsCount}/3
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: 1,
          maxHeight: '400px',
          overflowY: 'auto',
          p: 1
        }}>
          {REACTIONS.map((reaction) => (
            <Tooltip 
              key={reaction.emoji} 
              title={reaction.label}
              placement="top"
            >
              <IconButton
                onClick={() => handleReactionClick(reaction.emoji)}
                disabled={userReactionsCount >= 3 && currentReaction !== reaction.emoji}
                sx={{
                  width: 50,
                  height: 50,
                  fontSize: '1.2rem',
                  borderRadius: 2,
                  bgcolor: currentReaction === reaction.emoji ? '#0078d4' : 'transparent',
                  color: currentReaction === reaction.emoji ? '#ffffff' : textColor,
                  border: currentReaction === reaction.emoji ? 'none' : `1px solid ${borderColor}`,
                  '&:hover': {
                    bgcolor: currentReaction === reaction.emoji ? '#106ebe' : hoverColor,
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease'
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    transform: 'none'
                  },
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {reaction.emoji}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        backgroundColor: bgColor,
        borderTop: `1px solid ${borderColor}`
      }}>
        <Button 
          onClick={handleClose} 
          sx={{ 
            color: textColor,
            opacity: 0.7,
            '&:hover': {
              backgroundColor: hoverColor
            }
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleClose} 
          variant="contained" 
          sx={{ 
            backgroundColor: '#0078d4',
            '&:hover': {
              backgroundColor: '#106ebe'
            },
            minWidth: '120px'
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReactionContextMenu; 
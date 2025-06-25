import React from 'react';
import { 
  Box, 
  Chip, 
  Tooltip,
  Typography
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

export default function MessageReactions({ reactions = [], currentUserId, onReactionClick }) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  
  const bgColor = isDark ? '#3b3a39' : '#f0f0f0';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#555' : '#ddd';
  const myReactionColor = '#0078d4';
  
  // Группируем реакции по эмодзи
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const emoji = reaction.emoji;
    if (!acc[emoji]) {
      acc[emoji] = {
        emoji,
        count: 0,
        users: [],
        hasMyReaction: false
      };
    }
    acc[emoji].count++;
    acc[emoji].users.push(reaction.user);
    
    // Проверяем, есть ли наша реакция
    if (reaction.user === currentUserId || reaction.userId === currentUserId) {
      acc[emoji].hasMyReaction = true;
    }
    
    return acc;
  }, {});
  
  // Сортируем по количеству реакций (по убыванию)
  const sortedReactions = Object.values(groupedReactions)
    .sort((a, b) => b.count - a.count);
  
  if (sortedReactions.length === 0) {
    return null;
  }

  const handleReactionClick = (reaction) => {
    if (onReactionClick) {
      onReactionClick(reaction.emoji, reaction.hasMyReaction);
    }
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 0.5, 
      mt: 0.5,
      alignItems: 'center'
    }}>
      {sortedReactions.map((reaction, index) => (
        <Tooltip
          key={`${reaction.emoji}-${index}`}
          title={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {reaction.emoji} {reaction.count}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {reaction.users.map(user => 
                  typeof user === 'string' ? user : user.fullName || user.username || 'Пользователь'
                ).join(', ')}
              </Typography>
              {reaction.hasMyReaction && (
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                  Нажмите, чтобы убрать
                </Typography>
              )}
            </Box>
          }
          placement="top"
        >
          <Chip
            label={`${reaction.emoji} ${reaction.count}`}
            size="small"
            onClick={() => handleReactionClick(reaction)}
            sx={{
              height: 20,
              fontSize: '0.7rem',
              bgcolor: reaction.hasMyReaction ? myReactionColor : bgColor,
              color: reaction.hasMyReaction ? '#ffffff' : textColor,
              border: reaction.hasMyReaction ? 'none' : `1px solid ${borderColor}`,
              '&:hover': {
                bgcolor: reaction.hasMyReaction ? '#106ebe' : (isDark ? '#4a4a4a' : '#e5e5e5'),
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease'
              },
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              fontWeight: reaction.hasMyReaction ? 'bold' : 'normal',
              '& .MuiChip-label': {
                px: 1,
                py: 0.25
              }
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
} 
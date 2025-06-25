import React from 'react';
import { 
  List, 
  ListItem, 
  Avatar, 
  Typography, 
  Box 
} from '@mui/material';

export default function GroupList({ groups, selectedGroup, setSelectedGroup }) {
  console.log('📋 GroupList render:', {
    groups,
    selectedGroup,
    groupsLength: groups?.length
  });

  // Функция для получения аватара группы
  const getGroupAvatar = (group) => {
    console.log('🖼️ Group avatar data:', {
      groupId: group.groupId,
      avatarUrl: group.avatarUrl,
      name: group.name
    });
    
    // Проверяем различные возможные поля для аватара
    const avatarUrl = group.avatarUrl || group.avatar || group.logo || '';
    
    if (avatarUrl && avatarUrl.trim()) {
      return avatarUrl;
    }
    
    // Возвращаем первую букву названия группы как fallback
    return null;
  };

  return (
    <List sx={{ 
      flex: 1, 
      overflowY: 'auto', 
      bgcolor: 'transparent', 
      p: 0
    }}>
      {groups.map((group) => {
        const avatarUrl = getGroupAvatar(group);
        const fallbackText = group.name?.[0]?.toUpperCase() || 'G';
        
        return (
          <ListItem 
            key={group._id || group.groupId}
            sx={{ 
              p: 2,
              cursor: 'pointer',
              backgroundColor: selectedGroup?._id === group._id || selectedGroup?.groupId === group.groupId
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
              },
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => setSelectedGroup(group)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={avatarUrl} 
                sx={{ 
                  width: 48, 
                  height: 48,
                  backgroundColor: '#0078d4',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  border: '2px solid #0078d4',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s'
                  }
                }} 
              >
                {fallbackText}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: '#ffffff', 
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  {group.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#8b949e', 
                    fontSize: '0.8rem'
                  }}
                >
                  {group.groupId} • {group.memberCount || group.members?.length || 0} участников
                </Typography>
                {group.description && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6c757d', 
                      fontSize: '0.75rem',
                      mt: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {group.description}
                  </Typography>
                )}
              </Box>
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
} 
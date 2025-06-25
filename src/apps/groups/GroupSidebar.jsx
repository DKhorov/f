import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Paper, 
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AccountCircle as BusinessCardIcon,
  Favorite as EmojiIcon,
  Group as GroupIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import GroupList from './GroupList';
import { useTheme } from '../contexts/ThemeContext';

export default function GroupSidebar({ 
  selectedGroup, 
  setSelectedGroup, 
  filteredGroups, 
  suggestedGroups, 
  onOpenJoin, 
  onOpenCreate, 
  search, 
  setSearch, 
  onRefresh, 
  onLogout,
  onlineUsers = [],
  currentUser = null,
  onClose
}) {
  const isAuth = useSelector(state => state.auth.data);
  const user = useSelector(state => state.auth.data);
  const [showVisitingCard, setShowVisitingCard] = useState(false);
  const { mode } = useTheme();

  // Определяем цвета в зависимости от темы
  const isDark = mode === 'dark';
  const bgColor = isDark ? '#202328' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';
  const borderColor = isDark ? '#23272b' : '#e0e0e0';
  const cardBgColor = isDark ? '#23272b' : '#f5f5f5';
  const inputBgColor = isDark ? '#181c20' : '#f8f9fa';
  const inputBorderColor = isDark ? '#3b3a39' : '#d0d0d0';

  const suggestedChats = [
    {
      id: 'uwu',
      groupId: '$uwu',
      name: 'UwU Chat',
      description: 'Вступи чат по нику $beta',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiE41LjRwpPvwO-2Ic8-AOqkbeHsCeevjdCg&s',
      members: 1,
      tags: ['i', 'like', 'boys'],
      features: ['Эмодзи', 'Стикеры', 'Голосовые сообщения'],
      isSpecial: true
    }
  ];

  const userVisitingCard = {
    name: user?.fullName || user?.username || 'Пользователь',
    username: user?.username || 'user',
    avatar: user?.avatarUrl || '',
    bio: user?.bio || 'Люблю общаться в группах!',
    joinDate: user?.createdAt ? new Date(user?.createdAt).toLocaleDateString() : 'Недавно',
    groups: filteredGroups?.length || 0,
    status: 'online',
    interests: user?.interests || ['Общение', 'Технологии', 'Музыка'],
    badges: ['Новичок', 'Активный участник']
  };

  const handleJoinUwu = async () => {
    try {
      console.log('Присоединение к группе $uwu');
      alert('$beta ');
    } catch (error) {
      console.error('Ошибка присоединения к группе:', error);
    }
  };

  console.log('🔍 User data in GroupSidebar:', user);
  console.log('🔍 User avatar:', user?.avatarUrl);

  return (
    <Paper 
      elevation={6} 
      sx={{
        width: { xs: '100%', sm: 340 },
        height: '100vh',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        background: bgColor,
        zIndex: 1,
        boxShadow: { xs: 'none', sm: '0 0 24px 0 rgba(0,0,0,0.25)' },
        borderRight: { xs: 'none', sm: `2px solid ${borderColor}` },
        transition: 'box-shadow 0.3s, background 0.3s',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: { xs: 'none', sm: '0 0 32px 0 rgba(0,0,0,0.35)' },
          background: isDark ? '#23272b' : '#fafafa',
        }
      }}
    >
      <Box sx={{ 
        p: { xs: 1, sm: 2 },
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 0.5, sm: 1 }
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            color: textColor, 
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
Dev Groups        </Typography>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: textColor,
            padding: { xs: 0.5, sm: 1 },
            display: { xs: 'flex', sm: 'none' },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
          }}
        >
          <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
        </IconButton>
        <IconButton 
          onClick={onRefresh}
          sx={{ 
            color: textColor,
            padding: { xs: 0.5, sm: 1 },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
          }}
        >
          <RefreshIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
        </IconButton>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onOpenJoin} 
          sx={{ 
            borderColor: 'rgba(1, 1, 1, 0)',
            color: textColor, 
            fontWeight: 'bold', 
            borderRadius: 50, 
            mr: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 12px', sm: '8px 16px' },
          
          }}
        >
          Вступить
        </Button>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: isDark ? 'rgba(1, 1, 1, 0)' : 'rgba(1, 1, 1, 0)', 
            color: isDark ? 'white' : 'black', 
            fontWeight: 'bold', 
            borderRadius: 50,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 12px', sm: '8px 16px' },
          
          }} 
          size="small" 
          onClick={onOpenCreate}
          startIcon={<AddIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
        >
          Создать
        </Button>
      </Box>

      <Box sx={{ px: { xs: 1, sm: 2 }, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Поиск группы..."
          value={search || ''}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: secondaryTextColor, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
              </InputAdornment>
            ),
            sx: { 
              background: inputBgColor, 
              color: textColor, 
              borderRadius: 1,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: inputBorderColor
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0078d4'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#0078d4'
              }
            }
          }}
        />
      </Box>
      
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <GroupList
          groups={filteredGroups || []}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
        />
      </Box>
      
      {(!filteredGroups || filteredGroups.length === 0) && (
        <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: secondaryTextColor }}>
            {search ? 'Группы не найдены' : 'Группы не загружены'}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ px: 2, py: 1, bgcolor: cardBgColor, borderTop: `1px solid ${borderColor}` }}>
        <Typography variant="subtitle2" sx={{ color: secondaryTextColor, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiIcon sx={{ fontSize: 16 }} />
          Предлагаемые чаты
        </Typography>
        <List dense>
          {suggestedChats.map((chat) => (
            <Card 
              key={chat.id}
              sx={{
                mb: 1, 
                background: 'linear-gradient(135deg,rgb(60, 60, 60) 0%,rgb(20, 20, 20) 100%)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255, 105, 180, 0.3)'
                }
              }}
              onClick={handleJoinUwu}
            >
              <CardContent sx={{ p: 2, pb: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Avatar 
                    src={chat.avatar} 
                    sx={{ 
                      width: 40, 
                      height: 40,
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                      AtomBeta
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small"
                    sx={{ 
                      color: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontSize: '0.8rem' }}>
                  {chat.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {chat.tags.map((tag, index) => (
                    <Chip 
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        height: 20
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      </Box>

      {isAuth && user && (
        <Box sx={{ 
          mt: 'auto', 
          p: 2, 
          bgcolor: cardBgColor, 
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar 
            src={user?.avatarUrl || ''} 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: '#0078d4',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: '2px solid #0078d4',
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s'
              }
            }}
            onClick={() => setShowVisitingCard(true)}
          >
            {(user?.fullName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ color: textColor, fontSize: '0.875rem', fontWeight: 600 }}>
              {user?.fullName || user?.username || 'Пользователь'}
            </Typography>
            <Typography variant="caption" sx={{ color: secondaryTextColor, fontSize: '0.75rem' }}>
              @{user?.username || 'user'}
            </Typography>
          </Box>
          <IconButton 
            onClick={onLogout}
            sx={{ 
              color: secondaryTextColor,
              '&:hover': {
                color: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)'
              }
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      )}

      <Dialog 
        open={showVisitingCard} 
        onClose={() => setShowVisitingCard(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: bgColor,
            color: textColor,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <BusinessCardIcon sx={{ color: '#0078d4' }} />
          Визитка пользователя
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar 
              src={userVisitingCard.avatar} 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#0078d4',
                border: '3px solid #0078d4'
              }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ color: textColor, fontWeight: 600, mb: 0.5 }}>
                {userVisitingCard.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#0078d4', fontWeight: 500, mb: 1 }}>
                @{userVisitingCard.username}
              </Typography>
              <Chip 
                label={userVisitingCard.status === 'online' ? '🟢 Онлайн' : '🔴 Офлайн'}
                size="small"
                sx={{ 
                  backgroundColor: userVisitingCard.status === 'online' ? '#4caf50' : '#f44336',
                  color: '#fff',
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>

          <Typography variant="body1" sx={{ color: secondaryTextColor, mb: 3, fontStyle: 'italic' }}>
            "{userVisitingCard.bio}"
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: secondaryTextColor, mb: 1 }}>
                Дата регистрации
              </Typography>
              <Typography variant="body2" sx={{ color: textColor }}>
                {userVisitingCard.joinDate}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: secondaryTextColor, mb: 1 }}>
                Групп
              </Typography>
              <Typography variant="body2" sx={{ color: textColor }}>
                {userVisitingCard.groups}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: secondaryTextColor, mb: 1 }}>
              Интересы
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {userVisitingCard.interests.map((interest, index) => (
                <Chip 
                  key={index}
                  label={interest}
                  size="small"
                  sx={{ 
                    backgroundColor: '#0078d4',
                    color: '#fff'
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: secondaryTextColor, mb: 1 }}>
              Значки
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {userVisitingCard.badges.map((badge, index) => (
                <Chip 
                  key={index}
                  label={badge}
                  size="small"
                  sx={{ 
                    backgroundColor: '#ff9800',
                    color: '#fff'
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${borderColor}` }}>
          <Button 
            onClick={() => setShowVisitingCard(false)}
            sx={{ 
              color: secondaryTextColor,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 
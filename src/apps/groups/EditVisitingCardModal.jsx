import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Typography,
  Avatar,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Close as CloseIcon,
  Add as AddIcon,
  AccountCircle as BusinessCardIcon
} from '@mui/icons-material';

export default function EditVisitingCardModal({ open, onClose, user, onSave }) {
  const [formData, setFormData] = useState({
    bio: user?.bio || 'Люблю общаться в группах!',
    interests: user?.interests || ['Общение', 'Технологии', 'Музыка'],
    newInterest: '',
    avatarUrl: user?.avatarUrl || ''
  });

  const handleAddInterest = () => {
    if (formData.newInterest.trim() && !formData.interests.includes(formData.newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, prev.newInterest.trim()],
        newInterest: ''
      }));
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleSave = () => {
    onSave({
      bio: formData.bio,
      interests: formData.interests,
      avatarUrl: formData.avatarUrl
    });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#23272b',
          color: '#fff',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #3b3a39',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BusinessCardIcon sx={{ color: '#0078d4' }} />
          <Typography variant="h6">Редактировать визитку</Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: '#888',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar 
              src={formData.avatarUrl} 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: '#0078d4',
                border: '3px solid #0078d4',
                mx: 'auto',
                mb: 2
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Аватар
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <TextField
              label="URL аватара"
              fullWidth
              value={formData.avatarUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#3b3a39'
                  },
                  '&:hover fieldset': {
                    borderColor: '#0078d4'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0078d4'
                  }
                },
                '& .MuiInputBase-input': {
                  color: '#fff'
                },
                '& .MuiInputLabel-root': {
                  color: '#888'
                }
              }}
            />
          </Box>
        </Box>

        <TextField
          label="О себе"
          fullWidth
          multiline
          rows={3}
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Расскажите о себе..."
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#3b3a39'
              },
              '&:hover fieldset': {
                borderColor: '#0078d4'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0078d4'
              }
            },
            '& .MuiInputBase-input': {
              color: '#fff'
            },
            '& .MuiInputLabel-root': {
              color: '#888'
            }
          }}
        />

        <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2 }}>
          Интересы
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {formData.interests.map((interest, index) => (
            <Chip 
              key={index}
              label={interest}
              onDelete={() => handleRemoveInterest(interest)}
              sx={{ 
                backgroundColor: '#0078d4',
                color: '#fff',
                '& .MuiChip-deleteIcon': {
                  color: '#fff',
                  '&:hover': {
                    color: '#ff6b6b'
                  }
                }
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            label="Добавить интерес"
            value={formData.newInterest}
            onChange={(e) => setFormData(prev => ({ ...prev, newInterest: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#3b3a39'
                },
                '&:hover fieldset': {
                  borderColor: '#0078d4'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0078d4'
                }
              },
              '& .MuiInputBase-input': {
                color: '#fff'
              },
              '& .MuiInputLabel-root': {
                color: '#888'
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleAddInterest}
            disabled={!formData.newInterest.trim()}
            sx={{ 
              backgroundColor: '#0078d4',
              '&:hover': {
                backgroundColor: '#106ebe'
              },
              '&:disabled': {
                backgroundColor: '#3b3a39',
                color: '#666'
              }
            }}
          >
            <AddIcon />
          </Button>
        </Box>

        <Box sx={{ 
          p: 2, 
          backgroundColor: 'rgba(0, 120, 212, 0.1)', 
          borderRadius: 2,
          border: '1px solid rgba(0, 120, 212, 0.3)'
        }}>
          <Typography variant="body2" sx={{ color: '#0078d4' }}>
            💡 Совет: Добавьте свои интересы, чтобы другие пользователи могли найти вас и начать общение!
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #3b3a39' }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: '#888',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          Отмена
        </Button>
        <Button 
          variant="contained"
          onClick={handleSave}
          sx={{ 
            backgroundColor: '#0078d4',
            '&:hover': {
              backgroundColor: '#106ebe'
            }
          }}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
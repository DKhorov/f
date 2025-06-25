import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import { 
  Code as CodeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';

export default function GroupCreateModal({ open, onClose, createData, setCreateData, createError, onCreate, isLoading = false }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Проверяем, что createData существует
  const data = createData || { name: '', logo: '', desc: '', nick: '' };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullScreen={isFullScreen}
      PaperProps={{
        sx: {
          backgroundColor: '#23272b',
          color: '#fff'
        }
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* Кастомная панель сверху */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 2, 
        py: 1, 
        bgcolor: '#23272b', 
        borderTopLeftRadius: 8, 
        borderTopRightRadius: 8 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon sx={{ fontSize: 22, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
            Создание новой группы
          </Typography>
        </Box>
        <Box>
          <IconButton 
            onClick={() => setIsFullScreen(f => !f)} 
            size="small" 
            sx={{ 
              color: '#fff', 
              mr: 1,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            {isFullScreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
          </IconButton>
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        minWidth: isFullScreen ? undefined : 500,
        backgroundColor: '#23272b'
      }}>
        {createError && (
          <Alert severity="error" sx={{ backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#ff6b6b' }}>
            {createError}
          </Alert>
        )}
        
        <TextField
          label="Название группы *"
          value={data.name || ''}
          onChange={e => setCreateData({ ...data, name: e.target.value })}
          required
          sx={{ 
            mb: 0.5, 
            borderRadius: 1, 
            mt: 0.5,
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
            },
            '& .MuiFormHelperText-root': {
              color: createError ? '#d13438' : '#888'
            }
          }}
          InputLabelProps={{ shrink: true }}
        />
        
        <TextField
          label="ID группы (начинается с $) *"
          value={data.nick || ''}
          onChange={e => setCreateData({ ...data, nick: e.target.value })}
          required
          error={!!data.nick && !data.nick.startsWith('$')}
          helperText={data.nick && !data.nick.startsWith('$') ? 'ID должен начинаться с $' : ''}
          sx={{ 
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: data.nick && !data.nick.startsWith('$') ? '#d13438' : '#3b3a39'
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
            },
            '& .MuiFormHelperText-root': {
              color: data.nick && !data.nick.startsWith('$') ? '#d13438' : '#888'
            }
          }}
          InputLabelProps={{ shrink: true }}
        />
        
        <TextField
          label="Описание группы"
          value={data.desc || ''}
          onChange={e => setCreateData({ ...data, desc: e.target.value })}
          multiline 
          rows={2}
          sx={{ 
            mb: 0.2, 
            borderRadius: 1,
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
          InputLabelProps={{ shrink: true }}
        />
        
        <TextField
          label="URL аватара группы"
          value={data.logo || ''}
          onChange={e => setCreateData({ ...data, logo: e.target.value })}
          placeholder="https://example.com/avatar.jpg"
          sx={{ 
            mb: 0.2, 
            borderRadius: 1,
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
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        pb: 3, 
        backgroundColor: '#23272b',
        borderTop: '1px solid #3b3a39'
      }}>
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
          onClick={onCreate} 
          variant="contained" 
          disabled={!data.name || !data.nick || !data.nick.startsWith('$') || isLoading}
          sx={{ 
            backgroundColor: '#0078d4',
            '&:hover': {
              backgroundColor: '#106ebe'
            },
            '&:disabled': {
              backgroundColor: '#3b3a39',
              color: '#666'
            },
            minWidth: '160px'
          }}
        >
          {isLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Создание...
            </div>
          ) : (
            'Создать группу'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
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
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon
} from '@mui/icons-material';

export default function GroupJoinModal({ open, onClose, joinName, setJoinName, joinError, onJoin, isLoading = false }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
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
            Присоединиться к группе
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
            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
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
        {joinError && (
          <Alert severity="error" sx={{ backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#ff6b6b' }}>
            {joinError}
          </Alert>
        )}
        
        <TextField
          autoFocus
          label="ID группы *"
          fullWidth
          value={joinName || ''}
          onChange={(e) => setJoinName(e.target.value)}
          required
          error={!!joinName && !joinName.startsWith('$')}
          helperText={joinName && !joinName.startsWith('$') ? 'ID должен начинаться с $' : 'Введите ID группы (например: $mygroup)'}
          sx={{ 
            mb: 0.5, 
            borderRadius: 1, 
            mt: 0.5,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: joinName && !joinName.startsWith('$') ? '#d13438' : '#3b3a39'
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
              color: joinName && !joinName.startsWith('$') ? '#d13438' : '#888'
            }
          }}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      
      <DialogActions sx={{ backgroundColor: '#23272b', p: 2 }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={onJoin} 
          variant="contained" 
          disabled={!joinName || !joinName.startsWith('$') || isLoading}
          sx={{ 
            backgroundColor: '#0078d4', 
            color: '#fff', 
            fontWeight: 'bold', 
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#106ebe'
            },
            '&:disabled': {
              backgroundColor: '#3b3a39',
              color: '#666'
            },
            minWidth: '140px'
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
              Присоединение...
            </div>
          ) : (
            'Присоединиться'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
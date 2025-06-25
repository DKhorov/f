import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../contexts/ThemeContext';

const EditMessageModal = ({ 
  open, 
  onClose, 
  message, 
  onSave, 
  isLoading = false 
}) => {
  const { mode } = useTheme();
  const [text, setText] = useState(message?.content || '');
  const [error, setError] = useState('');
  
  const isDark = mode === 'dark';
  const bgColor = isDark ? '#23272b' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const borderColor = isDark ? '#3b3a39' : '#e0e0e0';
  const hoverColor = isDark ? '#404040' : '#f5f5f5';
  
  const handleSave = () => {
    console.log('💾 EditMessageModal handleSave вызвана');
    console.log('💾 Текущий текст:', text);
    console.log('💾 onSave функция:', onSave);
    
    if (!text.trim()) {
      setError('Сообщение не может быть пустым');
      return;
    }
    
    if (text.length > 2000) {
      setError('Сообщение не может превышать 2000 символов');
      return;
    }
    
    setError('');
    console.log('💾 Вызываем onSave с текстом:', text.trim());
    onSave(text.trim());
  };

  const handleClose = () => {
    setError('');
    setText(message?.content || '');
    onClose();
  };

  // Обновляем текст при изменении сообщения
  useEffect(() => {
    if (message?.content) {
      setText(message.content);
    }
  }, [message?.content]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: bgColor,
          color: textColor,
          minWidth: 500,
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
          <EditIcon sx={{ fontSize: 22, mr: 1, color: '#0078d4' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: textColor }}>
            Редактирование сообщения
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
        
        <Typography variant="body2" sx={{ 
          color: textColor, 
          opacity: 0.7, 
          mb: 1
        }}>
          Отредактируйте текст сообщения:
        </Typography>
        
        <TextField
          label="Текст сообщения"
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          rows={4}
          fullWidth
          error={!!error}
          helperText={`${text.length}/2000 символов`}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: error ? '#ff6b6b' : borderColor
              },
              '&:hover fieldset': {
                borderColor: '#0078d4'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0078d4'
              }
            },
            '& .MuiInputBase-input': {
              color: textColor
            },
            '& .MuiInputLabel-root': {
              color: '#888'
            },
            '& .MuiFormHelperText-root': {
              color: error ? '#ff6b6b' : '#888'
            }
          }}
          InputLabelProps={{ shrink: true }}
        />
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
          onClick={handleSave} 
          variant="contained" 
          disabled={!text.trim() || text === message?.content || isLoading}
          sx={{ 
            backgroundColor: '#0078d4',
            '&:hover': {
              backgroundColor: '#106ebe'
            },
            '&:disabled': {
              backgroundColor: '#3b3a39',
              color: '#666'
            },
            minWidth: '120px'
          }}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMessageModal; 
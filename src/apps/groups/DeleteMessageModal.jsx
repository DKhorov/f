import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const DeleteMessageModal = ({ 
  open, 
  onClose, 
  message, 
  onConfirm, 
  isLoading = false 
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: '#23272b',
          color: '#ffffff',
          minWidth: 400,
          maxWidth: 500
        }
      }}
    >
      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        backgroundColor: '#23272b',
        p: 3
      }}>
        <Typography variant="h6" sx={{ color: '#ffffff' }}>
          Удаление сообщения
        </Typography>
        
        <Typography variant="body1" sx={{ color: '#ffffff' }}>
          Вы уверены, что хотите удалить это сообщение?
        </Typography>
        
        <Box sx={{
          p: 2,
          bgcolor: '#2d2d2d',
          borderRadius: 1
        }}>
          <Typography variant="body2" sx={{ color: '#ffffff' }}>
            {message?.content ? `"${message.content}"` : 'Сообщение'}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, backgroundColor: '#23272b' }}>
        <Button onClick={onClose} sx={{ color: '#ffffff' }}>
          Отмена
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={isLoading}
          sx={{ 
            backgroundColor: '#ff6b6b',
            '&:hover': { backgroundColor: '#e55a5a' },
            '&:disabled': { backgroundColor: '#3b3a39', color: '#666' }
          }}
        >
          {isLoading ? 'Удаление...' : 'Удалить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMessageModal; 
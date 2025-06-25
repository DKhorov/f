import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#23272b',
          color: '#fff'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #3b3a39'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          <Typography variant="h6">Аутентификация</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3, backgroundColor: 'rgba(3, 169, 244, 0.1)', color: '#03a9f4' }}>
          Для работы с группами необходимо войти в систему
        </Alert>

        <Typography variant="body1" sx={{ mb: 3, color: '#ccc' }}>
          Выберите действие для продолжения работы с группами
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            sx={{
              backgroundColor: '#0078d4',
              '&:hover': {
                backgroundColor: '#106ebe'
              },
              py: 1.5
            }}
          >
            Войти в систему
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={handleRegister}
            sx={{
              borderColor: '#0078d4',
              color: '#0078d4',
              '&:hover': {
                borderColor: '#106ebe',
                backgroundColor: 'rgba(0, 120, 212, 0.1)'
              },
              py: 1.5
            }}
          >
            Создать аккаунт
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #3b3a39' }}>
        <Button onClick={handleClose} sx={{ color: '#888' }}>
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
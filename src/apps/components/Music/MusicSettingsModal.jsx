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
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { 
  MusicNote as MusicIcon,
  Close as CloseIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';

export default function MusicSettingsModal({ 
  open, 
  onClose, 
  settings, 
  onSettingsChange, 
  onSave,
  debugInfo,
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onReloadAudio
}) {
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
          <MusicIcon sx={{ fontSize: 22, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
            Настройки Музыки
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
        minWidth: isFullScreen ? undefined : 600,
        backgroundColor: '#23272b'
      }}>
        {/* Основные настройки */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontSize: '16px' }}>
            Основные настройки
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoNext}
                onChange={(e) => onSettingsChange({ ...settings, autoNext: e.target.checked })}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#0078d4',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 120, 212, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#0078d4',
                  },
                }}
              />
            }
            label="Авто-следующий трек"
            sx={{ color: '#fff', mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.shuffle}
                onChange={(e) => onSettingsChange({ ...settings, shuffle: e.target.checked })}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#0078d4',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 120, 212, 0.08)',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#0078d4',
                  },
                }}
              />
            }
            label="Перемешать треки"
            sx={{ color: '#fff' }}
          />
        </Box>

        <Divider sx={{ backgroundColor: '#3b3a39', my: 2 }} />

        {/* Отладочная информация */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontSize: '16px' }}>
            Отладка аудио
          </Typography>
          
          <Box sx={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: 2, 
            borderRadius: 1,
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Трек: {debugInfo?.currentTrack || 'Нет'}</div>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Воспроизводится: {debugInfo?.isPlaying ? 'Да' : 'Нет'}</div>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Длительность: {debugInfo?.audioDuration || 'Неизвестно'}</div>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Текущее время: {debugInfo?.audioCurrentTime || 'Неизвестно'}</div>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Готовность: {debugInfo?.audioReadyState || 'Неизвестно'}</div>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Состояние сети: {debugInfo?.audioNetworkState || 'Неизвестно'}</div>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Dolby Atmos: only ON</div>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Провайдер: DK Studio Host</div>
            <div style={{ color: '#ccc', marginBottom: '8px' }}>Сервер: AtomGlide API 5.0</div>
            <div style={{ color: '#ccc' }}>Состояние Сервера: Normal</div>
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: '#3b3a39', my: 2 }} />

        {/* Управление воспроизведением */}
        {currentTrack && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontSize: '16px' }}>
              Управление воспроизведением
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onReloadAudio}
                sx={{ 
                  fontSize: '12px',
                  borderColor: '#3b3a39',
                  color: '#fff',
                  '&:hover': {
                    borderColor: '#0078d4',
                    backgroundColor: 'rgba(0, 120, 212, 0.1)'
                  }
                }}
              >
                Перезагрузить аудио
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onPlayPause}
                sx={{ 
                  fontSize: '12px',
                  borderColor: '#3b3a39',
                  color: '#fff',
                  '&:hover': {
                    borderColor: '#0078d4',
                    backgroundColor: 'rgba(0, 120, 212, 0.1)'
                  }
                }}
              >
                {isPlaying ? 'Пауза' : 'Играть'}
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={onPrevious}
                sx={{ 
                  fontSize: '12px',
                  borderColor: '#3b3a39',
                  color: '#fff',
                  '&:hover': {
                    borderColor: '#0078d4',
                    backgroundColor: 'rgba(0, 120, 212, 0.1)'
                  }
                }}
              >
                Предыдущий
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={onNext}
                sx={{ 
                  fontSize: '12px',
                  borderColor: '#3b3a39',
                  color: '#fff',
                  '&:hover': {
                    borderColor: '#0078d4',
                    backgroundColor: 'rgba(0, 120, 212, 0.1)'
                  }
                }}
              >
                Следующий
              </Button>
            </Box>
          </Box>
        )}
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
          onClick={onSave} 
          variant="contained" 
          sx={{ 
            backgroundColor: '#0078d4',
            '&:hover': {
              backgroundColor: '#106ebe'
            }
          }}
        >
          Сохранить настройки
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
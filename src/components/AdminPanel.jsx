import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Person as PersonIcon,
  Article as ArticleIcon,
  OnlinePrediction as OnlineIcon,
  Refresh as RefreshIcon,
  Stop as StopIcon,
  PlayArrow as StartIcon,
  Notifications as NotificationsIcon,
  Telegram as TelegramIcon
} from '@mui/icons-material';

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    users: 1250,
    posts: 3420,
    online: 89
  });
  const [serverStatus, setServerStatus] = useState('running');
  const [isUpdating, setIsUpdating] = useState(false);
  const [tgBotEnabled, setTgBotEnabled] = useState(true);
  const [command, setCommand] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Неверный логин или пароль!');
    }
  };

  const handleServerAction = (action) => {
    if (action === 'restart') {
      setServerStatus('restarting');
      setTimeout(() => setServerStatus('running'), 3000);
    } else if (action === 'stop') {
      setServerStatus('stopped');
    } else if (action === 'start') {
      setServerStatus('running');
    }
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 5000);
  };

  const handleCommand = () => {
    if (command.trim()) {
      alert(`Выполняется команда: ${command}`);
      setCommand('');
    }
  };

  if (!isLoggedIn) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Paper sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <Typography variant="h4" sx={{ 
            textAlign: 'center', 
            mb: 3, 
            color: '#1e3c72',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🔐 АДМИН ПАНЕЛЬ
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            variant="outlined"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(45deg, #2a5298 0%, #1e3c72 100%)'
              }
            }}
          >
            ВОЙТИ
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 2
    }}>
      <Paper sx={{
        maxWidth: 1200,
        mx: 'auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            🛠️ АДМИНИСТРАТОРСКАЯ ПАНЕЛЬ
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
            Система управления сервером
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Статистика */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1e3c72' }}>
            📊 СТАТИСТИКА СИСТЕМЫ
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #4CAF50 0%, #45a049 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.users.toLocaleString()}
                  </Typography>
                  <Typography variant="h6">Пользователей</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #2196F3 0%, #1976D2 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ArticleIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.posts.toLocaleString()}
                  </Typography>
                  <Typography variant="h6">Постов</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(45deg, #FF9800 0%, #F57C00 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <OnlineIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.online}
                  </Typography>
                  <Typography variant="h6">Онлайн сейчас</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Командная строка */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1e3c72' }}>
            💻 КОМАНДНАЯ СТРОКА
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Введите команду"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              sx={{ mb: 2 }}
              variant="outlined"
              onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
            />
            <Button
              variant="contained"
              onClick={handleCommand}
              sx={{
                background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2a5298 0%, #1e3c72 100%)'
                }
              }}
            >
              ВЫПОЛНИТЬ
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Управление сервером */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1e3c72' }}>
            🖥️ УПРАВЛЕНИЕ СЕРВЕРОМ
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => handleServerAction('restart')}
                sx={{
                  background: 'linear-gradient(45deg, #FF9800 0%, #F57C00 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #F57C00 0%, #FF9800 100%)'
                  }
                }}
              >
                ПЕРЕЗАГРУЗКА
              </Button>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<StopIcon />}
                onClick={() => handleServerAction('stop')}
                sx={{
                  background: 'linear-gradient(45deg, #f44336 0%, #d32f2f 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #d32f2f 0%, #f44336 100%)'
                  }
                }}
              >
                ОСТАНОВИТЬ
              </Button>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<StartIcon />}
                onClick={() => handleServerAction('start')}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50 0%, #45a049 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #45a049 0%, #4CAF50 100%)'
                  }
                }}
              >
                ЗАПУСТИТЬ
              </Button>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<NotificationsIcon />}
                onClick={handleUpdate}
                disabled={isUpdating}
                sx={{
                  background: 'linear-gradient(45deg, #9C27B0 0%, #7B1FA2 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7B1FA2 0%, #9C27B0 100%)'
                  }
                }}
              >
                {isUpdating ? 'ОБНОВЛЕНИЕ...' : 'ОБНОВИТЬ'}
              </Button>
            </Grid>
          </Grid>

          {/* Статус сервера */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              Статус сервера:
            </Typography>
            <Alert 
              severity={
                serverStatus === 'running' ? 'success' : 
                serverStatus === 'restarting' ? 'warning' : 'error'
              }
              sx={{ fontWeight: 'bold' }}
            >
              {serverStatus === 'running' && '🟢 Сервер работает'}
              {serverStatus === 'restarting' && '🟡 Сервер перезагружается...'}
              {serverStatus === 'stopped' && '🔴 Сервер остановлен'}
            </Alert>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Настройки */}
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1e3c72' }}>
            ⚙️ НАСТРОЙКИ
          </Typography>
          
          <List sx={{ background: '#f5f5f5', borderRadius: 1 }}>
            <ListItem>
              <ListItemText 
                primary="Telegram Bot" 
                secondary="Управление Telegram ботом"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={tgBotEnabled}
                    onChange={(e) => setTgBotEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4CAF50',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4CAF50',
                      },
                    }}
                  />
                }
                label={tgBotEnabled ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}
              />
            </ListItem>
          </List>

          {/* Кнопка выхода */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setIsLoggedIn(false)}
              sx={{
                borderColor: '#1e3c72',
                color: '#1e3c72',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#2a5298',
                  backgroundColor: 'rgba(30, 60, 114, 0.1)'
                }
              }}
            >
              ВЫЙТИ ИЗ АДМИН ПАНЕЛИ
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminPanel; 
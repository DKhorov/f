import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogActions, Box, IconButton, Button, Switch, Typography, Stack, Tabs, Tab, Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { MdFullscreen, MdClose, MdFullscreenExit, MdRefresh } from 'react-icons/md';
import { FiSettings, FiMonitor, FiTerminal, FiInfo, FiUser, FiBookmark, FiCreditCard } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/getme';
import { useNavigate } from 'react-router-dom';
import WalletModal from '../apps/wallet/wallet';
import FavoritesPage from '../apps/favorites/FavoritesPage';
import useSettings from '../apps/hooks/useSettings';

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 40,
  height: 20,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: 'rgb(255, 255, 255)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgb(23, 125, 220)' : 'rgb(24, 144, 255)',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgba(0, 35, 11, 0.2)',
    width: 16,
    height: 16,
    borderRadius: 8,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 20 / 2,
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.35)'
      : 'rgba(0, 0, 0, 0.25)',
    boxSizing: 'border-box',
  },
}));

const SettingsModal = ({ isOpen, onClose, onRoundedChange }) => {
  const theme = useTheme();
  const { mode, onToggleMode } = useSettings();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dnd, setDnd] = useState(false);
  const [roundedSidebar, setRoundedSidebar] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  
  // Новые состояния для модальных окон
  const [walletOpen, setWalletOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  
  // Отладочные панели
  const [debugTab, setDebugTab] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [systemInfo, setSystemInfo] = useState({});
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [quick3D, setQuick3D] = useState(false);
  const [rgbColor, setRgbColor] = useState('rgb(255,0,0)');
  const [fps, setFps] = useState(0);
  const [netSpeed, setNetSpeed] = useState(null);
  const rgbRef = useRef();
  const lastFrame = useRef(performance.now());
  const frameCount = useRef(0);
  
  // Состояние для вкладок настроек
  const [settingsTab, setSettingsTab] = useState(0);

  useEffect(() => {
    setDarkMode(localStorage.getItem('theme') === 'dark');
    setFullscreen(localStorage.getItem('fullscreen') === 'true');
    setShowAvatar(localStorage.getItem('showAvatar') !== 'false');
    setNotifications(localStorage.getItem('notifications') !== 'false');
    setDnd(localStorage.getItem('dnd') === 'true');
    setRoundedSidebar(localStorage.getItem('roundedSidebar') === 'true');
    setIsDebugMode(localStorage.getItem('debugMode') === 'true');
  }, [isOpen]);

  // RGB тестер
  useEffect(() => {
    let running = true;
    let t = 0;
    function animate() {
      if (!running) return;
      t += 0.02;
      const r = Math.floor(127 * (1 + Math.sin(t)));
      const g = Math.floor(127 * (1 + Math.sin(t + 2)));
      const b = Math.floor(127 * (1 + Math.sin(t + 4)));
      setRgbColor(`rgb(${r},${g},${b})`);
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, []);

  // FPS тестер
  useEffect(() => {
    let running = true;
    function loop(now) {
      if (!running) return;
      frameCount.current++;
      if (now - lastFrame.current > 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastFrame.current = now;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return () => { running = false; };
  }, []);

  // Speed test
  const runSpeedTest = async () => {
    const start = performance.now();
    try {
      await fetch('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png', { cache: 'no-store' });
      const ms = Math.round(performance.now() - start);
      setNetSpeed(ms);
    } catch {
      setNetSpeed('Ошибка');
    }
  };

  // Исправленный обработчик темы
  const handleThemeSwitch = (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    setDarkMode(e.target.checked);
    localStorage.setItem('theme', newTheme);
    
    // Отправляем событие для обновления темы без перезагрузки
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: newTheme } 
    }));
    
    // Показываем уведомление
    if (window.showNotification) {
      window.showNotification({
        title: 'Тема изменена',
        message: `Переключено на ${newTheme === 'dark' ? 'тёмную' : 'светлую'} тему`,
        type: 'info'
      });
    }
  };

  const handleSwitch = (setter, key, value, callback) => {
    setter(value);
    localStorage.setItem(key, value);
    if (callback) callback(value);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; Max-Age=0; path=/;';
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.clear();
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    window.location.reload();
  };

  // Функции для отладочных панелей
  const addConsoleLog = (message, type = 'log') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      timestamp,
      message,
      type
    };
    setConsoleLogs(prev => [...prev.slice(-99), newLog]); // Храним только последние 100 логов
  };

  const clearConsoleLogs = () => {
    setConsoleLogs([]);
  };

  const getSystemInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Неизвестно',
      cores: navigator.hardwareConcurrency || 'Неизвестно',
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: `${navigator.connection.downlink} Mbps`,
        rtt: `${navigator.connection.rtt} ms`
      } : 'Неизвестно',
      webGL: (() => {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          return gl ? gl.getParameter(gl.VENDOR) + ' ' + gl.getParameter(gl.RENDERER) : 'Не поддерживается';
        } catch (e) {
          return 'Не поддерживается';
        }
      })(),
      localStorage: localStorage.length,
      sessionStorage: sessionStorage.length,
      cookies: document.cookie.split(';').length,
      url: window.location.href,
      referrer: document.referrer || 'Нет',
      loadTime: performance.timing ? 
        `${performance.timing.loadEventEnd - performance.timing.navigationStart}ms` : 
        'Неизвестно'
    };
    setSystemInfo(info);
    return info;
  };

  const refreshSystemInfo = () => {
    getSystemInfo();
    addConsoleLog('Системная информация обновлена', 'info');
  };

  // Перехват консольных сообщений
  useEffect(() => {
    if (!isDebugMode) return;

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      originalLog.apply(console, args);
      addConsoleLog(args.join(' '), 'log');
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addConsoleLog(args.join(' '), 'error');
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addConsoleLog(args.join(' '), 'warn');
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      addConsoleLog(args.join(' '), 'info');
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, [isDebugMode]);

  // Получаем системную информацию при открытии
  useEffect(() => {
    if (isOpen && isDebugMode) {
      getSystemInfo();
      addConsoleLog('Отладочная панель открыта', 'info');
    }
  }, [isOpen, isDebugMode]);

  // Информация о сайте
  const siteInfo = {
    name: 'AtomGlide 8 Beta 1',
    version: '7.9.0',
    build: 'Сделай заствку прост 2005.12.19',
    description: 'Современная социальная платформа для создания и обмена контентом',
    features: [
      'Создание и публикация постов',
      'Музыкальный плеер',
      'Кошелек и транзакции',
      'Группы и чаты',
      'Избранное и закладки',
      'Настройки и персонализация',
      'Темная и светлая темы',
      'Адаптивный дизайн',
      'Push-уведомления',
      'Spotlight поиск'
    ],
    tech: {
      frontend: 'React 18, Material-UI, Webpack',
      backend: 'Node.js, Express',
      database: 'MongoDB',
      realtime: 'Socket.io',
      storage: 'AWS S3',
      auth: 'JWT'
    },
    api: {
      version: 'v2.1',
      baseUrl: 'https://api.atomglidedev.ru',
      endpoints: [
        '/api/posts',
        '/api/users',
        '/api/groups',
        '/api/music',
        '/api/wallet',
        '/api/favorites'
      ]
    },
    team: [
      { name: 'Разработка', role: 'Frontend & Backend' },
      { name: 'Дизайн', role: 'UI/UX Design' },
      { name: 'Тестирование', role: 'QA & Testing' }
    ],
    contact: {
      email: 'support@atomglidedev.ru',
      website: 'https://atomglidedev.ru',
      github: 'https://github.com/atomglide',
      discord: 'https://discord.gg/atomglide'
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      fullScreen={isFullScreen}
      PaperProps={{
        sx: {
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'all 0.3s ease'
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
        background: theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.05)' 
          : 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(10px)',
        borderTopLeftRadius: 8, 
        borderTopRightRadius: 8,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
        transition: 'all 0.3s ease'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FiSettings style={{ fontSize: 22, marginRight: 8, verticalAlign: 'middle', color: theme.palette.mode === 'dark' ? '#fff' : '#222' }} />
          <span style={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? '#fff' : '#222', fontSize: 18 }}>Настройки</span>
        </Box>
        <Box>
          <IconButton onClick={() => setIsFullScreen(f => !f)} size="small" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#222', mr: 1 }}>
            {isFullScreen ? <MdFullscreenExit /> : <MdFullscreen />}
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#222' }}>
            <MdClose />
          </IconButton>
        </Box>
      </Box>
      
      <DialogContent sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
        transition: 'all 0.3s ease'
      }}>
        {/* Вкладки настроек */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={settingsTab} 
            onChange={(e, newValue) => setSettingsTab(newValue)}
            sx={{ 
              '& .MuiTab-root': {
                color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a',
                fontWeight: 500
              }
            }}
          >
            <Tab 
              label="Основные" 
              icon={<FiSettings />} 
              iconPosition="start"
            />
            <Tab 
              label="Профиль" 
              icon={<FiUser />} 
              iconPosition="start"
            />
            <Tab 
              label="О сайте" 
              icon={<FiInfo />} 
              iconPosition="start"
            />
            {isDebugMode && (
              <Tab 
                label="Отладка" 
                icon={<FiTerminal />} 
                iconPosition="start"
              />
            )}
          </Tabs>
        </Box>

        {/* Основные настройки */}
        {settingsTab === 0 && (
          <>
            {/* Секция внешнего вида */}
            <Box sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                Внешний вид
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Тёмная тема
                  </Typography>
                  <AntSwitch 
                    checked={darkMode} 
                    onChange={handleThemeSwitch} 
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Полноэкранный режим
                  </Typography>
                  <AntSwitch 
                    checked={fullscreen} 
                    onChange={(e) => handleSwitch(setFullscreen, 'fullscreen', e.target.checked)} 
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Показывать аватар
                  </Typography>
                  <AntSwitch 
                    checked={showAvatar} 
                    onChange={(e) => handleSwitch(setShowAvatar, 'showAvatar', e.target.checked)} 
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Скруглённая боковая панель
                  </Typography>
                  <AntSwitch 
                    checked={roundedSidebar} 
                    onChange={(e) => {
                      handleSwitch(setRoundedSidebar, 'roundedSidebar', e.target.checked);
                      if (onRoundedChange) onRoundedChange(e.target.checked);
                    }} 
                  />
                </Box>
              </Stack>
            </Box>

            {/* Секция уведомлений */}
            <Box sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '16px',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                Уведомления
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Push-уведомления
                  </Typography>
                  <AntSwitch 
                    checked={notifications} 
                    onChange={(e) => handleSwitch(setNotifications, 'notifications', e.target.checked)} 
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Режим "Не беспокоить"
                  </Typography>
                  <AntSwitch 
                    checked={dnd} 
                    onChange={(e) => handleSwitch(setDnd, 'dnd', e.target.checked)} 
                  />
                </Box>
              </Stack>
            </Box>

            {/* Секция отладки */}
            <Box sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '16px',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                Отладка
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Режим отладки
                  </Typography>
                  <AntSwitch 
                    checked={isDebugMode} 
                    onChange={(e) => handleSwitch(setIsDebugMode, 'debugMode', e.target.checked)} 
                  />
                </Box>
              </Stack>
            </Box>

            {/* Секция действий */}
            <Box sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '16px',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                Действия
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => setConfirmLogout(true)}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,0.4)'
                    }
                  }}
                >
                  Выйти из аккаунта
                </Button>
                <Button 
                  variant="outlined" 
                  color="warning"
                  onClick={() => setConfirmReset(true)}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#ff9800' : '#f57c00',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,152,0,0.3)' : 'rgba(245,124,0,0.3)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255,152,0,0.05)' 
                      : 'rgba(255,152,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(255,152,0,0.1)' 
                        : 'rgba(255,152,0,0.2)'
                    }
                  }}
                >
                  Сбросить настройки
                </Button>
              </Stack>
            </Box>
          </>
        )}

        {/* Вкладка "Профиль" */}
        {settingsTab === 1 && (
          <>
            {/* Информация о пользователе */}
            <Box sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                Информация о пользователе
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a', fontWeight: 500 }}>
                    Имя пользователя:
                  </Typography>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#4ecdc4' : '#0066cc' }}>
                    {user?.username || 'Не указано'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a', fontWeight: 500 }}>
                    Email:
                  </Typography>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#4ecdc4' : '#0066cc' }}>
                    {user?.email || 'Не указано'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a', fontWeight: 500 }}>
                    Полное имя:
                  </Typography>
                  <Typography sx={{ color: theme.palette.mode === 'dark' ? '#4ecdc4' : '#0066cc' }}>
                    {user?.fullName || 'Не указано'}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Переключение темы */}
            <Box sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '16px',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                Внешний вид
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)' }}>
                      {mode === 'dark' ? '🌙' : '☀️'}
                    </Typography>
                    <Typography sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                      Тёмная тема
                    </Typography>
                  </Box>
                  <Switch
                    checked={mode === 'dark'}
                    onChange={onToggleMode}
                    inputProps={{ 'aria-label': 'theme switch' }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Быстрые действия */}
            <Box sx={{ 
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '16px',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              transition: 'all 0.3s ease'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                Быстрые действия
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<FiCreditCard />}
                  onClick={() => setWalletOpen(true)}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,0.4)'
                    }
                  }}
                >
                  Кошелек
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<FiBookmark />}
                  onClick={() => setFavoritesOpen(true)}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,0.4)'
                    }
                  }}
                >
                  Избранное
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<FiUser />}
                  onClick={() => navigate(`/account/profile/${user?._id}`)}
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,0.4)'
                    }
                  }}
                >
                  Открыть профиль
                </Button>
              </Stack>
            </Box>
          </>
        )}

        {/* Вкладка "О сайте" */}
        {settingsTab === 2 && (
          <Box sx={{ 
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FiTerminal size={20} />
              <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>
                Отладка
              </Typography>
            </Box>
            
            <Tabs 
              value={debugTab} 
              onChange={(e, newValue) => setDebugTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab 
                label="Консоль" 
                icon={<FiTerminal />} 
                iconPosition="start"
                sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}
              />
              <Tab 
                label="Система" 
                icon={<FiMonitor />} 
                iconPosition="start"
                sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}
              />
              <Tab 
                label="Тесты" 
                icon={<FiSettings />} 
                iconPosition="start"
                sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}
              />
            </Tabs>

            {/* Панель консоли */}
            {debugTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Консольные сообщения
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={clearConsoleLogs}
                    sx={{ fontSize: '12px' }}
                  >
                    Очистить
                  </Button>
                </Box>
                
                <Paper 
                  sx={{ 
                    height: '300px', 
                    overflow: 'auto', 
                    p: 2,
                    background: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                >
                  {consoleLogs.length === 0 ? (
                    <Typography sx={{ color: theme.palette.mode === 'dark' ? '#666' : '#999', fontStyle: 'italic' }}>
                      Нет сообщений в консоли
                    </Typography>
                  ) : (
                    consoleLogs.map((log) => (
                      <Box key={log.id} sx={{ mb: 1, display: 'flex', gap: 1 }}>
                        <Typography 
                          sx={{ 
                            color: theme.palette.mode === 'dark' ? '#888' : '#666',
                            fontSize: '11px',
                            minWidth: '60px'
                          }}
                        >
                          {log.timestamp}
                        </Typography>
                        <Typography 
                          sx={{ 
                            color: log.type === 'error' ? '#ff6b6b' : 
                                   log.type === 'warn' ? '#ffd93d' : 
                                   log.type === 'info' ? '#4ecdc4' : 
                                   theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a',
                            fontSize: '12px'
                          }}
                        >
                          [{log.type.toUpperCase()}] {log.message}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Box>
            )}

            {/* Панель системной информации */}
            {debugTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a' }}>
                    Системная информация
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={refreshSystemInfo}
                    startIcon={<MdRefresh />}
                    sx={{ fontSize: '12px' }}
                  >
                    Обновить
                  </Button>
                </Box>
                
                <Paper 
                  sx={{ 
                    height: '300px', 
                    overflow: 'auto', 
                    p: 2,
                    background: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                >
                  {Object.entries(systemInfo).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1, display: 'flex', gap: 1 }}>
                      <Typography 
                        sx={{ 
                          color: theme.palette.mode === 'dark' ? '#4ecdc4' : '#0066cc',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          minWidth: '120px'
                        }}
                      >
                        {key}:
                      </Typography>
                      <Typography 
                        sx={{ 
                          color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a',
                          fontSize: '12px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>
            )}

            {/* Панель тестов */}
            {debugTab === 2 && (
              <Box>
                <Typography variant="subtitle2" sx={{ 
                  color: theme.palette.mode === 'dark' ? '#e0e7ef' : '#3a3a3a',
                  mb: 2
                }}>
                  Тесты производительности
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {/* 3D Quick Test */}
                  {quick3D && (
                    <Box sx={{ width: 80, height: 80, perspective: 300 }}>
                      <Box sx={{
                        width: 80, height: 80, position: 'relative',
                        transformStyle: 'preserve-3d',
                        animation: 'cube-rotate 2s linear infinite',
                        background: 'none',
                      }}>
                        {/* Грани куба */}
                        {[0,1,2,3,4,5].map(i => (
                          <Box key={i} sx={{
                            position: 'absolute', width: 80, height: 80, background: `rgba(${50*i},${255-40*i},${100+30*i},0.7)`,
                            border: '2px solid #fff',
                            transform: [
                              'translateZ(40px)',
                              'rotateY(180deg) translateZ(40px)',
                              'rotateY(90deg) translateZ(40px)',
                              'rotateY(-90deg) translateZ(40px)',
                              'rotateX(90deg) translateZ(40px)',
                              'rotateX(-90deg) translateZ(40px)'
                            ][i]
                          }} />
                        ))}
                      </Box>
                      <style>{`
                        @keyframes cube-rotate {
                          0% { transform: rotateX(0deg) rotateY(0deg); }
                          100% { transform: rotateX(360deg) rotateY(360deg); }
                        }
                      `}</style>
                    </Box>
                  )}
                  
                  {/* RGB тестер */}
                  <Box sx={{ 
                    width: 120, 
                    height: 30, 
                    borderRadius: 2, 
                    background: rgbColor, 
                    boxShadow: '0 0 8px #0002', 
                    border: '1px solid #fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#222', 
                    fontWeight: 600 
                  }}>
                    RGB: {rgbColor}
                  </Box>
                  
                  {/* FPS тестер */}
                  <Box sx={{ 
                    width: 120, 
                    height: 30, 
                    borderRadius: 2, 
                    background: '#222', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 600 
                  }}>
                    FPS: {fps}
                  </Box>
                  
                  {/* Speed test */}
                  <Box sx={{ 
                    width: 180, 
                    height: 30, 
                    borderRadius: 2, 
                    background: '#e3f2fd', 
                    color: '#222', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 600, 
                    gap: 1 
                  }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={runSpeedTest} 
                      sx={{ mr: 1, fontSize: '11px', minWidth: 0, p: '2px 8px' }}
                    >
                      Проверить интернет
                    </Button>
                    {netSpeed === null ? '—' : typeof netSpeed === 'number' ? `Пинг: ${netSpeed} мс` : netSpeed}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Вкладка "Отладка" */}
        {settingsTab === 3 && isDebugMode && (
          <Box sx={{ 
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}>
            {/* ...контент отладки... */}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: theme.palette.mode === 'dark' ? 'white' : '#222' }}>
          Закрыть
        </Button>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: 'white', 
            color: 'black', 
            fontWeight: 'bold', 
            borderRadius: 50 
          }}
          onClick={() => window.location.reload()}
        >
          Применить
        </Button>
      </DialogActions>

      {/* Модалка подтверждения выхода */}
      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Подтверждение выхода</Typography>
          <Typography sx={{ mb: 3 }}>
            Вы уверены, что хотите выйти из аккаунта?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmLogout(false)} sx={{ color: 'white' }}>
            Отмена
          </Button>
          <Button 
            color="error" 
            variant="contained" 
            onClick={handleLogout}
            sx={{ backgroundColor: 'white', color: 'black', fontWeight: 'bold', borderRadius: 50 }}
          >
            Выйти
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка подтверждения сброса */}
      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Подтверждение сброса</Typography>
          <Typography sx={{ mb: 3 }}>
            Сбросить все настройки и выйти из аккаунта? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmReset(false)} sx={{ color: 'white' }}>
            Отмена
          </Button>
          <Button 
            color="warning" 
            variant="contained" 
            onClick={handleReset}
            sx={{ backgroundColor: 'white', color: 'black', fontWeight: 'bold', borderRadius: 50 }}
          >
            Сбросить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальные окна кошелька и избранного */}
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <FavoritesPage open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </Dialog>
  );
};

export default SettingsModal; 
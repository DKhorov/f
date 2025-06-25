import { io } from 'socket.io-client';

// Определяем URL сервера в зависимости от окружения
const getSocketURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_SOCKET_URL || 'https://atomglidedev.ru';
  }
  return 'https://atomglidedev.ru';
};

// Создаем и настраиваем Socket.IO подключение
export const createSocketConnection = (token) => {
  const socketURL = getSocketURL();
  
  console.log('🔗 Создание WebSocket подключения к:', socketURL);
  
  const socket = io(socketURL, {
    auth: token ? { token } : {},
    query: token ? { token } : {},
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    forceNew: true
  });

  // Добавляем обработчики событий
  socket.on('connect', () => {
    console.log('✅ WebSocket подключен');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket отключен:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Ошибка подключения WebSocket:', error);
  });

  socket.on('welcome', (data) => {
    console.log('🎉 Приветствие от сервера:', data);
  });

  return socket;
};

// Экспортируем URL для использования в других компонентах
export const SOCKET_URL = getSocketURL(); 
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createSocketConnection } from './socket';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem 
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  AddReaction as AddReactionIcon
} from '@mui/icons-material';
import axios from '../../axios';
import { selectIsAuth } from '../../redux/slices/auth';
import { useTheme } from '../contexts/ThemeContext';
import GroupHeader from './GroupHeader';
import GroupFooter from './GroupFooter';
import ReactionContextMenu from './ReactionContextMenu';
import MessageReactions from './MessageReactions';
import EditMessageModal from './EditMessageModal';
import DeleteMessageModal from './DeleteMessageModal';

// CSS для анимации спиннера
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function GroupChat({ selectedGroup, onGroupUpdate, onToggleSidebar, showSidebar }) {
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(state => state.auth.data);
  const { mode } = useTheme();
  
  console.log('💬 GroupChat - User data:', user);
  console.log('💬 GroupChat - User avatar:', user?.avatarUrl);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Состояние для контекстного меню реакций
  const [reactionMenuOpen, setReactionMenuOpen] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState(null);
  
  // Состояние для контекстного меню сообщений
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState(null);
  
  // Состояние для редактирования и удаления
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  // Определяем цвета в зависимости от темы
  const isDark = mode === 'dark';
  const bgColor = isDark ? '#23272b' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const secondaryTextColor = isDark ? '#aaa' : '#666';
  const borderColor = isDark ? '#222' : '#e0e0e0';
  const inputBgColor = isDark ? '#181c20' : '#f8f9fa';
  const inputBorderColor = isDark ? '#3b3a39' : '#d0d0d0';
  const messageBgColor = isDark ? '#3b3a39' : '#f5f5f5';
  const myMessageBgColor = '#0078d4';
  
  // Добавляем стили спиннера
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = spinnerStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // WebSocket подключение
  useEffect(() => {
    if (!selectedGroup || !isAuth) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      setMessages([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден');
      return;
    }

    // Очищаем предыдущее подключение
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    const connectWebSocket = () => {
      console.log('🔗 Подключение к WebSocket серверу...');
      
      const socketInstance = createSocketConnection(token);
      
      socketInstance.on('connect', () => {
        console.log('✅ WebSocket подключен');
        setIsConnected(true);
        
        // Подписываемся на группу
        socketInstance.emit('join-group', {
          groupId: selectedGroup.groupId
        });
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('🔌 WebSocket отключен:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('❌ Ошибка подключения WebSocket:', error);
        setIsConnected(false);
      });

      socketInstance.on('welcome', (data) => {
        console.log('🎉 Приветствие от сервера:', data);
      });

      socketInstance.on('group-joined', (data) => {
        console.log('✅ Присоединились к группе:', data);
      });

      socketInstance.on('receive-group-message', (data) => {
        console.log('📨 Получено сообщение:', data);
        console.log('👤 Отправитель:', data.sender);
        console.log('🖼️ Аватар отправителя:', data.sender?.avatarUrl);
        
        // Добавляем все сообщения, включая наши собственные
        setMessages(prev => {
          // Проверяем, нет ли уже такого сообщения
          const exists = prev.some(msg => 
            msg.messageId === data.messageId || 
            (msg.content === data.message && msg.userId === data.userId && msg.timestamp === data.timestamp)
          );
          
          if (exists) {
            console.log('⚠️ Сообщение уже существует, игнорируем');
            return prev;
          }
          
          return [...prev, {
            userId: data.userId,
            userName: data.sender?.fullName || data.sender?.username || 'Неизвестный',
            userAvatar: data.sender?.avatarUrl || '',
            content: data.message,
            timestamp: data.timestamp,
            messageId: data.messageId,
            reactions: data.reactions || []
          }];
        });
      });

      socketInstance.on('message-sent', (data) => {
        console.log('✅ Сообщение подтверждено:', data);
        // Это событие больше не нужно, так как мы не создаем локальные сообщения
      });

      socketInstance.on('group-error', (data) => {
        console.error('❌ Ошибка группы:', data.message);
        // Показываем ошибку пользователю
        alert(`Ошибка: ${data.message}`);
      });

      socketInstance.on('user-joined-group', (data) => {
        console.log('👤 Пользователь присоединился к группе:', data);
      });

      socketInstance.on('user-left-group', (data) => {
        console.log('👤 Пользователь покинул группу:', data);
      });

      socketInstance.on('user-group-typing', (data) => {
        if (data.userId === user?._id) return;
        setTypingUsers((prev) => {
          // Добавляем пользователя в список typing
          if (data.isTyping) {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          } else {
            // Убираем пользователя из списка typing
            return prev.filter((id) => id !== data.userId);
          }
        });
      });

      socketInstance.on('reaction-added', (data) => {
        setMessages((prev) => prev.map(msg =>
          msg.messageId === data.messageId
            ? { 
                ...msg, 
                reactions: [...(msg.reactions || []), { 
                  emoji: data.emoji, 
                  user: data.userId,
                  userId: data.userId,
                  createdAt: data.timestamp 
                }] 
              }
            : msg
        ));
      });

      socketInstance.on('reaction-removed', (data) => {
        setMessages((prev) => prev.map(msg =>
          msg.messageId === data.messageId
            ? { 
                ...msg, 
                reactions: (msg.reactions || []).filter(r => 
                  r.user !== data.userId && r.userId !== data.userId
                ) 
              }
            : msg
        ));
      });

      // Обработчики для редактирования и удаления сообщений
      socketInstance.on('message-edited', (data) => {
        console.log('📝 Получено событие message-edited:', data);
        setMessages((prev) => prev.map(msg =>
          msg.messageId === data.messageId
            ? { 
                ...msg, 
                content: data.text,
                isEdited: true,
                editedAt: data.editedAt
              }
            : msg
        ));
        console.log('✅ Сообщение обновлено в UI');
      });

      socketInstance.on('message-deleted', (data) => {
        setMessages((prev) => prev.filter(msg => msg.messageId !== data.messageId));
      });

      setSocket(socketInstance);
    };

    connectWebSocket();

    // Загружаем историю сообщений
    loadMessages();

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [selectedGroup?.groupId, isAuth, user?._id]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Загрузка истории сообщений
  const loadMessages = async () => {
    if (!selectedGroup) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`/groups/${selectedGroup.groupId}/messages`);
      const messages = response.data.messages || [];
      
      console.log('📚 Загружены сообщения:', messages);
      
      // Преобразуем формат сообщений для отображения
      const formattedMessages = messages.map(msg => {
        console.log('📝 Обработка сообщения:', msg);
        console.log('👤 Отправитель:', msg.sender);
        console.log('🖼️ Аватар отправителя:', msg.sender?.avatarUrl);
        console.log('😀 Реакции:', msg.reactions);
        
        return {
          userId: msg.sender._id,
          userName: msg.sender.fullName || msg.sender.username || 'Неизвестный',
          userAvatar: msg.sender.avatarUrl || '',
          content: msg.text,
          timestamp: msg.createdAt,
          messageId: msg._id,
          reactions: msg.reactions || []
        };
      });
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    console.log('👤 Отправка сообщения:', messageText);

    // Если WebSocket подключен, отправляем через него
    if (socket && isConnected) {
      try {
        socket.emit('send-group-message', {
          groupId: selectedGroup.groupId,
          message: messageText
        });
      } catch (error) {
        console.error('Ошибка отправки через WebSocket:', error);
      }
    } else {
      console.log('WebSocket не подключен');
    }
    
    setIsSending(false);
  };

  // Обработка нажатия Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Выход из группы
  const leaveGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      await axios.post(`/groups/${selectedGroup.groupId}/leave`);
      handleMenuClose();
      
      // Уведомляем WebSocket о выходе из группы
      if (socket && isConnected) {
        socket.emit('leave-group', {
          groupId: selectedGroup.groupId
        });
      }
      
      if (onGroupUpdate) {
        onGroupUpdate();
      }
    } catch (error) {
      console.error('Ошибка выхода из группы:', error);
      alert(error.response?.data?.message || 'Ошибка выхода из группы');
    }
  };

  const handleTypingStart = () => {
    if (socket && isConnected && selectedGroup) {
      socket.emit('group-typing', { groupId: selectedGroup.groupId, isTyping: true });
    }
  };
  const handleTypingStop = () => {
    if (socket && isConnected && selectedGroup) {
      socket.emit('group-typing', { groupId: selectedGroup.groupId, isTyping: false });
    }
  };

  const handleAddReaction = (messageId, emoji) => {
    if (socket && isConnected && user?._id) {
      socket.emit('add-reaction', { messageId, emoji, userId: user._id });
    }
  };

  // Функции для работы с контекстным меню реакций
  const handleReactionMenuOpen = (event, messageId) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedMessageForReaction(messageId);
    setReactionMenuOpen(true);
  };

  const handleReactionMenuClose = () => {
    setReactionMenuOpen(false);
    setSelectedMessageForReaction(null);
  };

  const handleReactionSelect = (emoji) => {
    if (selectedMessageForReaction && socket && isConnected && user?._id) {
      socket.emit('add-reaction', { 
        messageId: selectedMessageForReaction, 
        emoji, 
        userId: user._id 
      });
    }
  };

  // Обработчик клика по реакции
  const handleReactionClick = (messageId, emoji, isMyReaction) => {
    if (!socket || !isConnected || !user?._id) return;
    
    if (isMyReaction) {
      // Удаляем реакцию
      socket.emit('remove-reaction', { 
        messageId, 
        userId: user._id 
      });
    } else {
      // Проверяем лимит реакций перед добавлением
      const message = messages.find(m => m.messageId === messageId);
      const userReactionsCount = message?.reactions?.filter(r => 
        r.user === user._id || r.userId === user._id
      ).length || 0;
      
      if (userReactionsCount >= 3) {
        // Показываем ошибку или открываем меню реакций
        setSelectedMessageForReaction(messageId);
        setReactionMenuOpen(true);
        return;
      }
      
      // Добавляем реакцию
      socket.emit('add-reaction', { 
        messageId, 
        emoji, 
        userId: user._id 
      });
    }
  };

  // Получаем текущую реакцию пользователя для сообщения
  const getCurrentUserReaction = (messageReactions) => {
    if (!user?._id || !messageReactions) return null;
    const userReaction = messageReactions.find(reaction => 
      reaction.user === user._id || reaction.userId === user._id
    );
    return userReaction ? userReaction.emoji : null;
  };

  // Получаем количество реакций пользователя для сообщения
  const getUserReactionsCount = (messageReactions) => {
    if (!user?._id || !messageReactions) return 0;
    return messageReactions.filter(reaction => 
      reaction.user === user._id || reaction.userId === user._id
    ).length;
  };

  // Функции для работы с контекстным меню сообщений
  const handleMessageMenuOpen = (event, message) => {
    event.preventDefault();
    event.stopPropagation();
    setMessageMenuAnchor(event.currentTarget);
    setSelectedMessageForMenu(message);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
    setSelectedMessageForMenu(null);
  };

  const handleReactionFromMenu = () => {
    if (selectedMessageForMenu) {
      setSelectedMessageForReaction(selectedMessageForMenu.messageId);
      setReactionMenuOpen(true);
      handleMessageMenuClose();
    }
  };

  // Функции для редактирования и удаления
  const handleEditMessage = () => {
    if (selectedMessageForMenu) {
      setMessageToEdit(selectedMessageForMenu);
      setEditModalOpen(true);
      handleMessageMenuClose();
    }
  };

  const handleDeleteMessage = () => {
    if (selectedMessageForMenu) {
      setMessageToDelete(selectedMessageForMenu);
      setDeleteModalOpen(true);
      handleMessageMenuClose();
    }
  };

  const handleSaveEdit = async (newText) => {
    console.log('🔧 handleSaveEdit вызвана с текстом:', newText);
    console.log('🔧 messageToEdit:', messageToEdit);
    console.log('🔧 socket:', socket);
    console.log('🔧 isConnected:', isConnected);
    console.log('🔧 user._id:', user?._id);
    
    if (!messageToEdit || !socket || !isConnected || !user?._id) {
      console.error('❌ Не удалось отредактировать сообщение - недостаточно данных');
      return;
    }
    
    setIsEditing(true);
    try {
      console.log('📤 Отправка события edit-group-message через WebSocket');
      socket.emit('edit-group-message', {
        messageId: messageToEdit.messageId,
        text: newText,
        userId: user._id
      });
      console.log('✅ Событие edit-group-message отправлено');
      setEditModalOpen(false);
      setMessageToEdit(null);
    } catch (error) {
      console.error('❌ Ошибка редактирования сообщения:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete || !socket || !isConnected || !user?._id) return;
    
    setIsDeleting(true);
    try {
      socket.emit('delete-group-message', {
        messageId: messageToDelete.messageId,
        userId: user._id
      });
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Ошибка удаления сообщения:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!selectedGroup) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        color: secondaryTextColor, 
        flex: 1, 
        width: '100%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        bgcolor: bgColor,
        borderRadius: 0,
        boxShadow: 3
      }}>
        {/* Стикер пожимающего плечами человека */}
        <Box sx={{
          fontSize: '120px',
          marginBottom: '20px',
          filter: 'grayscale(1) opacity(0.7)'
        }}>
          🤷‍♂️
        </Box>
        <Typography variant="h5" sx={{ mb: 2, color: textColor }}>
          У вас пока нет чатов
        </Typography>
        <Typography variant="body1" sx={{ color: secondaryTextColor, maxWidth: '400px', lineHeight: 1.6 }}>
          Выберите группу слева, чтобы начать общение,<br />
          или создайте свою собственную группу!
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#0078d4',
              color: '#0078d4',
              '&:hover': {
                borderColor: '#106ebe',
                backgroundColor: 'rgba(0, 120, 212, 0.1)'
              }
            }}
          >
            Создать группу
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: '#0078d4',
              color: '#0078d4',
              '&:hover': {
                borderColor: '#106ebe',
                backgroundColor: 'rgba(0, 120, 212, 0.1)'
              }
            }}
          >
            Найти группы
          </Button>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      flex: 1, 
      minWidth: 0, 
      width: '100%',
      maxWidth: '1000px',
      bgcolor: bgColor, 
      borderRadius: 0, 
      boxShadow: 3, 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      minHeight: 0,
      '@media (max-width: 1100px)': {
        maxWidth: '100%',
      },
      '@media (max-width: 768px)': {
        borderRadius: 0,
        boxShadow: 'none'
      }
    }}>
      <GroupHeader
        selectedGroup={selectedGroup}
        onToggleSidebar={onToggleSidebar}
        onMenu={handleMenuOpen}
        anchorEl={anchorEl}
        onCloseMenu={handleMenuClose}
        isConnected={isConnected}
      />
      {/* Область сообщений */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        p: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 0.5, sm: 1 },
        minHeight: 0,
        maxHeight: 'calc(100vh - 180px)',
        background: bgColor,
        borderRadius: 2,
      }}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #3b3a39',
              borderTop: '3px solid #0078d4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <Typography variant="body2" sx={{ color: secondaryTextColor }}>
              Загрузка сообщений...
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message, index) => (
              <Box 
                key={message.messageId || `local-${index}`}
                sx={{ 
                  display: 'flex', 
                  gap: { xs: 0.5, sm: 1 },
                  justifyContent: message.userId?.toString() === user?._id?.toString() ? 'flex-end' : 'flex-start',
                  width: '100%',
                  mb: 1,
                  position: 'relative'
                }}
              >
                {/* Аватар пользователя - показываем для всех сообщений */}
                <Avatar 
                  src={message.userAvatar} 
                  sx={{ 
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    mt: 'auto',
                    bgcolor: message.userAvatar ? 'transparent' : '#0078d4',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 'bold',
                    border: '2px solid #0078d4',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s'
                    }
                  }}
                  alt={message.userName}
                >
                  {!message.userAvatar && message.userName?.charAt(0)?.toUpperCase()}
                </Avatar>
                {console.log('🖼️ Рендеринг аватара для сообщения:', message.messageId, 'Аватар:', message.userAvatar, 'Имя:', message.userName)}
                
                <Box sx={{
                  maxWidth: { xs: '90%', sm: '70%' },
                  minWidth: '60px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Имя отправителя */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: secondaryTextColor,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      fontWeight: 500,
                      mb: 0.5,
                      textAlign: message.userId?.toString() === user?._id?.toString() ? 'right' : 'left',
                      opacity: 0.8
                    }}
                  >
                    {message.userId?.toString() === user?._id?.toString() ? 'Вы' : message.userName}
                  </Typography>
                  
                  {/* Сообщение */}
                  <Box sx={{
                    backgroundColor: message.userId?.toString() === user?._id?.toString() ? myMessageBgColor : messageBgColor,
                    color: message.userId?.toString() === user?._id?.toString() ? '#fff' : textColor,
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 2,
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                    opacity: message.error ? 0.7 : 1,
                    border: message.error ? '1px solid #ff6b6b' : 'none',
                    position: 'relative',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre-line'
                  }}>
                    <Typography sx={{
                      fontSize: { xs: '0.95rem', sm: '1.05rem' },
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                    }}>{message.content}</Typography>
                    
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 0.5
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: message.userId?.toString() === user?._id?.toString() ? 'rgba(255,255,255,0.7)' : secondaryTextColor,
                        fontSize: { xs: '0.65rem', sm: '0.7rem' }
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                      {message.isSending && (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid #888',
                          borderTop: '2px solid #0078d4',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      )}
                      {message.isLocal && !message.isSending && (
                        <Typography variant="caption" sx={{ 
                          color: message.userId?.toString() === user?._id?.toString() ? 'rgba(255,255,255,0.7)' : secondaryTextColor,
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }
                        }}>
                          • Отправлено
                        </Typography>
                      )}
                      {message.isEdited && (
                        <Typography variant="caption" sx={{ 
                          color: message.userId?.toString() === user?._id?.toString() ? 'rgba(255,255,255,0.7)' : secondaryTextColor,
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          fontStyle: 'italic'
                        }}>
                          • Изменено
                        </Typography>
                      )}
                      {message.error && (
                        <Typography variant="caption" sx={{ 
                          color: '#ff6b6b',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' }
                        }}>
                          • {message.error}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Реакции */}
                    {message.reactions && message.reactions.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        <MessageReactions 
                          reactions={message.reactions} 
                          currentUserId={user?._id}
                          onReactionClick={(emoji, isMyReaction) => 
                            handleReactionClick(message.messageId, emoji, isMyReaction)
                          }
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {/* Кнопка с тремя точками - вынесена за сообщение */}
                <IconButton 
                  size="small" 
                  onClick={(event) => handleMessageMenuOpen(event, message)}
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: '0.8rem',
                    color: secondaryTextColor,
                    opacity: 0.7,
                    transition: 'all 0.2s ease',
                    alignSelf: 'flex-start',
                    mt: 3.5,
                    '&:hover': {
                      opacity: 1,
                      bgcolor: isDark ? '#404040' : '#f0f0f0',
                      color: '#0078d4'
                    }
                  }}
                >
                  <MoreVertIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>
      <GroupFooter
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isSending={isSending}
        isConnected={isConnected}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
      {/* Индикатор "Печатает..." */}
      {typingUsers.length > 0 && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: secondaryTextColor }}>
            {typingUsers.length === 1 ? 'Кто-то печатает...' : 'Несколько человек печатают...'}
          </Typography>
        </Box>
      )}
      
      {/* Контекстное меню реакций */}
      <ReactionContextMenu
        open={reactionMenuOpen}
        onClose={handleReactionMenuClose}
        onReactionSelect={handleReactionSelect}
        currentReaction={selectedMessageForReaction ? 
          getCurrentUserReaction(messages.find(m => m.messageId === selectedMessageForReaction)?.reactions) : 
          null
        }
        userReactionsCount={selectedMessageForReaction ? 
          getUserReactionsCount(messages.find(m => m.messageId === selectedMessageForReaction)?.reactions) : 
          0
        }
      />
      
      {/* Контекстное меню сообщений */}
      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={handleMessageMenuClose}
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#2d2d2d' : '#ffffff',
            color: textColor,
            border: `1px solid ${borderColor}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            minWidth: 150
          }
        }}
      >
        <MenuItem 
          onClick={handleReactionFromMenu}
          sx={{
            '&:hover': {
              bgcolor: isDark ? '#404040' : '#f5f5f5'
            }
          }}
        >
          <AddReactionIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
          Реакция
        </MenuItem>
        {selectedMessageForMenu?.userId?.toString() === user?._id?.toString() && (
          <>
            <MenuItem 
              onClick={handleEditMessage}
              sx={{
                '&:hover': {
                  bgcolor: isDark ? '#404040' : '#f5f5f5'
                }
              }}
            >
              <span style={{ marginRight: 8 }}>✏️</span>
              Редактировать
            </MenuItem>
            <MenuItem 
              onClick={handleDeleteMessage}
              sx={{
                '&:hover': {
                  bgcolor: isDark ? '#404040' : '#f5f5f5'
                },
                color: '#ff6b6b'
              }}
            >
              <span style={{ marginRight: 8 }}>🗑️</span>
              Удалить
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Модальное окно редактирования */}
      <EditMessageModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setMessageToEdit(null);
        }}
        message={messageToEdit}
        onSave={handleSaveEdit}
        isLoading={isEditing}
      />
      
      {/* Модальное окно удаления */}
      <DeleteMessageModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
        message={messageToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </Box>
  );
} 
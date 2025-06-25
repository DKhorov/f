import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  Paper,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  SmartToy as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import axios from '../../axios';
import ivanZoloAvatar from './ivan-zolo-avatar.png';
import ReactMarkdown from 'react-markdown';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function AIChatModal({ open, onClose }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/chat', {
        message: userMessage.content,
        conversationHistory: conversation
      });

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: response.data.timestamp
        };

        setConversation(prev => [...prev, aiMessage]);
      } else {
        setError(response.data.message || 'Ошибка при получении ответа');
      }
    } catch (err) {
      console.error('Ошибка чата с AI:', err);
      setError(err.response?.data?.message || 'Ошибка соединения с AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setError('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullScreen={isFullScreen || isMobile}
      PaperProps={{
        sx: {
          backgroundColor: '#23272b',
          color: '#fff',
          width: isMobile ? '100vw' : undefined,
          maxWidth: isMobile ? '100vw' : 600,
          minWidth: isMobile ? '100vw' : 600,
          minHeight: isMobile ? '100vh' : 500,
          p: isMobile ? 1 : 0,
        }
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-animation {
          animation: fadeIn 0.3s ease-out;
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
          <Avatar src={ivanZoloAvatar} sx={{ width: 32, height: 32, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
            Иван Золо
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={clearConversation}
            size="small"
            sx={{ 
              color: '#888',
              fontSize: '12px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Очистить
          </Button>
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
        minWidth: isMobile ? '100vw' : 600,
        minHeight: isMobile ? '100vh' : 500,
        maxHeight: isMobile ? '100vh' : 600,
        backgroundColor: '#23272b',
        p: isMobile ? 1 : 0,
        overflow: 'auto',
        paddingBottom: isMobile ? '120px' : 0,
      }}>
        {/* Область сообщений */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {conversation.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: '#888'
            }}>
              <Avatar src={ivanZoloAvatar} sx={{ width: 48, height: 48, mb: 2, mx: 'auto' }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Добро пожаловать! Я — Иван Золо 🤖
              </Typography>
              <Typography variant="body2">
                Задайте мне любой вопрос, и я постараюсь помочь
              </Typography>
            </Box>
          )}
          
          {conversation.map((msg, index) => (
            <Box
              key={index}
              className="message-animation"
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: msg.role === 'user' ? '#0078d4' : '#3b3a39',
                  color: '#fff',
                  borderRadius: 2,
                  position: 'relative'
                }}
              >
                {msg.role === 'assistant' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar src={ivanZoloAvatar} sx={{ width: 24, height: 24, backgroundColor: '#0078d4', color: '#fff' }} />
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      Иван Золо
                    </Typography>
                  </Box>
                )}
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    children={msg.content}
                    components={{
                      p: ({node, ...props}) => <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }} {...props} />,
                      code: ({node, ...props}) => <Box component="code" sx={{ background: '#222', color: '#fff', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.95em' }} {...props} />,
                      pre: ({node, ...props}) => <Box component="pre" sx={{ background: '#181818', color: '#fff', p: 2, borderRadius: 2, my: 1, overflowX: 'auto' }} {...props} />,
                      a: ({node, ...props}) => <a style={{ color: '#90caf9' }} {...props} />
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                )}
                {msg.role === 'assistant' && (
                  <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                )}
              </Paper>
            </Box>
          ))}
          
          {isLoading && (
            <Box
              className="message-animation"
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-start'
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: '#3b3a39',
                  color: '#fff',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={ivanZoloAvatar} sx={{ width: 24, height: 24, backgroundColor: '#0078d4' }} />
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    Иван Золо
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#0078d4' }} />
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Печатает...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ 
            backgroundColor: 'rgba(211, 47, 47, 0.1)', 
            color: '#ff6b6b',
            mx: 2
          }}>
            {error}
          </Alert>
        )}
        
        {/* Область ввода */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid #3b3a39',
          backgroundColor: '#23272b'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите ваше сообщение..."
              disabled={isLoading}
              sx={{ 
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
                '& .MuiInputBase-input::placeholder': {
                  color: '#888',
                  opacity: 1
                }
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              sx={{
                backgroundColor: '#0078d4',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#106ebe'
                },
                '&:disabled': {
                  backgroundColor: '#3b3a39',
                  color: '#666'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block' }}>
            Нажмите Enter для отправки, Shift+Enter для новой строки
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 
import React, { useState, useEffect } from 'react';
import axios from '../../axios';
import { Dialog, DialogContent, DialogActions, Box, IconButton, Button, TextField } from '@mui/material';
import { MdFullscreen, MdClose, MdFullscreenExit } from 'react-icons/md';
import { WalletOutlined, PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Input, Select, Spin, message, Avatar } from 'antd';
import useSettings from '../hooks/useSettings';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function WalletModal({ open, onClose }) {
  const { mode } = useSettings();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferUsername, setTransferUsername] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (open) fetchWalletData();
  }, [open]);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        axios.get('/auth/balance', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('/auth/transactions?limit=20', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data);
      setIsLoading(false);
    } catch (err) {
      message.error('Ошибка загрузки данных кошелька');
      setIsLoading(false);
    }
  };

  const fetchUsers = async (search) => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data.filter(user => user._id !== localStorage.getItem('userId')));
    } catch (err) {
      message.error('Ошибка загрузки пользователей');
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !transferUsername) {
      message.error('Заполните все поля');
      return;
    }
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      message.error('Введите корректную сумму');
      return;
    }
    try {
      setIsTransferring(true);
      await axios.post('/balance/transfer', {
        amount,
        username: transferUsername,
        description: transferDescription || 'Перевод средств',
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      message.success('Перевод выполнен успешно');
      setTransferModalVisible(false);
      setTransferAmount('');
      setTransferUsername('');
      setTransferDescription('');
      fetchWalletData();
    } catch (err) {
      message.error(err.response?.data?.message || 'Ошибка перевода');
    } finally {
      setIsTransferring(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatAmount = (amount) => {
    return amount > 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2);
  };

  const getTransactionColor = (amount) => {
    return amount > 0 ? '#4CAF50' : '#F44336';
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'transfer_in':
        return <ArrowRightOutlined style={{ color: '#4CAF50', transform: 'rotate(180deg)' }} />;
      case 'transfer_out':
        return <ArrowRightOutlined style={{ color: '#F44336' }} />;
      case 'withdrawal':
        return <WalletOutlined style={{ color: '#F44336' }} />;
      default:
        return <WalletOutlined style={{ color: '#4CAF50' }} />;
    }
  };

  // Цвета для тем
  const isDark = mode === 'dark';
  const bg = isDark ? '#10131a' : '#f5f7fa';
  const cardBg = isDark ? 'linear-gradient(135deg, #232a36 0%, #181c23 100%)' : 'linear-gradient(135deg, #e0e7ef 0%, #cfd9df 100%)';
  const cardText = isDark ? '#fff' : '#222';
  const sectionTitle = isDark ? '#e0e7ef' : '#3a3a3a';
  const listBg = isDark ? 'rgba(30,34,44,0.95)' : 'rgba(255,255,255,0.85)';

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isFullScreen || isMobile}>
      {/* Кастомная панель сверху */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 2, 
        py: 1, 
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        borderTopLeftRadius: 8, 
        borderTopRightRadius: 8,
        boxShadow: mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
        transition: 'all 0.3s ease'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WalletOutlined style={{ fontSize: 22, marginRight: 8, verticalAlign: 'middle', color: isDark ? '#fff' : '#222' }} />
          <span style={{ fontWeight: 600, color: isDark ? '#fff' : '#222', fontSize: 18 }}>Мой кошелек</span>
        </Box>
        <Box>
          <IconButton onClick={() => setIsFullScreen(f => !f)} size="small" sx={{ color: isDark ? '#fff' : '#222', mr: 1 }}>
            {isFullScreen ? <MdFullscreenExit /> : <MdFullscreen />}
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: isDark ? '#fff' : '#222' }}>
            <MdClose />
          </IconButton>
        </Box>
      </Box>
      
      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3, 
        minWidth: isMobile ? '100vw' : 520, 
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
        transition: 'all 0.3s ease',
        p: isMobile ? 1 : 3,
        overflow: 'auto',
        paddingBottom: isMobile ? '120px' : 0,
      }}>
        {/* Карточка баланса */}
        <Box sx={{
          background: mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          color: cardText,
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'all 0.3s ease'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>💳</span>
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Мой баланс</span>
          </Box>
          <Box sx={{ fontSize: '32px', fontWeight: 'bold', margin: '16px 0' }}>
            {balance.toFixed(2)} ₽
          </Box>
          <Box sx={{ marginBottom: '20px', fontSize: '14px', opacity: 0.8 }}>
            AtomGlide Wallet 
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                borderRadius: 3, 
                fontWeight: 600,
                background: mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: mode === 'dark' 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'rgba(0,0,0,0.15)'
                }
              }} 
              onClick={() => setTransferModalVisible(true)}
            >
              <PlusOutlined /> Перевести
            </Button>
    
          </Box>
        </Box>

        {/* Заголовок секции */}
        <Box sx={{ 
          color: sectionTitle, 
          padding: '0 8px', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 600
        }}>
          Последние операции
        </Box>

        {/* Список транзакций */}
        <Box sx={{
          background: mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          borderRadius: '12px',
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          transition: 'all 0.3s ease'
        }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
              <Spin size="large" />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', padding: '40px 20px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              Нет операций
            </Box>
          ) : (
            transactions.map(item => (
              <Box key={item._id} sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                '&:last-child': {
                  borderBottom: 'none'
                },
                '&:hover': {
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  borderRadius: '8px',
                  padding: '12px',
                  margin: '0 -12px'
                }
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}>
                  {getTransactionIcon(item.type)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    color: getTransactionColor(item.amount)
                  }}>
                    {formatAmount(item.amount)} ₽
                  </Box>
                  <Box sx={{
                    fontSize: '14px',
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                    marginBottom: '4px'
                  }}>
                    {item.description}
                  </Box>
                  <Box sx={{
                    fontSize: '12px',
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <span>{formatDate(item.createdAt)}</span>
                    {item.relatedUser && (
                      <span style={{ fontWeight: 500 }}>
                        {item.type === 'transfer_out' ? 'Получатель: ' : 'Отправитель: '}{item.relatedUser.fullName}
                      </span>
                    )}
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Плавающая кнопка */}
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ 
            borderRadius: 50, 
            position: 'fixed', 
            right: 40, 
            bottom: 40, 
            zIndex: 1002, 
            minWidth: 64, 
            minHeight: 64, 
            fontSize: 28, 
            boxShadow: 3 
          }} 
          onClick={() => setTransferModalVisible(true)}
        >
          <PlusOutlined />
        </Button>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: isDark ? 'white' : '#222' }}>Закрыть</Button>
        <Button onClick={() => setTransferModalVisible(true)} variant="contained" sx={{ backgroundColor: 'white', color: 'black', fontWeight: 'bold', borderRadius: 50 }}>Перевести</Button>
      </DialogActions>

      {/* Модалка перевода */}
      <Dialog open={transferModalVisible} onClose={() => setTransferModalVisible(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 4 }}>
          <Box sx={{ fontWeight: 600, fontSize: 20, mb: 2 }}>Перевод средств</Box>
          <Input
            type="number"
            value={transferAmount}
            onChange={e => setTransferAmount(e.target.value)}
            placeholder="Введите сумму"
            size="large"
            style={{ marginBottom: 16 }}
          />
          <Select
            showSearch
            value={transferUsername}
            placeholder="Выберите пользователя"
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={fetchUsers}
            onChange={value => setTransferUsername(value)}
            notFoundContent={null}
            size="large"
            style={{ width: '100%', marginBottom: 16 }}
          >
            {users.map(user => (
              <Select.Option key={user._id} value={user.username}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar src={user.avatarUrl} style={{ marginRight: 8 }} />
                  {user.fullName} (@{user.username})
                </div>
              </Select.Option>
            ))}
          </Select>
          <TextField
            value={transferDescription}
            onChange={e => setTransferDescription(e.target.value)}
            placeholder="Назначение платежа"
            multiline
            rows={2}
            fullWidth
            sx={{ 
              marginBottom: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                color: isDark ? '#fff' : '#000',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1890ff'
                }
              },
              '& .MuiInputBase-input': {
                color: isDark ? '#fff' : '#000'
              },
              '& .MuiInputBase-input::placeholder': {
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                opacity: 1
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3 }}>
          <Button onClick={() => setTransferModalVisible(false)} sx={{ color: 'white' }}>Отмена</Button>
          <Button onClick={handleTransfer} variant="contained" sx={{ backgroundColor: 'white', color: 'black', fontWeight: 'bold', borderRadius: 50 }} disabled={isTransferring}>Перевести</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
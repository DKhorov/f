import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';
import GroupSidebar from './GroupSidebar';
import GroupChat from './GroupChat';
import GroupJoinModal from './GroupJoinModal';
import GroupCreateModal from './GroupCreateModal';
import { selectIsAuth } from '../../redux/slices/auth';
import { Box, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

export default function GroupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const { mode } = useTheme();
  
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [search, setSearch] = useState('');
  const [openJoin, setOpenJoin] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createData, setCreateData] = useState({ name: '', logo: '', desc: '', nick: '' });
  const [createError, setCreateError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true); // Состояние для мобильного сайдбара

  // Определяем цвета в зависимости от темы
  const isDark = mode === 'dark';
  const bgColor = isDark ? '#181c20' : '#f5f5f5';

  // Проверка аутентификации при загрузке
  useEffect(() => {
    if (isAuth) {
      loadGroups();
    } else {
      setLoading(false);
      // Не показываем окно аутентификации автоматически
      // Пользователь должен войти через основное приложение
    }
  }, [isAuth]);

  // Загрузка групп при монтировании компонента
  const loadGroups = async () => {
    try {
      setLoading(true);
      // Загружаем только группы пользователя
      const response = await axios.get('/groups/my');
      setGroups(response.data.groups || []);
      if (response.data.groups && response.data.groups.length > 0) {
        setSelectedGroup(response.data.groups[0]);
      }
      setUser(response.data.user);
      
      // Загружаем онлайн пользователей (если есть API)
      try {
        const onlineResponse = await axios.get('/users/online');
        setOnlineUsers(onlineResponse.data.users || []);
      } catch (err) {
        console.log('Не удалось загрузить онлайн пользователей:', err);
        setOnlineUsers([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки групп:', err);
      if (err.response?.status === 401) {
        // Токен истек, но не показываем окно аутентификации
        setError('Сессия истекла. Пожалуйста, войдите заново.');
      } else {
        setError('Ошибка загрузки групп');
      }
    } finally {
      setLoading(false);
    }
  };

  // Создание новой группы
  const handleCreateGroup = async () => {
    try {
      if (!createData.name || !createData.nick) {
        setCreateError('Заполните все обязательные поля');
        return;
      }

      if (!createData.nick.startsWith('$')) {
        setCreateError('ID группы должен начинаться с $');
        return;
      }

      setIsCreating(true);
      setCreateError('');

      const groupData = {
        name: createData.name,
        groupId: createData.nick,
        description: createData.desc,
        avatarUrl: createData.logo,
        isPrivate: false
      };

      const response = await axios.post('/groups', groupData);
      
      if (response.data.group) {
        setGroups(prev => [response.data.group, ...prev]);
        setSelectedGroup(response.data.group);
        setOpenCreate(false);
        setCreateData({ name: '', logo: '', desc: '', nick: '' });
        setCreateError('');
        alert('Группа успешно создана!');
      }
    } catch (err) {
      console.error('Ошибка создания группы:', err);
      if (err.response?.status === 401) {
        setCreateError('Сессия истекла. Пожалуйста, войдите заново.');
      } else if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.msg || e.message).join(', ');
        setCreateError(`Ошибка валидации: ${errorMessages}`);
      } else {
        setCreateError(err.response?.data?.message || 'Ошибка создания группы');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Присоединение к группе
  const handleJoinGroup = async () => {
    try {
      if (!joinName) {
        setJoinError('Введите ID группы');
        return;
      }

      if (!joinName.startsWith('$')) {
        setJoinError('ID группы должен начинаться с $');
        return;
      }

      setIsJoining(true);
      setJoinError('');

      const response = await axios.post(`/groups/${joinName}/join`);
      
      if (response.data.message) {
        // Обновляем список групп после присоединения
        await loadGroups();
        setOpenJoin(false);
        setJoinName('');
        setJoinError('');
        alert('Вы успешно присоединились к группе!');
      }
    } catch (err) {
      console.error('Ошибка присоединения к группе:', err);
      if (err.response?.status === 401) {
        setJoinError('Сессия истекла. Пожалуйста, войдите заново.');
      } else {
        setJoinError(err.response?.data?.message || 'Ошибка присоединения к группе');
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Обработчик выбора группы
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    // На мобильных устройствах скрываем сайдбар после выбора группы
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    }
  };

  // Обработчик переключения сайдбара на мобильных
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Обработчик выбора пользователя
  const handleUserSelect = (user) => {
    console.log('Selected user:', user);
    // Здесь можно добавить логику для приватного чата
  };

  // Фильтрация групп по поиску
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.groupId.toLowerCase().includes(search.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        background: bgColor, 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #3b3a39',
          borderTop: '4px solid #0078d4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ color: isDark ? 'white' : 'black', fontSize: '18px' }}>Загрузка групп...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && !isAuth) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: bgColor, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'red', fontSize: '18px' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      background: bgColor,
      overflow: 'hidden'
    }}
    className="group-page-container"
    >
      <style>{`
        @media (max-width: 768px) {
          .group-page-container {
            flex-direction: column !important;
          }
          
          .group-page-container > * {
            flex-shrink: 0;
          }
          
          .group-page-container > *:nth-child(2) {
            flex: 1;
            min-height: 0;
          }
          
          .mobile-sidebar {
            display: none;
          }
          
          .mobile-sidebar.show {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            background: ${bgColor};
          }
          
          .mobile-menu-button {
            display: block !important;
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1001;
          }
        }
        
        @media (min-width: 769px) {
          .group-page-container {
            flex-direction: row !important;
          }
          
          .mobile-sidebar {
            display: block !important;
          }
          
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
      
      {/* Мобильная кнопка меню */}
      <IconButton
        className="mobile-menu-button"
        onClick={toggleSidebar}
        sx={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          color: isDark ? 'white' : 'black',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
          }
        }}
      >
        <MenuIcon />
      </IconButton>
      
      <div className={`mobile-sidebar ${showSidebar ? 'show' : ''}`}>
        <GroupSidebar
          selectedGroup={selectedGroup}
          setSelectedGroup={handleGroupSelect}
          filteredGroups={filteredGroups}
          suggestedGroups={[]}
          onOpenJoin={() => setOpenJoin(true)}
          onOpenCreate={() => setOpenCreate(true)}
          search={search}
          setSearch={setSearch}
          onRefresh={loadGroups}
          onLogout={() => navigate('/')}
          onlineUsers={onlineUsers}
          currentUser={user}
          onClose={() => setShowSidebar(false)}
        />
      </div>
      
      <GroupChat
        selectedGroup={selectedGroup}
        onGroupUpdate={loadGroups}
        onToggleSidebar={toggleSidebar}
        showSidebar={showSidebar}
      />

      <GroupJoinModal
        open={openJoin}
        onClose={() => setOpenJoin(false)}
        joinName={joinName}
        setJoinName={setJoinName}
        joinError={joinError}
        onJoin={handleJoinGroup}
        isLoading={isJoining}
      />

      <GroupCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        createData={createData}
        setCreateData={setCreateData}
        createError={createError}
        onCreate={handleCreateGroup}
        isLoading={isCreating}
      />
    </div>
  );
} 
import React, { useState, useEffect, useRef } from "react";
import { Avatar, Box, Divider, IconButton, Switch, Stack, Typography, Tooltip, Modal, CircularProgress } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { Nav_Buttons } from "../data";
import { Plus } from "@phosphor-icons/react";
import { styled } from '@mui/material/styles';
import useSettings from '../hooks/useSettings';
import { FiBookmark } from "react-icons/fi";
import { useSelector, useDispatch } from 'react-redux';
import { selectPlayer } from '../../redux/slices/player';
import { selectUser, fetchUser } from '../../redux/slices/getme';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import { keyframes } from '@mui/system';
import { UserInfo } from '../../account/UserInfo';
import NewPost from '../new-post/newpost';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsModal from '../../components/SettingsModal';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SearchIcon from '@mui/icons-material/Search';
import WalletModal from '../wallet/wallet';
import FavoritesPage from '../favorites/FavoritesPage';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { SmartToy as AIIcon } from '@mui/icons-material';
import AIChatModal from '../components/AIChatModal';

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 40,
  height: 20,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width:15,
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
    width:16,
    height:16,
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

const MenuBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '10px',
  boxShadow: '0 0 20px rgba(0,0,0,0.1)',
  width: '40px',
  padding: '8px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  animation: 'slideIn 0.3s ease-out',
  '@keyframes slideIn': {
    '0%': {
      opacity: 0,
      transform: 'scale(0.8) translateY(10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1) translateY(0)',
    }
  }
}));

const MenuIconButton = styled(IconButton)(({ theme }) => ({
  padding: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'scale(1.1)',
  }
}));

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlassBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(2px) saturate(180%)',
  border: '0.0625rem solid rgba(255, 255, 255, 0.8)',
  borderRadius: '2rem',
  padding: '1.25rem',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 4px 20px rgba(255, 255, 255, 0.3)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2rem',
    backdropFilter: 'blur(1px)',
    boxShadow: 'inset -10px -8px 0px -11px rgba(255, 255, 255, 1), inset 0px -9px 0px -8px rgba(255, 255, 255, 1)',
    opacity: 0.6,
    zIndex: -1,
    filter: 'blur(1px) drop-shadow(10px 4px 6px black) brightness(115%)',
    pointerEvents: 'none'
  }
}));

const StyledModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(3px)',
  animation: `${fadeIn} 0.15s ease-out forwards`,
});

const Sidebar = ({ showRightSidebar, setShowRightSidebar, setIsNewPostOpen, isNewPostOpen, onOpenSpotlight }) => {
  const theme = useMuiTheme();
  const { mode, onToggleMode } = useSettings();
  const [openFavoritesModal, setOpenFavoritesModal] = useState(false);
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const playerState = useSelector(selectPlayer) || {};
  const { currentTrack, isPlaying } = playerState;
  const sidebarRef = useRef(null);
  const [maxSidebarItems, setMaxSidebarItems] = useState(5);
  const userId = user?._id || '';
  const hasUserData = !!user && (user.username || user.email || user.fullName);
  const dispatch = useDispatch();
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [aiChatOpen, setAIChatOpen] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    console.log('user from redux:', user);
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(fetchUser());
    }
  }, [dispatch, user]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/auth/favorites', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavoritePosts(data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFavorites = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Для просмотра избранного нужно авторизоваться');
      return;
    }
    setOpenFavoritesModal(true);
  };

  const handleCloseFavorites = () => {
    setOpenFavoritesModal(false);
  };

  const removeFromFavorites = async (postId) => {
    try {
      await axios.delete(`/auth/favorites/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavoritePosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      alert('Не удалось удалить из избранного');
    }
  };

  // Универсальная функция для получения обложки (расширена)
  const getCover = (track) => {
    if (!track) return 'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large?v=v2&px=999';
    // Сначала coverImage
    if (track.coverImage) {
      if (track.coverImage.startsWith('/music/')) {
        return `https://atomglidedev.ru/uploads${track.coverImage}`;
      }
      if (track.coverImage.startsWith('/')) {
        return `https://atomglidedev.ru${track.coverImage}`;
      }
      if (track.coverImage.startsWith('http')) {
        return track.coverImage;
      }
      return track.coverImage;
    }
    // Потом cover
    if (track.cover) {
      if (track.cover.startsWith('/music/')) {
        return `https://atomglidedev.ru/uploads${track.cover}`;
      }
      if (track.cover.startsWith('/')) {
        return `https://atomglidedev.ru${track.cover}`;
      }
      if (track.cover.startsWith('http')) {
        return track.cover;
      }
      return track.cover;
    }
    return 'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large?v=v2&px=999';
  };

  const MiniPlayer = () => (
    currentTrack ? (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 1, width: '100%'
      }}>
        <Box
          sx={{
            width: 56, height: 56, borderRadius: 2, overflow: 'hidden', mb: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <img
            src={getCover(currentTrack)}
            alt={currentTrack.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <IconButton
          size="small"
          sx={{ mt: 0.5 }}
          onClick={() => {
            console.log('Mini player button clicked! Dispatching miniPlayerPlayPause event');
            window.dispatchEvent(new CustomEvent('miniPlayerPlayPause'));
          }}
        >
          {isPlaying ? <span style={{fontSize: 22}}>⏸</span> : <span style={{fontSize: 22}}>▶️</span>}
        </IconButton>
      </Box>
    ) : null
  );

  // Показывать мини-плеер в Sidebar на больших экранах, а на маленьких — только в меню
  const showMiniPlayer = !isMobile && window.innerHeight > 600;

  const sidebarElements = [
    { key: 'miniPlayer', node: <MiniPlayer key="miniPlayer" />, type: 'block' },
    { key: 'divider1', node: <Divider sx={{ width: '100%', backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} />, type: 'divider' },
    { key: 'nav', node: <>{Nav_Buttons.map((el) => (
      <IconButton
        sx={{ 
          width: "max-content", 
          color: mode === 'dark' ? "rgb(255, 255, 255)" : "rgb(102, 102, 102)",
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: mode === 'dark' ? theme.palette.primary.main : 'rgba(66, 66, 66, 0.75)',
            color: 'rgb(255, 255, 255)'
          }
        }}
        key={el.index}
        onClick={() => {
          handleNavigation(el.path);
        }}
      >
        {el.icon}
      </IconButton>
    ))}</>, type: 'block' },
    { key: 'divider2', node: <Divider sx={{ width: '100%', backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} />, type: 'divider' },
    { key: 'newpost', node: <IconButton
      key="newpost"
      sx={{ 
        width: "max-content", 
        color: mode === 'dark' ? "rgb(255, 255, 255)" : "rgb(102, 102, 102)",
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          backgroundColor: mode === 'dark' ? theme.palette.primary.main : 'rgba(66, 66, 66, 0.75)',
          color: 'rgb(255, 255, 255)'
        }
      }}
      onClick={() => setIsNewPostOpen(true)}
    >
      <Plus size={24} />
    </IconButton>, type: 'block' },
    { key: 'spotlight', node: <IconButton
      key="spotlight"
      sx={{ 
        width: "max-content", 
        color: mode === 'dark' ? "rgb(255, 255, 255)" : "rgb(102, 102, 102)",
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          backgroundColor: mode === 'dark' ? theme.palette.primary.main : 'rgba(66, 66, 66, 0.75)',
          color: 'rgb(255, 255, 255)'
        }
      }}
      onClick={() => {
        if (onOpenSpotlight) {
          onOpenSpotlight();
        }
      }}
    >
      <SearchIcon fontSize="medium" />
    </IconButton>, type: 'block' },
    { key: 'ai', node: <IconButton
      key="ai"
      sx={{ 
        width: "max-content", 
        color: mode === 'dark' ? "rgb(255, 255, 255)" : "rgb(102, 102, 102)",
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          backgroundColor: mode === 'dark' ? theme.palette.primary.main : 'rgba(66, 66, 66, 0.75)',
          color: 'rgb(255, 255, 255)'
        }
      }}
      onClick={() => setAIChatOpen(true)}
    >
      <AIIcon fontSize="medium" />
    </IconButton>, type: 'block' },
  ];

  // Определяем, сколько элементов помещается по реальной высоте Sidebar
  useEffect(() => {
    const updateMaxItems = () => {
      if (sidebarRef.current) {
        const sidebarHeight = sidebarRef.current.offsetHeight;
        // Примерная оценка: 1 элемент на 80px высоты (можно скорректировать)
        const items = Math.max(1, Math.floor((sidebarHeight - 120) / 80));
        setMaxSidebarItems(items);
        // ВРЕМЕННО: выводим в консоль
        // eslint-disable-next-line
        console.log('sidebarHeight:', sidebarHeight, 'maxSidebarItems:', items);
      }
    };
    updateMaxItems();
    window.addEventListener('resize', updateMaxItems);
    return () => window.removeEventListener('resize', updateMaxItems);
  }, []);

  // Логика: мини-плеер всегда в shown, если хватает места хотя бы на него
  let shown = [];
  let overflow = [];
  let blocksShown = 0;
  for (let i = 0; i < sidebarElements.length; i++) {
    const el = sidebarElements[i];
    if (el.type === 'block') {
      // Мини-плеер всегда в shown, если blocksShown === 0
      if (el.key === 'miniPlayer' && blocksShown === 0 && maxSidebarItems > 0) {
        shown.push(el);
        blocksShown++;
        continue;
      }
      if (blocksShown < maxSidebarItems) {
        shown.push(el);
        blocksShown++;
      } else {
        overflow = sidebarElements.slice(i);
        break;
      }
    } else {
      // Разделитель показываем только если до него был хотя бы один блок
      if (blocksShown > 0 && blocksShown <= maxSidebarItems) {
        shown.push(el);
      } else if (blocksShown > maxSidebarItems) {
        overflow.push(el);
      }
    }
  }

  // Скрываем Sidebar на мобильных
  if (isMobile) return null;

  return (
    <Box
      ref={sidebarRef}
      p={2}
      sx={{
        backgroundColor: mode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(255, 255, 255)',
        minWidth: "100px",
        height: "calc(100vh - 35px)",
        marginLeft: "15px",
        marginRight: "15px",
        marginTop: "15px",
        borderRadius: "5px",
        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: 'hidden',
        position: 'sticky',
        top: '15px',
      }}
    >
      {/* Логотип/аватарка в самом начале Sidebar */}
      <Box
        sx={{
          height: "44px",
          width: "44px",
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgb(255, 255, 255)',
          cursor: 'pointer',
          mb: 2,
          ml:1
        }}
        onClick={() => handleNavigation('/')}
      >
        <Avatar src='https://atomglidedev.ru/uploads/1746963814842-747665437.png' width={44} height={44}/>
      </Box>
      <Stack
        direction="column"
        alignItems="center"
        spacing={2}
        sx={{ 
          width: "100%", 
          flexGrow: 1, 
          minHeight: 0, 
          overflowY: "auto", 
          overflowX: "hidden",
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
        }}
      >
        {/* Все элементы Sidebar */}
        {shown.map(el => <React.Fragment key={el.key}>{el.node}</React.Fragment>)}
      </Stack>
      <Stack
        direction="column"
        alignItems="center"
        spacing={2}
        sx={{ width: "100%", flexShrink: 0 }}
      >
        {/* Аватарка в конце */}
        <Box sx={{ position: 'relative' }}>
          {userId ? (
            <Tooltip title={user?.username || 'Пользователь'}>
              <IconButton onClick={e => setAvatarMenuAnchor(e.currentTarget)}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: mode === 'dark' ? theme.palette.primary.main : 'rgb(25, 118, 210)'
                  }}
                  src={user?.avatarUrl ? `https://atomglidedev.ru${user.avatarUrl}` : undefined}
                >
                  {user && !user.avatarUrl ? user.username.charAt(0).toUpperCase() : null}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <UserInfo user={user} />
          )}
        </Box>
        <Menu
          anchorEl={avatarMenuAnchor}
          open={Boolean(avatarMenuAnchor)}
          onClose={() => setAvatarMenuAnchor(null)}
        >
          <MenuItem onClick={() => { setAvatarMenuAnchor(null); navigate(`/account/profile/${userId}`); }}>Открыть профиль</MenuItem>
          <MenuItem onClick={() => { setAvatarMenuAnchor(null); setSettingsOpen(true); }}>Настройки</MenuItem>
          <MenuItem onClick={() => { setAvatarMenuAnchor(null); setWalletOpen(true); }}>Кошелек</MenuItem>
          <MenuItem onClick={() => { setAvatarMenuAnchor(null); setOpenFavoritesModal(true); }}>Избранное</MenuItem>
          <MenuItem onClick={() => { setAvatarMenuAnchor(null); setAIChatOpen(true); }}>AI Chat</MenuItem>
          <MenuItem>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">
                {mode === 'dark' ? '🌙' : '☀️'}
              </Typography>
              <Typography variant="body2">
                {mode === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
              </Typography>
              <AntSwitch
                checked={mode === 'dark'}
                onChange={() => { onToggleMode(); setAvatarMenuAnchor(null); }}
                inputProps={{ 'aria-label': 'theme switch' }}
              />
            </Stack>
          </MenuItem>
        </Menu>
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
        <AIChatModal open={aiChatOpen} onClose={() => setAIChatOpen(false)} />
        {/* Новое модальное окно избранного */}
        <FavoritesPage 
          open={openFavoritesModal} 
          onClose={handleCloseFavorites} 
        />
      </Stack>
    </Box>
  );
};

export default Sidebar; 
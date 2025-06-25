import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as playerActions } from '../../redux/slices/player';
import axios from '../../axios';
import MusicItem from '../components/Music/MusicItem';
import MusicPlayer from '../components/Music/MusicPlayer';
import UploadDialog from '../components/Music/UploadDialog';
import MusicSettingsModal from '../components/Music/MusicSettingsModal';
import { Button, CircularProgress, Snackbar, Alert, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Typography as MuiTypography, IconButton, Tooltip } from '@mui/material';
import '../../style/work/work.scss';
import useSettings from '../hooks/useSettings';
import { Box, Typography, Grid } from '@mui/material';
import { Add as AddIcon, Info as InfoIcon, Settings as SettingsIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { 
  FaSpotify, 
  FaApple, 
  FaYoutube, 
  FaSoundcloud, 
  FaBandcamp,
  FaDeezer,
  FaAmazon,
  FaChromecast,
  FaBluetooth,
  FaWifi
} from 'react-icons/fa';
import { SiBeatport, SiMixcloud, SiTidal } from 'react-icons/si';
import { MdCast, MdCastConnected, MdBluetooth, MdBluetoothConnected } from 'react-icons/md';

const Music = () => {
  const dispatch = useDispatch();
  const { mode } = useSettings();
  const theme = useTheme();
  
  // Получаем состояние из Redux
  const reduxPlayer = useSelector(state => state.player);
  
  const [musicList, setMusicList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openStreamingInfo, setOpenStreamingInfo] = useState(false);
  const [openCastDialog, setOpenCastDialog] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castDevice, setCastDevice] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [newMusic, setNewMusic] = useState({
    title: '',
    artist: '',
    genre: 'Pop',
    album: '',
    lyrics: '',
    explicit: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const audioRef = useRef(null);
  const progressInterval = useRef(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef(null);
  const [shuffle, setShuffle] = useState(() => {
    const saved = localStorage.getItem('musicShuffle');
    return saved ? JSON.parse(saved) : false;
  });
  const [autoNext, setAutoNext] = useState(() => {
    const saved = localStorage.getItem('musicAutoNext');
    return saved ? JSON.parse(saved) : true;
  });
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const FETCH_CACHE_TIME = 30000; // 30 секунд кэширования
  const [lastFavoritesFetchTime, setLastFavoritesFetchTime] = useState(0);
  const FAVORITES_CACHE_TIME = 30000; // 30 секунд кэширования

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Список платформ для транслирования
  const streamingPlatforms = [
    {
      name: 'Spotify',
      icon: <FaSpotify />,
      description: 'Крупнейшая музыкальная платформа с миллионами слушателей',
      url: 'https://artists.spotify.com',
      color: '#1DB954'
    },
    {
      name: 'Apple Music',
      icon: <FaApple />,
      description: 'Премиум музыкальный сервис от Apple',
      url: 'https://artists.apple.com',
      color: '#FA243C'
    },
    {
      name: 'YouTube Music',
      icon: <FaYoutube />,
      description: 'Музыкальный сервис от Google с видео-контентом',
      url: 'https://music.youtube.com',
      color: '#FF0000'
    },
    {
      name: 'SoundCloud',
      icon: <FaSoundcloud />,
      description: 'Платформа для независимых музыкантов',
      url: 'https://soundcloud.com',
      color: '#FF7700'
    },
    {
      name: 'Bandcamp',
      icon: <FaBandcamp />,
      description: 'Платформа для прямой продажи музыки',
      url: 'https://bandcamp.com',
      color: '#629aa9'
    },
    {
      name: 'Deezer',
      icon: <FaDeezer />,
      description: 'Французский музыкальный стриминговый сервис',
      url: 'https://www.deezer.com',
      color: '#00C7F2'
    },
    {
      name: 'Amazon Music',
      icon: <FaAmazon />,
      description: 'Музыкальный сервис от Amazon',
      url: 'https://music.amazon.com',
      color: '#FF9900'
    },
    {
      name: 'Tidal',
      icon: <SiTidal />,
      description: 'Сервис с высоким качеством звука',
      url: 'https://tidal.com',
      color: '#000000'
    },
    {
      name: 'Beatport',
      icon: <SiBeatport />,
      description: 'Специализируется на электронной музыке',
      url: 'https://www.beatport.com',
      color: '#FF5722'
    },
    {
      name: 'Mixcloud',
      icon: <SiMixcloud />,
      description: 'Платформа для диджеев и радиошоу',
      url: 'https://www.mixcloud.com',
      color: '#314359'
    }
  ];

  // Функции для кастинга
  const handleCastClick = () => {
    setOpenCastDialog(true);
    scanForDevices();
  };

  const handleCloseCastDialog = () => {
    setOpenCastDialog(false);
  };

  const scanForDevices = () => {
    // Симуляция поиска устройств
    const mockDevices = [
      {
        id: 'chromecast-1',
        name: 'Living Room TV',
        type: 'chromecast',
        icon: <FaChromecast />,
        color: '#4285F4',
        description: 'Google Chromecast'
      },
      {
        id: 'airplay-1',
        name: 'Apple TV',
        type: 'airplay',
        icon: <FaApple />,
        color: '#000000',
        description: 'Apple AirPlay'
      },
      {
        id: 'bluetooth-1',
        name: 'JBL Flip 5',
        type: 'bluetooth',
        icon: <FaBluetooth />,
        color: '#0082FC',
        description: 'Bluetooth Speaker'
      },
      {
        id: 'wifi-1',
        name: 'Sonos One',
        type: 'wifi',
        icon: <FaWifi />,
        color: '#000000',
        description: 'WiFi Speaker'
      },
      {
        id: 'chromecast-2',
        name: 'Bedroom TV',
        type: 'chromecast',
        icon: <FaChromecast />,
        color: '#4285F4',
        description: 'Google Chromecast'
      }
    ];
    
    setAvailableDevices(mockDevices);
  };

  const connectToDevice = (device) => {
    setCastDevice(device);
    setIsCasting(true);
    setOpenCastDialog(false);
    
    // Симуляция подключения
    showSnackbar(`Подключено к ${device.name}`, 'success');
    
    // Если есть текущий трек, отправляем его на устройство
    if (currentTrack) {
      castCurrentTrack(device);
    }
  };

  const disconnectFromDevice = () => {
    setIsCasting(false);
    setCastDevice(null);
    showSnackbar('Отключено от устройства', 'info');
  };

  const castCurrentTrack = (device) => {
    if (!currentTrack) return;
    
    const trackUrl = `https://atomglidedev.ru/uploads/${currentTrack.filePath.replace(/^\/+/,'')}`;
    
    // Симуляция отправки трека на устройство
    console.log(`Кастинг ${currentTrack.title} на ${device.name}`);
    console.log(`URL: ${trackUrl}`);
    
    showSnackbar(`Отправлено на ${device.name}`, 'success');
  };

  const handleDeviceClick = (device) => {
    if (isCasting && castDevice?.id === device.id) {
      disconnectFromDevice();
    } else {
      connectToDevice(device);
    }
  };

  const handleStreamingInfoClick = () => {
    setOpenStreamingInfo(true);
  };

  const handleCloseStreamingInfo = () => {
    setOpenStreamingInfo(false);
  };

  const handlePlatformClick = (url) => {
    window.open(url, '_blank');
  };

  // Функции для модального окна настроек
  const handleSettingsClick = () => {
    setOpenSettingsModal(true);
  };

  const handleCloseSettingsModal = () => {
    setOpenSettingsModal(false);
  };

  const handleSettingsChange = (newSettings) => {
    setAutoNext(newSettings.autoNext);
    setShuffle(newSettings.shuffle);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('musicAutoNext', JSON.stringify(autoNext));
    localStorage.setItem('musicShuffle', JSON.stringify(shuffle));
    showSnackbar('Настройки сохранены', 'success');
    setOpenSettingsModal(false);
  };

  useEffect(() => {
    fetchMusic();
    fetchFavorites();
  }, []);

  // Синхронизация с Redux состоянием
  useEffect(() => {
    if (reduxPlayer.currentTrack && reduxPlayer.currentTrack !== currentTrack) {
      setCurrentTrack(reduxPlayer.currentTrack);
    }
    if (reduxPlayer.isPlaying !== isPlaying) {
      setIsPlaying(reduxPlayer.isPlaying);
    }
    if (reduxPlayer.audioRef && reduxPlayer.audioRef !== audioRef.current) {
      audioRef.current = reduxPlayer.audioRef;
    }
  }, [reduxPlayer, currentTrack, isPlaying]);

  // Сохраняем настройки в localStorage
  useEffect(() => {
    localStorage.setItem('musicShuffle', JSON.stringify(shuffle));
  }, [shuffle]);

  useEffect(() => {
    localStorage.setItem('musicAutoNext', JSON.stringify(autoNext));
  }, [autoNext]);

  // Обработчики для управления музыкой через уведомления
  useEffect(() => {
    const handleMusicControl = (event) => {
      const { action } = event.detail;
      
      switch (action) {
        case 'play_pause':
          togglePlayPause();
          break;
        case 'next':
          playNextAuto();
          break;
        case 'previous':
          playPrevious();
          break;
        default:
          break;
      }
    };

    // Обработчик для мини-плеера в сайдбаре
    const handleMiniPlayerPlayPause = () => {
      console.log('Mini player play/pause button clicked!');
      console.log('Current state before toggle:', { isPlaying, currentTrack: currentTrack?.title });
      togglePlayPause();
    };

    window.addEventListener('musicControl', handleMusicControl);
    window.addEventListener('miniPlayerPlayPause', handleMiniPlayerPlayPause);
    
    return () => {
      window.removeEventListener('musicControl', handleMusicControl);
      window.removeEventListener('miniPlayerPlayPause', handleMiniPlayerPlayPause);
    };
  }, [currentTrack, isPlaying, musicList, shuffle]);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime / audioRef.current.duration || 0);
        }
      }, 1000);
    } else {
      clearInterval(progressInterval.current);
    }
    return () => clearInterval(progressInterval.current);
  }, [isPlaying]);

  const fetchMusic = async (force = false) => {
    const now = Date.now();
    
    // Проверяем, нужно ли обновлять данные
    if (!force && now - lastFetchTime < FETCH_CACHE_TIME) {
      console.log('📥 Используем кэшированные данные музыки');
      return;
    }
    
    try {
      setLoading(true);
      console.log('📥 Загрузка списка музыки...');
      const { data } = await axios.get('/music');
      console.log('📥 Получена музыка:', data);
      setMusicList(data);
      setLastFetchTime(now);
      setLoading(false);
    } catch (err) {
      console.error('❌ Ошибка при загрузке музыки:', err);
      setLoading(false);
      showSnackbar('Ошибка при загрузке музыки', 'error');
    }
  };

  const fetchFavorites = async (force = false) => {
    const now = Date.now();
    
    // Проверяем, нужно ли обновлять данные
    if (!force && now - lastFavoritesFetchTime < FAVORITES_CACHE_TIME) {
      console.log('📥 Используем кэшированные данные избранного');
      return;
    }
    
    try {
      const { data } = await axios.get('/music/favorites');
      console.log('📥 Получены избранные треки:', data);
      setFavorites(data);
      setLastFavoritesFetchTime(now);
    } catch (err) {
      console.error('❌ Ошибка при загрузке избранного:', err);
    }
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
  };

  const handleCoverChange = (file) => {
    setSelectedCover(file);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMusic(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpload = async (formData) => {
    try {
      setUploading(true);
      console.log('📤 Начинаем загрузку трека...');
      
      const response = await axios.post('/music/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📤 Прогресс загрузки: ${percentCompleted}%`);
        },
      });

      console.log('📤 Загрузка завершена:', response.data);
      showSnackbar('Трек успешно загружен!', 'success');
      
      // Сбрасываем кэш и обновляем список
      setLastFetchTime(0);
      await fetchMusic(true);
      
      // Сбрасываем форму
      resetForm();
      setOpenUploadDialog(false);
    } catch (error) {
      console.error('❌ Ошибка при загрузке:', error);
      let errorMessage = 'Ошибка при загрузке трека';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewMusic({
      title: '',
      artist: '',
      genre: 'Pop',
      album: '',
      lyrics: '',
      explicit: false
    });
    setSelectedFile(null);
    setSelectedCover(null);
  };

  const checkAudioAvailability = async (filePath) => {
    try {
      const audioUrl = `https://atomglidedev.ru/uploads/${filePath.replace(/^\/+/,'')}`;
      const response = await fetch(audioUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Audio availability check failed:', error);
      return false;
    }
  };

  const playMusic = async (music) => {
    try {
      if (currentTrack?._id === music._id && isPlaying) {
        showSnackbar('Эта песня уже играет', 'info');
        return;
      }

      if (currentTrack?._id === music._id && !isPlaying) {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
          dispatch(playerActions.setIsPlaying(true));
        }
        return;
      }

      dispatch(playerActions.setLoading(true));
      dispatch(playerActions.clearError());
      
      // Очищаем предыдущий аудио элемент
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      const audioUrl = `https://atomglidedev.ru/uploads/${music.filePath.replace(/^\/+/,'')}`;
      console.log('Loading audio from:', audioUrl);
      
      const audio = new Audio();
      audioRef.current = audio;
      audio.preload = 'metadata';

      // Обработчики событий
      audio.onerror = (e) => {
        console.error('Audio error event:', e);
        console.error('Audio error details:', audio.error);
        let errorMessage = 'Неизвестная ошибка';
        
        if (audio.error) {
          switch (audio.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Воспроизведение было прервано';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Ошибка сети при загрузке аудио';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Ошибка декодирования аудио';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Формат аудио не поддерживается';
              break;
            default:
              errorMessage = `Ошибка воспроизведения: ${audio.error.message || 'Неизвестная ошибка'}`;
          }
        }
        
        dispatch(playerActions.setError(errorMessage));
        showSnackbar(errorMessage, 'error');
        setIsPlaying(false);
        dispatch(playerActions.setIsPlaying(false));
        dispatch(playerActions.setLoading(false));
      };

      audio.onended = () => {
        console.log('Audio ended');
        setIsPlaying(false);
        dispatch(playerActions.setIsPlaying(false));
        setProgress(0);
        
        // Автоматически переключаемся на следующий трек (если включено)
        if (autoNext) {
          playNextAuto();
        }
      };

      audio.oncanplaythrough = () => {
        console.log('Audio can play through');
        dispatch(playerActions.setLoading(false));
      };

      audio.onloadedmetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
      };

      audio.onpause = () => {
        console.log('Audio paused');
        setIsPlaying(false);
        dispatch(playerActions.setIsPlaying(false));
      };
      
      audio.onplay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
        dispatch(playerActions.setIsPlaying(true));
        dispatch(playerActions.setLoading(false));
      };

      // Устанавливаем источник и пытаемся воспроизвести
      audio.src = audioUrl;
      audio.load();

      // Ждем немного для загрузки метаданных
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout loading audio'));
        }, 15000); // Увеличиваем таймаут до 15 секунд

        audio.oncanplay = () => {
          clearTimeout(timeout);
          resolve();
        };

        audio.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Audio loading failed'));
        };
      });

      await audio.play();
      setIsPlaying(true);
      setCurrentTrack(music);
      dispatch(playerActions.setCurrentTrack(music));
      dispatch(playerActions.setIsPlaying(true));
      dispatch(playerActions.setAudioRef(audio));
      dispatch(playerActions.setLoading(false));
      
    } catch (err) {
      console.error('Play failed:', err);
      let errorMessage = 'Не удалось воспроизвести трек';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Воспроизведение заблокировано браузером. Разрешите автовоспроизведение.';
      } else if (err.message.includes('Timeout')) {
        errorMessage = 'Трек не загрузился за отведенное время';
      } else if (err.message.includes('Audio loading failed')) {
        errorMessage = 'Ошибка загрузки аудиофайла';
      } else {
        errorMessage = `Не удалось воспроизвести: ${err.message}`;
      }
      
      dispatch(playerActions.setError(errorMessage));
      showSnackbar(errorMessage, 'error');
      setIsPlaying(false);
      dispatch(playerActions.setIsPlaying(false));
      dispatch(playerActions.setLoading(false));
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      console.log('No audio reference available');
      return;
    }
    
    console.log('Toggle play/pause called, current state:', isPlaying);
    
    if (isPlaying) {
      console.log('Pausing audio...');
      audioRef.current.pause();
      setIsPlaying(false);
      dispatch(playerActions.setIsPlaying(false));
    } else {
      console.log('Playing audio...');
      audioRef.current.play().then(() => {
        console.log('Audio play started successfully');
        setIsPlaying(true);
        dispatch(playerActions.setIsPlaying(true));
      }).catch((err) => {
        console.error('Audio play failed:', err);
        showSnackbar('Не удалось воспроизвести трек', 'error');
      });
    }
  };

  const handleProgressChange = (newProgress) => {
    if (!audioRef.current) return;
    
    setProgress(newProgress);
    audioRef.current.currentTime = newProgress * audioRef.current.duration;
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const playNext = () => {
    if (!currentTrack || musicList.length === 0) return;
    const currentIndex = musicList.findIndex(item => item._id === currentTrack._id);
    let nextIndex;
    if (shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * musicList.length);
      } while (nextIndex === currentIndex && musicList.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % musicList.length;
    }
    
    const nextTrack = musicList[nextIndex];
    
    // Показываем уведомление о следующем треке
    if (window.showNextTrackNotification) {
      window.showNextTrackNotification(nextTrack);
    }
    
    playMusic(nextTrack);
  };

  const playNextAuto = () => {
    if (autoNext) {
      playNext();
    }
  };

  const playPrevious = () => {
    if (!currentTrack || musicList.length === 0) return;
    
    const currentIndex = musicList.findIndex(item => item._id === currentTrack._id);
    const prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    const prevTrack = musicList[prevIndex];
    
    // Показываем уведомление о предыдущем треке
    if (window.showNextTrackNotification) {
      window.showNextTrackNotification(prevTrack);
    }
    
    playMusic(prevTrack);
  };

  const addToFavorites = async (musicId) => {
    try {
      const { data } = await axios.post(`/music/${musicId}/favorite`);
      console.log('📥 Добавлено в избранное:', data);
      
      // Обновляем локальное состояние
      setFavorites(prev => {
        const newFavorites = [...prev];
        if (!newFavorites.includes(musicId)) {
          newFavorites.push(musicId);
        }
        return newFavorites;
      });
      
      // Сбрасываем кэш избранного
      setLastFavoritesFetchTime(0);
      
      showSnackbar('Добавлено в избранное', 'success');
    } catch (err) {
      console.error('❌ Ошибка при добавлении в избранное:', err);
      showSnackbar('Ошибка при добавлении в избранное', 'error');
    }
  };

  const removeFromFavorites = async (musicId) => {
    try {
      const { data } = await axios.delete(`/music/${musicId}/favorite`);
      console.log('📥 Удалено из избранного:', data);
      
      // Обновляем локальное состояние
      setFavorites(prev => prev.filter(id => id !== musicId));
      
      // Сбрасываем кэш избранного
      setLastFavoritesFetchTime(0);
      
      showSnackbar('Удалено из избранного', 'success');
    } catch (err) {
      console.error('❌ Ошибка при удалении из избранного:', err);
      showSnackbar('Ошибка при удалении из избранного', 'error');
    }
  };

  const toggleFavorite = async (musicId) => {
    const isFavorite = favorites.includes(musicId);
    
    if (isFavorite) {
      await removeFromFavorites(musicId);
    } else {
      await addToFavorites(musicId);
    }
  };

  const filteredMusicList = useMemo(() => {
    return musicList.filter(track =>
      track.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      track.artist.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [musicList, debouncedSearch]);

  // Отладочная информация
  const debugInfo = {
    currentTrack: currentTrack?.title || 'Нет',
    isPlaying,
    audioDuration: audioRef.current?.duration || 'Неизвестно',
    audioCurrentTime: audioRef.current?.currentTime || 'Неизвестно',
    audioReadyState: audioRef.current?.readyState || 'Неизвестно',
    audioNetworkState: audioRef.current?.networkState || 'Неизвестно'
  };

  // Дебаунсинг для поиска
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: mode === 'dark' ? 'rgb(18, 18, 18)' : 'rgb(255, 255, 255)'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      className="mu"
      sx={{
        backgroundColor: mode === 'dark' ? 'rgb(18, 18, 18)' : 'rgb(255, 255, 255)',
        minHeight: '100vh',
        padding: '20px',
        color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        paddingBottom: currentTrack ? '100px' : '20px'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'
          }}
        >
          AtomGlude Music
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
      
     
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleSettingsClick}
            sx={{
              borderColor: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)',
              color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)',
              '&:hover': {
                borderColor: mode === 'dark' ? 'rgb(100, 181, 246)' : 'rgb(21, 101, 192)',
                backgroundColor: mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            Настройки
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenUploadDialog(true)}
            sx={{
              backgroundColor: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)',
              color: 'rgb(255, 255, 255)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgb(100, 181, 246)' : 'rgb(21, 101, 192)'
              }
            }}
          >
            Upload Track
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, maxWidth: 400 }}>
        <SearchIcon sx={{ mr: 1 }} />
        <input
          type="text"
          placeholder="Поиск по названию или исполнителю..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16
          }}
        />
      </Box>

      {musicList.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: 2
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: mode === 'dark' ? 'rgb(176, 176, 176)' : 'rgb(102, 102, 102)'
            }}
          >
            No tracks available
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenUploadDialog(true)}
            sx={{
              borderColor: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)',
              color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)',
              '&:hover': {
                borderColor: mode === 'dark' ? 'rgb(100, 181, 246)' : 'rgb(21, 101, 192)',
                backgroundColor: mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.1)'
              }
            }}
          >
            Upload Your First Track
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          flexGrow: 1, 
          p: 3,
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            flexGrow: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(240, 240, 240)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? 'rgb(70, 70, 70)' : 'rgb(200, 200, 200)',
              borderRadius: '4px',
              '&:hover': {
                background: mode === 'dark' ? 'rgb(90, 90, 90)' : 'rgb(180, 180, 180)',
              },
            },
          }}>
            <Grid container spacing={2}>
              {filteredMusicList.map((track) => (
                <Grid item xs={2.4} key={track._id}>
                  <MusicItem
                    item={track}
                    onPlay={playMusic}
                    isCurrent={currentTrack?._id === track._id}
                    isPlaying={isPlaying}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.includes(track._id)}
                    showArtist={true}
                    mode={mode}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {currentTrack && (
        <MusicPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          mode={mode}
          onPlayPause={togglePlayPause}
          onNext={playNext}
          onPrevious={playPrevious}
          progress={progress}
          onProgressChange={handleProgressChange}
          audioRef={audioRef}
          isCasting={isCasting}
          castDevice={castDevice}
        />
      )}

      <UploadDialog
        openUploadDialog={openUploadDialog}
        setOpenUploadDialog={setOpenUploadDialog}
        handleUpload={handleUpload}
        handleFileChange={handleFileChange}
        handleCoverChange={handleCoverChange}
        handleInputChange={handleInputChange}
        newMusic={newMusic}
        selectedFile={selectedFile}
        selectedCover={selectedCover}
        uploading={uploading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            backgroundColor: mode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(255, 255, 255)',
            color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Модальное окно с информацией о платформах */}
      <Dialog
        open={openStreamingInfo}
        onClose={handleCloseStreamingInfo}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: mode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(255, 255, 255)',
            color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${mode === 'dark' ? 'rgb(60, 60, 60)' : 'rgb(200, 200, 200)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <InfoIcon sx={{ color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)' }} />
          Где транслировать вашу музыку
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <MuiTypography variant="body2" sx={{ mb: 3, color: mode === 'dark' ? 'rgb(176, 176, 176)' : 'rgb(102, 102, 102)' }}>
            Выберите платформу для размещения вашей музыки. Каждая платформа имеет свои особенности и аудиторию.
          </MuiTypography>
          <List sx={{ p: 0 }}>
            {streamingPlatforms.map((platform, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handlePlatformClick(platform.url)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  border: `1px solid ${mode === 'dark' ? 'rgb(60, 60, 60)' : 'rgb(200, 200, 200)'}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgb(50, 50, 50)' : 'rgb(240, 240, 240)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: platform.color,
                  fontSize: '24px',
                  minWidth: '40px'
                }}>
                  {platform.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiTypography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'
                    }}>
                      {platform.name}
                    </MuiTypography>
                  }
                  secondary={
                    <MuiTypography variant="body2" sx={{ 
                      color: mode === 'dark' ? 'rgb(176, 176, 176)' : 'rgb(102, 102, 102)',
                      mt: 0.5
                    }}>
                      {platform.description}
                    </MuiTypography>
                  }
                />
                <MuiTypography variant="caption" sx={{ 
                  color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)',
                  fontSize: '12px'
                }}>
                  Перейти →
                </MuiTypography>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${mode === 'dark' ? 'rgb(60, 60, 60)' : 'rgb(200, 200, 200)'}`,
          p: 2
        }}>
          <Button 
            onClick={handleCloseStreamingInfo}
            sx={{
              color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)'
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно для кастинга на устройства */}
      <Dialog
        open={openCastDialog}
        onClose={handleCloseCastDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: mode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(255, 255, 255)',
            color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${mode === 'dark' ? 'rgb(60, 60, 60)' : 'rgb(200, 200, 200)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <MdCast sx={{ color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)' }} />
          Кастинг на устройства
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <MuiTypography variant="body2" sx={{ mb: 3, color: mode === 'dark' ? 'rgb(176, 176, 176)' : 'rgb(102, 102, 102)' }}>
            Выберите устройство для воспроизведения музыки
          </MuiTypography>
          
          {isCasting && castDevice && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: 1, 
              backgroundColor: mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
              border: `1px solid ${mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`
            }}>
              <MuiTypography variant="subtitle2" sx={{ color: '#4CAF50', mb: 1 }}>
                Подключено к:
              </MuiTypography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: castDevice.color, fontSize: '20px' }}>
                  {castDevice.icon}
                </Box>
                <MuiTypography variant="body1" sx={{ fontWeight: 600 }}>
                  {castDevice.name}
                </MuiTypography>
              </Box>
            </Box>
          )}
          
          <List sx={{ p: 0 }}>
            {availableDevices.map((device) => (
              <ListItem
                key={device.id}
                button
                onClick={() => handleDeviceClick(device)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  border: `1px solid ${mode === 'dark' ? 'rgb(60, 60, 60)' : 'rgb(200, 200, 200)'}`,
                  transition: 'all 0.2s',
                  backgroundColor: isCasting && castDevice?.id === device.id 
                    ? (mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgb(50, 50, 50)' : 'rgb(240, 240, 240)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: device.color,
                  fontSize: '24px',
                  minWidth: '40px'
                }}>
                  {device.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiTypography variant="h6" sx={{ 
                      fontWeight: 600,
                      color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'
                    }}>
                      {device.name}
                    </MuiTypography>
                  }
                  secondary={
                    <MuiTypography variant="body2" sx={{ 
                      color: mode === 'dark' ? 'rgb(176, 176, 176)' : 'rgb(102, 102, 102)',
                      mt: 0.5
                    }}>
                      {device.description}
                    </MuiTypography>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isCasting && castDevice?.id === device.id ? (
                    <>
                      <MuiTypography variant="caption" sx={{ 
                        color: '#4CAF50',
                        fontSize: '12px'
                      }}>
                        Подключено
                      </MuiTypography>
                      <MdCastConnected style={{ color: '#4CAF50' }} />
                    </>
                  ) : (
                    <>
                      <MuiTypography variant="caption" sx={{ 
                        color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)',
                        fontSize: '12px'
                      }}>
                        Подключиться
                      </MuiTypography>
                      <MdCast style={{ 
                        color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)',
                        fontSize: '16px'
                      }} />
                    </>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${mode === 'dark' ? 'rgb(60, 60, 60)' : 'rgb(200, 200, 200)'}`,
          p: 2
        }}>
          <Button 
            onClick={handleCloseCastDialog}
            sx={{
              color: mode === 'dark' ? 'rgb(144, 202, 249)' : 'rgb(25, 118, 210)'
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно для настроек музыки */}
      <MusicSettingsModal
        open={openSettingsModal}
        onClose={handleCloseSettingsModal}
        settings={{ autoNext, shuffle }}
        onSettingsChange={handleSettingsChange}
        onSave={handleSaveSettings}
        debugInfo={debugInfo}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onNext={playNext}
        onPrevious={playPrevious}
        onReloadAudio={() => currentTrack && playMusic(currentTrack)}
      />
    </Box>
  );
};

export default Music;
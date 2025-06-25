import React, { useState, useEffect, useRef } from 'react';
import { 
  SkipPrevious, 
  SkipNext, 
  PlayArrow, 
  Pause, 
  VolumeUp, 
  VolumeOff,
  HighQuality,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import { SiDolby } from "react-icons/si";
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdFullscreenExit } from 'react-icons/md';
import './MusicPlayerFullscreen.scss';
import { useDispatch } from 'react-redux';
import { actions as playerActions } from '../../../redux/slices/player';
import { Snackbar, Alert } from '@mui/material';
import useSettings from '../../hooks/useSettings';

const SIDEBAR_WIDTH = 240; // px, если у вас другая ширина — поменяйте здесь

const MusicPlayer = ({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious, 
  progress, 
  volume, 
  onProgressChange,
  onVolumeChange
}) => {
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [coverImage, setCoverImage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dolbySnackbar, setDolbySnackbar] = useState(false);
  const progressRef = useRef(null);
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const dispatch = useDispatch();
  const { mode } = useSettings();

  const formatTime = (seconds) => {
    const secs = Math.floor(seconds || 0);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const getCoverImageUrl = (track) => {
    if (!track) return '';
    
    try {
      if (track.coverImage) {
        const cleanPath = track.coverImage
          .replace(/^\/+/, '')
          .replace(/\/+/g, '/');
        return `https://atomglidedev.ru/uploads/${cleanPath}`;
      }
      return track.image || "https://via.placeholder.com/150";
    } catch (err) {
      console.error('Error processing cover image:', err);
      return "https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large?v=v2&px=999";
    }
  };

  useEffect(() => {
    if (currentTrack) {
      const newCoverUrl = getCoverImageUrl(currentTrack);
      setCoverImage(newCoverUrl);

      // Очищаем предыдущий аудио элемент
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      const audio = new Audio();
      audioRef.current = audio;

      const audioUrl = `https://atomglidedev.ru/uploads/${currentTrack.filePath.replace(/^\/+/,'')}`;
      audio.src = audioUrl;
      audio.preload = 'metadata';

      const handleLoadedMetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(formatTime(audio.duration));
        }
      };

      const handleCanPlay = () => {
        console.log('Audio can play, duration:', audio.duration);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(formatTime(audio.duration));
        }
      };

      const handleTimeUpdate = () => {
        if (audio.currentTime && !isNaN(audio.currentTime)) {
          setCurrentTime(formatTime(audio.currentTime));
        }
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(formatTime(audio.duration));
        }
        if (typeof onProgressChange === 'function' && audio.duration) {
          onProgressChange(audio.currentTime / audio.duration);
        }
      };

      const handleEnded = () => {
        console.log('Audio ended');
        if (typeof onNext === 'function') {
          onNext();
        }
      };

      const handleError = (e) => {
        console.error('Audio error event:', e);
        console.error('Audio error details:', audio.error);
        console.error('Audio src:', audio.src);
        console.error('Audio networkState:', audio.networkState);
        console.error('Audio readyState:', audio.readyState);
        setDuration('0:00');
        setCurrentTime('0:00');
      };

      const handleLoadStart = () => {
        console.log('Audio load started for:', audio.src);
        setDuration('0:00');
        setCurrentTime('0:00');
      };

      const handleLoadedData = () => {
        console.log('Audio data loaded, duration:', audio.duration);
        console.log('Audio readyState:', audio.readyState);
        console.log('Audio networkState:', audio.networkState);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(formatTime(audio.duration));
        }
      };

      // Добавляем все обработчики событий
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Пытаемся загрузить метаданные
      audio.load();

      return () => {
        // Удаляем все обработчики событий
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        
        // Очищаем аудио
        audio.pause();
        audio.src = '';
      };
    }
  }, [currentTrack, onNext, onProgressChange]);

  // Дополнительная проверка длительности
  useEffect(() => {
    if (currentTrack && audioRef.current && duration === '0:00') {
      const checkDuration = () => {
        if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          setDuration(formatTime(audioRef.current.duration));
        }
      };
      
      // Проверяем несколько раз с интервалом
      const interval = setInterval(checkDuration, 1000);
      const timeout = setTimeout(() => clearInterval(interval), 10000); // Останавливаем через 10 секунд
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentTrack, duration]);

  const handleProgressClick = (e) => {
    if (!progressRef.current || !audioRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const newProgress = Math.max(0, Math.min(1, clickPos));
    
    if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = newProgress * audioRef.current.duration;
      if (typeof onProgressChange === 'function') {
        onProgressChange(newProgress);
      }
    }
  };

  const toggleFullscreen = () => setIsFullscreen(f => !f);

  // Глобальный обработчик для мини-плеера
  useEffect(() => {
    const handler = () => {
      if (isPlaying) {
        onPlayPause && onPlayPause();
        dispatch(playerActions.setIsPlaying(false));
      } else {
        onPlayPause && onPlayPause();
        dispatch(playerActions.setIsPlaying(true));
      }
    };
    window.addEventListener('miniPlayerPlayPause', handler);
    return () => window.removeEventListener('miniPlayerPlayPause', handler);
  }, [isPlaying, onPlayPause, dispatch]);

  const handleDolbyClick = () => {
    setDolbySnackbar(true);
  };

  if (!currentTrack) return null;

  // Новый fullscreen layout
  if (isFullscreen) {
    return (
      // Корневой контейнер полноэкранного плеера
      <div className="music-player fullscreen">
        {/* Значок Dolby Atmos в левом верхнем углу */}
        <div className="dolby-badge">
          <SiDolby className="dolby-icon" /> {/* Иконка Dolby */}
          <span>Dolby Atmos</span> {/* Текстовый бейдж */}
        </div>
        {/* Кнопка выхода из полноэкранного режима в правом нижнем углу */}
        <button
          className="fullscreen-close-btn"
          onClick={toggleFullscreen} // Обработчик выхода из fullscreen
          title="Выйти из полноэкранного режима"
        >
          <MdFullscreenExit size={32} /> {/* Иконка выхода */}
        </button>
        {/* Основной контент: обложка и информация */}
        <div className="fullscreen-content">
          {/* Левая часть: обложка с отражением (винил) */}
          <div className="fullscreen-cover-block">
            <div className="fullscreen-cover-vinyl">
              <img
                src={coverImage} // Ссылка на обложку трека
                alt="Cover"
                className="fullscreen-cover-img"
                style={{ transform: 'perspective(600px) rotateY(10deg)' }} // 3D-эффект в другую сторону
                onError={e => {
                  e.target.src = "https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large?v=v2&px=999";
                }}
              />
              <div className="fullscreen-cover-reflection" /> {/* Отражение под обложкой */}
            </div>
          </div>
          {/* Правая часть: информация о треке */}
          <div className="fullscreen-info-block">
            <div className="fullscreen-title">{currentTrack.title}!</div> {/* Название трека */}
            <div className="fullscreen-artist">{currentTrack.artist}</div> {/* Исполнитель */}
          </div>
        </div>

        
      
      </div>
    );
  }

  return (
    <motion.div
      className={`music-player ${isFullscreen ? 'fullscreen' : ''}`}
      ref={playerRef}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      style={{
        '--bg-image': `url(${coverImage})`,
        left: SIDEBAR_WIDTH, // отступ слева для сайдбара
        width: `calc(100vw - ${SIDEBAR_WIDTH}px)`, // ширина без сайдбара
        position: 'fixed',
        bottom: 0,
        zIndex: 1200,
      }}
    >
      {/* FULLSCREEN BACKDROP */}
      {isFullscreen && <div className="fullscreen-backdrop" />}
      {/* Dolby & HQ Badges */}
      {isFullscreen && (
        <>
          <motion.div
            className="audio-badge left-top"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SiDolby className="dolby-icon" />
            <span>Dolby Atmos</span>
          </motion.div>
          <motion.div
            className="audio-badge right-top"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <HighQuality className="hq-icon" />
            <span>High Quality</span>
          </motion.div>
        </>
      )}
      {/* Основной контент плеера */}
      <div className={`player-track-info ${isFullscreen ? 'fullscreen' : ''}`}>
        <AnimatePresence>
          {coverImage && (
            <motion.div
              key="cover"
              className={`cover-container${isFullscreen ? ' fullscreen' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              layoutId="player-cover"
            >
              <div className="cover-shadow" />
              <img
                src={coverImage}
                alt="Cover"
                className={`player-cover${isFullscreen ? ' fullscreen' : ''}`}
                onError={(e) => {
                  e.target.src = "https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large?v=v2&px=999";
                }}
              />
              <div className="cover-reflection" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className={`player-info${isFullscreen ? ' fullscreen' : ''}`}>
          <motion.h3
            className={`player-title${isFullscreen ? ' fullscreen' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {currentTrack.title}!
          </motion.h3>
          <motion.p
            className={`player-artist${isFullscreen ? ' fullscreen' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {currentTrack.artist}
          </motion.p>
        </div>
      </div>
      <div className={`player-controls ${isFullscreen ? 'fullscreen' : ''}`}> 
        <motion.button 
          className="player-btn" 
          onClick={onPrevious}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SkipPrevious />
        </motion.button>
        <motion.button 
          className="player-btn play-btn" 
          onClick={onPlayPause}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </motion.button>
        <motion.button 
          className="player-btn" 
          onClick={onNext}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SkipNext />
        </motion.button>
      </div>
      <div className={`player-progress ${isFullscreen ? 'fullscreen' : ''}`}> 
        <span className="progress-time">{currentTime}</span>
        <div className="progress-bar" ref={progressRef} onClick={handleProgressClick}>
          <div
            className="progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="progress-thumb"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
        <span className="progress-time">{duration}</span>
      </div>
      <div className={`player-extra-controls ${isFullscreen ? 'fullscreen' : ''}`}> 
        <motion.button
          className="player-extra-btn"
          onClick={handleDolbyClick}
          title="Dolby Atmos"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SiDolby />
        </motion.button>
        <motion.button
          className="player-extra-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </motion.button>
      </div>
      <Snackbar
        open={dolbySnackbar}
        autoHideDuration={2000}
        onClose={() => setDolbySnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          Dolby Atmos выключен
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default MusicPlayer;

/*
CSS для fullscreen режима (скопируйте в MusicPlayer.css):
.music-player.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(10,10,20,0.7);
  overflow: hidden;
}
.fullscreen-backdrop {
  position: absolute;
  inset: 0;
  background: var(--bg-image) center/cover no-repeat;
  filter: blur(32px) brightness(0.5) saturate(1.2);
  z-index: 0;
  transition: filter 0.5s;
}
.cover-container.fullscreen {
  z-index: 2;
  margin-bottom: 18px;
  box-shadow: 0 0 64px 16px #fff8, 0 8px 32px #000a;
  border-radius: 32px;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  animation: glow 2s infinite alternate;
  display: flex;
  justify-content: center;
}
@keyframes glow {
  from { box-shadow: 0 0 32px 8px #fff4, 0 8px 32px #000a; }
  to   { box-shadow: 0 0 64px 24px #fff8, 0 8px 32px #000a; }
}
.player-cover.fullscreen {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 0 32px 8px #fff8;
}
.player-info.fullscreen {
  text-align: center;
  margin: 8px 0 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.player-title.fullscreen {
  font-size: 2.2rem;
  color: #fff;
  text-shadow: 0 0 16px #fff, 0 0 32px #0ff8;
  margin-bottom: 4px;
  margin-top: 0;
}
.player-artist.fullscreen {
  font-size: 1.2rem;
  color: #aaf;
  text-shadow: 0 0 8px #fff8;
  margin: 0;
}
.player-controls.fullscreen {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 36px;
  margin: 18px 0 10px 0;
  z-index: 2;
}
.player-btn {
  font-size: 2rem;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  filter: drop-shadow(0 0 8px #0ff8);
}
.player-btn.play-btn {
  font-size: 2.6rem;
  color: #0ff;
  filter: drop-shadow(0 0 16px #0ff8);
}
.player-progress.fullscreen {
  width: 50vw;
  max-width: 420px;
  margin: 10px auto 0 auto;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress-bar {
  height: 8px;
  background: #fff3;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  margin: 0 12px;
  flex: 1;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ff, #08f, #aaf);
  border-radius: 4px;
  transition: width 0.2s;
}
.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 6px #0ff8;
  left: 0;
  transition: left 0.2s;
}
.player-extra-controls.fullscreen {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 18px;
  z-index: 2;
}
.player-extra-btn {
  font-size: 1.5rem;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  filter: drop-shadow(0 0 8px #0ff8);
}
.player-extra-btn.active {
  color: #0ff;
  filter: drop-shadow(0 0 16px #0ff8);
}
.volume-control {
  position: absolute;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 90px;
  background: #222a;
  border-radius: 12px;
  display: flex;
  align-items: flex-end;
  z-index: 10;
  box-shadow: 0 0 12px #0ff8;
  padding: 6px 0;
}
.volume-bar {
  width: 8px;
  height: 100%;
  background: #fff2;
  border-radius: 6px;
  margin: 0 auto;
  position: relative;
  cursor: pointer;
}
.volume-fill {
  width: 100%;
  background: linear-gradient(180deg, #0ff, #08f, #aaf);
  border-radius: 6px;
  transition: height 0.2s;
  position: absolute;
  bottom: 0;
}
.audio-badge {
  position: absolute;
  top: 32px;
  padding: 8px 20px;
  border-radius: 24px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  box-shadow: 0 0 8px #0ff8;
}
.audio-badge.left-top { left: 32px; }
.audio-badge.right-top { right: 32px; }
.fullscreen-close-btn {
  position: absolute;
  right: 40px;
  bottom: 40px;
  z-index: 30;
  width: 56px;
  height: 56px;
  background: radial-gradient(circle at 60% 40%, #0ff8 0%, #222a 80%);
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0.85;
  border-radius: 50%;
  box-shadow: 0 4px 32px #0ff4, 0 2px 8px #0008;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}
.fullscreen-close-btn:hover {
  opacity: 1;
  transform: scale(1.12);
  box-shadow: 0 0 32px #0ffb, 0 2px 12px #000a;
}
.fullscreen-close-btn svg {
  color: #fff;
  filter: drop-shadow(0 0 8px #0ff8);
}
*/
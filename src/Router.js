import React, { useEffect, Suspense, lazy, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FullPost } from './apps/fullpost/FullPost';
import { SnackbarProvider } from 'notistack';
import { Box, Typography, Button } from '@mui/material';
import NewPost from './apps/new-post/newpost';
import Spotlight from './components/Spotlight';
import AdminPanel from './components/AdminPanel';

// Компонент-заглушка для мобильных устройств
const MobileMusicBlocked = () => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      p: 3
    }}>
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
        🎵
      </Typography>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        Музыка недоступна
      </Typography>
      <Typography variant="h6" sx={{ mb: 4, opacity: 0.8, maxWidth: 400 }}>
        Музыкальный раздел доступен только на десктопных устройствах
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={() => window.history.back()}
        sx={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)'
          }
        }}
      >
        Назад
      </Button>
    </Box>
  );
};

const PrivateRoute = ({ children }) => {
  const isAuth = useSelector(state => Boolean(state.auth.data));
  const status = useSelector(state => state.auth.status);
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (status === 'loading') {
    return <div style={{textAlign: 'center', marginTop: 100}}>Загрузка...</div>;
  }

  if ((!token && !isAuth) || status === 'failed') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const Header = lazy(() => import('./apps/header/header'));
const Menu = lazy(() => import('./apps/menu/Menu'));
const MenuMusic = lazy(() => import('./apps/menu/Menu-music'));
const Music = lazy(() => import('./apps/main/music'));
const Work = lazy(() => import('./apps/main/work'));
const PopularMusic = lazy(() => import('./apps/main/PopularMusic'));
const SettingsPage = lazy(() => import('./apps/setting/setting'));
const LocalDrafts = lazy(() => import('./apps/main/LocalDrafts'));
const Store = lazy(() => import('./apps/store/store'));
const Mobile = lazy(() => import('./apps/menu/menu-mob'));
const Login = lazy(() => import('./apps/setup/Login'));
const Dock = lazy(() => import('./apps/menu/dock'));
const SurveyForm = lazy(() => import('./apps/mini-apps/application/form'));
const FileEditor = lazy(() => import('./apps/mini-apps/application/code'));
const RegistrationForm = lazy(() => import('./apps/setup/Registration'));
const MePost = lazy(() => import('./apps/main/mypost'));
const MiniApps = lazy(() => import('./apps/mini-apps/mini-apps'));
const Profile = lazy(() => import('./account/account'));
const ArtistList = lazy(() => import('./apps/main/ArtistList'));
const ArtistPage = lazy(() => import('./apps/main/ArtistPage'));
const ProfileEdit = lazy(() => import('./apps/edit-account/edit'));
const TagsPage = lazy(() => import('./apps/mini-apps/TagsPage'));
const GroupPage = lazy(() => import('./apps/groups/GroupPage'));
const Time = lazy(() => import('./apps/main/time'));

const AppRouter = () => {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = React.useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const location = useLocation();
  const isAuth = useSelector(state => state.auth.isAuth);

  React.useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
      const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent);
      setIsMobile(isMobileDevice || isTablet);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Обработчик горячих клавиш для спотлайта
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSpotlightOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    
    // Исключаем страницу профиля из скрытия прокрутки
    const shouldHideOverflow = ['/', '/mypost', '/popular', '/posts', '/tags', '/rev']
      .some(path => location.pathname.startsWith(path) && 
           !location.pathname.startsWith('/account/profile'));
    
    document.body.style.overflow = shouldHideOverflow ? 'hidden' : 'auto';
    document.documentElement.style.overflow = shouldHideOverflow ? 'hidden' : 'auto';
    document.body.style.height = shouldHideOverflow ? '100%' : 'auto';
    document.documentElement.style.height = shouldHideOverflow ? '100%' : 'auto';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [location.pathname]);

  return (
    <div className="app-container">
      <SnackbarProvider maxSnack={3}>
        <Routes>
          {/* Public routes */}
          <Route path="/dock" element={<Suspense fallback={<div>Загрузка...</div>}><Dock /></Suspense>} />
          <Route path="/apps/atomform" element={<Suspense fallback={<div>Загрузка...</div>}><SurveyForm /></Suspense>} />
          <Route path="/login" element={<Suspense fallback={<div>Загрузка...</div>}><Login /></Suspense>} />
          <Route path="/register" element={<Suspense fallback={<div>Загрузка...</div>}><RegistrationForm /></Suspense>} />

          {/* Protected routes */}
          <Route path="/*" element={
            <PrivateRoute>
              <Box display="flex">
                <Suspense fallback={<div>Загрузка...</div>}>
                  <Header 
                    setIsNewPostOpen={setIsNewPostOpen}
                    isNewPostOpen={isNewPostOpen}
                    onOpenSpotlight={() => setSpotlightOpen(true)}
                  />
                </Suspense>
                {isMobile && <Suspense fallback={<div>Загрузка...</div>}><Mobile /></Suspense>}
                <div className='flex-container'>
                  <Routes>
                    <Route path="/" element={
                        <Suspense fallback={<div>Загрузка...</div>}>
                          <Time />
                        </Suspense>
                    } />
                    <Route path="/chat" element={<Suspense fallback={<div>Загрузка...</div>}><GroupPage /></Suspense>} />
                    <Route path="/popular" element={
                      <div className='main-container'>
                    
                        <Suspense fallback={<div>Загрузка...</div>}>
                          <Work />
                        </Suspense>
                      </div>
                    } />

                    <Route path="/mypost" element={
                      <div className='main-container'>
                      
                        <Suspense fallback={<div>Загрузка...</div>}>
                          <MePost />
                        </Suspense>
                      </div>
                    } />
                    <Route path="/local" element={
                      <div className='main-container'>
                        
                        <Suspense fallback={<div>Загрузка...</div>}>
                          <LocalDrafts />
                        </Suspense>
                      </div>
                    } />
                    <Route path="/posts/:id" element={
                      <div className='main-container'>
                       
                        <Suspense fallback={<div>Загрузка...</div>}>
                          <FullPost />
                        </Suspense>
                      </div>
                    } />
                    <Route path="/account/profile/:id?" element={
                      <>
                        <Suspense fallback={<div>Загрузка...</div>}>
                          <Profile />
                        </Suspense>
                      
                      </>
                    } />
                    <Route path="/rev" element={
                      <div className='main-container'>
     
                        <Suspense fallback={<div>Загрузка...</div>}>
                          <MiniApps />
                        </Suspense>
                      </div>
                    } />
                 
                    <Route path="/music" element={
                      isMobile ? (
                        <MobileMusicBlocked />
                      ) : (
                        <div className='main-container'>
                          <Suspense fallback={<div>Загрузка...</div>}><Music /></Suspense>
                        </div>
                      )
                    } />
               
                 
                    <Route path="/artist/:id" element={
                      isMobile ? (
                        <MobileMusicBlocked />
                      ) : (
                        <div className='main-container'>
                          <Suspense fallback={<div>Загрузка...</div>}>
                            <MenuMusic />
                          </Suspense>
                          <Suspense fallback={<div>Загрузка...</div>}>
                            <ArtistPage />
                          </Suspense>
                        </div>
                      )
                    } />
                
                 
                    <Route path="/queue" element={
                      isMobile ? (
                        <MobileMusicBlocked />
                      ) : (
                        <div className='main-container'>
                          <Suspense fallback={<div>Загрузка...</div>}>
                            <MenuMusic />
                          </Suspense>
                          <Suspense fallback={<div>Загрузка...</div>}>
                            <div>Queue Page</div>
                          </Suspense>
                        </div>
                      )
                    } />
                    <Route path="/discover" element={
                      isMobile ? (
                        <MobileMusicBlocked />
                      ) : (
                        <div className='main-container'>
                          <Suspense fallback={<div>Загрузка...</div>}>
                            <MenuMusic />
                          </Suspense>
                          <Suspense fallback={<div>Загрузка...</div>}>
                            <div>Discover Page</div>
                          </Suspense>
                        </div>
                      )
                    } />
                    <Route path="/edit-profile" element={<Suspense fallback={<div>Загрузка...</div>}><ProfileEdit /></Suspense>} />
                    <Route path="/groups" element={<Suspense fallback={<div>Загрузка...</div>}><GroupPage /></Suspense>} />
                  </Routes>
                </div>
              </Box>
              
              {/* Модальное окно NewPost рендерится на уровне всего приложения */}
              <NewPost 
                isOpen={isNewPostOpen} 
                onClose={() => setIsNewPostOpen(false)} 
              />
              
              {/* Глобальный спотлайт */}
              <Spotlight 
                open={spotlightOpen} 
                onClose={() => setSpotlightOpen(false)} 
              />
            </PrivateRoute>
          } />
        </Routes>
      </SnackbarProvider>
    </div>
  );
};

export default AppRouter;
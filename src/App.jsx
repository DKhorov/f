import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import useSettings from './apps/hooks/useSettings';
import Sidebar from './apps/header/header';
import RightSidebar from './components/RightSidebar';
import PushNotifications from './components/PushNotifications';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchAuthMe } from './redux/slices/auth';

const App = () => {
  const { mode } = useSettings();
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const location = useLocation();
  const isGroupsPage = location.pathname.startsWith('/groups');
  const dispatch = useDispatch();
  
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: {
              main: 'rgb(25, 118, 210)',
              light: 'rgb(66, 165, 245)',
              dark: 'rgb(21, 101, 192)',
              contrastText: 'rgb(255, 255, 255)',
            },
            secondary: {
              main: 'rgb(156, 39, 176)',
              light: 'rgb(186, 104, 200)',
              dark: 'rgb(123, 31, 162)',
              contrastText: 'rgb(255, 255, 255)',
            },
            background: {
              default: 'rgb(255, 255, 255)',
              paper: 'rgb(255, 255, 255)',
            },
            text: {
              primary: 'rgb(0, 0, 0)',
              secondary: 'rgb(102, 102, 102)',
              disabled: 'rgb(158, 158, 158)',
            },
            divider: 'rgba(0, 0, 0, 0.12)',
            action: {
              active: 'rgba(0, 0, 0, 0.54)',
              hover: 'rgba(0, 0, 0, 0.04)',
              selected: 'rgba(0, 0, 0, 0.08)',
              disabled: 'rgba(0, 0, 0, 0.26)',
              disabledBackground: 'rgba(0, 0, 0, 0.12)',
            },
          }
        : {
            primary: {
              main: 'rgb(144, 202, 249)',
              light: 'rgb(187, 222, 251)',
              dark: 'rgb(66, 165, 245)',
              contrastText: 'rgb(0, 0, 0)',
            },
            secondary: {
              main: 'rgb(206, 147, 216)',
              light: 'rgb(225, 190, 231)',
              dark: 'rgb(186, 104, 200)',
              contrastText: 'rgb(0, 0, 0)',
            },
            background: {
              default: 'rgb(18, 18, 18)',
              paper: 'rgb(30, 30, 30)',
            },
            text: {
              primary: 'rgb(255, 255, 255)',
              secondary: 'rgb(176, 176, 176)',
              disabled: 'rgb(158, 158, 158)',
            },
            divider: 'rgba(255, 255, 255, 0.12)',
            action: {
              active: 'rgba(255, 255, 255, 0.7)',
              hover: 'rgba(255, 255, 255, 0.08)',
              selected: 'rgba(255, 255, 255, 0.16)',
              disabled: 'rgba(255, 255, 255, 0.3)',
              disabledBackground: 'rgba(255, 255, 255, 0.12)',
            },
          }),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'dark' ? 'rgb(18, 18, 18)' : 'rgb(255, 255, 255)',
            color: mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
    },
  });

  // Глобальные обработчики для модалов
  useEffect(() => {
    const handleOpenFavorites = () => {
      console.log('Opening favorites modal');
    };

    const handleOpenWallet = () => {
      console.log('Opening wallet modal');
    };

    window.addEventListener('openFavoritesModal', handleOpenFavorites);
    window.addEventListener('openWalletModal', handleOpenWallet);

    return () => {
      window.removeEventListener('openFavoritesModal', handleOpenFavorites);
      window.removeEventListener('openWalletModal', handleOpenWallet);
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchAuthMe());
    }
  }, [dispatch]);

  // Основное приложение
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div 
        style={{ 
          backgroundColor: mode === 'dark' ? 'rgb(18, 18, 18)' : 'rgb(255, 255, 255)',
          minHeight: '100vh',
          transition: 'all 0.5s ease-in-out',
          animation: 'fadeInApp 0.5s ease-in-out'
        }}
      >
        {!isGroupsPage && (
          <Sidebar 
            showRightSidebar={showRightSidebar} 
            setShowRightSidebar={setShowRightSidebar} 
            style={{position: 'absolute', left: 0, top: 0, zIndex: 100}}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Здесь основной контент приложения */}
        </div>
        <RightSidebar open={showRightSidebar} onClose={() => setShowRightSidebar(false)} />
        
        {/* Система пуш-уведомлений */}
        <PushNotifications />
        
        {/* CSS анимации для приложения */}
        <style>{`
          @keyframes fadeInApp {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
};

export default App; 
import React from 'react';
import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

const SIDEBAR_WIDTH = 340;

const SlideSidebar = styled(Box)(({ theme, open, isMobile }) => ({
  position: isMobile ? 'fixed' : 'relative',
  right: 0,
  top: 0,
  height: '100vh',
  width: SIDEBAR_WIDTH,
  maxWidth: '95vw',
  background: theme.palette.mode === 'dark' ? 'rgba(30,30,40,0.98)' : 'rgba(255,255,255,0.98)',
  boxShadow: open ? (isMobile ? '0 0 32px 0 rgba(0,0,0,0.25)' : '0 0 24px 0 rgba(0,0,0,0.12)') : 'none',
  borderLeft: `1.5px solid ${theme.palette.divider}`,
  zIndex: 1400,
  display: 'flex',
  flexDirection: 'column',
  transform: open ? 'translateX(0)' : `translateX(${SIDEBAR_WIDTH + 40}px)` ,
  transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
  ...(isMobile && {
    left: 0,
    width: '100vw',
    maxWidth: '100vw',
    borderLeft: 'none',
    borderTop: `2px solid ${theme.palette.divider}`,
    borderRadius: 0,
    background: theme.palette.mode === 'dark' ? 'rgba(20,20,30,0.98)' : 'rgba(255,255,255,0.99)',
  })
}));

const Overlay = styled(Box)(({ open }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.18)',
  zIndex: 1399,
  opacity: open ? 1 : 0,
  pointerEvents: open ? 'auto' : 'none',
  transition: 'opacity 0.25s',
}));

const RightSidebar = ({ open, onClose, children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 900px)');

  return (
    <>
      {isMobile && <Overlay open={open} onClick={onClose} />}
      <SlideSidebar open={open} isMobile={isMobile} theme={theme}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6">Дополнительно</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {children || <Typography color="text.secondary">Контент правого сайдбара</Typography>}
        </Box>
      </SlideSidebar>
    </>
  );
};

export default RightSidebar; 
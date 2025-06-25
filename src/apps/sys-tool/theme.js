import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgb(88, 166, 255)',
      light: 'rgb(144, 202, 249)',
      dark: 'rgb(66, 165, 245)',
      contrastText: 'rgb(0, 0, 0)',
    },
    secondary: {
      main: 'rgb(137, 87, 229)',
      light: 'rgb(206, 147, 216)',
      dark: 'rgb(123, 31, 162)',
      contrastText: 'rgb(255, 255, 255)',
    },
    background: {
      default: 'rgb(13, 17, 23)',
      paper: 'rgb(22, 27, 34)',
    },
    text: {
      primary: 'rgb(201, 209, 217)',
      secondary: 'rgb(139, 148, 158)',
      disabled: 'rgb(110, 118, 129)',
    },
    grey: {
      300: 'rgb(201, 209, 217)',
      400: 'rgb(139, 148, 158)',
      500: 'rgb(110, 118, 129)',
      600: 'rgb(72, 79, 88)',
      700: 'rgb(48, 54, 61)',
      800: 'rgb(33, 38, 45)',
      900: 'rgb(22, 27, 34)',
    },
    divider: 'rgb(48, 54, 61)',
    action: {
      active: 'rgba(255, 255, 255, 0.7)',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'rgb(13, 17, 23)',
          color: 'rgb(201, 209, 217)',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgb(22, 27, 34)',
          borderRight: '1px solid rgb(48, 54, 61)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(22, 27, 34)',
          border: '1px solid rgb(48, 54, 61)',
        },
      },
    },
  },
});

export default theme;
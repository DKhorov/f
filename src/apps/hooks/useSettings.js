import { useTheme } from '../contexts/ThemeContext';

const useSettings = () => {
  const { mode, toggleMode } = useTheme();

  return {
    mode,
    onToggleMode: toggleMode,
  };
};

export default useSettings; 
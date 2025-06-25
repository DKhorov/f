# src/apps/components

**Файлов в папке:** 1 (основной)

## Список файлов и их назначение

1. **Music/**
   - Подпапка с музыкальными компонентами (MusicPlayer, MusicItem, UploadDialog и др.). См. отдельный README.md внутри папки Music.

---

**Как подключать темы:**
- В каждом компоненте импортируйте useSettings и используйте mode для динамических стилей.
- Пример:
  ```js
  import useSettings from '../../hooks/useSettings';
  const { mode } = useSettings();
  // ...
  <div style={{ background: mode === 'dark' ? '#181818' : '#fff' }} />
  ```

---

(C) DK Studio 2023-2025  AtomGlide Labs. 
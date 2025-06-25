# Конфигурация чатов AtomGlide

## 🌐 Серверы

### Основной домен (atomglidedev.ru)
- **API сервер**: `https://atomglidedev.ru`
- **WebSocket сервер**: `https://atomglidedev.ru`
- **Статические файлы**: `https://atomglidedev.ru`

### Функциональность
- **REST API**: CRUD операции для чатов
- **WebSocket чаты**: Реальное время общения в группах
- **Файловый хостинг**: Загрузка изображений и файлов

## 🔧 Конфигурация

### API Endpoints
```javascript
baseURL: "https://atomglidedev.ru",
```

### WebSocket подключения
- WebSocket подключение к `wss://atomglidedev.ru`
- HTTP подключение к `https://atomglidedev.ru`
- Автоматическое переподключение

### Серверы
- REST API сервер для данных
- WebSocket сервер для чатов
- Файловый сервер для медиа

## Обзор
В проекте настроена гибридная архитектура для работы с чатами:

### Основной домен (atomglidedev.ru)
- **Авторизация**: Все операции аутентификации
- **Управление группами**: Создание, присоединение, список групп
- **Пользовательские данные**: Профили, настройки

### Локальный сервер (localhost:4445)
- **WebSocket чаты**: Реальное время общения в группах
- **Сообщения**: Отправка и получение сообщений
- **История сообщений**: Загрузка истории чатов

## Файлы конфигурации

### src/axios.js
```javascript
// Основной axios для авторизации
const instance = axios.create({
  baseURL: "https://atomglidedev.ru",
  withCredentials: true
});

// Отдельный axios для чатов
const chatInstance = axios.create({
  baseURL: "http://localhost:4445",
  withCredentials: true
});
```

### Использование в компонентах

#### GroupPage.jsx
- Использует основной `axios` для операций с группами
- Создание групп, присоединение, загрузка списка

#### GroupChat.jsx
- Использует `chatInstance` для загрузки истории сообщений
- WebSocket подключение к `ws://localhost:4445`

#### chat.jsx (основной чат)
- WebSocket подключение к `http://localhost:4445`

## Требования к серверу

### Локальный сервер (localhost:4445)
- WebSocket сервер для чатов
- API endpoints:
  - `GET /groups/:groupId/messages` - история сообщений
  - `POST /groups/:groupId/leave` - выход из группы
- Поддержка JWT токенов для авторизации

### Основной сервер (atomglidedev.ru)
- REST API для управления группами
- Система авторизации
- Пользовательские данные

## Безопасность
- Все запросы используют JWT токены из localStorage
- Автоматическое добавление заголовка Authorization
- Поддержка withCredentials для CORS 
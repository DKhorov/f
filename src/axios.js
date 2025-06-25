import axios from "axios";

// Определяем базовый URL в зависимости от окружения
const getBaseURL = () => {
  // Возвращаем URL для API
  return process.env.REACT_APP_API_URL || 'https://atomglide.ru';
};

// Основной axios для авторизации и общих запросов
const instance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 10000
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error);
    return Promise.reject(error);
  }
);

export default instance;
import axios from "axios";

// Определяем базовый URL в зависимости от окружения
const getBaseURL = () => {
  // Возвращаем URL для API
  return process.env.REACT_APP_API_URL || 'https://atomglidedev.ru';
};

// Axios для чатов на atomglidedev.ru
const chatAxios = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 10000
});

chatAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

chatAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Chat axios error:', error);
    return Promise.reject(error);
  }
);

export default chatAxios; 
import axios from "axios";

// Axios для основного чата на atomglidedev.ru
const chatAxios = axios.create({
  baseURL: "https://atomglidedev.ru",
  withCredentials: true
});

chatAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default chatAxios; 
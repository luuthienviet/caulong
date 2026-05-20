import axios from 'axios';

const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : `${window.location.protocol}//${window.location.host}/api`;
};

const API = axios.create({
  baseURL: getBaseURL(),
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle global errors cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'A network or server error occurred. Please try again.',
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };
    return Promise.reject(customError);
  }
);

export default api;

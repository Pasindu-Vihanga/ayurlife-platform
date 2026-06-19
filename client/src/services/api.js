import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
});

// Add a request interceptor to inject the token
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const token = JSON.parse(userInfo).token;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export { BASE_URL };
export default api;

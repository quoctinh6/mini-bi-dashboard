import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm interceptor để nhúng JWT token tự động vào header (hỗ trợ RLS)
api.interceptors.request.use((config) => {
    // Trong môi trường ứng dụng thật, lấy token từ localStorage hoặc Cookies
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const analyticsServices = {
    // Fetch metrics (Revenue, Growth Rate)
    getMetrics: async () => {
        const response = await api.get('/analytics/metrics');
        return response.data;
    },
    
    // Fetch sales grouped data (for charts)
    getSales: async (params) => {
        // params chứa: groupBy ('Date', 'Province', 'Department'), startDate, endDate, department
        const response = await api.get('/analytics/sales', { params });
        return response.data;
    },

    // Upload Data API
    uploadData: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/data/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default api;

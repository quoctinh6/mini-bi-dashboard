import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authServices = {
    login: async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    }
};

export const masterDataServices = {
    getProvinces:   () => api.get('/master/provinces').then(res => res.data),
    getCategories:  () => api.get('/master/categories').then(res => res.data),
    getDepartments: () => api.get('/master/departments').then(res => res.data),
    getRegions:     () => api.get('/master/regions').then(res => res.data),
};

export const dashboardServices = {
    getOverview: async (params = {}) => {
        const response = await api.get('/dashboard/overview', { params });
        return response.data;
    }
};

export const analyticsServices = {
    getMetrics: async (params = {}) => {
        const response = await api.get('/analytics/metrics', { params });
        return response.data;
    },
    getSales: async (params = {}) => {
        const response = await api.get('/analytics/sales', { params });
        return response.data;
    }
};

export const dataServices = {
    getTransactions: async (params = {}) => {
        const response = await api.get('/data/transactions', { params });
        return response.data;
    },
    createManualEntry: async (data: any) => {
        const response = await api.post('/data/manual', data);
        return response.data;
    },
    uploadData: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/data/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default api;

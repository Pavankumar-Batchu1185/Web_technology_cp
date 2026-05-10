import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface TokenResponse {
  access: string;
  refresh: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post<TokenResponse>(`${API_BASE}/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', data.access);

          error.config.headers.Authorization = `Bearer ${data.access}`;

          return api.request(error.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: LoginCredentials) =>
    axios.post<TokenResponse>(`${API_BASE}/token/`, credentials),
};

export const questionAPI = {
  list: (params: Record<string, string | number>) => api.get('/questions/', { params }),
  get: (id: number) => api.get(`/questions/${id}/`),
  create: (data: any) => api.post('/questions/', data),
  update: (id: number, data: any) => api.patch(`/questions/${id}/`, data),
  delete: (id: number) => api.delete(`/questions/${id}/`),
  upvote: (id: number) => api.post(`/questions/${id}/upvote/`),
  downvote: (id: number) => api.post(`/questions/${id}/downvote/`),
};


export const answerAPI = {
  list: (questionId: number) =>
    api.get(`/answers/?question=${questionId}`),
  listByAuthor: (username: string) =>
    api.get(`/answers/?author=${username}`),
  create: (data: any) =>
    api.post('/answers/', data),
  upvote: (id: number) =>
    api.post(`/answers/${id}/upvote/`),
  downvote: (id: number) =>
    api.post(`/answers/${id}/downvote/`),
  markBest: (id: number) =>
    api.post(`/answers/${id}/mark_best/`),
};

export const categoryAPI = {
  list: () => api.get('/categories/'),
};

export const profileAPI = {
  get: (username: string) => api.get(`/profiles/${username}/`),
  me: () => api.get('/profiles/me/'),
  update: (data: any) => {
  if (data instanceof FormData) {
    return api.put('/profiles/me/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  return api.put('/profiles/me/', data);
},
};

export const announcementAPI = {
  list: (params?: Record<string, string>) => api.get('/announcements/', { params }),
  create: (data: any) => api.post('/announcements/', data),
  update: (id: number, data: any) => api.patch(`/announcements/${id}/`, data),
  delete: (id: number) => api.delete(`/announcements/${id}/`),
};

export default api;

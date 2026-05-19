import { api } from '@/lib/api';

// Users
export const getUsers = () => api.get('/users').then(r => r.data);
export const getUser = (id: string) => api.get(`/users/${id}`).then(r => r.data);
export const createUser = (data: Record<string, unknown>) => api.post('/users', data).then(r => r.data);
export const updateUser = (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data).then(r => r.data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`).then(r => r.data);

// Pages
export const getPages = () => api.get('/pages').then(r => r.data);
export const getPage = (id: string) => api.get(`/pages/${id}`).then(r => r.data);
export const createPage = (data: Record<string, unknown>) => api.post('/pages', data).then(r => r.data);
export const updatePage = (id: string, data: Record<string, unknown>) => api.patch(`/pages/${id}`, data).then(r => r.data);
export const deletePage = (id: string) => api.delete(`/pages/${id}`).then(r => r.data);

// Sections
export const getSections = (pageId?: string) => api.get('/sections', { params: { pageId } }).then(r => r.data);
export const getSection = (id: string) => api.get(`/sections/${id}`).then(r => r.data);
export const createSection = (data: Record<string, unknown>) => api.post('/sections', data).then(r => r.data);
export const updateSection = (id: string, data: Record<string, unknown>) => api.patch(`/sections/${id}`, data).then(r => r.data);
export const deleteSection = (id: string) => api.delete(`/sections/${id}`).then(r => r.data);

// Clients
export const getClients = () => api.get('/clients').then(r => r.data);
export const getClient = (id: string) => api.get(`/clients/${id}`).then(r => r.data);
export const createClient = (data: Record<string, unknown>) => api.post('/clients', data).then(r => r.data);
export const updateClient = (id: string, data: Record<string, unknown>) => api.patch(`/clients/${id}`, data).then(r => r.data);
export const deleteClient = (id: string) => api.delete(`/clients/${id}`).then(r => r.data);

// Media
export const getMedia = () => api.get('/media').then(r => r.data);
export const uploadMedia = (formData: FormData) => api.post('/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const uploadZipMedia = (formData: FormData) => api.post('/media/upload-zip', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const updateMedia = (id: string, data: Record<string, unknown>) => api.patch(`/media/${id}`, data).then(r => r.data);
export const deleteMedia = (id: string) => api.delete(`/media/${id}`).then(r => r.data);

// Videos
export const getVideos = () => api.get('/videos').then(r => r.data);
export const createVideo = (data: FormData | Record<string, unknown>) => {
  const isFormData = data instanceof FormData;
  return api.post('/videos', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined).then(r => r.data);
};
export const updateVideo = (id: string, data: FormData | Record<string, unknown>) => {
  const isFormData = data instanceof FormData;
  return api.patch(`/videos/${id}`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined).then(r => r.data);
};
export const deleteVideo = (id: string) => api.delete(`/videos/${id}`).then(r => r.data);

// Odoo
export const getOdooStatus = () => api.get('/odoo/status').then(r => r.data);

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

// Section Types
export const getSectionTypes = () => api.get('/section-types').then(r => r.data);
export const getSectionType = (type: string) => api.get(`/section-types/${type}`).then(r => r.data);
export const createSectionType = (data: Record<string, unknown>) => api.post('/section-types', data).then(r => r.data);
export const updateSectionType = (type: string, data: Record<string, unknown>) => api.patch(`/section-types/${type}`, data).then(r => r.data);
export const deleteSectionType = (type: string) => api.delete(`/section-types/${type}`).then(r => r.data);

// Odoo
export const getOdooStatus = () => api.get('/odoo/status').then(r => r.data);
export const searchOdooPartners = (q: string) => api.get('/odoo/search-partners', { params: { q } }).then(r => r.data);
export const getOdooPartnerProjects = (partnerId: number) => api.get(`/odoo/partners/${partnerId}/projects`).then(r => r.data);
export const linkClientOdoo = (clientId: string, odooPartnerId: number | null) => api.post(`/clients/${clientId}/link-odoo`, { odooPartnerId }).then(r => r.data);
export const syncClientOdooProjects = (clientId: string) => api.post(`/clients/${clientId}/sync-odoo-projects`).then(r => r.data);

// Projects
export const getClientProjects = (clientId: string) => api.get(`/projects/client/${clientId}`).then(r => r.data);
export const createProject = (clientId: string, data: Record<string, unknown>) => api.post(`/projects/client/${clientId}`, data).then(r => r.data);
export const updateProject = (id: string, data: Record<string, unknown>) => api.patch(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`).then(r => r.data);

// Comments
export const getComments = (projectId: string) => api.get(`/comments/project/${projectId}`).then(r => r.data);
export const createComment = (projectId: string, data: Record<string, unknown>) => api.post(`/comments/project/${projectId}`, data).then(r => r.data);
export const updateComment = (id: string, data: Record<string, unknown>) => api.patch(`/comments/${id}`, data).then(r => r.data);
export const deleteComment = (id: string) => api.delete(`/comments/${id}`).then(r => r.data);

// Time Entries
export const getTimeEntries = (projectId: string) => api.get(`/time-entries/project/${projectId}`).then(r => r.data);
export const createTimeEntry = (projectId: string, data: Record<string, unknown>) => api.post(`/time-entries/project/${projectId}`, data).then(r => r.data);
export const updateTimeEntry = (id: string, data: Record<string, unknown>) => api.patch(`/time-entries/${id}`, data).then(r => r.data);
export const deleteTimeEntry = (id: string) => api.delete(`/time-entries/${id}`).then(r => r.data);

// Time Entry Media
export const assignTimeEntryMedia = (timeEntryId: string, mediaId: string) => api.post(`/time-entry-media/time-entries/${timeEntryId}/media`, { mediaId }).then(r => r.data);
export const removeTimeEntryMedia = (timeEntryId: string, mediaId: string) => api.delete(`/time-entry-media/time-entries/${timeEntryId}/media/${mediaId}`).then(r => r.data);

// Project Media
export const assignProjectMedia = (projectId: string, mediaId: string) => api.post(`/project-media/project/${projectId}`, { mediaId }).then(r => r.data);
export const removeProjectMedia = (projectId: string, mediaId: string) => api.delete(`/project-media/project/${projectId}/media/${mediaId}`).then(r => r.data);
export const toggleProjectMediaVisible = (id: string, visible: boolean) => api.patch(`/project-media/${id}`, { visible }).then(r => r.data);

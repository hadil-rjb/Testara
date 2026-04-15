import { api } from './client';

export interface CreateProjectData {
  name: string;
  url: string;
  environment?: string;
}

export interface UpdateProjectData {
  name?: string;
  environment?: string;
}

export const projectApi = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: CreateProjectData) => api.post('/projects', data),
  update: (id: string, data: UpdateProjectData) =>
    api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

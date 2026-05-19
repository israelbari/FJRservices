export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'cliente';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  pageId: string;
  title: string;
  subtitle: string;
  content: string;
  type: string;
  active: boolean;
  order: number;
  imageUrl?: string;
  videos?: Video[];
  medias?: Media[];
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  name: string;
  src: string;
  folder: string;
  dimensions?: string | null;
  size?: string | null;
  mimeType?: string | null;
  clientId?: string | null;
  sectionId?: string | null;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  src?: string | null;
  playbackRate?: number;
  sectionId?: string | null;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  project?: string | null;
  status: 'active' | 'inactive';
  token: string;
  createdAt: string;
  medias?: Array<{ id: string; media: Media }>;
}

export interface ActivityLog {
  id: string;
  action: 'create' | 'edit' | 'delete' | 'upload' | 'login' | 'logout';
  entity: string;
  entityId: string;
  detail: string;
  userId?: string | null;
  userName?: string | null;
  createdAt: string;
}

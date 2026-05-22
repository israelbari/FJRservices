export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'cliente';
  status: 'active' | 'inactive';
  telegramId?: string | null;
  telegramName?: string | null;
  lastLogin: string;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  active: boolean;
  useDynamicContent: boolean;
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
  thumbnailSrc: string;
  folder: string;
  dimensions?: string | null;
  size?: string | null;
  mimeType?: string | null;
  source?: string | null;
  telegramMsgId?: string | null;
  clientId?: string | null;
  sectionId?: string | null;
  order: number;
  title?: string | null;
  link?: string | null;
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

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
  comments?: Comment[];
  timeEntries?: TimeEntry[];
  medias?: ProjectMediaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  content: string;
  visible: boolean;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  description: string;
  hours: number;
  date: string;
  visible: boolean;
  billable: boolean;
  notes?: string | null;
  medias?: Array<{ id: string; media: Media }>;
  createdAt: string;
}

export interface ProjectMediaItem {
  id: string;
  projectId: string;
  mediaId: string;
  media: Media;
  visible: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: 'active' | 'inactive';
  token: string;
  odooPartnerId?: number | null;
  createdAt: string;
  medias?: Array<{ id: string; media: Media }>;
  projects?: Project[];
}

export interface SectionType {
  id: string;
  type: string;
  label: string;
  description?: string | null;
  icon: string;
  color: string;
  bgColor: string;
  configSchema: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SectionTypeField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'array-text' | 'array-object' | 'color';
  options?: string[];
  fields?: SectionTypeField[];
  required?: boolean;
  default?: unknown;
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

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Folder, ImageIcon, AlertTriangle, Phone, Mail, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface MediaItem {
  id: string;
  name: string;
  src: string;
  folder: string;
  mimeType?: string;
}

interface ProjectMediaItem {
  id: string;
  media: MediaItem;
  visible: boolean;
}

interface Comment {
  id: string;
  content: string;
  visible: boolean;
  createdAt: string;
}

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  date: string;
  visible: boolean;
  billable: boolean;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
  medias: ProjectMediaItem[];
  comments: Comment[];
  timeEntries: TimeEntry[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  token: string;
  projects: Project[];
  createdAt: string;
}

interface GalleryImage {
  id: string;
  src: string;
  thumbSrc: string;
  name: string;
  projectName: string;
}

/* ------------------------------------------------------------------ */
/*  LIGHTBOX COMPONENT                                                 */
/* ------------------------------------------------------------------ */

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }: { images: GalleryImage[]; currentIndex: number; onClose: () => void; onNext: () => void; onPrev: () => void; }) {
  const image = images[currentIndex];
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onNext(); if (e.key === 'ArrowLeft') onPrev(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [onClose, onNext, onPrev]);
  if (!image) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-md flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"><X className="w-6 h-6 text-white" /></button>
      {images.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"><ChevronLeft className="w-6 h-6 text-white" /></button>
      )}
      <div className="flex flex-col items-center justify-center max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={image.name} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
        <div className="mt-4 text-center">
          <p className="text-sm text-white/70">{currentIndex + 1} / {images.length}</p>
          <p className="text-xs text-[#E8913A] mt-1">{image.projectName}</p>
        </div>
      </div>
      {images.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"><ChevronRight className="w-6 h-6 text-white" /></button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PORTAL COMPONENT                                              */
/* ------------------------------------------------------------------ */

export default function Portal() {
  const { token } = useParams<{ token: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/clients/token/${token}`)
      .then((res) => { setClient(res.data); if (res.data.projects?.length > 0) setActiveProject(res.data.projects[0].id); })
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allImages = useMemo<GalleryImage[]>(() => {
    if (!client) return [];
    const images: GalleryImage[] = [];
    client.projects.forEach((project) => {
      project.medias.forEach((pm) => {
        images.push({
          id: pm.id,
          src: `${API_URL}/media/${pm.media.id}/url`,
          thumbSrc: `${API_URL}/media/${pm.media.id}/url?size=thumb`,
          name: pm.media.name,
          projectName: project.name,
        });
      });
    });
    return images;
  }, [client]);

  const activeProjectData = useMemo(() => client?.projects.find((p) => p.id === activeProject), [client, activeProject]);

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  const projectImages = useMemo(() => {
    if (!activeProjectData) return [];
    return activeProjectData.medias.map((pm) => ({
      id: pm.id,
      src: `${API_URL}/media/${pm.media.id}/url`,
      thumbSrc: `${API_URL}/media/${pm.media.id}/url?size=thumb`,
      name: pm.media.name,
      projectName: activeProjectData.name,
    }));
  }, [activeProjectData]);

  const totalVisibleImages = useMemo(() => client?.projects.reduce((sum, p) => sum + p.medias.length, 0) || 0, [client]);

  if (!loading && !client) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col">
        <header className="h-16 bg-[#0A1628] flex items-center px-6">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
            <Link to="/"><img src="/FJRServices.png" alt="FJR Services" className="h-8 w-auto" /></Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-[400px]">
            <AlertTriangle className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
            <h1 className="text-[22px] font-bold text-[#1E293B] mb-2">Enlace no valido o expirado</h1>
            <p className="text-sm text-[#64748B] mb-6">Este enlace de acceso no es valido o ha expirado. Contacta con FJR Services para obtener un nuevo acceso.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/"><Button className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white">Ir al sitio web</Button></Link>
              <Link to="/contacto"><Button variant="outline" className="h-10 border-[#D1D5DB] text-[#374151]">Contactar</Button></Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#4A90D9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col">
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A1628] flex items-center transition-shadow duration-200 ${scrolled ? 'shadow-lg' : ''}`}>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center"><img src="/FJRServices.png" alt="FJR Services" className="h-8 w-auto hidden sm:block" /></Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-[13px] text-[#94A3B8]">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#4A90D9]" />474-937-8270</span>
              <span className="text-[#64748B]">|</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#4A90D9]" />info@fjrservices.com</span>
            </div>
            <Link to="/contacto" target="_blank"><Button size="sm" className="h-8 bg-[#E8913A] hover:bg-[#D47A2A] text-white text-[12px] uppercase tracking-wide"><Phone className="w-3.5 h-3.5 mr-1.5 md:hidden" /><span className="hidden md:inline">Contactar</span></Button></Link>
          </div>
        </div>
      </header>

      <section className="mt-16 bg-gradient-to-br from-[#0A1628] to-[#0F1E35] py-10 md:py-12 px-5 text-center relative overflow-hidden">
        <svg className="absolute bottom-0 left-0 right-0 opacity-10 text-[#4A90D9]" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V60H0V30Z" fill="currentColor" />
        </svg>
        <p className="text-[12px] uppercase tracking-[0.12em] text-[#7DB8F0] mb-2">Portal de Trabajo</p>
        <h1 className="text-2xl md:text-[26px] font-bold text-white mb-2">Bienvenido, {client.name}</h1>
        <p className="text-sm text-white/70 max-w-[500px] mx-auto">Aqui encontraras las imagenes, comentarios y horas de tus proyectos</p>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <Folder className="w-4 h-4 text-[#E8913A]" />
          <span className="text-[13px] text-[#E8913A]">{client.projects.length} proyecto{client.projects.length !== 1 ? 's' : ''} activo{client.projects.length !== 1 ? 's' : ''}</span>
        </div>
      </section>

      <main className="flex-1 px-4 md:px-6 py-6 max-w-[1200px] mx-auto w-full">
        {client.projects.length === 0 || totalVisibleImages === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="w-14 h-14 text-[#CBD5E1] mb-3" />
            <h3 className="text-lg font-semibold text-[#1E293B] mb-1">No hay contenido disponible</h3>
            <p className="text-sm text-[#94A3B8] mb-4">Contacta con nosotros si esperabas ver algo aqui.</p>
            <Link to="/contacto"><Button className="h-10 bg-[#E8913A] hover:bg-[#D47A2A] text-white">Contactar</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Project sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 sticky top-20">
                <h3 className="text-sm font-semibold text-[#1E293B] mb-2 px-2">Proyectos</h3>
                <div className="space-y-1">
                  {client.projects.map((project) => {
                    const imgCount = project.medias.length;
                    const comCount = project.comments.length;
                    const hrCount = project.timeEntries.length;
                    const isActive = activeProject === project.id;
                    return (
                      <button key={project.id} onClick={() => setActiveProject(project.id)} className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'bg-[#EFF6FF] text-[#4A90D9] font-medium' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}>
                        <span className="truncate block">{project.name}</span>
                        <span className="text-[10px] text-[#94A3B8]">{imgCount} img · {comCount} com · {hrCount} h</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-6">
              {activeProjectData && (
                <>
                  {/* Images */}
                  {projectImages.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-[#1E293B] mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#4A90D9]" /> Imagenes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {projectImages.map((image, imgIdx) => (
                          <button key={image.id} onClick={() => openLightbox(imgIdx)} className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 text-left">
                            <div className="aspect-square overflow-hidden">
                              <img src={image.thumbSrc} alt={image.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white text-xs font-medium truncate">{image.projectName}</p>
                                <p className="text-white/70 text-[10px] mt-0.5 truncate">{image.name}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {activeProjectData.comments.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-[#1E293B] mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#4A90D9]" /> Comentarios</h3>
                      <div className="space-y-2">
                        {activeProjectData.comments.map((comment) => (
                          <div key={comment.id} className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                            <p className="text-[14px] text-[#374151]">{comment.content}</p>
                            <p className="text-[11px] text-[#94A3B8] mt-1">{new Date(comment.createdAt).toLocaleDateString('es-ES')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Entries */}
                  {activeProjectData.timeEntries.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-[#1E293B] mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-[#4A90D9]" /> Horas trabajadas</h3>
                      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
                        <table className="w-full text-[13px]">
                          <thead className="bg-[#F8FAFC]">
                            <tr>
                              <th className="text-left px-4 py-2 text-[#64748B] font-medium">Descripcion</th>
                              <th className="text-left px-4 py-2 text-[#64748B] font-medium">Fecha</th>
                              <th className="text-left px-4 py-2 text-[#64748B] font-medium">Tipo</th>
                              <th className="text-right px-4 py-2 text-[#64748B] font-medium">Horas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeProjectData.timeEntries.map((entry) => (
                              <tr key={entry.id} className="border-t border-[#F1F5F9]">
                                <td className="px-4 py-2.5 text-[#374151]">{entry.description}</td>
                                <td className="px-4 py-2.5 text-[#94A3B8]">{new Date(entry.date).toLocaleDateString('es-ES')}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${entry.billable ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {entry.billable ? 'Facturable' : 'No facturable'}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-[#4A90D9]">{entry.hours}h</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
                            <tr>
                              <td className="px-4 py-2 text-[#64748B] font-medium" colSpan={3}>Total facturable</td>
                              <td className="px-4 py-2 text-right font-bold text-emerald-600">
                                {activeProjectData.timeEntries.filter(e => e.billable).reduce((s, e) => s + e.hours, 0).toFixed(1)}h
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-[#64748B] font-medium" colSpan={3}>Total no facturable</td>
                              <td className="px-4 py-2 text-right font-bold text-gray-500">
                                {activeProjectData.timeEntries.filter(e => !e.billable).reduce((s, e) => s + e.hours, 0).toFixed(1)}h
                              </td>
                            </tr>
                            <tr className="border-t border-[#E2E8F0]">
                              <td className="px-4 py-2 text-[#1E293B] font-bold" colSpan={3}>Total horas</td>
                              <td className="px-4 py-2 text-right font-bold text-[#4A90D9]">
                                {activeProjectData.timeEntries.reduce((s, e) => s + e.hours, 0).toFixed(1)}h
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-[#E2E8F0] py-6 px-5">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#94A3B8]">&copy; 2025 FJR Services. Portal privado.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[12px] text-[#64748B]"><Phone className="w-3 h-3 text-[#4A90D9]" />474-937-8270</span>
            <a href="mailto:info@fjrservices.com" className="text-[12px] text-[#4A90D9] hover:underline">info@fjrservices.com</a>
          </div>
        </div>
      </footer>

      {lightboxOpen && <Lightbox images={projectImages} currentIndex={lightboxIndex} onClose={closeLightbox} onNext={nextImage} onPrev={prevImage} />}
    </div>
  );
}

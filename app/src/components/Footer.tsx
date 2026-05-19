import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Youtube, Linkedin, Lock } from 'lucide-react'

const navLinks = [
  { label: 'Inicio', path: '/' },
  { label: 'Servicios', path: '/servicios' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Contacto', path: '/contacto' },
]

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <footer className="bg-[#001529] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1 - Brand */}
          <div>
            <Link to="/" className="flex items-center">
              <img src="/FJRServices.png" alt="FJR Services" className="h-9 w-auto" />
            </Link>
            <p className="mt-4 text-[14px] leading-[1.6] text-[rgba(255,255,255,0.6)] max-w-[280px]">
              Reparacion y mantenimiento de embarcaciones de recreo desde 2005.
            </p>
          </div>

          {/* Column 2 - Navigation */}
          <div>
            <h4 className="text-[13px] uppercase font-semibold tracking-[0.08em] text-white font-inter">
              Navegacion
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[14px] text-[rgba(255,255,255,0.6)] hover:text-[#00B4D8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/admin/login"
                  className="text-[14px] text-[rgba(255,255,255,0.6)] hover:text-[#E8913A] transition-colors flex items-center gap-1.5"
                >
                  <Lock size={13} />
                  Panel Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <h4 className="text-[13px] uppercase font-semibold tracking-[0.08em] text-white font-inter">
              Contacto
            </h4>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#00B4D8]" />
                <span className="text-[14px] text-[rgba(255,255,255,0.7)]">
                  474-937-8270
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#00B4D8]" />
                <span className="text-[14px] text-[rgba(255,255,255,0.7)]">
                  info@fjrservices.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#00B4D8]" />
                <span className="text-[14px] text-[rgba(255,255,255,0.7)]">
                  Region de Murcia, Espana
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-[rgba(255,255,255,0.5)] hover:text-[#00B4D8] hover:scale-[1.15] transition-all"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[rgba(255,255,255,0.1)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[13px] text-[rgba(255,255,255,0.4)]">
            &copy; 2025 FJSERVICES. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-[rgba(255,255,255,0.4)]">
            <Link to="/admin/login" className="flex items-center gap-1 hover:text-[#E8913A] transition-colors">
              <Lock size={12} />
              Acceso Admin
            </Link>
            <span>|</span>
            <span className="text-white opacity-80">ES</span>
            <span>/</span>
            <span className="hover:text-white cursor-pointer transition-colors">EN</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

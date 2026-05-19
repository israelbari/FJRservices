import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Youtube, Linkedin } from 'lucide-react'

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
    <footer className="bg-[#0A1628] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1 - Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3">
              <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 20C6 16 12 14 18 16C24 18 30 16 34 12" stroke="#1F3A5F" strokeWidth="3" strokeLinecap="round" />
                <path d="M2 14C6 10 12 8 18 10C24 12 30 10 34 6" stroke="#4A90D9" strokeWidth="3" strokeLinecap="round" />
                <path d="M2 8C6 4 12 2 18 4C24 6 30 4 34 2" stroke="#7DB8F0" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="font-outfit font-bold text-[18px] tracking-[0.02em] text-white">
                FJR SERVICES
              </span>
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
                    className="text-[14px] text-[rgba(255,255,255,0.6)] hover:text-[#E8913A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div>
            <h4 className="text-[13px] uppercase font-semibold tracking-[0.08em] text-white font-inter">
              Contacto
            </h4>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#4A90D9]" />
                <span className="text-[14px] text-[rgba(255,255,255,0.7)]">
                  474-937-8270
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#4A90D9]" />
                <span className="text-[14px] text-[rgba(255,255,255,0.7)]">
                  info@fjrservices.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#4A90D9]" />
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
                  className="text-[rgba(255,255,255,0.5)] hover:text-[#E8913A] hover:scale-[1.15] transition-all"
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
          <div className="flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.4)]">
            <span className="text-white opacity-80">ES</span>
            <span>/</span>
            <span className="hover:text-white cursor-pointer transition-colors">EN</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

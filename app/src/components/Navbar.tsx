import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'

const navLinks = [
  { label: 'INICIO', path: '/' },
  { label: 'SERVICIOS', path: '/servicios' },
  { label: 'NOSOTROS', path: '/nosotros' },
  { label: 'CONTACTO', path: '/contacto' },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={
        'fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300 ' +
        (scrolled
          ? 'bg-[#001529]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)]'
          : 'bg-[#001529]')
      }
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/FJRServices.png" alt="FJR Services" className="h-11 w-auto" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={
                'text-[13px] uppercase tracking-[0.06em] font-inter font-semibold transition-all duration-300 ' +
                (isActive(link.path)
                  ? 'text-white opacity-100 underline decoration-[#00B4D8] decoration-2 underline-offset-4'
                  : 'text-white opacity-80 hover:opacity-100 hover:text-[#00B4D8]')
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Language + Admin + Mobile Menu */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin/login"
            className="hidden md:flex flex-col items-center text-white opacity-70 hover:opacity-100 hover:text-[#E8913A] transition-all duration-300"
            title="Panel Admin"
          >
            <CaptainIcon />
            <span className="text-[10px] uppercase tracking-[0.08em] mt-0.5">User</span>
          </Link>

          <button className="hidden md:flex items-center gap-1 text-[13px] text-white opacity-80 hover:opacity-100 transition-opacity">
            ES
            <ChevronDown size={14} />
          </button>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[72px] bg-[#001529] z-40 md:hidden">
          <div className="flex flex-col items-center gap-8 pt-12">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={
                  'text-[15px] uppercase tracking-[0.08em] font-inter font-semibold transition-all ' +
                  (isActive(link.path)
                    ? 'text-[#00B4D8]'
                    : 'text-white opacity-80')
                }
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="flex flex-col items-center text-white opacity-80 mt-4"
              onClick={() => setMobileOpen(false)}
            >
              <CaptainIcon />
              <span className="text-[10px] uppercase tracking-[0.08em] mt-0.5">User</span>
            </Link>
            <button className="flex items-center gap-1 text-[13px] text-white opacity-80 mt-4">
              ES
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

function CaptainIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gorra de patrón */}
      <path
        d="M4 12C4 10 6 8 9 8H19C22 8 24 10 24 12V13C24 14 23 15 22 15H6C5 15 4 14 4 13V12Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Visera */}
      <path
        d="M6 13C8 14.5 12 15 14 15C16 15 20 14.5 22 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Insignia circular en la gorra */}
      <circle cx="14" cy="11.5" r="1.8" fill="#001529" opacity="0.6" />
      {/* Cabeza */}
      <circle cx="14" cy="19" r="5" fill="currentColor" opacity="0.8" />
    </svg>
  )
}


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
          ? 'bg-[rgba(10,22,40,0.95)] backdrop-blur-md border-b border-[rgba(255,255,255,0.08)]'
          : 'bg-transparent')
      }
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <LogoSVG />
          <span className="font-outfit font-bold text-[18px] tracking-[0.02em] text-white">
            FJR SERVICES
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={
                'text-[13px] uppercase tracking-[0.06em] font-inter font-medium transition-all duration-300 ' +
                (isActive(link.path)
                  ? 'text-white opacity-100 underline decoration-[#E8913A] decoration-2 underline-offset-4'
                  : 'text-white opacity-80 hover:opacity-100 hover:text-[#E8913A]')
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Language + Mobile Menu */}
        <div className="flex items-center gap-4">
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
        <div className="fixed inset-0 top-[72px] bg-[#0A1628] z-40 md:hidden">
          <div className="flex flex-col items-center gap-8 pt-12">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={
                  'text-[15px] uppercase tracking-[0.08em] font-inter font-semibold transition-all ' +
                  (isActive(link.path)
                    ? 'text-[#E8913A]'
                    : 'text-white opacity-80')
                }
              >
                {link.label}
              </Link>
            ))}
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

function LogoSVG() {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 20C6 16 12 14 18 16C24 18 30 16 34 12"
        stroke="#1F3A5F"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M2 14C6 10 12 8 18 10C24 12 30 10 34 6"
        stroke="#4A90D9"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M2 8C6 4 12 2 18 4C24 6 30 4 34 2"
        stroke="#7DB8F0"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

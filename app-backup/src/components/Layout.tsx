import { useEffect, useState, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { ChevronUp } from 'lucide-react'

interface LayoutProps {
  children?: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Show/hide scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">{children ? children : <Outlet />}</main>
      <Footer />

      {/* Scroll-to-top button */}
      <button
        onClick={scrollToTop}
        className={
          'fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#E8913A] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(232,145,58,0.3)] transition-all duration-300 hover:bg-[#D47A2A] hover:scale-110 ' +
          (showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-5 pointer-events-none')
        }
        aria-label="Volver arriba"
      >
        <ChevronUp size={20} />
      </button>
    </div>
  )
}

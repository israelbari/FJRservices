import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Copy, Check, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [logoutMessage, setLogoutMessage] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
    if (searchParams.get('logout') === '1') {
      setLogoutMessage(true);
      const timer = setTimeout(() => setLogoutMessage(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Introduce un correo y contrasena validos');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      navigate('/admin', { replace: true });
    } else {
      setError('Correo o contrasena incorrectos');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at center, rgba(74,144,217,0.08) 0%, transparent 70%), #F1F5F9',
      }}
    >
      {/* Card */}
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl p-8 sm:p-10 shadow-xl relative z-10"
        style={{
          boxShadow:
            '0 20px 60px rgba(10,22,40,0.12), 0 4px 12px rgba(10,22,40,0.08)',
        }}
      >
        {/* Logout success */}
        {logoutMessage && (
          <div className="mb-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-[#166534]">
            <Check className="w-4 h-4" />
            Sesion cerrada correctamente
          </div>
        )}

        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            <img src="/LOGOFJRSERVICES.jpg" alt="FJR Services" className="h-20 w-auto mx-auto" />
          </div>
          <h1 className="mt-6 text-[22px] font-bold text-[#1E293B]">
            Panel de Administracion
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Gestiona el contenido de fjrservices.com
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#DC2626] flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-[#EF4444] hover:text-[#DC2626]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Correo Electronico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fjrservices.com"
              className="w-full h-[42px] border border-[#D1D5DB] rounded-lg px-3.5 text-sm text-[#1E293B] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00B4D8] focus:ring-[3px] focus:ring-[#00B4D8]/10 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Contrasena
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-[42px] border border-[#D1D5DB] rounded-lg px-3.5 pr-10 text-sm text-[#1E293B] placeholder-[#9CA3AF] focus:outline-none focus:border-[#00B4D8] focus:ring-[3px] focus:ring-[#00B4D8]/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] bg-[#00B4D8] hover:bg-[#009FBF] text-white text-sm font-semibold uppercase tracking-[0.04em] rounded-[10px] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(232,145,58,0.3)] active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Iniciar Sesion'
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
          <p className="text-xs uppercase text-[#94A3B8] tracking-[0.05em] font-medium mb-2">
            Credenciales de demo
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <code className="text-[13px] text-[#00B4D8] font-mono">admin@fjrservices.com</code>
              <button
                onClick={() => copyToClipboard('admin@fjrservices.com', 'email')}
                className="w-7 h-7 flex items-center justify-center rounded text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
              >
                {copiedField === 'email' ? (
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-[13px] text-[#00B4D8] font-mono">admin123</code>
              <button
                onClick={() => copyToClipboard('admin123', 'password')}
                className="w-7 h-7 flex items-center justify-center rounded text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
              >
                {copiedField === 'password' ? (
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Back to site */}
        <div className="mt-5 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#00B4D8] hover:text-[#33C5E5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}

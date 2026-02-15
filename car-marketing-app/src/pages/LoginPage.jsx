import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed top-[-20%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-blue-400/5 blur-[120px] z-0"></div>
      <div className="fixed bottom-[-20%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-cyan-400/5 blur-[100px] z-0"></div>

      <div className="glass-panel rounded-3xl p-8 md:p-10 w-full max-w-md relative z-10 fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://carmarketing.mx/wp-content/uploads/2023/10/carmarketing-blanco.jpeg"
            alt="Car Marketing"
            className="h-10 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-brand-dark mb-1">
            Bienvenido de vuelta
          </h1>
          <p className="text-slate-400 text-sm">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Email
            </label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@carmarketing.mx"
                className="input-clean w-full rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-brand-dark focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Contraseña
            </label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-clean w-full rounded-xl py-3 pl-11 pr-12 text-sm font-medium text-brand-dark focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase text-center mb-3">
            Credenciales Demo
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'Admin', email: 'admin@carmarketing.mx', pass: 'admin123', color: 'bg-red-50 text-red-500 border-red-100' },
              { role: 'Gerente', email: 'gerente@carmarketing.mx', pass: 'gerente123', color: 'bg-amber-50 text-amber-500 border-amber-100' },
              { role: 'Vendedor', email: 'vendedor@carmarketing.mx', pass: 'vendedor123', color: 'bg-green-50 text-green-500 border-green-100' },
            ].map((demo) => (
              <button
                key={demo.role}
                onClick={() => { setEmail(demo.email); setPassword(demo.pass); }}
                className={`text-[10px] font-bold py-2 px-2 rounded-xl border hover:scale-105 transition-all ${demo.color}`}
              >
                {demo.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

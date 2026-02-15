import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout, getRoleName } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'fas fa-chart-bar' },
    { to: '/quoter', label: 'Cotizador', icon: 'fas fa-calculator' },
    { to: '/crm', label: 'Clientes', icon: 'fas fa-users' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ to: '/configuration', label: 'Configuración', icon: 'fas fa-cog' });
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-panel mx-4 mt-4 rounded-full px-6 md:px-8 py-3 flex justify-between items-center max-w-7xl lg:mx-auto shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="https://carmarketing.mx/wp-content/uploads/2023/10/carmarketing-blanco.jpeg"
            alt="Car Marketing"
            className="h-7 md:h-9 w-auto object-contain"
          />
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                location.pathname === link.to
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-slate-500 hover:text-brand-dark hover:bg-white/60'
              }`}
            >
              <i className={`${link.icon} mr-2`}></i>
              {link.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={logout}
              className="ml-2 px-4 py-2 rounded-full text-sm font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          )}
        </nav>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-slate-600"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 p-6 ${mobileOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-brand-dark">Menú</span>
          <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <i className="fas fa-times"></i>
          </button>
        </div>
        {user && (
          <div className="mb-6 p-3 bg-slate-50 rounded-xl">
            <div className="font-bold text-sm text-brand-dark">{user.name}</div>
            <div className="text-xs text-slate-400 uppercase">{getRoleName(user.role)}</div>
          </div>
        )}
        <nav className="space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === link.to
                  ? 'bg-brand-light text-brand-blue'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <i className={`${link.icon} w-5`}></i> {link.label}
            </Link>
          ))}
          <button
            onClick={() => { logout(); setMobileOpen(false); }}
            className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-500 w-full"
          >
            <i className="fas fa-sign-out-alt w-5"></i> Cerrar Sesión
          </button>
        </nav>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)}></div>
      )}
    </header>
  );
}

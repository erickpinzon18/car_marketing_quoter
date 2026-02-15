import { createContext, useContext, useState, useEffect } from 'react';
import { USERS } from '../data/users';

const AuthContext = createContext(null);

const DEMO_USERS = USERS;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session (will be replaced with Firebase onAuthStateChanged)
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const found = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (found) {
          const userData = { ...found };
          delete userData.password;
          sessionStorage.setItem('currentUser', JSON.stringify(userData));
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error('Credenciales incorrectas'));
        }
      }, 800);
    });
  };

  const logout = () => {
    sessionStorage.removeItem('currentUser');
    setUser(null);
  };

  const getRoleName = (role) => {
    const names = { admin: 'Administrador', manager: 'Gerente', vendor: 'Vendedor' };
    return names[role] || 'Usuario';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getRoleName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

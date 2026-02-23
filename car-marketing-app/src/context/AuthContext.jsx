import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { getUserById } from '../firebase/services/usersService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore /users/{uid}
          const userData = await getUserById(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // Auth user exists but no Firestore profile — force logout
            console.error('No user profile found in Firestore for UID:', firebaseUser.uid);
            await signOut(auth);
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle setting the user
    // But we also return the profile for immediate use if needed
    const userData = await getUserById(credential.user.uid);
    if (!userData) {
      throw new Error('No se encontró el perfil de usuario');
    }
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await signOut(auth);
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

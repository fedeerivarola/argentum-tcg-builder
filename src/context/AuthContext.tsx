import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string, publicName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context; };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) return { uid, ...userDoc.data() } as User;
    return null;
  };

  const createUserDocument = async (uid: string, email: string, nickname: string, publicName?: string, role: 'user' | 'admin' = 'user') => {
    await setDoc(doc(db, 'users', uid), { nickname, email, publicName: publicName || null, role, createdAt: new Date(), cardCount: 0 });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) { const userData = await fetchUserData(fbUser.uid); setUser(userData); }
      else { setUser(null); }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => { await signInWithEmailAndPassword(auth, email, password); };
  const register = async (email: string, password: string, nickname: string, publicName?: string) => {
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
      if (!fbUser) throw new Error('No se pudo crear el usuario');
      await updateProfile(fbUser, { displayName: nickname });
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || '';
      const isAdmin = adminEmail ? email.toLowerCase() === adminEmail.toLowerCase() : false;
      try {
        await createUserDocument(fbUser.uid, email, nickname, publicName, isAdmin ? 'admin' : 'user');
      } catch (docError) {
        console.warn('Error creando documento de usuario en Firestore:', docError);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };
  const logout = async () => { await signOut(auth); setUser(null); setFirebaseUser(null); };

  return <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

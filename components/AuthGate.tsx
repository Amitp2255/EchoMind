import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import App from '../App';
import AuthScreen from './AuthScreen';

const AuthGate: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // A simple loader while checking auth state
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
      </div>
    );
  }

  return user ? <App user={user} /> : <AuthScreen />;
};

export default AuthGate;

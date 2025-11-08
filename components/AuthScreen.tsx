import React, { useState } from 'react';
// FIX: Removed Firebase v9 modular imports and replaced with a single import for the v8 namespaced API.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { auth, firestore } from '../services/firebase';

type AuthMode = 'login' | 'signup';

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let userCredential;
      if (mode === 'signup') {
        // FIX: Switched to v8 namespaced API for creating a user.
        userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // FIX: Switched to v8 namespaced API for updating a user profile.
        await userCredential.user?.updateProfile({ displayName: name });
        // Create user document in Firestore
        // FIX: Switched to v8 namespaced API for Firestore operations.
        if (userCredential.user) {
          await firestore.collection("users").doc(userCredential.user.uid).set({
            name: name,
            email: userCredential.user.email,
            // FIX: Switched to v8 namespaced API for server timestamp.
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
      } else {
        // FIX: Switched to v8 namespaced API for signing in a user.
        userCredential = await auth.signInWithEmailAndPassword(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // FIX: Switched to v8 namespaced API for Google Auth provider.
      const provider = new firebase.auth.GoogleAuthProvider();
      // FIX: Switched to v8 namespaced API for sign-in with popup.
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      // Create user document in Firestore if it's a new user
       // FIX: Switched to v8 namespaced API for Firestore operations.
       if (user) {
        await firestore.collection("users").doc(user.uid).set({
            name: user.displayName,
            email: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true }); // Merge to avoid overwriting existing data
       }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-100 p-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400" style={{ fontFamily: "'Lora', serif" }}>
            EchoMind
          </h1>
          <p className="text-md text-slate-400">Feel. Reflect. Grow.</p>
        </header>

        <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
          <div className="flex border-b border-slate-700 mb-6">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === 'login' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>
              Login
            </button>
            <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === 'signup' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>
              Sign Up
            </button>
          </div>
          
          <form onSubmit={handleAuthAction} className="space-y-4">
            {mode === 'signup' && (
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
            <button type="submit" disabled={isLoading} className="w-full py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed font-semibold">
              {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </form>

          {error && <p className="text-red-400 text-xs mt-4 text-center">{error}</p>}
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-500">OR</span>
            </div>
          </div>

          <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full py-2 flex items-center justify-center gap-2 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed font-semibold">
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.94C34.353 4.909 29.489 2.5 24 2.5C11.318 2.5 2.5 11.318 2.5 24s8.818 21.5 21.5 21.5S45.5 36.682 45.5 24c0-1.541-.138-3.041-.389-3.917z"></path>
              <path fill="#FF3D00" d="M6.306 14.691c-1.229 2.195-1.929 4.704-1.929 7.309s.7 5.114 1.929 7.309l-5.166 4.028C.61 30.089 0 27.135 0 24s.61-6.089 1.14-8.717l5.166 4.028z"></path>
              <path fill="#4CAF50" d="M24 45.5c5.411 0 10.21-1.839 13.72-4.92l-5.066-3.94c-2.189 1.456-4.943 2.36-7.654 2.36-4.92 0-9.15-2.81-10.75-6.83l-5.166 4.028C8.717 41.59 15.64 45.5 24 45.5z"></path>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.066 3.94c3.12-2.91 4.944-7.202 4.944-11.914c0-1.541-.138-3.041-.389-3.917z"></path>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
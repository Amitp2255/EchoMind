// FIX: Changed Firebase imports and initialization to v8 compat/namespaced style to fix module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkoK0bgU5exz5T6JxtAKkK-C1vMLMwhvM",
  authDomain: "edupath-ai-73ddd.firebaseapp.com",
  projectId: "edupath-ai-73ddd",
  storageBucket: "edupath-ai-73ddd.firebasestorage.app",
  messagingSenderId: "156258923875",
  appId: "1:156258923875:web:86d06d560b47ba763fcf56",
  measurementId: "G-EQC4NXFPVN"
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
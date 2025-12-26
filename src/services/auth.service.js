import React, { createContext, useContext, useEffect, useState } from 'react';
import app from '../firebase/firebase.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { firestoreService } from '../firebase/firestore';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // create or sync user profile in Firestore
  const createUserProfile = async (firebaseUser, additionalData = {}) => {
    try {
      const userDoc = await firestoreService.getDocument('users', firebaseUser.uid);
      if (!userDoc) {
        const profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || additionalData.fullName || '',
          username: additionalData.username || (firebaseUser.email || '').split('@')[0],
          registrationNo: additionalData.registrationNo || '',
          phoneNumber: additionalData.phoneNumber || '',
          profilePicture: firebaseUser.photoURL || additionalData.profilePicture || '',
          rating: 5.0,
          totalTrades: 0,
          createdAt: new Date()
        };
        await firestoreService.createDocument('users', profile, firebaseUser.uid);
        setUserData({ id: firebaseUser.uid, ...profile });
      } else {
        setUserData(userDoc);
      }
      return true;
    } catch (err) {
      console.error('createUserProfile error', err);
      return false;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const doc = await firestoreService.getDocument('users', firebaseUser.uid);
        if (doc) setUserData(doc);
        else await createUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
      setError(null);
    });

    return () => unsub();
  }, []);

  // Auth functions
  const signUpWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const uc = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: uc.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await createUserProfile(res.user);
      }
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedData) => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) throw new Error('No user logged in');

      // Update Firestore
      const res = await firestoreService.updateDocument('users', auth.currentUser.uid, updatedData);
      if (res.success) {
        setUserData(prev => ({ ...prev, ...updatedData }));
      }

      // Also update Firebase Auth displayName/photoURL if present
      if (updatedData.fullName || updatedData.profilePicture) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: updatedData.fullName || auth.currentUser.displayName,
            photoURL: updatedData.profilePicture || auth.currentUser.photoURL
          });
        } catch (err) {
          console.warn('Failed to update auth profile:', err.message);
        }
      }

      return res;
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (data) => {
    // alias for updateUserProfile to match previous API
    return updateUserProfile(data);
  };

  const value = {
    user,
    userData,
    loading,
    error,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    signOut,
    updateUserProfile,
    updateUserData,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default {
  useAuth,
  AuthProvider
};

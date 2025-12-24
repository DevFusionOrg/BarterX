import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../firebase/auth';
import { firestoreService } from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create user profile in Firestore
  const createUserProfile = async (firebaseUser, additionalData = {}) => {
    try {
      const userDoc = await firestoreService.getDocument('users', firebaseUser.uid);
      
      if (!userDoc) {
        // Create new user profile
        const userProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || additionalData.fullName || '',
          username: additionalData.username || firebaseUser.email.split('@')[0],
          registrationNo: additionalData.registrationNo || '',
          phoneNumber: additionalData.phoneNumber || '',
          profilePicture: firebaseUser.photoURL || additionalData.profilePicture || '',
          rating: 5.0,
          totalTrades: 0
        };
        
        await firestoreService.createDocument('users', userProfile, firebaseUser.uid);
        setUserData({ id: firebaseUser.uid, ...userProfile });
      } else {
        // Update existing user data
        setUserData(userDoc);
      }
      
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Get user data from Firestore
        const userDoc = await firestoreService.getDocument('users', firebaseUser.uid);
        if (userDoc) {
          setUserData(userDoc);
        } else {
          // Create basic user profile if doesn't exist
          await createUserProfile(firebaseUser);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  // Sign up with email
  const signUpWithEmail = async (email, password, userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signUpWithEmail(email, password);
      
      if (result.success && result.user) {
        // Update Firebase profile
        await authService.updateUserProfile(userData.fullName, null);
        
        // Create user profile in Firestore
        await createUserProfile(result.user, userData);
        
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Sign up failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email
  const signInWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithEmail(email, password);
      
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Sign in failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithGoogle();
      
      if (result.success && result.user) {
        // Create/update user profile
        await createUserProfile(result.user);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Google sign in failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.resetPassword(email);
      
      if (result.success) {
        return { success: true };
      } else {
        throw new Error(result.error || 'Password reset failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signOut();
      
      if (result.success) {
        setUser(null);
        setUserData(null);
        return { success: true };
      } else {
        throw new Error(result.error || 'Sign out failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      // Update Firestore
      const result = await firestoreService.updateDocument('users', user.uid, updatedData);
      
      if (result.success) {
        // Update local state
        setUserData(prev => ({ ...prev, ...updatedData }));
        return { success: true };
      } else {
        throw new Error(result.error || 'Profile update failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
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
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
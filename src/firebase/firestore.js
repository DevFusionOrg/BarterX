import app from './firebase.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot 
} from "firebase/firestore";

const db = getFirestore(app);

// Collections
export const usersCollection = collection(db, "users");
export const itemsCollection = collection(db, "items");
export const requestsCollection = collection(db, "requests");
export const chatsCollection = collection(db, "chats");
export const messagesCollection = collection(db, "messages");

// Helper Functions
export const firestoreService = {
  // Create document
  createDocument: async (collectionName, data, id = null) => {
    try {
      if (id) {
        const docRef = doc(db, collectionName, id);
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return { success: true, id };
      } else {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
      }
    } catch (error) {
      console.error(`Error creating document:`, error);
      return { success: false, error: error.message };
    }
  },

  // Get document
  getDocument: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error(`Error getting document:`, error);
      return null;
    }
  },

  // Update document
  updateDocument: async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error(`Error updating document:`, error);
      return { success: false, error: error.message };
    }
  },

  // Delete document
  deleteDocument: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting document:`, error);
      return { success: false, error: error.message };
    }
  },

  // Query collection
  queryCollection: async (collectionName, conditions = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = 20) => {
    try {
      let q = query(collection(db, collectionName));
      
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error(`Error querying collection:`, error);
      return [];
    }
  },

  // Real-time updates
  getRealtimeUpdates: (collectionName, conditions, callback) => {
    try {
      let q = query(collection(db, collectionName));
      
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      return onSnapshot(q, (snapshot) => {
        const results = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        callback(results);
      });
    } catch (error) {
      console.error(`Error setting up realtime updates:`, error);
      return () => {};
    }
  }
};

export { db, getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs, serverTimestamp, Timestamp };
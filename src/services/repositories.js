import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const db = getFirestore();

/**
 * Items Repository
 * Handles all item-related Firestore operations
 */
export const itemsRepository = {
  /**
   * Create a new item listing
   */
  async createItem(userId, itemData) {
    try {
      const itemRef = doc(collection(db, 'items'));
      const itemWithMetadata = {
        ...itemData,
        ownerId: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        viewCount: 0,
        likedBy: [],
        status: 'available',
      };

      await setDoc(itemRef, itemWithMetadata);

      // Update user's item count
      await updateDoc(doc(db, 'users', userId), {
        itemsListedCount: arrayUnion(itemRef.id),
      });

      return { success: true, itemId: itemRef.id };
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  /**
   * Get item by ID
   */
  async getItemById(itemId) {
    try {
      const itemRef = doc(db, 'items', itemId);
      const itemSnap = await getDoc(itemRef);

      if (!itemSnap.exists()) {
        throw new Error('Item not found');
      }

      return { id: itemSnap.id, ...itemSnap.data() };
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  },

  /**
   * Update item
   */
  async updateItem(itemId, updateData) {
    try {
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  /**
   * Delete item
   */
  async deleteItem(itemId, userId) {
    try {
      const itemRef = doc(db, 'items', itemId);
      await deleteDoc(itemRef);

      // Remove from user's items list
      await updateDoc(doc(db, 'users', userId), {
        itemsListed: arrayUnion(itemId),
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  /**
   * Get all items with filters and pagination
   */
  async getItems(filters = {}, lastVisible = null, pageSize = 10) {
    try {
      const constraints = [where('status', '==', 'available')];

      // Add filters
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters.condition) {
        constraints.push(where('condition', '==', filters.condition));
      }
      if (filters.ownerId) {
        constraints.push(where('ownerId', '==', filters.ownerId));
      }
      if (filters.minPrice !== undefined) {
        constraints.push(where('price', '>=', filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        constraints.push(where('price', '<=', filters.maxPrice));
      }

      // Add ordering
      constraints.push(orderBy('createdAt', 'desc'));

      // Add pagination
      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }
      constraints.push(limit(pageSize));

      const q = query(collection(db, 'items'), ...constraints);
      const querySnapshot = await getDocs(q);

      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      return {
        items,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: items.length === pageSize,
      };
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  /**
   * Search items by name or description
   */
  async searchItems(searchTerm, pageSize = 10) {
    try {
      // Firebase doesn't support full-text search directly
      // This is a simple implementation - for production, consider using Algolia or ElasticSearch
      const q = query(
        collection(db, 'items'),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(q);
      const items = [];

      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        const searchStr = `${item.name} ${item.description} ${item.category}`.toLowerCase();
        if (searchStr.includes(searchTerm.toLowerCase())) {
          items.push(item);
        }
      });

      return items;
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  },

  /**
   * Get recent items
   */
  async getRecentItems(limit_count = 10) {
    try {
      const q = query(
        collection(db, 'items'),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      );

      const querySnapshot = await getDocs(q);
      const items = [];

      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      return items;
    } catch (error) {
      console.error('Error fetching recent items:', error);
      throw error;
    }
  },

  /**
   * Increment view count
   */
  async incrementViewCount(itemId) {
    try {
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, {
        viewCount: (await getDoc(itemRef)).data().viewCount + 1 || 1,
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  },
};

/**
 * Requests Repository
 * Handles barter request operations
 */
export const requestsRepository = {
  /**
   * Create a barter request
   */
  async createRequest(requestData) {
    try {
      const requestRef = doc(collection(db, 'requests'));
      const requestWithMetadata = {
        ...requestData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'pending',
      };

      await setDoc(requestRef, requestWithMetadata);

      // Send notification to receiver
      await updateDoc(doc(db, 'users', requestData.receiverId), {
        notifications: arrayUnion({
          type: 'barter_request',
          senderId: requestData.senderId,
          itemId: requestData.itemId,
          requestId: requestRef.id,
          read: false,
          createdAt: Timestamp.now(),
        }),
      });

      return { success: true, requestId: requestRef.id };
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  },

  /**
   * Get request by ID
   */
  async getRequestById(requestId) {
    try {
      const requestRef = doc(db, 'requests', requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) {
        throw new Error('Request not found');
      }

      return { id: requestSnap.id, ...requestSnap.data() };
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
  },

  /**
   * Get requests for a user
   */
  async getUserRequests(userId, role = 'receiver') {
    try {
      const field = role === 'receiver' ? 'receiverId' : 'senderId';
      const q = query(
        collection(db, 'requests'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const requests = [];

      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });

      return requests;
    } catch (error) {
      console.error('Error fetching user requests:', error);
      throw error;
    }
  },

  /**
   * Update request status
   */
  async updateRequestStatus(requestId, status) {
    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, {
        status,
        updatedAt: Timestamp.now(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  },
};

/**
 * Messages Repository
 * Handles messaging/chat operations
 */
export const messagesRepository = {
  /**
   * Send a message
   */
  async sendMessage(conversationId, senderId, messageData) {
    try {
      const messageRef = doc(collection(db, `conversations/${conversationId}/messages`));
      const messageWithMetadata = {
        ...messageData,
        senderId,
        createdAt: Timestamp.now(),
        read: false,
      };

      await setDoc(messageRef, messageWithMetadata);

      // Update conversation
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: messageData.text,
        lastMessageTime: Timestamp.now(),
        lastMessageSenderId: senderId,
      });

      return { success: true, messageId: messageRef.id };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Get conversation messages
   */
  async getMessages(conversationId, limit_count = 50) {
    try {
      const q = query(
        collection(db, `conversations/${conversationId}/messages`),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      );

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });

      return messages.reverse(); // Show oldest first
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Create or get conversation
   */
  async createConversation(userId1, userId2) {
    try {
      const conversationId = [userId1, userId2].sort().join('_');
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        await setDoc(conversationRef, {
          participants: [userId1, userId2],
          createdAt: Timestamp.now(),
          lastMessage: '',
          lastMessageTime: Timestamp.now(),
        });
      }

      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },
};

import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, updateProfile as firebaseUpdateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import cloudinaryService from './cloudinary.service';

class ProfileService {
  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
  }

  /**
   * Get user profile data
   * @param {string} userId - User ID
   * @returns {Promise} User profile data
   */
  async getProfile(userId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return {
          success: true,
          data: userSnap.data(),
        };
      } else {
        return {
          success: false,
          error: 'User profile not found',
        };
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch profile',
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} data - Profile data to update
   * @returns {Promise} Update result
   */
  async updateProfile(userId, data) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate data
      if (data.fullName && !data.fullName.trim()) {
        throw new Error('Full name cannot be empty');
      }

      if (data.username && !data.username.trim()) {
        throw new Error('Username cannot be empty');
      }

      // Check if username is unique (if changed)
      if (data.username) {
        const existingUser = await this.getUserByUsername(data.username, userId);
        if (existingUser) {
          throw new Error('Username is already taken');
        }
      }

      const userRef = doc(this.db, 'users', userId);
      
      // Update Firestore
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });

      // Update Firebase Auth profile if name changed
      if (data.fullName) {
        await firebaseUpdateProfile(user, {
          displayName: data.fullName,
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Update profile picture
   * @param {string} userId - User ID
   * @param {string} imageUrl - New image URL
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise} Update result
   */
  async updateProfilePicture(userId, imageUrl, publicId) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userRef = doc(this.db, 'users', userId);

      // Get old profile picture public ID to delete
      const userSnap = await getDoc(userRef);
      const oldPublicId = userSnap.data()?.profilePicturePublicId;

      // Update Firestore
      await updateDoc(userRef, {
        profilePicture: imageUrl,
        profilePicturePublicId: publicId,
        updatedAt: new Date(),
      });

      // Update Firebase Auth profile photo
      await firebaseUpdateProfile(user, {
        photoURL: imageUrl,
      });

      // Delete old image from Cloudinary if exists
      if (oldPublicId) {
        await cloudinaryService.deleteImage(oldPublicId);
      }

      return true;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw new Error(error.message || 'Failed to update profile picture');
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Change result
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // Validate passwords
      if (!currentPassword || !newPassword) {
        return {
          success: false,
          error: 'Current and new passwords are required',
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          error: 'New password must be at least 6 characters',
        };
      }

      // Reauthenticate user
      try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      } catch (error) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // Update password
      await updatePassword(user, newPassword);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.message || 'Failed to change password',
      };
    }
  }

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise} User stats
   */
  async getUserStats(userId) {
    try {
      // Get user profile
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const userData = userSnap.data();

      // Get items count
      const itemsRef = collection(this.db, `users/${userId}/items`);
      const itemsSnap = await getDocs(itemsRef);

      // Get trades count (simplified - you may need to adjust based on your data structure)
      const tradesCollection = collection(this.db, `users/${userId}/trades`);
      const tradesSnap = await getDocs(tradesCollection);

      return {
        itemsListed: itemsSnap.size || 0,
        itemsTraded: tradesSnap.size || 0,
        rating: userData.rating || 5.0,
        reviews: userData.reviewCount || 0,
        joinDate: userData.createdAt || new Date(),
        accountStatus: userData.accountStatus || 'active',
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        itemsListed: 0,
        itemsTraded: 0,
        rating: 5.0,
        reviews: 0,
      };
    }
  }

  /**
   * Get user by username
   * @param {string} username - Username to search
   * @param {string} excludeUserId - User ID to exclude from search
   * @returns {Promise} User data if found
   */
  async getUserByUsername(username, excludeUserId = null) {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      // If we need to exclude a user (for update checks)
      if (excludeUserId) {
        const filtered = querySnapshot.docs.filter(doc => doc.id !== excludeUserId);
        return filtered.length > 0 ? filtered[0].data() : null;
      }

      return querySnapshot.docs[0].data();
    } catch (error) {
      console.error('Error searching for user:', error);
      return null;
    }
  }

  /**
   * Create user profile (called on signup)
   * @param {string} userId - User ID
   * @param {Object} data - User data
   * @returns {Promise} Creation result
   */
  async createUserProfile(userId, data) {
    try {
      const userRef = doc(this.db, 'users', userId);

      const profileData = {
        uid: userId,
        fullName: data.fullName || '',
        username: (data.username || '').toLowerCase(),
        email: data.email || '',
        profilePicture: null,
        profilePicturePublicId: null,
        bio: '',
        location: '',
        website: '',
        rating: 5.0,
        reviewCount: 0,
        accountStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(userRef, profileData);

      return {
        success: true,
        data: profileData,
      };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user profile',
      };
    }
  }

  /**
   * Get profile completion percentage
   * @param {string} userId - User ID
   * @returns {Promise} Completion percentage
   */
  async getProfileCompletion(userId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return 0;
      }

      const data = userSnap.data();
      const fields = ['fullName', 'username', 'profilePicture', 'bio', 'location'];
      const filledFields = fields.filter(field => {
        const value = data[field];
        return value && (typeof value === 'string' ? value.trim() : value);
      }).length;

      return Math.round((filledFields / fields.length) * 100);
    } catch (error) {
      console.error('Error calculating profile completion:', error);
      return 0;
    }
  }

  /**
   * Update user rating
   * @param {string} userId - User ID
   * @param {number} newRating - New rating value
   * @returns {Promise} Update result
   */
  async updateUserRating(userId, newRating) {
    try {
      if (newRating < 1 || newRating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const currentRating = userSnap.data().rating || 5.0;
      const reviewCount = userSnap.data().reviewCount || 0;

      // Calculate new average rating
      const totalRating = (currentRating * reviewCount) + newRating;
      const averageRating = totalRating / (reviewCount + 1);

      await updateDoc(userRef, {
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: reviewCount + 1,
        updatedAt: new Date(),
      });

      return {
        success: true,
        rating: averageRating,
      };
    } catch (error) {
      console.error('Error updating rating:', error);
      return {
        success: false,
        error: error.message || 'Failed to update rating',
      };
    }
  }
}

export default new ProfileService();
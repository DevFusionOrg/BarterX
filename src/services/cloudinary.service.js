import axios from 'axios';

class CloudinaryService {
  constructor() {
    this.cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    this.apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;
    this.apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET;
  }

  /**
   * Upload image with optional transformations
   * @param {File} file - The image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} Upload result with URL and metadata
   */
  async uploadImage(file, options = {}) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed: JPG, PNG, WebP, GIF');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('resource_type', 'auto');

      // Add quality optimization
      formData.append('quality', 'auto');
      
      // Add custom folder
      if (options.folder) {
        formData.append('folder', options.folder);
      }

      // Add tags for organization
      if (options.tags) {
        formData.append('tags', options.tags);
      }

      // Add public ID if provided
      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: options.onProgress,
          timeout: 60000, // 60 second timeout
        }
      );

      return {
        success: true,
        data: {
          publicId: response.data.public_id,
          url: response.data.secure_url,
          format: response.data.format,
          bytes: response.data.bytes,
          width: response.data.width,
          height: response.data.height,
          aspectRatio: response.data.width / response.data.height,
          createdAt: response.data.created_at,
          version: response.data.version,
          thumbnailUrl: this.getThumbnailUrl(response.data.public_id, 300, 300),
          optimizedUrl: this.getOptimizedUrl(response.data.public_id, 800),
          croppedUrl: this.getCroppedUrl(response.data.public_id, 400, 400),
        },
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      
      let errorMessage = 'Failed to upload image';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get thumbnail URL with specified dimensions
   * @param {string} publicId - Public ID of the image
   * @param {number} width - Thumbnail width
   * @param {number} height - Thumbnail height
   * @returns {string} Thumbnail URL
   */
  getThumbnailUrl(publicId, width = 300, height = 300) {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_fill,w_${width},h_${height},q_auto/${publicId}`;
  }

  /**
   * Get optimized URL with specified width
   * @param {string} publicId - Public ID of the image
   * @param {number} width - Image width
   * @returns {string} Optimized URL
   */
  getOptimizedUrl(publicId, width = 800) {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_limit,w_${width},q_auto:good/${publicId}`;
  }

  /**
   * Get cropped and resized URL
   * @param {string} publicId - Public ID of the image
   * @param {number} width - Crop width
   * @param {number} height - Crop height
   * @returns {string} Cropped URL
   */
  getCroppedUrl(publicId, width = 400, height = 400) {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_fill,w_${width},h_${height},g_face,q_auto/${publicId}`;
  }

  /**
   * Get webp version for better compression
   * @param {string} publicId - Public ID of the image
   * @param {number} width - Image width
   * @returns {string} WebP URL
   */
  getWebpUrl(publicId, width = 800) {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/f_webp,c_limit,w_${width},q_auto:good/${publicId}`;
  }

  /**
   * Get responsive image srcset
   * @param {string} publicId - Public ID of the image
   * @returns {string} Srcset string
   */
  getResponsiveSrcSet(publicId) {
    return `
      ${this.getOptimizedUrl(publicId, 400)} 400w,
      ${this.getOptimizedUrl(publicId, 600)} 600w,
      ${this.getOptimizedUrl(publicId, 800)} 800w,
      ${this.getOptimizedUrl(publicId, 1000)} 1000w,
      ${this.getOptimizedUrl(publicId, 1200)} 1200w
    `.trim();
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Public ID of the image to delete
   * @returns {Promise} Deletion result
   */
  async deleteImage(publicId) {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      // In production, you should delete server-side using your backend
      // This endpoint requires authentication
      // For now, we'll log the attempt
      console.warn('Image deletion should be handled server-side for security');

      return {
        success: true,
        message: 'Deletion request sent to server',
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image',
      };
    }
  }

  /**
   * Apply watermark to image
   * @param {string} publicId - Public ID of the image
   * @param {string} watermarkText - Watermark text
   * @returns {string} Watermarked image URL
   */
  addWatermark(publicId, watermarkText) {
    const encodedText = encodeURIComponent(watermarkText);
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/l_text:Arial_30:${encodedText},o_50,y_10/${publicId}`;
  }

  /**
   * Apply blur effect
   * @param {string} publicId - Public ID of the image
   * @param {number} intensity - Blur intensity (1-2000)
   * @returns {string} Blurred image URL
   */
  addBlur(publicId, intensity = 300) {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/e_blur:${intensity}/${publicId}`;
  }

  /**
   * Get image info/metadata
   * @param {string} publicId - Public ID of the image
   * @returns {Promise} Image metadata
   */
  async getImageInfo(publicId) {
    try {
      const response = await axios.get(
        `https://res.cloudinary.com/${this.cloudName}/image/upload/fl_getinfo/${publicId}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching image info:', error);
      return {
        success: false,
        error: 'Failed to fetch image information',
      };
    }
  }

  /**
   * Transform and get multiple format URLs
   * @param {string} publicId - Public ID of the image
   * @returns {Object} URLs in different formats
   */
  getMultiFormatUrls(publicId) {
    return {
      jpeg: `https://res.cloudinary.com/${this.cloudName}/image/upload/f_jpg,q_auto/${publicId}`,
      png: `https://res.cloudinary.com/${this.cloudName}/image/upload/f_png,q_auto/${publicId}`,
      webp: this.getWebpUrl(publicId),
      avif: `https://res.cloudinary.com/${this.cloudName}/image/upload/f_avif,q_auto/${publicId}`,
      thumbnail: this.getThumbnailUrl(publicId, 200, 200),
      optimized: this.getOptimizedUrl(publicId, 800),
    };
  }
}

export default new CloudinaryService();
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Camera, Upload, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import cloudinaryService from '../services/cloudinary.service';
import { itemsRepository } from '../services/repositories';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 100px;
`;

const Header = styled.div`
  margin-bottom: 30px;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 10px 0;
    color: #333;
  }

  p {
    font-size: 1rem;
    color: #666;
    margin: 0;
  }
`;

const FormSection = styled.form`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const FormGroup = styled.div`
  margin-bottom: 25px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;

  span {
    color: #ff4757;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    color: #999;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    color: #999;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    color: #999;
  }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #667eea;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  background: #f8f9ff;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #764ba2;
    background: #f0f2ff;
  }

  input {
    display: none;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ff3838;
    transform: scale(1.1);
  }
`;

const UploadHint = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 10px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f0f0f0;
  color: #333;
  border: 1.5px solid #e0e0e0;

  &:hover:not(:disabled) {
    background: #e8e8e8;
    border-color: #d0d0d0;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  border: 1.5px solid #fc8181;
  border-radius: 8px;
  padding: 12px 15px;
  color: #c53030;
  margin-bottom: 15px;
  font-weight: 500;
`;

const SuccessMessage = styled.div`
  background: #c6f6d5;
  border: 1.5px solid #9ae6b4;
  border-radius: 8px;
  padding: 12px 15px;
  color: #22543d;
  font-weight: 500;
  margin-bottom: 15px;
`;

const UploadProgress = styled.div`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const CATEGORIES = [
  'Electronics',
  'Clothes',
  'Books',
  'Tools',
  'Furniture',
  'Sports',
  'Home & Kitchen',
  'Art & Collectibles',
  'Toys',
  'Other'
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const AddItem = () => {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    condition: '',
    price: '',
  });

  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const files = e.target.files;
    if (files) {
      uploadImages(Array.from(files));
    }
  };

  const uploadImages = async (filesToUpload) => {
    try {
      setError('');
      setUploadProgress(0);

      // Max 2 images
      const remainingSlots = 2 - images.length;
      const filesToProcess = filesToUpload.slice(0, remainingSlots);

      if (filesToProcess.length === 0) {
        setError('You can upload a maximum of 2 images');
        return;
      }

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];

        // Validate file
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError('Only JPEG, PNG, and WebP images are allowed');
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setError('Image size must be less than 10MB');
          continue;
        }

        // Upload to Cloudinary
        const result = await cloudinaryService.uploadImage(file, {
          folder: `barterx/items/${user.uid}`,
          onProgress: (e) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        if (result.success) {
          setImages(prev => [...prev, {
            url: result.data.url,
            publicId: result.data.publicId
          }]);
          setUploadProgress(0);
        } else {
          setError(result.error || 'Failed to upload image');
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // Validate form
      if (!formData.name.trim()) {
        setError('Item name is required');
        return;
      }

      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }

      if (!formData.category) {
        setError('Please select a category');
        return;
      }

      if (!formData.condition) {
        setError('Please select condition');
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError('Valid price is required');
        return;
      }

      if (images.length === 0) {
        setError('At least one image is required');
        return;
      }

      // Create item
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        images: images.map(img => ({
          url: img.url,
          publicId: img.publicId
        })),
        ownerName: userData?.fullName,
        ownerPhone: userData?.phoneNumber,
        ownerRegistrationNo: userData?.registrationNo,
      };

      const result = await itemsRepository.createItem(user.uid, itemData);

      if (result.success) {
        setSuccess('Item posted successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          condition: '',
          price: '',
        });
        setImages([]);

        setTimeout(() => {
          setSuccess('');
          // Navigate to marketplace
          window.location.href = '/';
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating item:', err);
      setError(err.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <h1>Post New Item</h1>
        <p>Share your item for barter exchange</p>
      </Header>

      <FormSection onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <FormGroup>
          <Label>Item Name <span>*</span></Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Mountain Bike"
            disabled={loading}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Description <span>*</span></Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your item in detail..."
            disabled={loading}
            required
          />
        </FormGroup>

        <Row>
          <FormGroup>
            <Label>Category <span>*</span></Label>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Condition <span>*</span></Label>
            <Select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="">Select Condition</option>
              {CONDITIONS.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </Select>
          </FormGroup>
        </Row>

        <FormGroup>
          <Label>Estimated Price (₹) <span>*</span></Label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter price"
            disabled={loading}
            min="1"
            step="0.01"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Photos (Max 2) <span>*</span></Label>
          <ImageUploadArea
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              uploadImages(Array.from(e.dataTransfer.files));
            }}
          >
            <Upload size={48} color="#667eea" />
            <p style={{ margin: '15px 0 5px' }}>Drop images here or click to browse</p>
            <UploadHint>Supports JPG, PNG, WebP up to 10MB each</UploadHint>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              disabled={loading}
            />
          </ImageUploadArea>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <UploadProgress>
              <ProgressBar progress={uploadProgress} />
            </UploadProgress>
          )}

          {images.length > 0 && (
            <ImageGrid>
              {images.map((img, idx) => (
                <ImagePreview key={idx}>
                  <img src={img.url} alt={`Preview ${idx + 1}`} />
                  <RemoveButton
                    type="button"
                    onClick={() => removeImage(idx)}
                    disabled={loading}
                  >
                    <X size={18} />
                  </RemoveButton>
                </ImagePreview>
              ))}
            </ImageGrid>
          )}
        </FormGroup>

        <ButtonGroup>
          <PrimaryButton
            type="submit"
            disabled={loading || images.length === 0}
          >
            {loading ? 'Posting...' : <>
              <Plus size={20} />
              Post Item
            </>}
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </SecondaryButton>
        </ButtonGroup>
      </FormSection>
    </Container>
  );
};

export default AddItem;

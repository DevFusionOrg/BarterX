import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth.service';
import { Loader2, AlertCircle, Upload, Edit2, Lock, LogOut } from 'lucide-react';
import cloudinaryService from '../services/cloudinary.service';
import profileService from '../services/profile.service';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  padding-bottom: 100px;
  min-height: 100vh;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  color: white;
  margin-bottom: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
`;

const ProfileImageSection = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const ProfileImage = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 5px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const PlaceholderImage = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5px dashed rgba(255, 255, 255, 0.5);
  font-size: 3rem;
`;

const ImageUploadButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50px;
  height: 50px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background: #764ba2;
    transform: scale(1.1);
  }

  input {
    display: none;
  }

  svg {
    color: white;
    width: 24px;
    height: 24px;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const UserUsername = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0 0 20px 0;
  color: rgba(255, 255, 255, 0.8);
`;

const UserEmail = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
  word-break: break-all;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 25px 0;
  color: #333;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
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
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;

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
  min-height: 100px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 25px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 24px;
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

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SidebarButton = styled(Button)`
  width: 100%;
  background: ${props => props.danger ? '#ff4757' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  padding: 15px 20px;
  font-weight: 600;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
`;

const Spinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  color: #667eea;
  width: 48px;
  height: 48px;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  background: #fed7d7;
  border: 1.5px solid #fc8181;
  border-radius: 10px;
  padding: 25px;
  color: #c53030;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
  flex: 1;
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
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 10px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, userData, signOut, updateUserData } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    bio: '',
    location: '',
    profilePicture: ''
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // User stats
  const [stats, setStats] = useState({
    itemsListed: 0,
    itemsTraded: 0,
  });

    const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user) {
        setError('User not found. Please log in.');
        return;
      }

      // Set profile data from auth context
      setProfileData(prev => ({
        ...prev,
        fullName: userData?.fullName || '',
        username: userData?.username || '',
        bio: userData?.bio || '',
        location: userData?.location || '',

        profilePicture: userData?.profilePicture || ''
      }));

      // Load user stats
      const userStats = await profileService.getUserStats(user.uid);
      if (userStats) {
        setStats(userStats);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, userData]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(10);
      setError('');

      // Upload to Cloudinary
      const result = await cloudinaryService.uploadImage(file, {
        folder: 'barterx/profiles',
        transformation: {
          width: 400,
          height: 400,
          crop: 'fill',
          quality: 'auto'
        },
        onProgress: (e) => {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(Math.min(progress, 90));
        }
      });

      if (result.success) {
        setUploadProgress(95);
        
        // Update profile picture in database
        const updated = await profileService.updateProfilePicture(
          user.uid,
          result.data.url,
          result.data.publicId
        );

        if (updated) {
          setProfileData(prev => ({
            ...prev,
            profilePicture: result.data.url
          }));
          
          // Update auth context
          await updateUserData({
            ...userData,
            profilePicture: result.data.url
          });

          setSuccess('Profile picture updated successfully!');
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(0), 1000);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload profile picture');
      setUploadProgress(0);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      // Validate form
      if (!profileData.fullName.trim()) {
        setError('Full name is required');
        return;
      }

      if (!profileData.username.trim()) {
        setError('Username is required');
        return;
      }

      // Update profile
      const updated = await profileService.updateProfile(user.uid, {
        fullName: profileData.fullName,
        username: profileData.username,
        bio: profileData.bio,
        location: profileData.location
      });

      if (updated) {
        await updateUserData({
          ...userData,
          fullName: profileData.fullName,
          username: profileData.username,
          bio: profileData.bio,
          location: profileData.location
        });
        
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      // Validate passwords
      if (!passwordData.currentPassword.trim()) {
        setError('Current password is required');
        return;
      }

      if (!passwordData.newPassword.trim()) {
        setError('New password is required');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }

      // Change password
      const result = await profileService.changePassword(
        user.uid,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner />
          <LoadingText>Loading your profile...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <ErrorContainer>
          <AlertCircle size={24} />
          <ErrorMessage>
            Please log in to view your profile.
          </ErrorMessage>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      {error && (
        <ErrorContainer>
          <AlertCircle size={24} />
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorContainer>
      )}

      <Header>
        <HeaderContent>
          <ProfileImageSection>
            {profileData.profilePicture ? (
              <ProfileImage src={profileData.profilePicture} alt={profileData.fullName} />
            ) : (
              <PlaceholderImage>👤</PlaceholderImage>
            )}
            <ImageUploadButton htmlFor="profile-image-input">
              <Upload size={24} />
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                disabled={updating}
              />
            </ImageUploadButton>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <UploadProgress>
                <ProgressBar progress={uploadProgress} />
              </UploadProgress>
            )}
          </ProfileImageSection>

          <ProfileInfo>
            <UserName>{profileData.fullName}</UserName>
            <UserUsername>@{profileData.username}</UserUsername>
            <UserEmail>{user.email}</UserEmail>

            <StatsGrid>
              <StatCard>
                <StatValue>{stats.itemsListed}</StatValue>
                <StatLabel>Items Listed</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.itemsTraded}</StatValue>
                <StatLabel>Traded</StatLabel>
              </StatCard>
            </StatsGrid>
          </ProfileInfo>
        </HeaderContent>
      </Header>

      <ContentGrid>
        <MainContent>
          <Section>
            <SectionTitle>Edit Profile</SectionTitle>
            
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <form onSubmit={handleProfileUpdate}>
              <FormGroup>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    fullName: e.target.value
                  }))}
                  placeholder="Enter your full name"
                  disabled={updating}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')
                  }))}
                  placeholder="Enter your username"
                  disabled={updating}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="bio">Bio</Label>
                <TextArea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    bio: e.target.value
                  }))}
                  placeholder="Tell us about yourself"
                  disabled={updating}
                  maxLength="500"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    location: e.target.value
                  }))}
                  placeholder="Your city or region"
                  disabled={updating}
                />
              </FormGroup>

              <ButtonGroup>
                <PrimaryButton type="submit" disabled={updating}>
                  <Edit2 size={18} />
                  {updating ? 'Saving...' : 'Save Changes'}
                </PrimaryButton>
              </ButtonGroup>
            </form>
          </Section>

          <Section>
            <SectionTitle>Change Password</SectionTitle>
            
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <form onSubmit={handlePasswordChange}>
              <FormGroup>
                <Label htmlFor="currentPassword">Current Password *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  placeholder="Enter your current password"
                  disabled={updating}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="newPassword">New Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  placeholder="Enter new password (min 6 characters)"
                  disabled={updating}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  placeholder="Re-enter your new password"
                  disabled={updating}
                  required
                />
              </FormGroup>

              <ButtonGroup>
                <PrimaryButton type="submit" disabled={updating}>
                  <Lock size={18} />
                  {updating ? 'Updating...' : 'Update Password'}
                </PrimaryButton>
              </ButtonGroup>
            </form>
          </Section>
        </MainContent>

        <Sidebar>
          <Section>
            <SectionTitle>Account</SectionTitle>
            <SidebarButton onClick={handleLogout} danger>
              <LogOut size={18} />
              Logout
            </SidebarButton>
          </Section>

          <Section>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
              Quick Info
            </h3>
            <div style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.8' }}>
              <div><strong>Member Since:</strong> {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</div>
              <div style={{ marginTop: '10px' }}><strong>Account Status:</strong> Active</div>
            </div>
          </Section>
        </Sidebar>
      </ContentGrid>
    </Container>
  );
};

export default Profile;
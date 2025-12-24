import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, Flag, Phone, MapPin, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { itemsRepository, requestsRepository } from '../services/repositories';
import profileService from '../services/profile.service';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 30px;
  min-height: 100vh;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ImageCarousel = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CarouselButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'left' ? 'left: 15px;' : 'right: 15px;'}
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
  }

  svg {
    color: #333;
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  overflow-x: auto;
  padding: 5px 0;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 10px;
  }
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid ${props => props.active ? '#667eea' : 'transparent'};
  opacity: ${props => props.active ? 1 : 0.6};
  transition: all 0.3s ease;
  flex-shrink: 0;
  object-fit: cover;

  &:hover {
    opacity: 1;
  }
`;

const ItemInfo = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const ItemName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 15px 0;
`;

const ItemMeta = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
  }

  value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }
`;

const Badge = styled.span`
  background: ${props => {
    if (props.type === 'price') return '#667eea';
    if (props.type === 'condition') return '#48bb78';
    if (props.type === 'category') return '#ed8936';
    return '#667eea';
  }};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const Description = styled.div`
  margin-bottom: 30px;

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 1rem;
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
`;

const OwnerCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 25px;
  color: white;
  margin-bottom: 20px;
`;

const OwnerName = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 15px 0;
`;

const OwnerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 1rem;

  div {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button`
  padding: 14px 20px;
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

const ConnectButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;

  &:hover:not(:disabled) {
    background: #f8f9ff;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  background: #fed7d7;
  border: 1.5px solid #fc8181;
  border-radius: 10px;
  padding: 20px;
  color: #c53030;
  margin-bottom: 20px;
`;

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      setError('');

      const itemData = await itemsRepository.getItemById(itemId);
      setItem(itemData);

      // Increment view count
      await itemsRepository.incrementViewCount(itemId);

      // Load owner details
      const ownerData = await profileService.getProfile(itemData.ownerId);
      if (ownerData.data) {
        setOwner(ownerData.data);
      }
    } catch (err) {
      console.error('Error loading item:', err);
      setError(err.message || 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectClick = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.uid === item.ownerId) {
      setError('You cannot send a request for your own item');
      return;
    }

    try {
      setSendingRequest(true);
      setError('');

      const result = await requestsRepository.createRequest({
        senderId: user.uid,
        receiverId: item.ownerId,
        itemId: itemId,
        status: 'pending',
        message: '',
      });

      if (result.success) {
        alert('Request sent successfully! The owner will review your request.');
        navigate('/history');
      }
    } catch (err) {
      console.error('Error sending request:', err);
      setError(err.message || 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  const nextImage = () => {
    if (item && item.images) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item && item.images) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>Loading item details...</LoadingContainer>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container>
        <ErrorContainer>Item not found</ErrorContainer>
      </Container>
    );
  }

  const currentImage = item.images?.[currentImageIndex]?.url;

  return (
    <Container>
      {error && <ErrorContainer>{error}</ErrorContainer>}

      <ContentGrid>
        <div>
          {/* Image Carousel */}
          <ImageCarousel>
            {currentImage && <CarouselImage src={currentImage} alt="Item" />}
            {item.images && item.images.length > 1 && (
              <>
                <CarouselButton direction="left" onClick={prevImage}>
                  <ChevronLeft size={24} />
                </CarouselButton>
                <CarouselButton direction="right" onClick={nextImage}>
                  <ChevronRight size={24} />
                </CarouselButton>
              </>
            )}
            <ImageCounter>
              {currentImageIndex + 1} / {item.images?.length || 1}
            </ImageCounter>
          </ImageCarousel>

          {/* Thumbnails */}
          {item.images && item.images.length > 1 && (
            <ThumbnailContainer>
              {item.images.map((img, idx) => (
                <Thumbnail
                  key={idx}
                  src={img.url}
                  active={idx === currentImageIndex}
                  onClick={() => setCurrentImageIndex(idx)}
                  alt={`Thumbnail ${idx + 1}`}
                />
              ))}
            </ThumbnailContainer>
          )}
        </div>

        {/* Right Sidebar */}
        <div>
          <ItemInfo>
            <ItemName>{item.name}</ItemName>

            <ItemMeta>
              <MetaItem>
                <label>Price</label>
                <Badge type="price">₹{item.price}</Badge>
              </MetaItem>
              <MetaItem>
                <label>Category</label>
                <Badge type="category">{item.category}</Badge>
              </MetaItem>
              <MetaItem>
                <label>Condition</label>
                <Badge type="condition">{item.condition}</Badge>
              </MetaItem>
            </ItemMeta>

            <Description>
              <h3>About this item</h3>
              <p>{item.description}</p>
            </Description>

            {/* Owner Card */}
            {owner && (
              <OwnerCard>
                <OwnerName>{owner.fullName}</OwnerName>
                <OwnerInfo>
                  {owner.phoneNumber && (
                    <div>
                      <Phone size={20} />
                      <span>{owner.phoneNumber}</span>
                    </div>
                  )}
                  {owner.registrationNo && (
                    <div>
                      <User size={20} />
                      <span>Reg: {owner.registrationNo}</span>
                    </div>
                  )}
                  <div>
                    <MapPin size={20} />
                    <span>{owner.location || 'Location not set'}</span>
                  </div>
                </OwnerInfo>
              </OwnerCard>
            )}

            {/* Action Buttons */}
            <ActionButtons>
              {user && user.uid !== item.ownerId ? (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={sendingRequest}
                >
                  {sendingRequest ? 'Sending...' : 'Connect / Send Request'}
                </ConnectButton>
              ) : user && user.uid === item.ownerId ? (
                <SecondaryButton disabled>
                  Your Item
                </SecondaryButton>
              ) : (
                <ConnectButton onClick={() => navigate('/auth')}>
                  Sign in to Connect
                </ConnectButton>
              )}

              <SecondaryButton onClick={() => setLiked(!liked)}>
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Liked' : 'Like'}
              </SecondaryButton>

              <SecondaryButton>
                <Share2 size={20} />
                Share
              </SecondaryButton>

              <SecondaryButton>
                <Flag size={20} />
                Report
              </SecondaryButton>
            </ActionButtons>
          </ItemInfo>
        </div>
      </ContentGrid>
    </Container>
  );
};

export default ItemDetails;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { requestsRepository, itemsRepository } from '../services/repositories';
import profileService from '../services/profile.service';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 100px;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 30px;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 1rem;
    color: #666;
    margin: 0;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;

const TabButton = styled.button`
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: ${props => props.active ? '#667eea' : '#666'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid ${props => props.active ? '#667eea' : 'transparent'};
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
  }
`;

const RequestCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => {
    if (props.status === 'accepted') return '#48bb78';
    if (props.status === 'declined') return '#ff4757';
    return '#ffc107';
  }};
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const RequestTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span`
  background: ${props => {
    if (props.status === 'accepted') return '#d4edda';
    if (props.status === 'declined') return '#f8d7da';
    return '#fff3cd';
  }};
  color: ${props => {
    if (props.status === 'accepted') return '#155724';
    if (props.status === 'declined') return '#721c24';
    return '#856404';
  }};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RequestInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBlock = styled.div`
  h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #666;
    margin: 0 0 5px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    font-size: 1rem;
    color: #333;
    margin: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

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
    box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
  }
`;

const AcceptButton = styled(Button)`
  background: #48bb78;
  color: white;

  &:hover:not(:disabled) {
    background: #38a169;
  }
`;

const DeclineButton = styled(Button)`
  background: #ff4757;
  color: white;

  &:hover:not(:disabled) {
    background: #ff3838;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);

  h2 {
    font-size: 1.3rem;
    color: #333;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 1rem;
    color: #666;
    margin: 0;
  }
`;

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsMap, setItemsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadRequests();
  }, [activeTab, user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const role = activeTab === 'received' ? 'receiver' : 'sender';
      const userRequests = await requestsRepository.getUserRequests(user.uid, role);
      setRequests(userRequests);

      // Load items and user details
      const items = {};
      const users = {};

      for (const req of userRequests) {
        // Load item
        if (!items[req.itemId]) {
          try {
            const item = await itemsRepository.getItemById(req.itemId);
            items[req.itemId] = item;
          } catch (err) {
            console.error('Error loading item:', err);
          }
        }

        // Load sender/receiver user
        const otherUserId = activeTab === 'received' ? req.senderId : req.receiverId;
        if (!users[otherUserId]) {
          try {
            const userData = await profileService.getProfile(otherUserId);
            users[otherUserId] = userData.data;
          } catch (err) {
            console.error('Error loading user:', err);
          }
        }
      }

      setItemsMap(items);
      setUsersMap(users);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await requestsRepository.updateRequestStatus(requestId, 'accepted');
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' } : req
      ));
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Failed to accept request');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await requestsRepository.updateRequestStatus(requestId, 'declined');
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'declined' } : req
      ));
    } catch (err) {
      console.error('Error declining request:', err);
      alert('Failed to decline request');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'accepted') return <CheckCircle size={16} />;
    if (status === 'declined') return <XCircle size={16} />;
    return <Clock size={16} />;
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>Loading requests...</LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Barter Requests</h1>
        <p>Manage your barter exchange requests</p>
      </Header>

      <Tabs>
        <TabButton
          active={activeTab === 'received'}
          onClick={() => setActiveTab('received')}
        >
          Requests I Received ({requests.length})
        </TabButton>
        <TabButton
          active={activeTab === 'sent'}
          onClick={() => setActiveTab('sent')}
        >
          Requests I Sent ({requests.length})
        </TabButton>
      </Tabs>

      {requests.length === 0 ? (
        <EmptyState>
          <h2>No {activeTab} requests</h2>
          <p>{activeTab === 'received' ? 'You haven\'t received any barter requests yet' : 'You haven\'t sent any barter requests yet'}</p>
        </EmptyState>
      ) : (
        <div>
          {requests.map(request => {
            const item = itemsMap[request.itemId];
            const otherUser = activeTab === 'received' 
              ? usersMap[request.senderId] 
              : usersMap[request.receiverId];

            return (
              <RequestCard key={request.id} status={request.status}>
                <RequestHeader>
                  <RequestTitle>{item?.name || 'Item'}</RequestTitle>
                  <StatusBadge status={request.status}>
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </StatusBadge>
                </RequestHeader>

                <RequestInfo>
                  <InfoBlock>
                    <h4>{activeTab === 'received' ? 'From' : 'To'}</h4>
                    <p>{otherUser?.fullName || 'Unknown'}</p>
                  </InfoBlock>
                  <InfoBlock>
                    <h4>Category</h4>
                    <p>{item?.category || '-'}</p>
                  </InfoBlock>
                  <InfoBlock>
                    <h4>Item Price</h4>
                    <p>₹{item?.price || '-'}</p>
                  </InfoBlock>
                  <InfoBlock>
                    <h4>Condition</h4>
                    <p>{item?.condition || '-'}</p>
                  </InfoBlock>
                </RequestInfo>

                <ActionButtons>
                  <PrimaryButton onClick={() => navigate(`/item/${request.itemId}`)}>
                    View Item
                  </PrimaryButton>
                  <PrimaryButton onClick={() => alert('Chat feature coming soon')}>
                    <MessageCircle size={16} />
                    Message
                  </PrimaryButton>
                  {activeTab === 'received' && request.status === 'pending' && (
                    <>
                      <AcceptButton onClick={() => handleAccept(request.id)}>
                        Accept
                      </AcceptButton>
                      <DeclineButton onClick={() => handleDecline(request.id)}>
                        Decline
                      </DeclineButton>
                    </>
                  )}
                </ActionButtons>
              </RequestCard>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default History;

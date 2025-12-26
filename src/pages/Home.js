import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth.service';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 100px;
`;

const Header = styled.header`
  margin-bottom: 40px;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
  }
`;

const WelcomeCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 40px;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.2);

  h2 {
    font-size: 1.8rem;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 1rem;
    margin: 0;
    opacity: 0.9;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #667eea;

  h3 {
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 0.5px;
    margin: 0 0 15px 0;
    font-weight: 600;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #667eea;
    margin: 0 0 10px 0;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #999;
    margin: 0;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const Button = styled.button`
  padding: 15px 20px;
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

  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  grid-column: span 2;

  &:hover {
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  @media (max-width: 600px) {
    grid-column: span 1;
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const OutlineButton = styled(Button)`
  background: transparent;
  color: #ff4757;
  border: 2px solid #ff4757;

  &:hover {
    background: #ff4757;
    color: white;
  }
`;

function Home() {
  const navigate = useNavigate();
  const { user, userData, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Container>
      <Header>
        <h1>BarterX</h1>
        <p>Your community barter & exchange platform</p>
      </Header>

      <WelcomeCard>
        <h2>Welcome back! 👋</h2>
        <p>{userData?.fullName || user?.displayName || 'Trader'}</p>
      </WelcomeCard>

      <StatsGrid>
        <StatCard>
          <h3>Your Items</h3>
          <p className="stat-number">0</p>
          <p className="stat-label">Listed for trade</p>
        </StatCard>
        <StatCard>
          <h3>Requests</h3>
          <p className="stat-number">0</p>
          <p className="stat-label">Pending</p>
        </StatCard>
        <StatCard>
          <h3>Rating</h3>
          <p className="stat-number">{userData?.rating || '5.0'}/5</p>
          <p className="stat-label">Community trust</p>
        </StatCard>
      </StatsGrid>

      <ButtonGrid>
        <PrimaryButton onClick={() => navigate('/marketplace')}>
          Browse Marketplace
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate('/add-item')}>
          Add Item
        </SecondaryButton>
        <SecondaryButton onClick={() => navigate('/marketplace')}>
          Explore
        </SecondaryButton>
        <SecondaryButton onClick={() => navigate('/history')}>
          Requests
        </SecondaryButton>
        <OutlineButton onClick={handleLogout}>
          Logout
        </OutlineButton>
      </ButtonGrid>
    </Container>
  );
}

export default Home;
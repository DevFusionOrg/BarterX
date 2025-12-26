import React from 'react';
import styled from 'styled-components';
import { ShoppingBag, Plus, Clock, User } from 'lucide-react';

const BottomNavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 70px;
  z-index: 100;
  padding-bottom: 0;

  @media (max-width: 768px) {
    height: 65px;
  }
`;

const NavButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  background: none;
  border: none;
  text-decoration: none;
  color: ${props => props.active ? '#667eea' : '#999'};
  transition: all 0.3s ease;
  gap: 4px;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  svg {
    width: 24px;
    height: 24px;
  }

  span {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    @media (max-width: 600px) {
      font-size: 0.7rem;
    }
  }
`;

const AddItemCircle = styled.button`
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  border: none;
  margin-bottom: 10px;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  min-width: 60px;
  box-shadow: 0 3px 15px rgba(102, 126, 234, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a3b91 100%);
    color: white;
    transform: scale(1.05);
  }

  svg {
    width: 28px;
    height: 28px;
  }
`;

const BottomNavigation = ({ activeTab, onTabChange }) => {
  return (
    <BottomNavWrapper>
      <NavButton active={activeTab === 'market'} onClick={() => onTabChange('market')}>
        <ShoppingBag size={24} />
        <span>Market</span>
      </NavButton>
      <NavButton active={activeTab === 'history'} onClick={() => onTabChange('history')}>
        <Clock size={24} />
        <span>History</span>
      </NavButton>
      <AddItemCircle onClick={() => onTabChange('add-item')}>
        <Plus size={28} />
      </AddItemCircle>
      <NavButton active={activeTab === 'profile'} onClick={() => onTabChange('profile')}>
        <User size={24} />
        <span>Profile</span>
      </NavButton>
    </BottomNavWrapper>
  );
};

export default BottomNavigation;

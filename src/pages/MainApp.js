import React, { useState } from 'react';
import styled from 'styled-components';
import Marketplace from './Marketplace';
import Profile from './Profile';
import History from './History';
import AddItem from './AddItem';
import ItemDetails from './ItemDetails';
import BottomNavigation from '../components/ui/BottomNavigation';

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
`;

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('market');
  const [selectedItemId, setSelectedItemId] = useState(null);

  const renderContent = () => {
    // If viewing item details, show that instead
    if (selectedItemId) {
      return <ItemDetails itemId={selectedItemId} onBack={() => setSelectedItemId(null)} />;
    }

    switch (activeTab) {
      case 'market':
        return <Marketplace onSelectItem={(id) => setSelectedItemId(id)} />;
      case 'add-item':
        return <AddItem onItemAdded={() => setActiveTab('market')} />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile />;
      default:
        return <Marketplace onSelectItem={(id) => setSelectedItemId(id)} />;
    }
  };

  return (
    <Container>
      {renderContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </Container>
  );
};

export default MainApp;

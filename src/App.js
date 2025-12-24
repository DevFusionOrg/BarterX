import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Pages
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import Chat from './pages/Chat';
import AddItem from './pages/AddItem';
import ItemDetails from './pages/ItemDetails';
import History from './pages/History';

// Components
import BottomNavigation from './components/ui/BottomNavigation';

// Loading Component
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="spinner"></div>
    <p>Loading BarterX...</p>
  </div>
);

// Private Route Component with Bottom Navigation
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Hide navigation on item details pages
  const hideNavigation = location.pathname.match(/^\/item\//);

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? (
    <>
      {children}
      {!hideNavigation && <BottomNavigation />}
    </>
  ) : <Navigate to="/auth" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return !user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/marketplace" element={
              <PrivateRoute>
                <Marketplace />
              </PrivateRoute>
            } />
            <Route path="/add-item" element={
              <PrivateRoute>
                <AddItem />
              </PrivateRoute>
            } />
            <Route path="/item/:itemId" element={
              <PrivateRoute>
                <ItemDetails />
              </PrivateRoute>
            } />
            <Route path="/history" element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            } />
            <Route path="/chat/:chatId" element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
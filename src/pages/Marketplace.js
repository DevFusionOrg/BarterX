import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { itemsRepository } from '../services/repositories';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 100px;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 30px;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
  }
`;

const SearchBar = styled.form`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    padding: 14px 15px 14px 45px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 15px;
    color: #999;
    pointer-events: none;
  }
`;

const FilterButton = styled.button`
  padding: 14px 24px;
  background: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const FiltersPanel = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  label {
    display: block;
    font-size: 0.95rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }

  select,
  input {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #e0e0e0;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
`;

const ItemCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
`;

const ItemImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: #f5f5f5;
`;

const ItemInfo = styled.div`
  padding: 15px;
`;

const ItemName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const ItemPrice = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 1.1rem;
  color: #666;
`;

const CATEGORIES = ['Electronics', 'Clothes', 'Books', 'Tools', 'Furniture', 'Sports', 'Home & Kitchen', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const Marketplace = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const recentItems = await itemsRepository.getRecentItems(50);
      setItems(recentItems);
    } catch (err) {
      console.error('Error loading items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadItems();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await itemsRepository.searchItems(searchTerm);
      setItems(searchResults);
    } catch (err) {
      console.error('Error searching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container>
      <Header>
        <h1>Marketplace</h1>
        <p>Browse items available for barter exchange</p>
      </Header>

      <SearchBar onSubmit={handleSearch}>
        <SearchInput>
          <Search size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, owner..."
          />
        </SearchInput>
        <FilterButton onClick={() => setShowFilters(!showFilters)}>
          <Filter size={20} />
          Filters
        </FilterButton>
      </SearchBar>

      {showFilters && (
        <FiltersPanel>
          <FilterGroup>
            <label>Category</label>
            <select name="category" onChange={handleFilterChange}>
              <option value="">All</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </FilterGroup>
          <FilterGroup>
            <label>Condition</label>
            <select name="condition" onChange={handleFilterChange}>
              <option value="">All</option>
              {CONDITIONS.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </FilterGroup>
        </FiltersPanel>
      )}

      {loading ? (
        <LoadingContainer>Loading items...</LoadingContainer>
      ) : (
        <ItemsGrid>
          {items.map(item => (
            <ItemCard key={item.id} onClick={() => navigate(`/item/${item.id}`)}>
              <ItemImage src={item.images?.[0]?.url || 'https://via.placeholder.com/280x200'} alt={item.name} />
              <ItemInfo>
                <ItemName>{item.name}</ItemName>
                <ItemPrice>₹{item.price}</ItemPrice>
                <small>{item.category}</small>
              </ItemInfo>
            </ItemCard>
          ))}
        </ItemsGrid>
      )}
    </Container>
  );
};

export default Marketplace;
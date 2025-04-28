import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RestaurantList.css';

function RestaurantList() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('all');
    const [cuisines, setCuisines] = useState([]);
    const [sortBy, setSortBy] = useState('rating');
    const navigate = useNavigate();

    const fetchRestaurants = async (retryCount = 0) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(
                `http://localhost:5004/api/restaurants/list?search=${encodeURIComponent(searchTerm)}&cuisine=${encodeURIComponent(selectedCuisine)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Server responded with status: ${response.status}`);
            }
            
            let data = await response.json();
            
            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received from server');
            }
            
            data = sortRestaurants(data);
            setRestaurants(data);
            
            // Extract unique cuisines, filter out undefined/null/empty
            const uniqueCuisines = [...new Set(data.map(restaurant => restaurant.cuisine).filter(c => typeof c === 'string' && c.trim() !== ''))];
            setCuisines(['all', ...uniqueCuisines]);
            
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            const errorMessage = err.message || 'An unexpected error occurred';
            
            if (retryCount < 2) {
                console.log(`Retrying... Attempt ${retryCount + 1} of 2`);
                setTimeout(() => {
                    fetchRestaurants(retryCount + 1);
                }, 2000);
            } else {
                setError(`Unable to load restaurants: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, [searchTerm, selectedCuisine, sortBy]);

    const sortRestaurants = (data) => {
        return [...data].sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.rating || 4.0) - (a.rating || 4.0);
                case 'deliveryTime':
                    const getMinutes = (time) => {
                        const [min] = (time || '30-45').split('-').map(Number);
                        return min;
                    };
                    return getMinutes(a.deliveryTime) - getMinutes(b.deliveryTime);
                default:
                    return 0;
            }
        });
    };

    const handleRestaurantClick = (restaurantId) => {
        try {
            if (!restaurantId) {
                throw new Error('Invalid restaurant ID');
            }
            navigate(`/restaurant/${restaurantId}`);
        } catch (err) {
            console.error('Error navigating to restaurant:', err);
            setError('Unable to navigate to restaurant details');
        }
    };

    const handleSearch = (e) => {
        try {
            setSearchTerm(e.target.value);
        } catch (err) {
            console.error('Error updating search term:', err);
        }
    };

    const handleCuisineChange = (e) => {
        try {
            setSelectedCuisine(e.target.value);
        } catch (err) {
            console.error('Error updating cuisine filter:', err);
        }
    };

    const handleSortChange = (e) => {
        try {
            setSortBy(e.target.value);
        } catch (err) {
            console.error('Error updating sort option:', err);
        }
    };

    const handleRetry = () => {
        fetchRestaurants(0);
    };

    if (loading) return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading restaurants...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <div className="error-message">
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={handleRetry}>
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="restaurant-list-container">
            <div className="restaurant-list-header">
                <h1>Explore Restaurants</h1>
                <p>Discover the best food & drinks in your area</p>
            </div>

            <div className="filters-section">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search restaurants by name, cuisine, or location..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <div className="filter-controls">
                    <select 
                        value={selectedCuisine} 
                        onChange={handleCuisineChange}
                        className="cuisine-select"
                    >
                        {cuisines.map(cuisine => (
                            <option key={cuisine} value={cuisine}>
                                {cuisine === 'all'
                                    ? 'All Cuisines'
                                    : (typeof cuisine === 'string' && cuisine.length > 0
                                        ? cuisine.charAt(0).toUpperCase() + cuisine.slice(1)
                                        : 'Unknown')}
                            </option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="sort-select"
                    >
                        <option value="rating">Top Rated</option>
                        <option value="deliveryTime">Fastest Delivery</option>
                    </select>
                </div>
            </div>

            <div className="restaurants-grid">
                {restaurants.length > 0 ? (
                    restaurants.map(restaurant => (
                        <div
                            key={restaurant._id}
                            className="restaurant-card"
                            onClick={() => handleRestaurantClick(restaurant._id)}
                        >
                            <div className="restaurant-image">
                                <img 
                                    src={restaurant.coverImage || '/restaurant-default-cover.jpg'} 
                                    alt={restaurant.name}
                                    onError={(e) => {
                                        e.target.src = '/restaurant-default-cover.jpg';
                                    }}
                                />
                            </div>
                            <div className="restaurant-info">
                                <h3>{restaurant.restaurantName}</h3>
                                <p className="cuisine">{restaurant.cuisine}</p>
                                <div className="restaurant-meta">
                                    <span className="rating">★ {restaurant.rating || '4.0'}</span>
                                    <span className="delivery-time">
                                        {restaurant.deliveryTime || '30-45'} mins
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>No restaurants found matching your criteria</p>
                        <button onClick={() => {
                            setSearchTerm('');
                            setSelectedCuisine('all');
                            setSortBy('rating');
                        }} className="reset-filters">
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RestaurantList; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RestaurantDetail.css';

function RestaurantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5004/api/restaurants/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch restaurant details');
                }
                const data = await response.json();
                setRestaurant(data);
                
                // Fetch restaurant's menu items
                const menuResponse = await fetch(`http://localhost:5004/api/menu-items/restaurant/${id}`);
                if (!menuResponse.ok) {
                    throw new Error('Failed to fetch menu items');
                }
                const menuData = await menuResponse.json();
                setMenuItems(menuData.data || []);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantDetails();
    }, [id]);

    const handleFoodItemClick = (itemId) => {
        navigate(`/food/${itemId}`);
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!restaurant) return <div className="not-found">Restaurant not found</div>;

    // Group menu items by category, filter out undefined/null/empty
    const categories = ['all', ...new Set(menuItems.map(item => item.category).filter(c => typeof c === 'string' && c.trim() !== ''))];
    const filteredItems = activeCategory === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === activeCategory);

    return (
        <div className="restaurant-detail-container">
            {/* Restaurant Header */}
            <div className="restaurant-header">
                <div className="restaurant-cover">
                    <img 
                        src={restaurant.coverImage || '/restaurant-default-cover.jpg'} 
                        alt={restaurant.name} 
                        className="cover-image"
                    />
                </div>
                <div className="restaurant-info">
                    <h1>{restaurant.name}</h1>
                    <div className="restaurant-meta">
                        <span className="cuisine">{restaurant.cuisine}</span>
                        <span className="rating">★ {restaurant.rating || '4.0'}</span>
                        <span className="delivery-time">{restaurant.deliveryTime || '30-45'} mins</span>
                    </div>
                    <p className="description">{restaurant.description}</p>
                </div>
            </div>

            {/* Category Navigation */}
            <div className="category-nav">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {typeof category === 'string' && category.length > 0
                            ? category.charAt(0).toUpperCase() + category.slice(1)
                            : 'Unknown'}
                    </button>
                ))}
            </div>

            {/* Menu Items Grid */}
            <div className="menu-items-grid">
                {filteredItems.map(item => (
                    <div 
                        key={item._id} 
                        className="menu-item-card"
                        onClick={() => handleFoodItemClick(item._id)}
                    >
                        <div className="menu-item-image">
                            <img src={item.image || '/food-placeholder.jpg'} alt={item.name} />
                        </div>
                        <div className="menu-item-info">
                            <h3>{item.name}</h3>
                            <p className="description">{item.description}</p>
                            <p className="price">LKR {item.price.toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RestaurantDetail; 
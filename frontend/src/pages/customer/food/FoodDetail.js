import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './FoodDetail.css';

function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [foodItem, setFoodItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchFoodItem = async () => {
      try {
        // First try to get the item from the home menu items endpoint
        const response = await fetch(`http://localhost:5004/api/menu-items/home-menu-items?page=1&limit=100`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        
        // Find the specific item in the response
        const item = data.data.find(item => item.id === id || item._id === id);
        
        if (!item) {
          throw new Error('Food item not found');
        }

        console.log('Found food item:', item); // Debug log
        
        // Add restaurant information to the food item
        const itemWithRestaurant = {
          ...item,
          _id: item._id || item.id, // Ensure we have _id
          restaurant_id: item.restaurant_id || item.restaurantId || item.restaurant?._id || '',
          restaurant_name: item.restaurant_name || item.restaurant || item.restaurantName || 'Unknown Restaurant',
          image: item.image || item.img,
          price: parseFloat(item.price) // Ensure price is a number
        };

        console.log('Processed food item with restaurant info:', itemWithRestaurant); // Debug log
        setFoodItem(itemWithRestaurant);
      } catch (err) {
        console.error('Error fetching food item:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItem();
  }, [id]);

  const handleAddToCart = async () => {
    if (!foodItem) {
      console.error('No food item data available');
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      Swal.fire({
        title: 'Please Login',
        text: 'You need to be logged in to add items to cart',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2ecc71',
        cancelButtonColor: '#e74c3c'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    try {
      // Ensure we have a valid _id
      if (!foodItem._id) {
        throw new Error('Invalid food item ID');
      }

      const cartItem = {
        itemId: foodItem._id,
        name: foodItem.name,
        price: parseFloat(foodItem.price), // Ensure price is a number
        quantity: parseInt(quantity), // Ensure quantity is a number
        img: foodItem.image || foodItem.img,
        restaurant_id: foodItem.restaurant_id || foodItem.restaurant?._id || '',
        restaurant_name: foodItem.restaurant_name || foodItem.restaurant || 'Unknown Restaurant'
      };

      console.log('Adding to cart with restaurant info:', cartItem); // Debug log

      const response = await fetch("http://localhost:5003/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartItem),
      });

      const data = await response.json();
      console.log('Server response:', data); // Debug log

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Item added to cart successfully!',
          icon: 'success',
          confirmButtonColor: '#2ecc71',
          timer: 2000,
          timerProgressBar: true
        }).then(() => {
          navigate("/cart");
        });
      } else {
        throw new Error(data.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to add item to cart. Please try again.',
        icon: 'error',
        confirmButtonColor: '#e74c3c'
      });
    }
  };

  const handleOrderNow = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to place an order',
        icon: 'warning',
        confirmButtonText: 'Go to Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2ecc71',
        cancelButtonColor: '#e74c3c'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    navigate('/cart');
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!foodItem) {
    return <div className="not-found">Food item not found</div>;
  }

  return (
    <div className="food-detail-container">
      <div className="food-detail-content">
        <div className="food-detail-image">
          <img src={foodItem.image || "/placeholder.svg"} alt={foodItem.name} />
        </div>
        <div className="food-detail-info">
          <h1 className="food-detail-title">{foodItem.name}</h1>
          <p className="food-detail-restaurant">{foodItem.restaurant_name}</p>
          <p className="food-detail-price">Rs.{(foodItem.price || 0).toFixed(2)}</p>
          <div className="food-detail-description">
            <h2>Description</h2>
            <p>{foodItem.description || "No description available."}</p>
          </div>
          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={() => handleQuantityChange(-1)}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="quantity">{quantity}</span>
            <button 
              className="quantity-btn"
              onClick={() => handleQuantityChange(1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="food-detail-actions">
            <button className="add-to-cart-button" onClick={handleAddToCart}>Add to Cart</button>
            <button className="order-now-button" onClick={handleOrderNow}>Order Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodDetail; 
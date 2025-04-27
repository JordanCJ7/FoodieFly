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
        const item = data.data.find(item => item.id === id);
        
        if (!item) {
          throw new Error('Food item not found');
        }
        
        setFoodItem(item);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFoodItem();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to add items to cart',
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

    try {
      const response = await fetch('http://localhost:5003/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: foodItem._id || foodItem.id,
          name: foodItem.name,
          price: foodItem.price,
          img: foodItem.image
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      const data = await response.json();
      Swal.fire({
        title: 'Success!',
        text: 'Item added to cart successfully!',
        icon: 'success',
        confirmButtonColor: '#2ecc71',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to add item to cart. Please try again.',
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
          <p className="food-detail-restaurant">{foodItem.restaurant || "Unknown Restaurant"}</p>
          <p className="food-detail-price">Rs.{(foodItem.price || 0).toFixed(2)}</p>
          <div className="food-detail-description">
            <h2>Description</h2>
            <p>{foodItem.description || "No description available."}</p>
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
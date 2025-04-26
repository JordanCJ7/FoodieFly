import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyOrders.css";

function MyOrders() {
  const [item, setItem] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]); // for storing orders
  const [isAuthenticated, setIsAuthenticated] = useState(false); // to track login status
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please log in to view your cart.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5003/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const itemsWithQuantity = (data.items || []).map((item) => ({
            ...item,
            quantity: item.quantity || 1,
          }));
          setCartItems(itemsWithQuantity);
        } else {
          console.error("Failed to fetch cart");
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:5003/api/order/customer/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (loading) return <div>Loading your orders...</div>;

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {cartItems.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item._id} className="order-card">
            <p><strong>Item:</strong> {item.name}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Price (each):</strong> LKR.{item.price.toFixed(2)}</p>
            <p><strong>Total:</strong> LKR.{(item.price * item.quantity).toFixed(2)}</p>

            <div className="progress-bar">
              <div className={`step ${item.status === "Pending" || item.status === "Preparing" || item.status === "Delivered" ? "active" : ""}`}>Pending</div>
              <div className={`step ${item.status === "Preparing" || item.status === "Delivered" ? "active" : ""}`}>Accepted</div>
              <div className={`step ${item.status === "Out for Delivery" || item.status === "Delivered" ? "active" : ""}`}>Preparing</div>
              <div className={`step ${item.status === "Delivered" ? "active" : ""}`}>Ready</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;

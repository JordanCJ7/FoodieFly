import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5003/api/order/customer/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched orders:', response.data);
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError("Error fetching orders: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    // If we have a new order from payment, add it to the state first
    if (location.state?.order) {
      console.log('New order from payment:', location.state.order);
      setOrders(prevOrders => [location.state.order, ...prevOrders]);
    }

    // Then fetch all orders to ensure we have the latest data
    fetchOrders();
  }, [location.state]);

  if (loading) return <div className="orders-container">Loading your orders...</div>;
  if (error) return <div className="orders-container">{error}</div>;

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Restaurant:</strong> {order.restaurantName || 'N/A'}</p>
            <div className="order-items">
              <strong>Items:</strong>
              {Array.isArray(order.items) ? (
                order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <p>
                      {item.name || 'Unknown Item'} × {item.quantity || 0} - LKR {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                ))
              ) : (
                <div className="order-item">
                  <p>No items available</p>
                </div>
              )}
            </div>
            <p><strong>Delivery Fee:</strong> LKR {formatPrice(order.deliveryFee)}</p>
            <p><strong>Total Amount:</strong> LKR {formatPrice(order.totalAmount)}</p>
            <p><strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Status:</strong> <span className={`status ${(order.status || 'pending').toLowerCase()}`}>{order.status || 'Pending'}</span></p>

            <div className="progress-bar">
              {['Pending', 'Accepted', 'Preparing', 'Ready'].map((status, index, array) => (
                <div
                  key={status}
                  className={`step ${
                    array.slice(0, array.indexOf(order.status || 'Pending') + 1).includes(status) ? 'active' : ''
                  }`}
                >
                  <div className="step-circle"></div>
                  {status}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;

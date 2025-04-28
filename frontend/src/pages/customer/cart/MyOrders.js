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
        setOrders(response.data);
      } catch (err) {
        setError("Error fetching orders: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    // If we have new orders from payment, add them to the state first
    if (location.state?.orders) {
      setOrders(prevOrders => [...location.state.orders, ...prevOrders]);
    }

    // Then fetch all orders to ensure we have the latest data
    fetchOrders();
  }, [location.state]);

  if (loading) return <div className="orders-container">Loading your orders...</div>;
  if (error) return <div className="orders-container">{error}</div>;

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Item:</strong> {order.itemId[0]}</p>
            <p><strong>Quantity:</strong> {order.quantity}</p>
            <p><strong>Total Price:</strong> LKR.{order.totalPrice.toFixed(2)}</p>
            <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></p>

            <div className="progress-bar">
              <div className={`step ${order.status === "Pending" || order.status === "Accepted" || order.status === "Preparing" || order.status === "Ready" ? "active" : ""}`}>
                <div className="step-circle"></div>
                Pending
              </div>
              <div className={`step ${order.status === "Accepted" || order.status === "Preparing" || order.status === "Ready" ? "active" : ""}`}>
                <div className="step-circle"></div>
                Accepted
              </div>
              <div className={`step ${order.status === "Preparing" || order.status === "Ready" ? "active" : ""}`}>
                <div className="step-circle"></div>
                Preparing
              </div>
              <div className={`step ${order.status === "Ready" ? "active" : ""}`}>
                <div className="step-circle"></div>
                Ready
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;

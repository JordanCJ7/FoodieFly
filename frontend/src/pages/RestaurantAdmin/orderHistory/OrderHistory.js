import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderHistory.css';
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RestaurantNavbar from '../../../components/RestaurantNavbar/RestaurantNavbar';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("Authentication token is missing.");
          setLoading(false);
          return;
        }

        // First get the restaurant ID
        const restaurantIdResponse = await axios.get("http://localhost:5004/api/restaurants/get-restaurant-id", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!restaurantIdResponse.data || !restaurantIdResponse.data.restaurantId) {
          setError("Could not find restaurant information.");
          setLoading(false);
          return;
        }

        const restaurantId = restaurantIdResponse.data.restaurantId;

        // Fetch ready and cancelled orders for this restaurant
        const ordersResponse = await axios.get(`http://localhost:5003/api/order/restaurant/${restaurantId}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (ordersResponse.data) {
          // Transform Ready status to show as Completed in the UI
          const formattedOrders = ordersResponse.data.map(order => ({
            ...order,
            displayStatus: order.status === 'Ready' ? 'Completed' : order.status
          }));
          setOrders(formattedOrders);
        }
      } catch (err) {
        console.error('Error fetching completed orders:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <HourglassEmptyIcon fontSize="large" />
        <p>Loading order history...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <RestaurantNavbar />
      <div className="order-history-container">
        <h2 className="page-title">Order History</h2>
        {orders.length === 0 ? (
          <div className="no-orders-message">No completed orders found</div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-history-card">
                <div className="order-grid">
                  <div className="order-field">
                    <span className="field-label">Order ID:</span>
                    <span className="field-value">{order._id}</span>
                  </div>
                  <div className="order-field">
                    <span className="field-label">Restaurant:</span>
                    <span className="field-value">{order.restaurantName}</span>
                  </div>
                  <div className="order-field items-field">
                    <span className="field-label">Items:</span>
                    <span className="field-value">
                      {order.items.map((item, index) => (
                        <span key={index} className="item-entry">
                          {item.name} × {item.quantity} - LKR {item.price * item.quantity}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="order-field">
                    <span className="field-label">Delivery Fee:</span>
                    <span className="field-value">LKR {order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="order-field">
                    <span className="field-label">Total Amount:</span>
                    <span className="field-value">LKR {order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="order-field">
                    <span className="field-label">Order Date:</span>
                    <span className="field-value">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-field">
                    <span className="field-label">Completed Date:</span>
                    <span className="field-value">{new Date(order.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-field">
                    <span className="field-label">Status:</span>
                    <span className="field-value">
                      <span className={`status-badge ${order.displayStatus}`}>
                        {order.displayStatus}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default OrderHistory; 
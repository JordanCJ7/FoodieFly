"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import RestaurantNavbar from '../../../components/RestaurantNavbar/RestaurantNavbar';

function Home() {
  const navigate = useNavigate();
  const [registrationStatus, setRegistrationStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);

  // Fetch restaurant verification status from the backend
  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.error("Authentication token is missing.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5004/api/restaurants/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          const { isVerified } = response.data;
          setRegistrationStatus(isVerified ? "approved" : "pending");
        }
      } catch (error) {
        console.error("Error fetching restaurant status:", error);
        if (error.response && error.response.status === 404) {
          setRegistrationStatus("rejected");
        } else {
          alert(`Error: ${error.response?.data?.error || "An unexpected error occurred."}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantStatus();
  }, []);

  // Fetch restaurant orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setOrderError("Authentication token is missing.");
          setOrderLoading(false);
          return;
        }

        // First get the restaurant ID
        const restaurantIdResponse = await axios.get("http://localhost:5004/api/restaurants/get-restaurant-id", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!restaurantIdResponse.data || !restaurantIdResponse.data.restaurantId) {
          console.error('Could not get restaurant ID:', restaurantIdResponse.data);
          setOrderError("Could not find restaurant information.");
          setOrderLoading(false);
          return;
        }

        const restaurantId = restaurantIdResponse.data.restaurantId;
        console.log('Restaurant ID:', restaurantId);

        // Get restaurant details
        const restaurantResponse = await axios.get(`http://localhost:5004/api/restaurants/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!restaurantResponse.data || !restaurantResponse.data._id) {
          console.error('Invalid restaurant data:', restaurantResponse.data);
          setOrderError("Could not find restaurant information.");
          setOrderLoading(false);
          return;
        }

        const restaurant = restaurantResponse.data;
        console.log('Restaurant Profile:', restaurant);

        // Fetch orders for this restaurant
        const ordersResponse = await axios.get(`http://localhost:5003/api/order/restaurant/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Orders Response:', ordersResponse.data);

        if (ordersResponse.data) {
          // Transform the data to match MyOrders.js format
          const formattedOrders = ordersResponse.data.map(order => ({
            _id: order._id,
            restaurantId: restaurantId,
            restaurantName: restaurant.restaurantName,
            items: order.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            deliveryFee: order.deliveryFee || 200,
            totalAmount: order.totalAmount,
            status: order.status || 'Pending',
            createdAt: order.createdAt,
            customerName: order.payerName,
            paymentStatus: order.paymentStatus
          }));
          console.log('Formatted Orders:', formattedOrders);
          setOrders(formattedOrders);
          setOrderError(null);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          endpoint: err.config?.url
        });
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
        setOrderError("Error fetching restaurant details: " + errorMessage);
        setOrders([]);
      } finally {
        setOrderLoading(false);
      }
    };

    if (registrationStatus === "approved") {
      fetchOrders();
      // Set up polling to refresh orders every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [registrationStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setOrderError("Authentication token is missing.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5003/api/order/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data) {
        if (newStatus === 'Cancelled') {
          // Remove the cancelled order immediately
          setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        } else if (newStatus === 'Ready') {
          // Update the order status first
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === orderId ? { ...order, status: newStatus } : order
            )
          );
          
          // After 10 seconds, remove from active orders without changing status
          setTimeout(() => {
            setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
          }, 10000); // 10 seconds
        } else {
          // For other status changes, just update the status
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === orderId ? { ...order, status: newStatus } : order
            )
          );
        }
        console.log(`Order ${orderId} status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error(`Error updating order to ${newStatus}:`, err);
      alert(`Error updating order: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleButtonClick = () => {
    navigate("/restaurant-register");
  };

  const handleMenuButtonClick = () => {
    navigate("/addMenuItem");
  };

  const handleViewMenuButtonClick = () => {
    navigate("/menu-item-list");
  }

  if (loading) {
    return (
      <div className="home-container-RA">
        <div className="loading-indicator">
          <HourglassEmptyIcon fontSize="large" />
          <p>Loading registration status...</p>
        </div>
      </div>
    );
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Pending': 'Accepted',
      'Accepted': 'Preparing',
      'Preparing': 'Ready'
    };
    return statusFlow[currentStatus] || null;
  };

  return (
    <div className="home-container-RA">
      <RestaurantNavbar />
      <div className="hero-section-RA">
        <h1>FoodieFly - Food Ordering & Delivery System</h1>
        <p className="subtitle-RA">
          Launch your restaurant,
          curate your menu and start accepting online orders,<br/>
          seamlessly all in one place, today!
        </p>
        <div className="cta-buttons-RA">
          <button className="primary-button-RA" onClick={handleButtonClick}>
            Register Your Restaurant
          </button>
          <button className="secondary-button-RA" onClick={handleMenuButtonClick}>
            Add Menu Items
          </button>
          <button className="secondary-button-RA" onClick={handleViewMenuButtonClick}>
            View your Menus
          </button>
          <button className="secondary-button-RA" onClick={() => navigate('/restaurant-admin/order-history')}>
            View Order History
          </button>
        </div>
      </div>

      {registrationStatus === "approved" && (
        <div className="orders-section">
          <h2>Manage Orders</h2>
          {orderLoading ? (
            <div className="loading-indicator">
              <HourglassEmptyIcon fontSize="large" />
              <p>Loading orders...</p>
            </div>
          ) : orderError ? (
            <div className="error-message">{orderError}</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <FastfoodIcon fontSize="large" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="orders-container">
              <h2 className="manage-orders-title">Manage Orders</h2>
              {orders.map((order) => (
                <div key={order._id} className="order-detail-card">
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
                      <span className="field-label">Status:</span>
                      <span className="field-value">
                        <span className={`status-badge ${order.status}`}>{order.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="order-progress">
                    <div className={`progress-step ${order.status === 'Pending' ? 'active' : ''}`} data-status="Pending">
                      <div className="step-dot"></div>
                      <span>Pending</span>
                    </div>
                    <div className={`progress-step ${order.status === 'Accepted' ? 'active' : ''}`} data-status="Accepted">
                      <div className="step-dot"></div>
                      <span>Accepted</span>
                    </div>
                    <div className={`progress-step ${order.status === 'Preparing' ? 'active' : ''}`} data-status="Preparing">
                      <div className="step-dot"></div>
                      <span>Preparing</span>
                    </div>
                    <div className={`progress-step ${order.status === 'Ready' ? 'active' : ''}`} data-status="Ready">
                      <div className="step-dot"></div>
                      <span>Ready</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    {order.status === 'Pending' && (
                      <>
                        <button 
                          className="accept-order-btn"
                          onClick={() => handleStatusChange(order._id, 'Accepted')}
                        >
                          Accept Order
                        </button>
                        <button 
                          className="cancel-order-btn"
                          onClick={() => handleStatusChange(order._id, 'Cancelled')}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {order.status === 'Accepted' && (
                      <>
                        <button 
                          className="status-btn preparing-btn"
                          onClick={() => handleStatusChange(order._id, 'Preparing')}
                        >
                          Mark as Preparing
                        </button>
                        <button 
                          className="cancel-order-btn"
                          onClick={() => handleStatusChange(order._id, 'Cancelled')}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {order.status === 'Preparing' && (
                      <button 
                        className="status-btn ready-btn"
                        onClick={() => handleStatusChange(order._id, 'Ready')}
                      >
                        Mark as Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="features-section">
        <div className="feature">
          <div className="feature-icon">
            <RestaurantIcon fontSize="large" />
          </div>
          <h3>Quick & Easy Setup</h3>
          <p>Bring your restaurant online in just a few minutes with our streamlined registration process.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <PhoneAndroidIcon fontSize="large" />
          </div>
          <h3>Seamless Mobile Ordering</h3>
          <p>Your customers can easily place orders from any device, thanks to our fully responsive platform.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <LocalShippingIcon fontSize="large" />
          </div>
          <h3>Effortless Delivery Management</h3>
          <p>Monitor deliveries in real-time and optimize your delivery fleet for maximum efficiency.</p>
        </div>
      </div>

      <div className="registration-status">
        <h2>Registration Status</h2>
        <div className={`status-indicator ${registrationStatus}`}>
          {registrationStatus === "approved" ? (
            <>
              <span className="status-icon">
                <CheckCircleIcon fontSize="large" className="icon-approved" />
              </span>
              <p>Your restaurant registration has been approved!</p>
              <p className="status-message">You can now add menu items and start receiving orders.</p>
            </>
          ) : registrationStatus === "rejected" ? (
            <>
              <span className="status-icon">
                <CancelIcon fontSize="large" className="icon-rejected" />
              </span>
              <p>Your restaurant registration was not approved.</p>
              <p className="status-message">Please contact support for more information.</p>
            </>
          ) : (
            <>
              <span className="status-icon">
                <HourglassEmptyIcon fontSize="large" className="icon-pending" />
              </span>
              <p>Your restaurant registration is pending approval.</p>
              <p className="status-message">We'll notify you once it's reviewed.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Progress, List, Avatar, Statistic, message } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircleOutlined, 
  DollarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import axios from "axios";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [readyOrders, setReadyOrders] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 0,
    completedDeliveries: 0,
    earnings: 0,
    rating: 4.5
  });

  // Verify user role
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      message.error('Please log in to continue');
      navigate('/login');
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      if (decodedToken.role !== 'deliveryPersonnel') {
        message.error('Access denied. Only delivery personnel can access this page.');
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      message.error('Invalid authentication token');
      navigate('/login');
    }
  }, [navigate]);

  const fetchReadyOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/order/ready', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      setReadyOrders(response.data);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      message.error('Failed to fetch ready orders');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:5003/api/order/${orderId}/status`, {
        status: 'Accepted'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      message.success('Order accepted successfully');
      setReadyOrders(readyOrders.filter(order => order._id !== orderId));
    } catch (error) {
      console.error('Error accepting order:', error);
      message.error('Failed to accept order');
    }
  };

  const handleRejectOrder = (orderId) => {
    setReadyOrders(readyOrders.filter(order => order._id !== orderId));
    message.info('Order removed from view');
  };

  useEffect(() => {
    fetchReadyOrders();
    // Set up polling to refresh orders every 30 seconds
    const interval = setInterval(fetchReadyOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="delivery-home">
      <div className="stats-section">
        <Card className="stats-card">
          <Statistic
            title="Total Deliveries"
            value={deliveryStats.totalDeliveries}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card className="stats-card">
          <Statistic
            title="Earnings"
            value={deliveryStats.earnings}
            precision={2}
            prefix={<DollarOutlined />}
          />
        </Card>
        <Card className="stats-card">
          <Statistic
            title="Rating"
            value={deliveryStats.rating}
            precision={1}
            suffix="/5"
          />
        </Card>
      </div>

      <div className="active-deliveries">
        <h2>Ready Orders</h2>
        <List
          itemLayout="vertical"
          dataSource={readyOrders}
          renderItem={order => (
            <List.Item
              key={order._id}
              actions={[
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />}
                  onClick={() => handleAcceptOrder(order._id)}
                >
                  Accept Order
                </Button>,
                <Button 
                  danger 
                  icon={<CloseOutlined />}
                  onClick={() => handleRejectOrder(order._id)}
                >
                  Reject Order
                </Button>,
                <Button type="default" icon={<PhoneOutlined />}>
                  Contact Customer
                </Button>,
                <Button type="default" icon={<EnvironmentOutlined />}>
                  View Route
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={`Order #${order._id.slice(-6)}`}
                description={
                  <>
                    <div>{order.restaurantName}</div>
                    <Badge status="success" text="Ready for Delivery" />
                  </>
                }
              />
              <div className="delivery-details">
                <div><strong>Customer:</strong> {order.customerId?.first_name} {order.customerId?.last_name}</div>
                <div><strong>Total Amount:</strong> ${order.totalAmount}</div>
                <div><strong>Delivery Fee:</strong> ${order.deliveryFee}</div>
              </div>
              <div className="order-items">
                <strong>Items:</strong>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity}x {item.name} - ${item.price}
                    </li>
                  ))}
                </ul>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}

export default Home;
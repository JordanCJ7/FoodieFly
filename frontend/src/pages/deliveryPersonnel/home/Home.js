import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Progress, List, Avatar, Statistic, message, Tabs } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircleOutlined, 
  DollarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CheckOutlined,
  CloseOutlined,
  CarOutlined,
  DeliveredProcedureOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import axios from "axios";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [readyOrders, setReadyOrders] = useState([]);
  const [acceptedOrdersList, setAcceptedOrdersList] = useState([]);
  const [inDeliveryOrdersList, setInDeliveryOrdersList] = useState([]);
  const [completedOrdersList, setCompletedOrdersList] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 0,
    completedDeliveries: 0,
    earnings: 0,
    rating: 4.5
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchAcceptedOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5003/api/order/accepted', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const orders = response.data;
      
      // Separate orders by status
      const acceptedOrders = orders.filter(order => order.status === 'Accepted');
      const inDeliveryOrders = orders.filter(order => order.status === 'In Delivery');
      
      setAcceptedOrdersList(acceptedOrders);
      setInDeliveryOrdersList(inDeliveryOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
      message.error('Failed to fetch accepted orders');
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:5003/api/order/${orderId}/status`, {
        status: 'Accepted'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      message.success('Order accepted successfully');
      setReadyOrders(readyOrders.filter(order => order._id !== orderId));
      setAcceptedOrdersList([...acceptedOrdersList, response.data]);
    } catch (error) {
      console.error('Error accepting order:', error);
      message.error('Failed to accept order');
    }
  };

  const handleStartDelivery = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:5003/api/order/${orderId}/status`, {
        status: 'In Delivery'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      message.success('Delivery started');
      setAcceptedOrdersList(acceptedOrdersList.filter(order => order._id !== orderId));
      setInDeliveryOrdersList([...inDeliveryOrdersList, response.data]);
    } catch (error) {
      console.error('Error starting delivery:', error);
      message.error('Failed to start delivery');
    }
  };

  const handleDeliverOrder = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:5003/api/order/${orderId}/status`, {
        status: 'Delivered'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      message.success('Order delivered successfully');
      const deliveredOrder = inDeliveryOrdersList.find(order => order._id === orderId);
      setInDeliveryOrdersList(inDeliveryOrdersList.filter(order => order._id !== orderId));
      setCompletedOrdersList([deliveredOrder, ...completedOrdersList]);
      
      // Update delivery stats with earnings
      setDeliveryStats(prev => ({
        ...prev,
        completedDeliveries: prev.completedDeliveries + 1,
        totalDeliveries: prev.totalDeliveries + 1,
        earnings: prev.earnings + 200 // Add 200 per completed delivery
      }));
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      message.error('Failed to mark order as delivered');
    }
  };

  const handleRejectOrder = (orderId) => {
    setReadyOrders(readyOrders.filter(order => order._id !== orderId));
    message.info('Order removed from view');
  };

  useEffect(() => {
    fetchReadyOrders();
    fetchAcceptedOrders();
    // Set up polling to refresh orders every 30 seconds
    const interval = setInterval(() => {
      fetchReadyOrders();
      fetchAcceptedOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready':
        return <Badge status="success" text="Ready for Delivery" />;
      case 'Accepted':
        return <Badge status="warning" text="Accepted - Pick Up Pending" />;
      case 'In Delivery':
        return <Badge status="processing" text="In Delivery" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const renderOrderList = (orders, status) => (
    <List
      itemLayout="vertical"
      dataSource={orders}
      renderItem={order => (
        <List.Item
          key={order._id}
          actions={[
            order.status === 'Pending' && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={() => handleAcceptOrder(order._id)}
              >
                Accept Order
              </Button>
            ),
            (order.status === 'Accepted' || order.status === 'Ready') && (
              <Button 
                type="primary" 
                icon={<CarOutlined />}
                onClick={() => handleStartDelivery(order._id)}
              >
                Start Delivery
              </Button>
            ),
            order.status === 'In Delivery' && (
              <Button 
                type="primary" 
                icon={<DeliveredProcedureOutlined />}
                onClick={() => handleDeliverOrder(order._id)}
              >
                Complete Delivery
              </Button>
            ),
            order.status === 'Pending' && (
              <Button 
                danger 
                icon={<CloseOutlined />}
                onClick={() => handleRejectOrder(order._id)}
              >
                Reject Order
              </Button>
            ),
            <Button type="default" icon={<PhoneOutlined />}>
              Contact Customer
            </Button>,
            <Button type="default" icon={<EnvironmentOutlined />}>
              View Route
            </Button>
          ].filter(Boolean)}
        >
          <List.Item.Meta
            avatar={<Avatar icon={<UserOutlined />} />}
            title={`Order #${order._id.slice(-6)}`}
            description={
              <>
                <div>{order.restaurantName}</div>
                {getStatusBadge(order.status)}
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
  );

  return (
    <div className="delivery-home">
      <div className="stats-section">
        <Card className="stats-card">
          <Statistic
            title="Total Deliveries"
            value={deliveryStats.completedDeliveries}
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

      <Tabs defaultActiveKey="ready">
        <Tabs.TabPane tab="Ready Orders" key="ready">
          <div className="orders-section">
            <h2>Ready Orders</h2>
            {renderOrderList(readyOrders, 'Ready')}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={`Accepted Orders (${acceptedOrdersList.length})`} key="accepted">
          <div className="orders-section">
            <h2>Accepted Orders</h2>
            {renderOrderList(acceptedOrdersList, 'Accepted')}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab={`In Delivery (${inDeliveryOrdersList.length})`} key="in-delivery">
          <div className="orders-section">
            <h2>In Delivery</h2>
            {renderOrderList(inDeliveryOrdersList, 'In Delivery')}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane 
          tab={`Completed Orders (${completedOrdersList.length})`} 
          key="completed"
          icon={<HistoryOutlined />}
        >
          <div className="orders-section">
            <h2>Completed Orders</h2>
            <List
              itemLayout="vertical"
              dataSource={completedOrdersList}
              renderItem={order => (
                <List.Item
                  key={order._id}
                  actions={[
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
                        <Badge status="success" text="Delivered" />
                      </>
                    }
                  />
                  <div className="delivery-details">
                    <div><strong>Customer:</strong> {order.customerId?.first_name} {order.customerId?.last_name}</div>
                    <div><strong>Total Amount:</strong> ${order.totalAmount}</div>
                    <div><strong>Delivery Fee:</strong> ${order.deliveryFee}</div>
                    <div><strong>Completed At:</strong> {new Date().toLocaleString()}</div>
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
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Home;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5003/api/order/customer/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter completed and cancelled orders
        const historicalOrders = response.data.filter(order => 
          order.status === 'Completed' || order.status === 'Cancelled'
        );
        
        setOrders(historicalOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order history:', error);
        setError('Failed to fetch order history. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading order history...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Order History
        </Typography>
        <button className="view-active-orders" onClick={() => navigate('/my-orders')}>
          View Active Orders
        </button>
      </Box>
      
      {orders.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No completed or cancelled orders found.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">
                    Order #{order._id.slice(-6)}
                  </Typography>
                  <Typography variant="body1">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body1">
                    Restaurant: {order.restaurantName}
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: order.status === 'Completed' ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}>
                    Status: {order.status}
                  </Typography>
                  <Typography variant="body1">
                    Total Amount: LKR {order.totalAmount?.toFixed(2)}
                  </Typography>
                  {order.deliveryFee && (
                    <Typography variant="body2" color="text.secondary">
                      Delivery Fee: LKR {order.deliveryFee.toFixed(2)}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Items:
                  </Typography>
                  {order.items.map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                      • {item.quantity}x {item.name} - LKR {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default OrderHistory; 
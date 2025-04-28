import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function PayPalCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems = [], cartItems = [] } = location.state || {};
  const [sdkReady, setSdkReady] = useState(false);

  // Calculate total
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));
  const selectedTotal = selectedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = selectedCartItems.length > 0 ? 200 : 0;
  const totalPrice = selectedTotal + deliveryFee;

  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        if (!window.paypal) {
          const { data: clientId } = await axios.get('http://localhost:5010/api/config/paypal');
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons&enable-funding=venmo,card`;
          script.async = true;
          script.onload = () => setSdkReady(true);
          script.onerror = () => setSdkReady(false);
          document.body.appendChild(script);
        } else {
          setSdkReady(true);
        }
      } catch (error) {
        setSdkReady(false);
      }
    };
    loadPayPalScript();
  }, []);

  useEffect(() => {
    if (sdkReady && window.paypal && selectedCartItems.length > 0) {
      const paypalContainer = document.getElementById('paypal-button-container');
      if (paypalContainer) {
        paypalContainer.innerHTML = '';
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: totalPrice.toFixed(2),
                    currency_code: 'USD',
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            try {
              const details = await actions.order.capture();
              const payer = details.payer;
              const purchaseUnit = details.purchase_units[0];
              localStorage.setItem('order_id', details.id);
              
              const token = localStorage.getItem('auth_token');
              if (!token) {
                throw new Error('Authentication token not found');
              }

              // Create orders in the order service
              const createdOrders = [];
              for (const item of selectedCartItems) {
                const orderData = {
                  itemId: item._id,
                  quantity: item.quantity,
                  totalPrice: item.price * item.quantity
                };

                try {
                  const orderResponse = await axios.post(
                    "http://localhost:5003/api/order/add",
                    orderData,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  createdOrders.push(orderResponse.data);
                } catch (error) {
                  console.error('Error creating order:', error);
                  throw new Error('Failed to create order');
                }
              }

              // Save payment details
              await axios.post('http://localhost:5010/api/payment/paypalDetails', {
                orderId: details.id,
                payerName: `${payer.name.given_name} ${payer.name.surname}`,
                amount: parseFloat(purchaseUnit.amount.value),
                currency: purchaseUnit.amount.currency_code,
                paymentDetails: details,
              }, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              // Remove paid items from cart
              try {
                await axios.post('http://localhost:5003/api/cart/remove-multiple', {
                  itemIds: selectedItems
                }, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
              } catch (error) {
                console.error('Error removing items from cart:', error);
              }

              Swal.fire({
                title: 'Payment Successful!',
                text: `Thank you for your purchase, ${payer.name.given_name}!`,
                icon: 'success',
                confirmButtonColor: '#2ecc71',
              }).then(() => {
                // Navigate to order tracking page with the created orders
                navigate('/my-orders', { 
                  state: { 
                    orderId: details.id,
                    success: true,
                    orders: createdOrders
                  } 
                });
              });
            } catch (error) {
              console.error('Payment/Order Error:', error);
              Swal.fire({
                title: 'Error',
                text: error.message || 'There was an error processing your payment/order.',
                icon: 'error',
                confirmButtonColor: '#e74c3c',
              });
            }
          },
          onError: (err) => {
            console.error('PayPal Error:', err);
            Swal.fire({
              title: 'Payment Error',
              text: 'There was an error with PayPal. Please try again.',
              icon: 'error',
              confirmButtonColor: '#e74c3c',
            });
          },
        }).render('#paypal-button-container');
      }
    }
  }, [sdkReady, selectedCartItems, totalPrice, navigate]);

  if (!selectedCartItems.length) {
    return <div>No items selected for payment.</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Pay with PayPal</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Total to Pay:</strong> LKR {totalPrice.toFixed(2)}
      </div>
      <div id="paypal-button-container"></div>
      <button style={{ marginTop: 24 }} onClick={() => navigate(-1)}>Back to Cart</button>
    </div>
  );
}

export default PayPalCheckout; 
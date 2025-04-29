import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function PayPalCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData, selectedItems = [], cartItems = [] } = location.state || {};
  const [sdkReady, setSdkReady] = useState(false);

  // Calculate total from orderData if available, otherwise calculate from items
  const totalPrice = orderData?.totalAmount || (() => {
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));
    const selectedTotal = selectedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = selectedCartItems.length > 0 ? 200 : 0;
    return selectedTotal + deliveryFee;
  })();

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
    if (sdkReady && window.paypal && orderData) {
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

              console.log('Creating order with data:', orderData);

              // Create a single order with all items
              const orderResponse = await axios.post(
                "http://localhost:5003/api/order/add",
                {
                  ...orderData,
                  paypalOrderId: details.id,
                  payerName: `${payer.name.given_name} ${payer.name.surname}`,
                  paymentStatus: 'Completed'
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              console.log('Order creation response:', orderResponse.data);

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
                // Get the selected cart items
                const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));
                // Use the itemId field instead of _id for removal
                const itemIdsToRemove = selectedCartItems.map(item => item.itemId || item._id);
                console.log('Removing items from cart using itemIds:', itemIdsToRemove);
                
                await axios.post('http://localhost:5003/api/cart/remove-multiple', {
                  itemIds: itemIdsToRemove
                }, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                console.log('Successfully removed items from cart');
              } catch (error) {
                console.error('Error removing items from cart:', error.response?.data || error);
                // Don't block the checkout process, but show a warning
                Swal.fire({
                  title: 'Warning',
                  text: 'Your order was successful, but we could not remove items from your cart. Please try clearing your cart manually.',
                  icon: 'warning',
                  confirmButtonColor: '#2ecc71',
                  position: 'top-end',
                  toast: true,
                  timer: 5000,
                  showConfirmButton: false
                });
              }

              Swal.fire({
                title: 'Payment Successful!',
                text: `Thank you for your purchase, ${payer.name.given_name}!`,
                icon: 'success',
                confirmButtonColor: '#2ecc71',
                position: 'top-end',
                toast: true,
                timer: 3000,
                showConfirmButton: false
              }).then(() => {
                // Navigate to order tracking page with the created order and force a cart refresh
                navigate('/my-orders', { 
                  state: { 
                    order: orderResponse.data, 
                    success: true, 
                    orderId: details.id,
                    cartRefreshNeeded: true
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
                position: 'top-end',
                toast: true,
                timer: 3000,
                showConfirmButton: false
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
              position: 'top-end',
              toast: true,
              timer: 3000,
              showConfirmButton: false
            });
          },
        }).render('#paypal-button-container');
      }
    }
  }, [sdkReady, orderData, totalPrice, navigate]);

  if (!orderData) {
    return <div>No order data available for payment.</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Pay with PayPal</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Total to Pay:</strong> LKR {totalPrice.toFixed(2)}
      </div>
      <div id="paypal-button-container"></div>
      <button 
        style={{ 
          marginTop: 24,
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }} 
        onClick={() => navigate(-1)}
      >
        Back to Cart
      </button>
    </div>
  );
}

export default PayPalCheckout; 
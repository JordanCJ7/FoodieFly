import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from 'sweetalert2';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sdkReady, setSdkReady] = useState(false); // State to check if SDK is ready


    const navigate = useNavigate(); // Initialize useNavigate
    const handlePaymentDetailsClick = () => {
        navigate("/payment-details"); // Navigate to the payment details page
    };

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

        if (!window.paypal) {
            addPayPalScript();
        } else {
            setSdkReady(true);
        }
        
    }, []);

    const removeItem = async (id) => {
        const token = localStorage.getItem("auth_token");
        
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You want to remove this item from cart?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2ecc71',
                cancelButtonColor: '#e74c3c',
                confirmButtonText: 'Yes, remove it!'
            });

            if (result.isConfirmed) {
                const response = await axios.delete(`http://localhost:5003/api/cart/remove/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCartItems((prev) => prev.filter((item) => item._id !== id));
                setSelectedOrders((prev) => prev.filter((orderId) => orderId !== id));

                Swal.fire({
                    title: 'Removed!',
                    text: 'Item has been removed from cart.',
                    icon: 'success',
                    confirmButtonColor: '#2ecc71',
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } catch (error) {
            console.error("Error removing item:", error.response?.data || error.message);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to remove item from cart.',
                icon: 'error',
                confirmButtonColor: '#e74c3c'
            });
        }
    };

    // Update item quantity in the cart
    const updateQuantity = async (itemId, change) => {
        const item = cartItems.find((item) => item._id === itemId);
        const newQuantity = item.quantity + change;

        if (newQuantity <= 0) {
            Swal.fire({
                title: 'Invalid Quantity',
                text: 'Quantity cannot be less than 1',
                icon: 'warning',
                confirmButtonColor: '#2ecc71'
            });
            return;
        }

        try {
            const token = localStorage.getItem("auth_token");
            const response = await axios.put(
                "http://localhost:5003/api/cart/update",
                { itemId, quantity: newQuantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCartItems((prev) => {
                const updated = prev.map((item) =>
                    item._id === itemId ? { ...item, quantity: newQuantity } : item
                );
                return updated;
            });
        } catch (error) {
            console.error("Error updating quantity:", error.response?.data || error.message);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update quantity.',
                icon: 'error',
                confirmButtonColor: '#e74c3c'
            });
        }
    };



    const clearCart = () => {
        setCartItems([]);
        setSelectedOrders([]);
    };



    const handleSelectOrder = (id) => {
        if (selectedOrders.includes(id)) {
            setSelectedOrders(selectedOrders.filter((orderId) => orderId !== id));
        } else {
            setSelectedOrders([...selectedOrders, id]);
        }
    };

    const handleCheckout = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            Swal.fire({
                title: 'Authentication Required',
                text: 'Please log in to proceed with checkout.',
                icon: 'warning',
                confirmButtonText: 'Go to Login',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#2ecc71',
                cancelButtonColor: '#e74c3c'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
            return;
        }
    
        const selectedItems = cartItems.filter(item => selectedOrders.includes(item._id));
    
        try {
            for (const item of selectedItems) {
                const orderData = {
                    //restaurantId: item.restaurantId, // This must be part of cart item
                    itemId: item._id,
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity
                };
    
                await axios.post(
                    "http://localhost:5003/api/order/add",
                    orderData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
    
            Swal.fire({
                title: 'Success!',
                text: 'Order placed successfully!',
                icon: 'success',
                confirmButtonColor: '#2ecc71',
                timer: 2000,
                timerProgressBar: true
            });
            // Optionally clear only selected orders from cart
            const remainingCartItems = cartItems.filter(item => !selectedOrders.includes(item._id));
            setCartItems(remainingCartItems);
            setSelectedOrders([]);
        } catch (error) {
            console.error("Error placing order:", error.response?.data || error.message);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to place order. Please try again.',
                icon: 'error',
                confirmButtonColor: '#e74c3c'
            });
        }
    };
    

    const selectedTotal = cartItems
        .filter((item) => selectedOrders.includes(item._id))
        .reduce((total, item) => total + item.price * item.quantity, 0);

    const deliveryFee = selectedOrders.length > 0 ? 200 : 0;
    const totalPrice = selectedTotal + deliveryFee;


    //// Function to dynamically load the PayPal SDK script
    const addPayPalScript = async () => {
        const {data: clientId} = await axios.get("http://localhost:5010/api/config/paypal");
        console.log(clientId);
            
        // Load PayPal script dynamically
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`; // Add your PayPal client ID
        script.async = true;
        script.onload = () => {
            // PayPal script loaded successfully
            console.log("PayPal script loaded");
            setSdkReady(true); // Set SDK ready state to true
        };
        document.body.appendChild(script);
    };

    useEffect(() => {
        if (sdkReady && selectedOrders.length > 0) {
            // Clear the PayPal button container before rendering a new button
            const paypalContainer = document.getElementById("paypal-button-container");
            if (paypalContainer) {
                paypalContainer.innerHTML = ""; // Clear the container
            }

            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: totalPrice.toFixed(2),
                                    currency_code: "USD",
                                },
                            },
                        ],
                    });
                },
                onApprove: async (data, actions) => {
                    const details = await actions.order.capture();
                    const payer = details.payer;
                    const purchaseUnit = details.purchase_units[0];

                    localStorage.setItem("order_id", details.id);// Store paypal order ID in local storage

                    alert(`Transaction completed by ${details.payer.name.given_name}`);
                    console.log("Payment Details:", details);

                    try {
                        await axios.post("http://localhost:5010/api/payment/paypalDetails",
                            {
                                orderId: details.id,
                                payerName: `${payer.name.given_name} ${payer.name.surname}`,
                                amount: parseFloat(purchaseUnit.amount.value),
                                currency: purchaseUnit.amount.currency_code,
                                paymentDetails: details,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                                },
                            }
                        );
                        console.log("✅ Payment info saved to DB");
                    } catch (error) {
                        console.error("❌ Failed to save payment:", error);
                    }
                    
                },
                onError: (err) => {
                    console.error("PayPal Payment Error:", err);
                },
            }).render("#paypal-button-container");
        }
    }, [sdkReady, selectedOrders, totalPrice]);




    if (loading) return <div>Loading...</div>;

    return (
        <div className="cart-container">
            <h2 className="cart-title">My Cart</h2>
            {cartItems.length === 0 ? (
                <p className="empty-cart">Your cart is empty.</p>
            ) : (
                <>
                    <button className="clear-cart-button" onClick={clearCart}>
                        Clear Cart
                    </button>
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item._id} className="cart-item">
                                <input
                                    type="checkbox"
                                    className="cart-checkbox"
                                    checked={selectedOrders.includes(item._id)}
                                    onChange={() => handleSelectOrder(item._id)}
                                />
                                <img
                                    src={item.img.startsWith("http") || item.img.startsWith("/") ? item.img : `/images/${item.img}`}
                                    alt={item.name}
                                    className="cart-item-img"
                                />
                                <div className="cart-item-details">
                                    <span className="cart-item-name">{item.name}</span>
                                    <span className="cart-item-price">
                                        LKR.{item.price.toFixed(2)}
                                    </span>
                                </div>
                                <div className="quantity-controls">
                                    <button 
                                        className="quantity-btn"
                                        onClick={() => updateQuantity(item._id, -1)}
                                        aria-label="Decrease quantity"
                                    >
                                        -
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button 
                                        className="quantity-btn"
                                        onClick={() => updateQuantity(item._id, 1)}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeItem(item._id)}
                                    className="remove-btn"
                                    aria-label="Remove item"
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>LKR.{selectedTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery</span>
                            <span>LKR.{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>LKR.{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        className="checkout-button"
                        disabled={selectedOrders.length === 0}
                        onClick={handleCheckout}
                    >
                        CHECK OUT
                    </button>
                </>
            )}
        </div>
    );
}

export default Cart;

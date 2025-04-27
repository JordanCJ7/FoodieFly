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
    const [sdkReady, setSdkReady] = useState(false);

    const navigate = useNavigate();
    const handlePaymentDetailsClick = () => {
        navigate("/payment-details");
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
                        totalPrice: (item.price || 0) * (item.quantity || 1)
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
    }, []);

    // Separate useEffect for PayPal script
    useEffect(() => {
        const loadPayPalScript = async () => {
            try {
                if (!window.paypal && selectedOrders.length > 0) {
                    const {data: clientId} = await axios.get("http://localhost:5010/api/config/paypal");
                    const script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
                    script.async = true;
                    script.onload = () => {
                        setSdkReady(true);
                    };
                    script.onerror = () => {
                        console.error("Failed to load PayPal SDK");
                        setSdkReady(false);
                    };
                    document.body.appendChild(script);
                }
            } catch (error) {
                console.error("Error loading PayPal script:", error);
                setSdkReady(false);
            }
        };

        loadPayPalScript();
    }, [selectedOrders]);

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
                await axios.delete(`http://localhost:5003/api/cart/remove/${id}`, {
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
            await axios.put(
                "http://localhost:5003/api/cart/update",
                { itemId, quantity: newQuantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCartItems((prev) => {
                return prev.map((item) =>
                    item._id === itemId 
                        ? { 
                            ...item, 
                            quantity: newQuantity,
                            totalPrice: item.price * newQuantity 
                        } 
                        : item
                );
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

    const clearCart = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            await axios.delete("http://localhost:5003/api/cart/clear", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems([]);
            setSelectedOrders([]);
        } catch (error) {
            console.error("Error clearing cart:", error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to clear cart.',
                icon: 'error',
                confirmButtonColor: '#e74c3c'
            });
        }
    };

    const handleSelectOrder = (id) => {
        setSelectedOrders(prev => {
            if (prev.includes(id)) {
                return prev.filter(orderId => orderId !== id);
            } else {
                return [...prev, id];
            }
        });
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

    // Calculate totals
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const selectedTotal = cartItems
        .filter((item) => selectedOrders.includes(item._id))
        .reduce((total, item) => total + (item.price * item.quantity), 0);

    const deliveryFee = selectedOrders.length > 0 ? 200 : 0;
    const totalPrice = selectedTotal + deliveryFee;

    // Render PayPal buttons only when SDK is ready and items are selected
    useEffect(() => {
        if (sdkReady && selectedOrders.length > 0 && window.paypal) {
            try {
                const paypalContainer = document.getElementById("paypal-button-container");
                if (paypalContainer) {
                    paypalContainer.innerHTML = "";
                    
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
                            try {
                                const details = await actions.order.capture();
                                const payer = details.payer;
                                const purchaseUnit = details.purchase_units[0];

                                localStorage.setItem("order_id", details.id);

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

                                Swal.fire({
                                    title: 'Payment Successful!',
                                    text: `Thank you for your purchase, ${payer.name.given_name}!`,
                                    icon: 'success',
                                    confirmButtonColor: '#2ecc71'
                                });
                            } catch (error) {
                                console.error("Payment processing error:", error);
                                Swal.fire({
                                    title: 'Payment Error',
                                    text: 'There was an error processing your payment.',
                                    icon: 'error',
                                    confirmButtonColor: '#e74c3c'
                                });
                            }
                        },
                        onError: (err) => {
                            console.error("PayPal Payment Error:", err);
                            Swal.fire({
                                title: 'Payment Error',
                                text: 'There was an error with PayPal. Please try again.',
                                icon: 'error',
                                confirmButtonColor: '#e74c3c'
                            });
                        },
                    }).render("#paypal-button-container");
                }
            } catch (error) {
                console.error("Error rendering PayPal buttons:", error);
            }
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
                                        LKR {item.price.toFixed(2)} × {item.quantity} = LKR {(item.price * item.quantity).toFixed(2)}
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
                            <span>Cart Subtotal ({cartItems.length} items)</span>
                            <span>LKR {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Selected Items ({selectedOrders.length} items)</span>
                            <span>LKR {selectedTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery Fee</span>
                            <span>LKR {deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total to Pay</span>
                            <span>LKR {totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        className="checkout-button"
                        disabled={selectedOrders.length === 0}
                        onClick={handleCheckout}
                    >
                        CHECK OUT ({selectedOrders.length} items)
                    </button>

                    <div id="paypal-button-container"></div>
                </>
            )}
        </div>
    );
}

export default Cart;

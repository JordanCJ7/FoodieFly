import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from 'sweetalert2';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [sdkReady, setSdkReady] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const navigate = useNavigate();

    const handlePaymentDetailsClick = () => {
        navigate("/payment-details");
    };

    useEffect(() => {
        console.log('Cart component mounted, fetching items...');
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                Swal.fire({
                    title: 'Please Login',
                    text: 'You need to be logged in to view your cart',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Go to Login',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#2ecc71',
                    cancelButtonColor: '#e74c3c'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate("/login");
                    }
                });
                return;
            }

            setLoading(true);
            console.log('Fetching cart with token:', token);

            const response = await fetch("http://localhost:5003/api/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            console.log('Cart API response:', data);

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch cart items");
            }

            if (!data.items || !Array.isArray(data.items)) {
                console.log('No items array in response or invalid format');
                setCartItems([]);
                setLoading(false);
                return;
            }

            // Process the cart items to ensure consistent structure
            const processedItems = data.items.map(item => {
                console.log('Processing item:', item);
                return {
                    _id: item._id || item.itemId,
                    name: item.name || 'Unknown Item',
                    price: parseFloat(item.price || 0),
                    quantity: parseInt(item.quantity || 1),
                    img: item.img || item.image || '/placeholder-food-image.jpg',
                    totalPrice: parseFloat(item.price || 0) * parseInt(item.quantity || 1),
                    restaurant_id: item.restaurant_id || '',
                    restaurant_name: item.restaurant_name || 'Unknown Restaurant'
                };
            });

            console.log('Processed cart items:', processedItems);
            setCartItems(processedItems);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setError(error.message);
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to fetch cart items. Please try again.',
                icon: 'error',
                confirmButtonColor: '#e74c3c'
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset selected restaurant when no items are selected
    useEffect(() => {
        if (selectedItems.length === 0) {
            setSelectedRestaurant(null);
        }
    }, [selectedItems]);

    // Separate useEffect for PayPal script
    useEffect(() => {
        const loadPayPalScript = async () => {
            try {
                if (!window.paypal && selectedItems.length > 0) {
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
    }, [selectedItems]);

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
                setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));

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

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const token = localStorage.getItem("auth_token");
            const response = await fetch(`http://localhost:5003/api/cart/${itemId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (!response.ok) {
                throw new Error("Failed to update quantity");
            }

            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === itemId
                        ? {
                            ...item,
                            quantity: newQuantity,
                            totalPrice: item.price * newQuantity
                        }
                        : item
                )
            );
        } catch (error) {
            console.error("Error updating quantity:", error);
            alert("Failed to update quantity. Please try again.");
        }
    };

    const clearCart = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                Swal.fire({
                    title: 'Please Login',
                    text: 'You need to be logged in to clear your cart',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Go to Login',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#2ecc71',
                    cancelButtonColor: '#e74c3c'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate("/login");
                    }
                });
                return;
            }

            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "This will remove all items from your cart!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2ecc71',
                cancelButtonColor: '#e74c3c',
                confirmButtonText: 'Yes, clear it!'
            });

            if (result.isConfirmed) {
                const response = await fetch("http://localhost:5003/api/cart/clear", {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to clear cart');
                }

                setCartItems([]);
                setSelectedItems([]);
                
                Swal.fire({
                    title: 'Cleared!',
                    text: 'Your cart has been cleared.',
                    icon: 'success',
                    confirmButtonColor: '#2ecc71',
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to clear cart. Please try again.',
                icon: 'error',
                confirmButtonColor: '#e74c3c'
            });
        }
    };

    const handleSelectOrder = (id) => {
        const selectedItem = cartItems.find(item => item._id === id);
        if (!selectedItem) return;

        const currentRestaurantId = selectedItem.restaurant_id;
        
        // If no items are currently selected, set this restaurant as the selected one
        if (selectedItems.length === 0) {
            setSelectedRestaurant(currentRestaurantId);
            setSelectedItems([id]);
            return;
        }

        // If this item is already selected, remove it
        if (selectedItems.includes(id)) {
            const newSelectedItems = selectedItems.filter(itemId => itemId !== id);
            setSelectedItems(newSelectedItems);
            
            // If no items remain selected, reset the selected restaurant
            if (newSelectedItems.length === 0) {
                setSelectedRestaurant(null);
            }
            return;
        }

        // Check if the new item is from the same restaurant
        if (currentRestaurantId !== selectedRestaurant) {
            Swal.fire({
                title: 'Invalid Selection',
                text: 'You can only select items from the same restaurant in a single order.',
                icon: 'warning',
                confirmButtonColor: '#2ecc71'
            });
            return;
        }

        // Add the new item to selected items
        setSelectedItems([...selectedItems, id]);
    };

    const handleCheckout = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            Swal.fire({
                title: 'Please Login',
                text: 'You need to be logged in to checkout',
                icon: 'warning',
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
    
        const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));
    
        try {
            for (const item of selectedCartItems) {
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

            const remainingCartItems = cartItems.filter(item => !selectedItems.includes(item._id));
            setCartItems(remainingCartItems);
            setSelectedItems([]);
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

    // Calculate totals with restaurant-based delivery fee
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const selectedTotal = selectedItems.reduce((total, itemId) => {
        const item = cartItems.find(i => i._id === itemId);
        return total + (item ? item.price * item.quantity : 0);
    }, 0);

    // Apply delivery fee only if items are selected and they're from the same restaurant
    const deliveryFee = selectedItems.length > 0 ? 200 : 0;
    const totalPrice = selectedTotal + deliveryFee;

    // Group cart items by restaurant for display
    const groupedCartItems = useMemo(() => {
        console.log('Grouping cart items:', cartItems);
        return cartItems.reduce((groups, item) => {
            const restaurantId = item.restaurant_id || 'unknown';
            const restaurantName = item.restaurant_name || 'Unknown Restaurant';
            
            if (!groups[restaurantId]) {
                groups[restaurantId] = {
                    restaurantName: restaurantName,
                    items: []
                };
            }
            groups[restaurantId].items.push(item);
            return groups;
        }, {});
    }, [cartItems]);

    // Render PayPal buttons only when SDK is ready and items are selected
    useEffect(() => {
        if (sdkReady && selectedItems.length > 0 && window.paypal) {
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
    }, [sdkReady, selectedItems, totalPrice]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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
                    
                    {Object.entries(groupedCartItems).map(([restaurantId, group]) => (
                        <div key={restaurantId} className="restaurant-group">
                            <h3 className="restaurant-name">
                                {group.restaurantName}
                            </h3>
                            <div className="cart-items">
                                {group.items.map((item) => (
                                    <div key={item._id} className="cart-item">
                                        <input
                                            type="checkbox"
                                            className="cart-checkbox"
                                            checked={selectedItems.includes(item._id)}
                                            onChange={() => handleSelectOrder(item._id)}
                                            disabled={selectedRestaurant && 
                                                    item.restaurant_id !== selectedRestaurant && 
                                                    selectedItems.length > 0}
                                        />
                                        <img
                                            src={item.img || "/placeholder.svg"}
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
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button 
                                                className="quantity-btn"
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
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
                        </div>
                    ))}

                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Cart Subtotal ({cartItems.length} items)</span>
                            <span>LKR {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Selected Items ({selectedItems.length} items)</span>
                            <span>LKR {selectedTotal.toFixed(2)}</span>
                        </div>
                        {selectedItems.length > 0 && (
                            <div className="summary-row">
                                <span>Delivery Fee (per restaurant)</span>
                                <span>LKR {deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total to Pay</span>
                            <span>LKR {totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {selectedItems.length > 0 && (
                        <div className="selected-restaurant-info">
                            <p>Ordering from: {selectedItems[0].restaurant_name}</p>
                        </div>
                    )}

                    <button
                        className="checkout-button"
                        disabled={selectedItems.length === 0}
                        onClick={handleCheckout}
                    >
                        CHECK OUT ({selectedItems.length} items)
                    </button>

                    <div id="paypal-button-container"></div>
                </>
            )}
        </div>
    );
}

export default Cart;

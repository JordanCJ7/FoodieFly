import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Swal from 'sweetalert2';

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  // Check if the user is logged in by verifying the presence of the auth token
  const isLoggedIn = !!localStorage.getItem("auth_token");

  // Decode the JWT token to get the user's role
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the payload
        return decodedToken.role || "customer"; // Default to "customer" if role is missing
      }
      return "customer"; // Default role for non-logged-in users
    } catch (err) {
      console.error("Error decoding token:", err);
      return "customer";
    }
  };

  const userRole = getUserRole();

  // Determine the home route based on the user's role
  const getHomeRoute = () => {
    switch (userRole) {
      case "restaurantAdmin":
        return "/restaurant-home";
      case "deliveryPersonnel":
        return "/delivery-home";
      case "systemAdmin":
        return "/admin-home";
      default:
        return "/"; // Default to customer home
    }
  };

  const homeRoute = getHomeRoute();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Function to handle sign-out
  const handleSignOut = async () => {
    try {
      const result = await Swal.fire({
        title: 'Sign Out',
        text: 'Are you sure you want to sign out?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, sign out',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        // Send a POST request to the backend to log out
        await axios.post(
          "http://localhost:5001/api/auth/logout",
          {},
          { withCredentials: true }
        );
        // Clear any frontend-stored tokens
        localStorage.removeItem("auth_token");
        // Show success message
        await Swal.fire({
          title: 'Signed Out!',
          text: 'You have been successfully signed out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        // Redirect the user to the login page
        navigate("/login");
      }
    } catch (err) {
      console.error("Error during sign-out:", err.response?.data?.error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while signing out. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4CAF50'
      });
    }
  };

  // Fetch cart items count
  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5003/api/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setCartItemCount(data.items?.length || 0);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    if (isLoggedIn) {
      fetchCartItems();
    }
  }, [isLoggedIn]);

  // Fetch notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5003/api/notifications/count", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Left side - Menu icon, Logo, and name */}
          <div className="header-left">
            <button className="icon-button menu-button" onClick={toggleSidebar}>
              <MenuIcon />
            </button>
            <Link to={homeRoute} className="logo-container">
              <div className="logo">FoodieFly</div>
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="header-center">
            {userRole === "customer" && (
              <>
                <Link to="/restaurants" className="nav-link">
                  <RestaurantIcon />
                  <span>Restaurants</span>
                </Link>
                <Link to="/my-orders" className="nav-link">
                  <ListAltIcon />
                  <span>My Orders</span>
                </Link>
              </>
            )}
          </div>

          {/* Right side - Auth buttons and icons */}
          <div className="header-right">
            {isLoggedIn ? (
              // Buttons to display when the user is logged in
              <>
                <button className="icon-button profile-button" onClick={() => navigate('/profile')}>
                  <PersonIcon />
                </button>
                <button className="icon-button cart-button" onClick={() => navigate('/cart')}>
                  <ShoppingCartIcon />
                  {cartItemCount > 0 && <span className="badge">{cartItemCount}</span>}
                </button>
                <button className="icon-button notification-button" onClick={() => navigate('/notifications')}>
                  <NotificationsIcon />
                  {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
                </button>
                <button className="text-button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              // Buttons to display when the user is not logged in
              <>
                <Link to="/register">
                  <button className="primary-button">Sign Up</button>
                </Link>
                <Link to="/login">
                  <button className="text-button-login">Login</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </>
  );
}

export default Header;
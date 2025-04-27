import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CloseIcon from "@mui/icons-material/Close";
import AddBoxIcon from "@mui/icons-material/AddBox";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHovered, setIsHovered] = useState(null);

  // Check if the user is logged in by verifying the presence of the auth token
  const isLoggedIn = !!localStorage.getItem("auth_token");

  // Decode the JWT token to get the user's role
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.role || "customer";
      }
      return "customer";
    } catch (err) {
      console.error("Error decoding token:", err);
      return "customer";
    }
  };

  const userRole = getUserRole();

  // Function to handle sign-out
  const handleSignOut = async () => {
    try {
      await fetch("http://localhost:5001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("auth_token");
      navigate("/login");
    } catch (err) {
      console.error("Error during sign-out:", err);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && e.target.classList.contains("sidebar-overlay")) {
        onClose();
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`sidebar-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="sidebar-overlay"></div>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">FoodSprint</div>
          <div className="sidebar-controls">
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </button>
            <button className="sidebar-close-button" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="sidebar-content">
          {isLoggedIn && (
            <div className="profile-section">
              <div className="profile-info">
                <Link 
                  to="/profile" 
                  className="sidebar-link" 
                  onClick={onClose}
                  onMouseEnter={() => setIsHovered('profile')}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <AccountCircleIcon /> 
                  <span>Manage account</span>
                </Link>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <nav className="sidebar-nav">
              {userRole === "customer" && (
                <>
                  <Link 
                    to="/orders" 
                    className="sidebar-link" 
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered('orders')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <ListAltIcon />
                    <span>Orders</span>
                  </Link>
                  <Link 
                    to="/cart" 
                    className="sidebar-link" 
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered('cart')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <ShoppingCartIcon />
                    <span>Cart</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className="sidebar-link"
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered('notifications')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <NotificationsIcon />
                    <span>Notifications</span>
                  </Link>
                </>
              )}

              {userRole === "restaurantAdmin" && (
                <>
                  <Link
                    to="/addMenuItem"
                    className="sidebar-link"
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered('addMenu')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <AddBoxIcon />
                    <span>Add Menus</span>
                  </Link>
                  <Link
                    to="/menu-item-list"
                    className="sidebar-link"
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered('viewMenu')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <RestaurantMenuIcon />
                    <span>View Menus</span>
                  </Link>
                </>
              )}

              {userRole === "deliveryPersonnel" && (
                <Link 
                  to="/delivery" 
                  className="sidebar-link" 
                  onClick={onClose}
                  onMouseEnter={() => setIsHovered('delivery')}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <LocalShippingIcon />
                  <span>My Deliveries</span>
                </Link>
              )}

              {userRole === "systemAdmin" && (
                <>
                  <Link
                    to="/manage-users"
                    className="sidebar-link"
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered('users')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <PeopleIcon />
                    <span>Manage Users</span>
                  </Link>
                  <Link
                    to="/verifyRestaurant"
                    className="sidebar-link"
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered('restaurants')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <StorefrontIcon />
                    <span>Manage Restaurants</span>
                  </Link>
                  <Link
                    to="/manage-financials"
                    className="sidebar-link"
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered('financials')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <AccountBalanceIcon />
                    <span>Manage Financials</span>
                  </Link>
                </>
              )}
            </nav>
          )}

          {!isLoggedIn && (
            <div className="auth-buttons">
              <Link to="/register">
                <button className="primary-button" onClick={onClose}>
                  Sign Up
                </button>
              </Link>
              <Link to="/login">
                <button className="text-button-login" onClick={onClose}>
                  Login
                </button>
              </Link>
            </div>
          )}

          {isLoggedIn && (
            <div className="sidebar-section">
              <div className="divider"></div>
              <button 
                className="sidebar-button" 
                onClick={handleSignOut}
                onMouseEnter={() => setIsHovered('signout')}
                onMouseLeave={() => setIsHovered(null)}
              >
                <ExitToAppIcon />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
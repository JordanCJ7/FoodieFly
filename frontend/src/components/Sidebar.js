import React, { useEffect, useState, useRef } from "react";
import "./Sidebar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import RestaurantIcon from "@mui/icons-material/Restaurant";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHovered, setIsHovered] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const sidebarRef = useRef(null);

  // Check if the user is logged in
  const isLoggedIn = !!localStorage.getItem("auth_token");

  // Get user role from JWT token
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

  // Handle sign-out
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

  // Handle section click
  const handleSectionClick = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

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

  // Set active section based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/profile')) setActiveSection('profile');
    else if (path.includes('/orders')) setActiveSection('orders');
    else if (path.includes('/cart')) setActiveSection('cart');
    else if (path.includes('/notifications')) setActiveSection('notifications');
    else if (path.includes('/addMenuItem')) setActiveSection('addMenu');
    else if (path.includes('/menu-item-list')) setActiveSection('viewMenu');
    else if (path.includes('/delivery')) setActiveSection('delivery');
    else if (path.includes('/manage-users')) setActiveSection('users');
    else if (path.includes('/verifyRestaurant')) setActiveSection('restaurants');
    else if (path.includes('/manage-financials')) setActiveSection('financials');
  }, [location]);

  if (!isOpen) return null;

  return (
    <div className={`sidebar-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="sidebar-overlay"></div>
      <div className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
        <div className="sidebar-header">
          <div className="sidebar-title">FoodSprint</div>
          <div className="sidebar-controls">
            <button 
              className="theme-toggle" 
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </button>
            <button 
              className="sidebar-close-button" 
              onClick={onClose}
              title="Close Sidebar"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="sidebar-content">
          {isLoggedIn && (
            <nav className="sidebar-nav">
              <Link 
                to="/profile" 
                className={`sidebar-link ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => handleSectionClick('profile')}
                onMouseEnter={() => setIsHovered('profile')}
                onMouseLeave={() => setIsHovered(null)}
              >
                <AccountCircleIcon />
                <span>Manage Profile</span>
              </Link>

              {userRole === "customer" && (
                <>
                  <Link 
                    to="/restaurants" 
                    className={`sidebar-link ${activeSection === 'restaurants' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('restaurants')}
                    onMouseEnter={() => setIsHovered('restaurants')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <RestaurantIcon />
                    <span>Browse Restaurants</span>
                  </Link>
                  <Link 
                    to="/orders" 
                    className={`sidebar-link ${activeSection === 'orders' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('orders')}
                    onMouseEnter={() => setIsHovered('orders')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <ListAltIcon />
                    <span>Orders</span>
                  </Link>
                  <Link 
                    to="/cart" 
                    className={`sidebar-link ${activeSection === 'cart' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('cart')}
                    onMouseEnter={() => setIsHovered('cart')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <ShoppingCartIcon />
                    <span>Cart</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className={`sidebar-link ${activeSection === 'notifications' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('notifications')}
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
                    className={`sidebar-link ${activeSection === 'addMenu' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('addMenu')}
                    onMouseEnter={() => setIsHovered('addMenu')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <AddBoxIcon />
                    <span>Add Menus</span>
                  </Link>
                  <Link
                    to="/menu-item-list"
                    className={`sidebar-link ${activeSection === 'viewMenu' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('viewMenu')}
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
                  className={`sidebar-link ${activeSection === 'delivery' ? 'active' : ''}`}
                  onClick={() => handleSectionClick('delivery')}
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
                    className={`sidebar-link ${activeSection === 'users' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('users')}
                    onMouseEnter={() => setIsHovered('users')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <PeopleIcon />
                    <span>Manage Users</span>
                  </Link>
                  <Link
                    to="/verifyRestaurant"
                    className={`sidebar-link ${activeSection === 'restaurants' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('restaurants')}
                    onMouseEnter={() => setIsHovered('restaurants')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <StorefrontIcon />
                    <span>Manage Restaurants</span>
                  </Link>
                  <Link
                    to="/manage-financials"
                    className={`sidebar-link ${activeSection === 'financials' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('financials')}
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
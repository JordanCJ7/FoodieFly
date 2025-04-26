import React, { useEffect } from "react";
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

function Sidebar({ isOpen, onClose }) {
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

  // Function to handle sign-out
  const handleSignOut = async () => {
    try {
      // Send a POST request to the backend to log out
      await fetch("http://localhost:5001/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      });
      // Clear any frontend-stored tokens
      localStorage.removeItem("auth_token");
      // Redirect the user to the login page
      navigate("/login");
    } catch (err) {
      console.error("Error during sign-out:", err);
    }
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
    <div className="sidebar-wrapper">
      <div className="sidebar-overlay"></div>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">FoodSprint</div>
          <button className="sidebar-close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="sidebar-content">
          {/* Profile section */}
          {isLoggedIn && (
            <div className="profile-section">
              <div className="profile-info">
                <Link to="/profile" className="sidebar-link" onClick={onClose}>
                  <AccountCircleIcon /> 
                  <span>Manage account</span>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          {isLoggedIn && (
            <nav className="sidebar-nav">
              {/* Customer-specific links */}
              {userRole === "customer" && (
                <>
                  <Link to="/orders" className="sidebar-link" onClick={onClose}>
                    <ListAltIcon />
                    <span>Orders</span>
                  </Link>
                  <Link to="/cart" className="sidebar-link" onClick={onClose}>
                    <ShoppingCartIcon />
                    <span>Cart</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className="sidebar-link"
                    onClick={onClose}
                  >
                    <NotificationsIcon />
                    <span>Notifications</span>
                  </Link>
                </>
              )}

              {/* Restaurant Admin-specific links */}
              {userRole === "restaurantAdmin" && (
                <>
                  <Link
                    to="/addMenuItem"
                    className="sidebar-link"
                    onClick={onClose}
                  >
                    <AddBoxIcon />
                    <span>Add Menus</span>
                  </Link>
                  <Link
                    to="/menu-item-list"
                    className="sidebar-link"
                    onClick={onClose}
                  >
                    <RestaurantMenuIcon />
                    <span>View Menus</span>
                  </Link>
                </>
              )}

              {/* Delivery Personnel-specific links */}
              {userRole === "deliveryPersonnel" && (
                <Link to="/delivery" className="sidebar-link" onClick={onClose}>
                  <LocalShippingIcon />
                  <span>My Deliveries</span>
                </Link>
              )}

              {/* System Admin-specific links */}
              {userRole === "systemAdmin" && (
                <>
                  <Link
                    to="/manage-users"
                    className="sidebar-link"
                    onClick={onClose}
                  >
                    <PeopleIcon />
                    <span>Manage Users</span>
                  </Link>
                  <Link
                    to="/verifyRestaurant"
                    className="sidebar-link"
                    onClick={onClose}
                  >
                    <StorefrontIcon />
                    <span>Manage Restaurants</span>
                  </Link>
                  <Link
                    to="/manage-financials"
                    className="sidebar-link"
                    onClick={onClose}
                  >
                    <AccountBalanceIcon />
                    <span>Manage Financials</span>
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Authentication Buttons */}
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

          {/* Sign out */}
          {isLoggedIn && (
            <div className="sidebar-section">
              <div className="divider"></div>
              <button className="sidebar-button" onClick={handleSignOut}>
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
"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

function Home() {
  const navigate = useNavigate();
  const [registrationStatus, setRegistrationStatus] = useState("pending"); 
  const [loading, setLoading] = useState(true); 

  // Fetch restaurant verification status from the backend
  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const token = localStorage.getItem("auth_token"); 
        if (!token) {
          console.error("Authentication token is missing.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5004/api/restaurants/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          const { isVerified } = response.data; 
          setRegistrationStatus(isVerified ? "approved" : "pending");
        }
      } catch (error) {
        console.error("Error fetching restaurant status:", error);
        if (error.response && error.response.status === 404) {
          setRegistrationStatus("rejected"); 
        } else {
          alert(`Error: ${error.response?.data?.error || "An unexpected error occurred."}`);
        }
      } finally {
        setLoading(false); 
      }
    };

    fetchRestaurantStatus();
  }, []);

  
  const handleButtonClick = () => {
    navigate("/restaurant-register");
  };

  const handleMenuButtonClick = () => {
    navigate("/addMenuItem");
  };

  const handleViewMenuButtonClick = () => {
    navigate("/menu-item-list");
  }

  if (loading) {
    return (
      <div className="home-container-RA">
        <div className="loading-indicator">
          <HourglassEmptyIcon fontSize="large" />
          <p>Loading registration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container-RA">
      <div className="hero-section-RA">
        <h1>Food Ordering & Delivery System</h1>
        <p className="subtitle-RA">
          Register your restaurant, manage your menu, and start receiving orders online today.
        </p>
        <div className="cta-buttons-RA">
          <button className="primary-button-RA" onClick={handleButtonClick}>
            Register Your Restaurant
          </button>
          <button className="secondary-button-RA" onClick={handleMenuButtonClick}>
            Add Menu Items
          </button>
          <button className="secondary-button-RA" onClick={handleViewMenuButtonClick}>
            View my Menus
          </button>
        </div>
      </div>
      <div className="features-section">
        <div className="feature">
          <div className="feature-icon">
            <RestaurantIcon fontSize="large" />
          </div>
          <h3>Easy Registration</h3>
          <p>Get your restaurant online in minutes with our simple registration process.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <PhoneAndroidIcon fontSize="large" />
          </div>
          <h3>Mobile Ordering</h3>
          <p>Customers can order from any device with our responsive platform.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <LocalShippingIcon fontSize="large" />
          </div>
          <h3>Delivery Management</h3>
          <p>Track deliveries and manage your delivery fleet efficiently.</p>
        </div>
      </div>
      <div className="registration-status">
        <h2>Registration Status</h2>
        <div className={`status-indicator ${registrationStatus}`}>
          {registrationStatus === "approved" ? (
            <>
              <span className="status-icon">
                <CheckCircleIcon fontSize="large" className="icon-approved" />
              </span>
              <p>Your restaurant registration has been approved!</p>
              <p className="status-message">You can now add menu items and start receiving orders.</p>
            </>
          ) : registrationStatus === "rejected" ? (
            <>
              <span className="status-icon">
                <CancelIcon fontSize="large" className="icon-rejected" />
              </span>
              <p>Your restaurant registration was not approved.</p>
              <p className="status-message">Please contact support for more information.</p>
            </>
          ) : (
            <>
              <span className="status-icon">
                <HourglassEmptyIcon fontSize="large" className="icon-pending" />
              </span>
              <p>Your restaurant registration is pending approval.</p>
              <p className="status-message">We'll notify you once it's reviewed.</p>
            </>
          )}
        </div>
      </div>
      <div className="admin-section">
        <h2>Restaurant Admin</h2>
        <p>Manage your restaurant profile and menu items from one place.</p>
        <div className="admin-buttons">
          <button className="admin-button" onClick={handleButtonClick}>
            Register Your Restaurant
          </button>
          <button className="admin-button" onClick={handleMenuButtonClick}>
            Add Menu Items
          </button>
          <button className="admin-button" onClick={handleViewMenuButtonClick}>
            View My Menus
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
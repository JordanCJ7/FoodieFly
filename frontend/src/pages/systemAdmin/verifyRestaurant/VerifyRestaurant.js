import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VerifyRestaurant.css";

function VerifyRestaurant() {
  const [restaurants, setRestaurants] = useState([]); // State to store restaurant data
  const [expandedRow, setExpandedRow] = useState(null); // Track which row is expanded

  // Fetch restaurant data from the backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("auth_token"); // Get the JWT token
        if (!token) {
          alert("Authentication token is missing. Please log in again.");
          return;
        }

        const response = await axios.get("http://localhost:5004/api/restaurants/get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setRestaurants(response.data); // Set restaurant data to state
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        if (error.response) {
          alert(`Backend Error: ${error.response.data?.error || "An unexpected error occurred."}`);
        } else {
          alert("No response received from the server. Please check your connection.");
        }
      }
    };

    fetchRestaurants();
  }, []);

  // Handle row expansion/collapse
  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // Handle restaurant verification (accept)
  const handleVerify = async (restaurantId) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5004/api/restaurants/verify-restaurant/${restaurantId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Restaurant verified successfully!");
        setRestaurants((prevRestaurants) =>
          prevRestaurants.map((res) =>
            res._id === restaurantId ? { ...res, isVerified: true } : res
          )
        );
      }
    } catch (error) {
      console.error("Error verifying restaurant:", error);
      alert(`Error: ${error.response?.data?.error || "An unexpected error occurred."}`);
    }
  };

  // Handle restaurant rejection
  const handleReject = async (restaurantId) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5004/api/restaurants/delete/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Restaurant rejected and removed successfully!");
        setRestaurants((prevRestaurants) =>
          prevRestaurants.filter((res) => res._id !== restaurantId)
        );
      }
    } catch (error) {
      console.error("Error rejecting restaurant:", error);
      alert(`Error: ${error.response?.data?.error || "An unexpected error occurred."}`);
    }
  };

  return (
    <div className="verify-restaurant-container">
      <h1>Verify Restaurant Registrations</h1>
      <p className="subtitle">Review and approve new restaurant applications</p>

      {/* Placeholder for no restaurants */}
      {restaurants.length === 0 && (
        <div className="no-restaurants">
          <span className="material-icons">restaurant</span>
          <p>No pending restaurant verifications</p>
        </div>
      )}

      {/* Table container */}
      <div className="table-container">
        <table className="restaurant-table">
          <thead>
            <tr>
              <th>Restaurant Name</th>
              <th className="hide-mobile">Owner</th>
              <th className="hide-mobile">Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant, index) => (
              <>
                <tr key={restaurant._id} className="restaurant-row">
                  <td
                    onClick={() => toggleRowExpansion(index)}
                    className="restaurant-name"
                  >
                    {restaurant.restaurantName}
                    <span className="material-icons expand-icon">
                      {expandedRow === index ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                    </span>
                  </td>
                  <td className="hide-mobile">{restaurant.OwnerName}</td>
                  <td className="hide-mobile">{restaurant.address}</td>
                  <td className="action-buttons">
                    <button
                      className="accept-button"
                      onClick={() => handleVerify(restaurant._id)}
                      disabled={restaurant.isVerified} // Disable if already verified
                    >
                      <span className="material-icons">check_circle</span>
                      <span className="button-text">
                        {restaurant.isVerified ? "Verified" : "Accept"} 
                      </span>
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleReject(restaurant._id)}
                    >
                      <span className="material-icons">cancel</span>
                      <span className="button-text">Reject</span>
                    </button>
                  </td>
                </tr>
                {expandedRow === index && (
                  <tr className="expanded-row">
                    <td colSpan="4">
                      <div className="restaurant-details">
                        <div className="detail-section">
                          <h3>Owner Information</h3>
                          <p>
                            <strong>Name:</strong> {restaurant.OwnerName}
                          </p>
                          <p>
                            <strong>Email:</strong> {restaurant.OwnerEmail}
                          </p>
                          <p>
                            <strong>Mobile:</strong> {restaurant.OwnerMobileNumber}
                          </p>
                        </div>
                        <div className="detail-section">
                          <h3>Manager Information</h3>
                          <p>
                            <strong>Name:</strong> {restaurant.ManagerName}
                          </p>
                          <p>
                            <strong>Mobile:</strong> {restaurant.ManagerMobileNumber}
                          </p>
                        </div>
                        <div className="detail-section">
                          <h3>Restaurant Details</h3>
                          <p>
                            <strong>Name:</strong> {restaurant.restaurantName}
                          </p>
                          <p>
                            <strong>Address:</strong> {restaurant.address}
                          </p>
                        </div>
                        <div className="detail-section">
                          <h3>Operating Hours</h3>
                          <div className="hours-grid">
                            {Object.keys(restaurant.operatingHours).map((day) => (
                              <div className="day-hours" key={day}>
                                <p>
                                  <strong>{day}:</strong>
                                </p>
                                <p>
                                  {restaurant.operatingHours[day].isOpen
                                    ? `${restaurant.operatingHours[day].open} - ${restaurant.operatingHours[day].close}`
                                    : "Closed"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="detail-section">
                          <h3>Bank Account Details</h3>
                          <p>
                            <strong>Account Holder:</strong>{" "}
                            {restaurant.bankAccountDetails.accountHolderName}
                          </p>
                          <p>
                            <strong>Account Number:</strong>{" "}
                            {restaurant.bankAccountDetails.accountNumber}
                          </p>
                          <p>
                            <strong>Bank Name:</strong> {restaurant.bankAccountDetails.bankName}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VerifyRestaurant;
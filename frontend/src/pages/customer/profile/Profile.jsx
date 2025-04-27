import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationCityIcon from '@mui/icons-material/LocationCity';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile information');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <div className="profile-loading">
      <div className="loading-spinner"></div>
      Loading profile...
    </div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  const renderProfileField = (icon, label, value) => {
    if (!value) return null;
    return (
      <div className="profile-field">
        <div className="field-icon">{icon}</div>
        <div className="field-content">
          <label>{label}</label>
          <div className="field-value">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <h1>My Profile</h1>
      </div>

      {user && (
        <div className="profile-details">
          <div className="profile-info-section">
            <h2>Personal Information</h2>
            {renderProfileField(
              <PersonIcon />,
              "Full Name",
              user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || user.last_name
            )}
            {renderProfileField(<EmailIcon />, "Email Address", user.email)}
            {renderProfileField(<PhoneIcon />, "Phone Number", user.mobile_number)}
            {renderProfileField(<LocationCityIcon />, "City", user.city)}
          </div>
          
          <div className="profile-section">
            <h2>Address</h2>
            <p><strong>Street:</strong> {user.address?.street}</p>
            <p><strong>City:</strong> {user.address?.city}</p>
            <p><strong>State:</strong> {user.address?.state}</p>
            <p><strong>Zip Code:</strong> {user.address?.zipCode}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 
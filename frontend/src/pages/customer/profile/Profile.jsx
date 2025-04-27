import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Swal from 'sweetalert2';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    city: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
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
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          mobile_number: response.data.mobile_number || '',
          city: response.data.city || ''
        });
        setLoading(false);
      } catch (err) {
        showErrorAlert('Failed to load profile information');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#4CAF50',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#f44336'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        showErrorAlert('Authentication token is missing. Please log in again.');
        return;
      }

      const response = await axios.put(
        'http://localhost:5001/api/auth/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(response.data);
      setIsEditing(false);
      showSuccessAlert('Profile updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update profile';
      showErrorAlert(errorMessage);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showErrorAlert('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 5) {
        showErrorAlert('New password must be at least 5 characters long');
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        showErrorAlert('Authentication token is missing. Please log in again.');
        return;
      }

      await axios.put(
        'http://localhost:5001/api/auth/password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      showSuccessAlert('Password updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update password';
      showErrorAlert(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      mobile_number: user.mobile_number || '',
      city: user.city || ''
    });
    setIsEditing(false);
  };

  const handleDeleteProfile = async () => {
    try {
      const result = await Swal.fire({
        title: 'Delete Profile',
        text: "Are you sure you want to delete your profile? This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f44336',
        cancelButtonColor: '#4CAF50',
        confirmButtonText: 'Yes, delete my profile',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          showErrorAlert('Authentication token is missing. Please log in again.');
          return;
        }

        await axios.delete('http://localhost:5001/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Clear local storage and redirect to login
        localStorage.removeItem('auth_token');
        
        await Swal.fire({
          title: 'Profile Deleted!',
          text: 'Your profile has been successfully deleted.',
          icon: 'success',
          confirmButtonColor: '#4CAF50',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        navigate('/login');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete profile';
      showErrorAlert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        Loading profile...
      </div>
    );
  }

  const renderProfileField = (icon, label, value, fieldName) => {
    if (!value && !isEditing) return null;
    return (
      <div className="profile-field">
        <div className="field-icon">{icon}</div>
        <div className="field-content">
          <label>{label}</label>
          {isEditing ? (
            <input
              type="text"
              name={fieldName}
              value={formData[fieldName]}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <div className="field-value">{value}</div>
          )}
        </div>
      </div>
    );
  };

  const renderPasswordField = (label, name, showPassword, setShowPassword) => (
    <div className="profile-field">
      <div className="field-icon">
        <LockIcon />
      </div>
      <div className="field-content">
        <label>{label}</label>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            name={name}
            value={passwordData[name]}
            onChange={handlePasswordChange}
            className="profile-input"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <h1>My Profile</h1>
        <div className="profile-actions">
          {!isEditing ? (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              <EditIcon /> Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-button" onClick={handleUpdateProfile}>
                <SaveIcon /> Save
              </button>
              <button className="cancel-button" onClick={handleCancelEdit}>
                <CancelIcon /> Cancel
              </button>
            </div>
          )}
          <button className="delete-button" onClick={handleDeleteProfile}>
            <DeleteIcon /> Delete Profile
          </button>
        </div>
      </div>

      {user && (
        <div className="profile-details">
          <div className="profile-info-section">
            <h2>Personal Information</h2>
            {renderProfileField(
              <PersonIcon />,
              "First Name",
              user.first_name,
              'first_name'
            )}
            {renderProfileField(
              <PersonIcon />,
              "Last Name",
              user.last_name,
              'last_name'
            )}
            {renderProfileField(<EmailIcon />, "Email Address", user.email, 'email')}
            {renderProfileField(<PhoneIcon />, "Phone Number", user.mobile_number, 'mobile_number')}
            {renderProfileField(<LocationCityIcon />, "City", user.city, 'city')}
          </div>

          <div className="profile-info-section">
            <div className="section-header">
              <h2>Password Management</h2>
              <button
                className="change-password-button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPasswordForm && (
              <div className="password-form">
                {renderPasswordField(
                  "Current Password",
                  "currentPassword",
                  showCurrentPassword,
                  setShowCurrentPassword
                )}
                {renderPasswordField(
                  "New Password",
                  "newPassword",
                  showNewPassword,
                  setShowNewPassword
                )}
                {renderPasswordField(
                  "Confirm New Password",
                  "confirmPassword",
                  showConfirmPassword,
                  setShowConfirmPassword
                )}
                <button
                  className="update-password-button"
                  onClick={handleUpdatePassword}
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 
import React, { useState, useEffect } from 'react';
import './Notifications.css';
import Swal from 'sweetalert2';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        Swal.fire({
          title: 'Authentication Required',
          text: 'Please log in to view notifications',
          icon: 'warning',
          confirmButtonColor: '#4CAF50',
          showCancelButton: true,
          confirmButtonText: 'Go to Login',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/login';
          }
        });
        return;
      }

      try {
        const response = await fetch('http://localhost:5003/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to fetch notifications',
            icon: 'error',
            confirmButtonColor: '#4CAF50'
          });
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while fetching notifications',
          icon: 'error',
          confirmButtonColor: '#4CAF50'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="no-notifications">No new notifications</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification._id} className="notification-card">
              <div className="notification-header">
                <span className="notification-type">{notification.type}</span>
                <span className="notification-time">{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
              <p className="notification-message">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications; 
import React, { useState, useEffect } from 'react';
import './Notifications.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please log in to view notifications');
        return;
      }

      try {
        // This is a placeholder. You'll need to implement the actual notifications API
        const response = await fetch('http://localhost:5003/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          console.error('Failed to fetch notifications');
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
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
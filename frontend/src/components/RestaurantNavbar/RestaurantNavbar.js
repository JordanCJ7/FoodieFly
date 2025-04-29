import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './RestaurantNavbar.css';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddCircleIcon from '@mui/icons-material/AddCircle';

function RestaurantNavbar() {
  const location = useLocation();

  return (
    <nav className="restaurant-navbar">
      <div className="nav-container">
        <Link 
          to="/restaurant-admin/home" 
          className={`nav-item ${location.pathname === '/restaurant-admin/home' ? 'active' : ''}`}
        >
          <RestaurantIcon />
          <span>Manage Orders</span>
        </Link>

        <Link 
          to="/restaurant-admin/order-history" 
          className={`nav-item ${location.pathname === '/restaurant-admin/order-history' ? 'active' : ''}`}
        >
          <HistoryIcon />
          <span>Order History</span>
        </Link>

        <Link 
          to="/menu-item-list" 
          className={`nav-item ${location.pathname === '/menu-item-list' ? 'active' : ''}`}
        >
          <MenuBookIcon />
          <span>View Menu</span>
        </Link>

        <Link 
          to="/addMenuItem" 
          className={`nav-item ${location.pathname === '/addMenuItem' ? 'active' : ''}`}
        >
          <AddCircleIcon />
          <span>Add Menu Item</span>
        </Link>
      </div>
    </nav>
  );
}

export default RestaurantNavbar; 
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import "./Login.css";
import Swal from 'sweetalert2';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Show loading state
      Swal.fire({
        title: 'Logging in...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Send login data to backend
      const response = await axios.post("http://localhost:5001/api/auth/login", formData);
      const { role, token } = response.data;

      // Store the token in localStorage
      localStorage.setItem("auth_token", token);

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        text: 'Login successful',
        timer: 1500,
        showConfirmButton: false,
        background: '#fff',
        customClass: {
          title: 'success-title',
          popup: 'success-popup'
        }
      });

      // Navigate based on user role
      if (role === "customer") {
        navigate("/");
      } else if (role === "restaurantAdmin") {
        navigate("/restaurant-home");
      } else if (role === "deliveryPersonnel") {
        navigate("/delivery-home");
      } else if (role === "systemAdmin") {
        navigate("/admin-home");
      }
    } catch (err) {
      console.error("Error during login:", err.response?.data?.error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.error || "An unexpected error occurred.",
        confirmButtonColor: 'var(--primary-color)',
        background: '#fff',
        customClass: {
          title: 'error-title',
          popup: 'error-popup'
        }
      });
    }
  };

  return (
    <div className="login-container">
      <div className="welcome-container">
        <h1 className="welcome-heading">Welcome to FoodieFly</h1>
        <p className="welcome-message">Sign in to continue to your account</p>
      </div>
      
      <div className="login-modal">
        <div className="login-header">
          <h2>Login</h2>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-groupL">
            <label className="labelL" htmlFor="email">Email</label>
            <input
              className="inputL"
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-groupL">
            <label className="labelL" htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                className="inputL"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="signup-prompt">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import "./Login.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); // To display error messages
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
      // Send login data to backend
      const response = await axios.post("http://localhost:5001/api/auth/login", formData);

      const { role, token } = response.data;

      // Store the token in localStorage or cookies 
      localStorage.setItem("auth_token", token);

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
      setError(err.response?.data?.error || "An unexpected error occurred.");
    }
  };

  return (
    <div className="login-container">
      <div className="welcome-container">
        <h1 className="welcome-heading">Welcome Back!</h1>
        <p className="welcome-message">
          Please enter your details to access your account
        </p>
      </div>

      <div className="login-modal">
        <div className="login-header">
          <h2>Login</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <div className="form-groupL">
            <label className="labelL" htmlFor="email">
              Email or phone number
            </label>
            <input
              className="inputL"
              type="text"
              id="email"
              name="email"
              placeholder="Enter your email or phone"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group password-group">
            <label className="labelL" htmlFor="password">
              Password
            </label>
            <div className="password-input-container">
              <input
                className="inputL"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
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
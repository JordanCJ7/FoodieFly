import { useState, useRef, useEffect } from "react";
import "./SignUp.css";
import SignUpImage from "../../../images/signup.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// List of Sri Lankan cities
const sriLankanCities = [
  "Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Sri Jayawardenepura Kotte", "Negombo",
  "Kandy", "Galle", "Trincomalee", "Batticaloa", "Jaffna", "Kalmunai", "Vavuniya", "Gampaha",
  "Kurunegala", "Matale", "Kalutara", "Mannar", "Nuwara Eliya", "Hambantota", "Kegalle", "Ampara",
  "Hatton", "Polonnaruwa", "Nawalapitiya", "Embilipitiya", "Weligama", "Ambalangoda", "Tangalle",
  "Bandarawela", "Haputale", "Monaragala", "Avissawella", "Kelaniya", "Panadura", "Beruwala",
  "Horana", "Wattala", "Ja-Ela", "Minuwangoda", "Kuliyapitiya", "Harispattuwa", "Kadugannawa",
  "Mawanella", "Gampola", "Akuressa", "Homagama", "Maharagama", "Kaduwela", "Piliyandala",
  "Peliyagoda", "Mulleriyawa", "Hendala", "Welisara", "Ragama", "Kandana", "Hanwella", "Wadduwa",
  "Aluthgama", "Bentota", "Hikkaduwa", "Unawatuna", "Mirissa", "Tissamaharama", "Ella", "Wellawaya",
  "Buttala", "Katharagama", "Pottuvil", "Arugam Bay", "Kattankudy", "Eravur", "Valaichchenai",
  "Chenkalady", "Sammanthurai", "Akkaraipattu", "Pothuvil", "Point Pedro", "Chavakachcheri",
  "Kilinochchi", "Mullaittivu", "Puthukkudiyiruppu", "Oddusuddan", "Pulmoddai", "Kantale", "Kinniya",
  "Mutur", "Habarana", "Sigiriya", "Mahiyanganaya", "Welimada", "Hali Ela", "Passara", "Lunugala",
  "Battaramulla", "Dalugama", "Kotikawatta", "Keselwatta", "Valvettithurai"
];

function SignUp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState(sriLankanCities);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    MobileNumber: "",
    Email: "",
    City: "",
    Password: "",
    Role: "customer", // Default role
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // Hook for navigation

  // Filter cities based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCities(sriLankanCities);
    } else {
      const filtered = sriLankanCities.filter((city) =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCitySelect = (city) => {
    setSearchTerm(city);
    setIsDropdownOpen(false);
    setFormData({ ...formData, City: city }); // Update city in form data
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 5) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return '#ff4444';
      case 2:
      case 3:
        return '#ffbb33';
      case 4:
      case 5:
        return '#00C851';
      default:
        return '#ff4444';
    }
  };

  // Real-time validation
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'Email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'MobileNumber':
        if (!/^[0-9]{10}$/.test(value)) {
          error = 'Please enter a valid 10-digit mobile number';
        }
        break;
      case 'Password':
        if (value.length < 5) {
          error = 'Password must be at least 5 characters long';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validate field in real-time
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Show loading state
      Swal.fire({
        title: 'Creating your account...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        formData
      );

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Welcome to FoodieFly!',
        text: 'Your account has been created successfully.',
        confirmButtonColor: 'var(--primary-color)',
        timer: 2000,
        timerProgressBar: true
      });

      // Store the token
      localStorage.setItem("auth_token", response.data.token);

      // Navigate based on role
      if (formData.Role === "customer") {
        navigate("/");
      } else if (formData.Role === "restaurantAdmin") {
        navigate("/restaurant-register");
      } else if (formData.Role === "deliveryPersonnel") {
        navigate("/delivery-home");
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data?.error);
      
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.error || "An unexpected error occurred.",
        confirmButtonColor: 'var(--primary-color)',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-container">
        <div className="signup-header">
          <h1>Sign Up</h1>
          <p>Create your account to order delicious food</p>
        </div>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-rowS">
            <div className="form-groupS">
              <label className="labelS" htmlFor="FirstName">
                First Name
              </label>
              <input
                className="inputS"
                type="text"
                id="FirstName"
                name="FirstName"
                placeholder="Enter your first name"
                value={formData.FirstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-groupS">
              <label className="labelS" htmlFor="LastName">
                Last Name
              </label>
              <input
                className="inputS"
                type="text"
                id="LastName"
                name="LastName"
                placeholder="Enter your last name"
                value={formData.LastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-groupS">
            <label className="labelS" htmlFor="MobileNumber">
              Mobile Number
            </label>
            <input
              className="inputS"
              type="tel"
              id="MobileNumber"
              name="MobileNumber"
              placeholder="Enter your mobile number"
              value={formData.MobileNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-groupS">
            <label className="labelS" htmlFor="Email">
              Email
            </label>
            <input
              className="inputS"
              type="email"
              id="Email"
              name="Email"
              placeholder="Enter your email address"
              value={formData.Email}
              onChange={handleChange}
              required
            />
          </div>
          {/* City Dropdown */}
          <div className="form-groupS">
            <label className="labelS" htmlFor="City">
              City
            </label>
            <div className="city-dropdown-container" ref={dropdownRef}>
              <input
                className="inputS city-search"
                type="text"
                id="City"
                name="City"
                placeholder="Search for your city"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onClick={() => setIsDropdownOpen(true)}
                required
              />
              {isDropdownOpen && (
                <div className="city-dropdown">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city, index) => (
                      <div
                        key={index}
                        className="city-option"
                        onClick={() => handleCitySelect(city)}
                      >
                        {city}
                      </div>
                    ))
                  ) : (
                    <div className="no-cities">No cities found</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="form-groupS">
            <label className="labelS" htmlFor="Password">
              Password
            </label>
            <div className="password-input-container">
              <input
                className="inputS"
                type={showPassword ? "text" : "password"}
                id="Password"
                name="Password"
                placeholder="Enter your password"
                value={formData.Password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.Password && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="strength-segment"
                      style={{
                        backgroundColor: index < calculatePasswordStrength(formData.Password)
                          ? getPasswordStrengthColor(calculatePasswordStrength(formData.Password))
                          : '#e0e0e0'
                      }}
                    />
                  ))}
                </div>
                <span className="strength-text">
                  {calculatePasswordStrength(formData.Password) <= 2 ? 'Weak' :
                   calculatePasswordStrength(formData.Password) <= 3 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}
            {validationErrors.Password && (
              <span className="error-message">{validationErrors.Password}</span>
            )}
          </div>
          {/* Account Type Selection */}
          <div className="form-groupS account-type-section">
            <label className="labelS">Choose Your Account Type</label>
            <p className="account-type-description">
              Select the type of account you want to create
            </p>
            <div className="account-type-options">
              <div className="account-type-option">
                <input
                  type="radio"
                  id="customer"
                  name="Role"
                  value="customer"
                  checked={formData.Role === "customer"}
                  onChange={handleChange}
                />
                <label htmlFor="customer" className="account-type-label">
                  <span className="account-type-title">Customer</span>
                  <span className="account-type-info">
                    Order food from your favorite restaurants
                  </span>
                </label>
              </div>
              <div className="account-type-option">
                <input
                  type="radio"
                  id="business"
                  name="Role"
                  value="restaurantAdmin"
                  checked={formData.Role === "restaurantAdmin"}
                  onChange={handleChange}
                />
                <label htmlFor="business" className="account-type-label">
                  <span className="account-type-title">Business Owner</span>
                  <span className="account-type-info">
                    Register your restaurant on our platform
                  </span>
                </label>
              </div>
              <div className="account-type-option">
                <input
                  type="radio"
                  id="delivery"
                  name="Role"
                  value="deliveryPersonnel"
                  checked={formData.Role === "deliveryPersonnel"}
                  onChange={handleChange}
                />
                <label htmlFor="delivery" className="account-type-label">
                  <span className="account-type-title">Delivery Person</span>
                  <span className="account-type-info">
                    Join our delivery fleet and earn money
                  </span>
                </label>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            className="signup-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="login-link">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Log In
            </Link>
          </p>
        </div>
      </div>
      <div className="signup-image">
        <div className="benefits">
        <h2>Get Food Delivered Your Way</h2>
          <ul>
            <li>Discover top local eats, all in one place</li>
            <li>Lightning-fast, dependable delivery right to your door</li>
            <li>Unlock exclusive deals, promos, and savings</li>
            <li>Track your order in real-time, every step of the way</li>
          </ul>

        <img src={SignUpImage} alt="signup" />
        </div>
        
        
      </div>
    </div>
  );
}

export default SignUp;
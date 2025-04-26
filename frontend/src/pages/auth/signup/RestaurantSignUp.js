import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./RestaurantSignUp.css";

const RestaurantSignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    OwnerName: "",
    OwnerEmail: "",
    OwnerMobileNumber: "",
    ManagerName: "",
    ManagerMobileNumber: "",
    restaurantName: "",
    address: "",
    operatingHours: {
      Monday: { isOpen: true, open: "", close: "" },
      Tuesday: { isOpen: true, open: "", close: "" },
      Wednesday: { isOpen: true, open: "", close: "" },
      Thursday: { isOpen: true, open: "", close: "" },
      Friday: { isOpen: true, open: "", close: "" },
      Saturday: { isOpen: true, open: "", close: "" },
      Sunday: { isOpen: true, open: "", close: "" },
    },
    bankAccountDetails: {
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
    },
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null); // State to store userId
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decodedToken = jwtDecode(token); // Decode the JWT token
      const { role, id: decodedUserId } = decodedToken; // Extract role and userId (id is used in the token)
      if (role !== "restaurantAdmin") {
        alert("Only restaurant admins can register a restaurant.");
        navigate("/home");
        return;
      }
      setIsLoggedIn(true);
      setUserRole(role);
      setUserId(decodedUserId); // Store userId in state
      console.log("Decoded Token:", decodedToken);
      console.log("Extracted userId:", decodedUserId);
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/login"); // Redirect to login if token decoding fails
    }
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle time changes for operating hours
  const handleTimeChange = (day, type, value) => {
    setFormData({
      ...formData,
      operatingHours: {
        ...formData.operatingHours,
        [day]: {
          ...formData.operatingHours[day],
          [type]: value,
        },
      },
    });
  };

  // Toggle day open/closed status
  const toggleDayOpen = (day) => {
    setFormData({
      ...formData,
      operatingHours: {
        ...formData.operatingHours,
        [day]: {
          ...formData.operatingHours[day],
          isOpen: !formData.operatingHours[day].isOpen,
        },
      },
    });
  };

  // Navigate to the next step
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  // Navigate to the previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const transformedData = {
        userId,
        OwnerName: formData.OwnerName,
        OwnerEmail: formData.OwnerEmail,
        OwnerMobileNumber: formData.OwnerMobileNumber,
        ManagerName: formData.ManagerName,
        ManagerMobileNumber: formData.ManagerMobileNumber,
        restaurantName: formData.restaurantName,
        address: formData.address,
        operatingHours: formData.operatingHours,
        bankAccountDetails: formData.bankAccountDetails,
      };
      console.log("Payload being sent to backend:", transformedData);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:5004/api/restaurants/register-restaurant",
        transformedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Backend response:", response); // Log the full response
      console.log("Backend response data:", response.data); // Log the response data

      if (response.status === 201) {
        alert("Restaurant registered successfully!");
        console.log("Navigating to addMenuItem page...");
        navigate("/addMenuItem"); // Navigate to the next page
      } else {
        alert("Unexpected response from the server. Please try again.");
      }
    } catch (error) {
      console.error("Error during restaurant registration:", error);
      if (error.response) {
        console.log("Backend error response:", error.response); // Log the full error response
        const errorMessage =
          error.response.data?.error || "An unexpected error occurred.";
        alert(`Backend Error: ${errorMessage}`);
      } else if (error.request) {
        alert("No response received from the server. Please check your connection.");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Render the current step of the form
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h2>Contact Information</h2>
            <div className="form-groupR">
              <label>
                Owner Name<span className="required">*</span>
              </label>
              <input
                className="inputR"
                type="text"
                name="OwnerName"
                value={formData.OwnerName}
                onChange={handleInputChange}
                placeholder="Enter owner's full name"
                required
              />
            </div>
            <div className="form-groupR">
              <label>
                Owner Email<span className="required">*</span>
              </label>
              <input
                className="inputR"
                type="email"
                name="OwnerEmail"
                value={formData.OwnerEmail}
                onChange={handleInputChange}
                placeholder="Enter owner's email address"
                required
              />
            </div>
            <div className="form-groupR">
              <label>
                Owner Mobile Number<span className="required">*</span>
              </label>
              <input
                className="inputR"
                type="text"
                name="OwnerMobileNumber"
                value={formData.OwnerMobileNumber}
                onChange={handleInputChange}
                placeholder="Enter owner's mobile number"
                required
              />
            </div>
            <div className="form-groupR">
              <label>
                Manager Name<span className="required">*</span>
              </label>
              <input
                className="inputR"
                type="text"
                name="ManagerName"
                value={formData.ManagerName}
                onChange={handleInputChange}
                placeholder="Enter manager's full name"
                required
              />
            </div>
            <div className="form-groupR">
              <label>
                Manager Mobile Number<span className="required">*</span>
              </label>
              <input
                className="inputR"
                type="text"
                name="ManagerMobileNumber"
                value={formData.ManagerMobileNumber}
                onChange={handleInputChange}
                placeholder="Enter manager's mobile number"
                required
              />
            </div>
            <div className="button-group">
              <button className="next-btn" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h2>Restaurant Information</h2>
            <div className="form-groupR">
              <label>
                Restaurant Name<span className="required">*</span>
              </label>
              <input
                className="inputR"
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleInputChange}
                placeholder="Enter restaurant name"
                required
              />
            </div>
            <div className="form-groupR">
              <label>
                Address<span className="required">*</span>
              </label>
              <textarea
                className="textareaR"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter restaurant address"
                rows="3"
                required
              ></textarea>
            </div>
            <div className="form-groupR">
              <label>
                Operating Hours<span className="required">*</span>
              </label>
              <div className="operating-hours">
                {Object.keys(formData.operatingHours).map((day) => (
                  <div key={day} className="day-hours">
                    <div className="day-status">
                      <span className="day-name">{day}</span>
                      <div className="day-toggle">
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={formData.operatingHours[day].isOpen}
                            onChange={() => toggleDayOpen(day)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        <span className="toggle-label">
                          {formData.operatingHours[day].isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                    {formData.operatingHours[day].isOpen ? (
                      <div className="time-inputs">
                        <div className="time-input">
                          <label className="open-label">Open</label>
                          <input
                            type="time"
                            value={formData.operatingHours[day].open}
                            onChange={(e) => handleTimeChange(day, "open", e.target.value)}
                            className="open-time"
                            required
                          />
                        </div>
                        <div className="time-input">
                          <label className="close-label">Close</label>
                          <input
                            type="time"
                            value={formData.operatingHours[day].close}
                            onChange={(e) => handleTimeChange(day, "close", e.target.value)}
                            className="close-time"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="closed-message">Restaurant is closed on this day</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="button-group">
              <button className="back-btn" onClick={prevStep}>
                Back
              </button>
              <button className="next-btn" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-step">
            <h2>Bank Details</h2>
            <div className="form-groupR">
              <label>
                Account Holder Name<span className="required">*</span>
              </label>
              <input
                className="inputR"
                type="text"
                name="bankAccountDetails.accountHolderName"
                value={formData.bankAccountDetails.accountHolderName}
                onChange={handleInputChange}
                placeholder="Enter account holder name"
                required
              />
            </div>
            <div className="form-groupR">
              <label>
                Account Number<span className="required">*</span>
              </label>
              <input
                className="inputR"
                type="text"
                name="bankAccountDetails.accountNumber"
                value={formData.bankAccountDetails.accountNumber}
                onChange={handleInputChange}
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="form-groupR">
              <label>
                Bank Name<span className="required">*</span>
              </label>
              <select
                className="selectR"
                name="bankAccountDetails.bankName"
                value={formData.bankAccountDetails.bankName}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Bank</option>
                <option value="Bank of Ceylon">Bank of Ceylon</option>
                <option value="People's Bank">People's Bank</option>
                <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                <option value="Sampath Bank">Sampath Bank</option>
                <option value="Hatton National Bank">Hatton National Bank</option>
                <option value="Nations Trust Bank">Nations Trust Bank</option>
                <option value="Seylan Bank">Seylan Bank</option>
                <option value="National Development Bank">National Development Bank</option>
                <option value="Union Bank of Colombo">Union Bank of Colombo</option>
                <option value="Pan Asia Bank">Pan Asia Bank</option>
                <option value="DFCC Bank">DFCC Bank</option>
                <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                <option value="Citibank N.A.">Citibank N.A.</option>
                <option value="HSBC Bank">HSBC Bank</option>
                <option value="Indian Overseas Bank">Indian Overseas Bank</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Habib Bank AG Zurich">Habib Bank AG Zurich</option>
                <option value="Saudi National Bank">Saudi National Bank</option>
                <option value="Al Rajhi Banking & Investment Corporation">Al Rajhi Banking & Investment Corporation</option>
                <option value="First Gulf Bank">First Gulf Bank</option>
                <option value="Bank of China">Bank of China</option>
                <option value="China Construction Bank">China Construction Bank</option>
                <option value="Industrial and Commercial Bank of China">Industrial and Commercial Bank of China</option>
                <option value="Bangkok Bank Public Company Limited">Bangkok Bank Public Company Limited</option>
                <option value="Standard Chartered Saadiq">Standard Chartered Saadiq</option>
                <option value="CIMB Bank">CIMB Bank</option>
                <option value="Deutsche Bank">Deutsche Bank</option>
                <option value="Malayan Banking Berhad (Maybank)">Malayan Banking Berhad (Maybank)</option>
                <option value="Public Bank Berhad">Public Bank Berhad</option>
                <option value="RHB Bank">RHB Bank</option>
                <option value="United Overseas Bank">United Overseas Bank</option>
                <option value="Development Bank of Singapore (DBS)">Development Bank of Singapore (DBS)</option>
                <option value="Overseas Chinese Banking Corporation (OCBC)">Overseas Chinese Banking Corporation (OCBC)</option>
              </select>
            </div>
            <div className="button-group">
              <button className="back-btn" onClick={prevStep}>
                Back
              </button>
              <button className="submit-btn" onClick={handleSubmit}>
                Submit Registration
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return <div>Loading...</div>;
  }

  return (
    <div className="restaurant-signup-container">
      <div className="signupR-header">
        <h1>Restaurant Onboarding</h1>
        <div className="progress-tracker">
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <div className="step-label">Contact Information</div>
            </div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <div className="step-label">Restaurant Information</div>
            </div>
            <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <div className="step-label">Bank Details</div>
            </div>
          </div>
        </div>
      </div>
      <div className="signupR-form">{renderStep()}</div>
    </div>
  );
};

export default RestaurantSignUp;
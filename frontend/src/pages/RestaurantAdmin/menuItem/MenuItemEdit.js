import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./MenuItemEdit.css";

function MenuItemEdit() {
  const { id } = useParams(); // Extract the menu item ID from the URL
  const navigate = useNavigate();
  
  // State to manage form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    availability: true,
    image: null, // To store the uploaded image file
  });

  // State to manage loading, error messages, and restaurantId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch the menu item details to populate the form
  useEffect(() => {
    const fetchMenuItemDetails = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          alert("Authentication token is missing. Please log in again.");
          return;
        }

        const response = await axios.get(`http://localhost:5004/api/menu-items/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 && response.data) {
          const menuItem = response.data;
          setFormData({
            name: menuItem.name,
            description: menuItem.description,
            price: menuItem.price,
            availability: menuItem.availability,
            image: null, // Image will be updated only if a new file is selected
          });
        } else {
          setError("Menu item not found.");
        }
      } catch (err) {
        console.error("Error fetching menu item details:", err.message);
        setError(err.response?.data?.error || "An error occurred while fetching the menu item.");
      }
    };

    fetchMenuItemDetails();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prevData) => ({
        ...prevData,
        image: files[0], // Store the first selected file
      }));
    } else if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Convert the image file to a base64 string
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file); // Read the file as a Data URL (base64)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      let imageData = "";
      if (formData.image) {
        imageData = await convertFileToBase64(formData.image);
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        availability: formData.availability,
        imageData: imageData, // Include the base64 image data if a new image is selected
      };

      console.log("Request Payload:", payload);

      const response = await axios.put(
        `http://localhost:5004/api/menu-items/update/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Menu item updated successfully!");
      navigate("/menu-item-list");
    } catch (err) {
      console.error("Error updating menu item:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "An error occurred while updating the menu item.");
    } finally {
      setLoading(false);
    }
  };

  // Render an error message if there’s an issue
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="menu-item-edit-container">
      <div className="menu-item-edit-header">
        <h2>Edit Menu Item</h2>
        <p>Update details for your menu item</p>
      </div>
      <form className="menu-item-form" onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="form-main">
            <div className="form-groupM">
              <label className="labelM" htmlFor="name">
                Item Name
              </label>
              <input
                className="inputM"
                type="text"
                id="name"
                name="name"
                placeholder="Enter menu item name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-groupM">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the dish, ingredients, etc."
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-rowM">
              <div className="form-groupM">
                <label htmlFor="price">Price</label>
                <input
                  className="labelM"
                  type="number"
                  id="price"
                  name="price"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-groupM checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span>Available for ordering</span>
              </label>
            </div>
          </div>
          <div className="form-sidebar">
            <div className="image-upload-container">
              <label htmlFor="image">Item Image</label>
              <div className="image-preview">
                {formData.image ? (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "100px" }}
                  />
                ) : (
                  <p>No image selected</p>
                )}
              </div>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                className="file-input"
                onChange={handleChange}
              />
              <label htmlFor="image" className="file-input-label">
                Choose Image
              </label>
              <p className="image-help-text">Recommended: 800x600px, JPG or PNG</p>
            </div>
          </div>
        </div>
        <div className="form-actions">
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Updating..." : "Update Menu Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MenuItemEdit;
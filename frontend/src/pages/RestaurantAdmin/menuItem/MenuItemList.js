import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./MenuItemList.css";

const MenuItemList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("Authentication token is missing. Please log in again.");
          setLoading(false);
          return;
        }
        const response = await fetch("http://localhost:5004/api/menu-items/user-menu-items", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from the server.");
        }
        setMenuItems(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching menu items:", err.message);
        setError(err.message || "An unexpected error occurred.");
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sorting when a column header is clicked
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const sortedAndFilteredItems = [...menuItems]
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.key) {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
      }
      return 0;
    });

  // Get the sort direction indicator
const getSortDirectionIndicator = (key) => {
  if (sortConfig.key !== key) return "";
  return sortConfig.direction === "ascending" ? (
    <span className="material-icons sort-icon">arrow_upward</span>
  ) : (
    <span className="material-icons sort-icon">arrow_downward</span>
  );
};

  // Handle Edit Action
  const handleEdit = (id) => {
    navigate(`/edit-menu-item/${id}`); // Navigate to the edit page
  };

  // Handle Delete Action
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("Authentication token is missing. Please log in again.");
          return;
        }
        const response = await fetch(`http://localhost:5004/api/menu-items/delete/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        // Remove the deleted item from the state
        setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
        alert("Menu item deleted successfully!");
      } catch (err) {
        console.error("Error deleting menu item:", err.message);
        setError(err.message || "An unexpected error occurred while deleting the menu item.");
      }
    }
  };

  return (
    <div className="menu-item-list-conteiner">
      <div className="menu-container">
        <h1>My Menu Items</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="table-container">
          <table className="menu-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("image")}>Image</th>
                <th onClick={() => requestSort("name")}>
                  Name{getSortDirectionIndicator("name")}
                </th>
                <th onClick={() => requestSort("description")}>
                  Description{getSortDirectionIndicator("description")}
                </th>
                <th onClick={() => requestSort("price")}>
                  Price{getSortDirectionIndicator("price")}
                </th>
                <th onClick={() => requestSort("availability")}>
                  Availability{getSortDirectionIndicator("availability")}
                </th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredItems.length > 0 ? (
                sortedAndFilteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="menu-image"
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>Rs.{item.price.toFixed(2)}</td>
                    <td>
                      <span className={item.availability ? "available" : "unavailable"}>
                        {item.availability ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td>
                      {/* Edit Icon */}
                      <span
                        className="material-icons action-icon edit-icon"
                        onClick={() => handleEdit(item.id)} // Navigate to edit page
                        title="Edit"
                      >
                        edit
                      </span>
                    </td>
                    <td>
                      {/* Delete Icon */}
                      <span
                        className="material-icons action-icon delete-icon"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        delete
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    No menu items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuItemList;
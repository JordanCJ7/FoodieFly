import { useState, useEffect } from "react";
import "./ManageUsers.css";
import { Trash2 } from "lucide-react";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Function to fetch all users from the backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth_token"); // Retrieve token from local storage
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `http://localhost:5001/api/auth/all?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data); // Assuming the backend returns { Status: 'Success', data: [] }
      setTotalPages(data.totalPages); // Set total pages from backend
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch users when the component mounts or when the page changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Function to handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("auth_token"); // Retrieve token from local storage
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(`http://localhost:5001/api/auth/delete/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        // Remove the deleted user from the state
        setUsers(users.filter((user) => user._id !== userId));
      } catch (err) {
        alert(`Error deleting user: ${err.message}`);
      }
    }
  };

  // Handle pagination button clicks
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="manage-users-container">
      <h1>User Management</h1>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Mobile Number</th>
              <th>Email</th>
              <th>City</th>
              <th>Account Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.mobile_number}</td>
                <td>{user.email}</td>
                <td>{user.city}</td>
                <td>
                  <span className={`account-type ${user.role}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ManageUsers;
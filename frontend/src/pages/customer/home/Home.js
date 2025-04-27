import { useEffect, useState } from "react"
import "./Home.css"
import HomeLandingPageImage from "../../../images/home_landing_img.jpg"
import { useNavigate } from "react-router-dom"
import Swal from 'sweetalert2';

function Home() {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const fetchMenuItems = async (page, search = "") => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5004/api/menu-items/home-menu-items?page=${page}&limit=6${search ? `&search=${search}` : ''}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
      const data = await response.json();

      if (!Array.isArray(data.data)) {
        throw new Error("Invalid data format received from the server.");
      }

      setFoodItems(data.data);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching menu items:", err.message);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.querySelector('.search-input-h').value;
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page when searching
    setIsSearching(true);
  };

  const handleSearchInputChange = (e) => {
    if (e.target.value === '') {
      setSearchQuery('');
      setIsSearching(false);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFoodCardClick = (item) => {
    navigate(`/food/${item.id}`);
  };

  if (loading && currentPage === 1) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="customer-home">
      <div className="home-container-c">
        {/* Hero Section */}
        <section className="hero-section-c">
          <div className="hero-content-c">
            <h1 className="hero-title-c">
              <span className="highlight-c">Fast Delivery</span>
              <br />
              From Top Restaurants
            </h1>
            <p className="hero-description-c">
              Order your favorite meals from the best local restaurants and enjoy doorstep delivery
              in 30 minutes or less. Fresh, delicious food is just a few clicks away.
            </p>
            <button className="order-button-c">
              Order Now <span className="arrow"></span>
            </button>
          </div>
          <div className="hero-image-c">
            <img src={HomeLandingPageImage || "/placeholder.svg"} alt="Delicious food" />
          </div>
        </section>

        {/* Search Section */}
        <section className="search-section-h">
          <form className="search-container-h" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input-h"
              placeholder="Search for food, restaurants, or cuisines..."
              onChange={handleSearchInputChange}
            />
            <button type="submit" className="search-button-h">Search</button>
          </form>
        </section>

        {/* Trending Section */}
        <section className="trending-section">
          <div className="section-header">
            <h2 className="section-title">
              {isSearching ? `Search Results for "${searchQuery}"` : 'Tailored to your'} <span className="highlight">taste</span>
            </h2>
          </div>
          <div className="food-grid">
            {foodItems.length > 0 ? (
              foodItems.map((item) => (
                <div 
                  className="food-card" 
                  key={item.id}
                  onClick={() => handleFoodCardClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleFoodCardClick(item);
                    }
                  }}
                >
                  <div className="food-image">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} />
                  </div>
                  <div className="food-details">
                    <h3 className="food-name">{item.name}</h3>
                    <p className="restaurant-name">{item.restaurant || "Unknown Restaurant"}</p>
                    <p className="food-price">Rs.{(item.price || 0).toFixed(2)}</p>
                    <div className="description">
                      <p className="description-label">Description:</p>
                      <p className="description-text">{item.description || "No description available."}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">
                {isSearching ? 'No items found matching your search.' : 'No menu items available.'}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {foodItems.length > 0 && (
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
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;
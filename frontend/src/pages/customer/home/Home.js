import { useEffect, useState } from "react"
import "./Home.css"
import HomeLandingPageImage from "../../../images/home_landing_img.jpg"
import { useNavigate, Link } from "react-router-dom"

function Home() {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const fetchMenuItems = async (page, search = "", retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `http://localhost:5004/api/menu-items/home-menu-items?page=${page}&limit=6${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Search results:", data); // For debugging

      if (!Array.isArray(data.data)) {
        throw new Error("Invalid data format received from the server.");
      }

      setFoodItems(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching menu items:", err.message);
      if (retryCount < 2) {
        // Retry after 2 seconds
        setTimeout(() => {
          fetchMenuItems(page, search, retryCount + 1);
        }, 2000);
      } else {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.querySelector('.search-input-h').value.trim();
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page when searching
    setIsSearching(!!searchInput);
    fetchMenuItems(1, searchInput);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value.trim();
    if (value === '') {
      setSearchQuery('');
      setIsSearching(false);
      setCurrentPage(1);
      fetchMenuItems(1, '');
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
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={() => fetchMenuItems(currentPage, searchQuery, 0)}>
            Try Again
          </button>
        </div>
      </div>
    );
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
            <Link to="/restaurants" className="order-button-c">
              Browse Restaurants <span className="arrow"></span>
            </Link>
          </div>
          <div className="hero-image-c">
            <img src={HomeLandingPageImage || "/placeholder.svg"} alt="Delicious food" />
          </div>
        </section>

        {/* Featured Restaurants Section */}
        <section className="featured-section">
          <div className="section-header">
            <h2>Popular Restaurants</h2>
            <Link to="/restaurants" className="view-all-link">
              View All <span className="arrow">→</span>
            </Link>
          </div>
          {/* Rest of the existing content */}
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
return (
  <div className="menu-item-add-container">
    <div className="menu-item-add-header">
      <h2>Add New Menu Item</h2>
      <p>Create a new delicious item for your menu</p>
    </div>

    {error && (
      <div className="error-message">
        <i className="fas fa-exclamation-circle"></i>
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit} className="menu-item-form">
      <div className="form-layout">
        <div className="form-details">
          <div className="form-groupM">
            <label htmlFor="name">Item Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="form-groupM">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your menu item"
              rows="4"
              required
            />
          </div>

          <div className="form-groupM">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Appetizers">Appetizers</option>
              <option value="Main Course">Main Course</option>
              <option value="Desserts">Desserts</option>
              <option value="Beverages">Beverages</option>
              <option value="Sides">Sides</option>
            </select>
          </div>

          <div className="form-groupM">
            <label htmlFor="price">Price (LKR)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="checkbox-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Available for Order
            </label>
          </div>
        </div>

        <div className="image-section">
          <div className="image-upload-container">
            <div 
              className="image-preview"
              style={formData.image ? { backgroundImage: `url(${previewUrl})` } : {}}
            >
              {!formData.image && (
                <div className="upload-placeholder">
                  <i className="fas fa-cloud-upload-alt fa-3x"></i>
                  <p>Upload Image</p>
                </div>
              )}
              {formData.image && <img src={previewUrl} alt="Preview" />}
            </div>
            <label className="file-input-label" htmlFor="image">
              <i className="fas fa-upload"></i> Choose Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
              required
            />
            <p className="image-help-text">
              Recommended: 800x600px or larger, JPG or PNG format
            </p>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Adding Item...
            </>
          ) : (
            <>
              <i className="fas fa-plus-circle"></i> Add Menu Item
            </>
          )}
        </button>
      </div>
    </form>
  </div>
); 
import { Link} from "react-router-dom";
import "./Home.css"

function Home() {
  return (
    <div className="admin-home">
      <header className="admin-header">
        <h1>System Administration</h1>
        <p>Welcome to the admin dashboard</p>
      </header>

      <div className="admin-functions">
        <div className="admin-card">
          <div className="card-header">
            <span className="material-icons card-icon">people</span>
            <h2 className="card-title">Manage User Accounts</h2>
            <p className="card-description">Create, update, or deactivate user accounts</p>
          </div>
          <div className="card-content">
          <Link to="/manage-users"><button className="admin-button">Manage Users</button></Link>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <span className="material-icons card-icon">store</span>
            <h2 className="card-title">Verify Restaurant Registrations</h2>
            <p className="card-description">Review and approve new restaurant applications</p>
          </div>
          <div className="card-content">
            <Link to="/verifyRestaurant"><button className="admin-button">Verify Restaurants</button></Link>
          </div>
        </div>

        <div className="admin-card centered-card">
          <div className="card-header">
            <span className="material-icons card-icon">credit_card</span>
            <h2 className="card-title">Handle Financial Transactions</h2>
            <p className="card-description">Process payments and manage financial records</p>
          </div>
          <div className="card-content">
            <button className="admin-button">Manage Finances</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home


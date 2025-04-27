# 🍔 FoodieFly 
# Food Ordering & Delivery System

<div align="center">
  <img src="frontend/src/images/logo.png" alt="FoodieFly Logo" width="200"/>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://www.docker.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4.4-green)](https://www.mongodb.com/)
  [![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-16.x-green)](https://nodejs.org/)
</div>

## 📋 Overview

FoodieFly is a modern, cloud-native food ordering and delivery system built with microservices architecture. It provides a seamless experience for customers to order food, restaurants to manage their menus, and delivery personnel to handle deliveries efficiently.

## ✨ Features

- 🔐 **User Authentication & Authorization**
  - Secure user registration and login
  - Role-based access control
  - JWT-based authentication

- 🏪 **Restaurant Management**
  - Restaurant profile management
  - Menu management
  - Real-time order updates
  - Analytics dashboard

- 🛒 **Order Management**
  - Real-time order tracking
  - Order history
  - Order status updates
  - Multiple payment options

- 🚚 **Delivery Management**
  - Real-time delivery tracking
  - Delivery personnel management
  - Route optimization
  - Delivery status updates

- 💳 **Payment Processing**
  - Secure payment gateway integration
  - Multiple payment methods
  - Transaction history
  - Refund management

## 🏗️ Architecture

The system is built using a microservices architecture with the following components:

- **Frontend Service** (Port 3000)
  - React.js based user interface
  - Responsive design
  - Real-time updates

- **Backend Services**
  - User Authentication Service (Port 5001)
  - Restaurant Management Service (Port 5004)
  - Order Management Service (Port 5003)
  - Delivery Management Service (Port 5008)
  - Payment Service (Port 5010)

- **Database**
  - MongoDB (Port 27017)
  - Data persistence through Docker volumes

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm (v8.x or higher)
- MongoDB (v4.4 or higher)
- Docker and Docker Compose (for containerized deployment)

### Installation

#### Method 1: Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/FoodieFly.git
cd FoodieFly
```

2. Start all services using Docker Compose:
```bash
docker-compose up
```

#### Method 2: Manual Setup

1. Install dependencies for all services:
```bash
# Install backend service dependencies
cd user_authentication_service && npm install
cd ../restaurant_management_service && npm install
cd ../order_management_service && npm install
cd ../payment_service && npm install
cd ../delivery_management_service && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

2. Start the services:
   - On Windows: Run `run.bat`
   - On Linux/Mac: Start each service in separate terminals:
```bash
# Terminal 1
cd user_authentication_service && npm start

# Terminal 2
cd restaurant_management_service && npm start

# Terminal 3
cd order_management_service && npm start

# Terminal 4
cd payment_service && npm start

# Terminal 5
cd delivery_management_service && npm start

# Terminal 6
cd frontend && npm start
```

### Accessing the Application

- Frontend: http://localhost:3000
- Backend Services:
  - User Authentication: http://localhost:5001
  - Restaurant Management: http://localhost:5004
  - Order Management: http://localhost:5003
  - Payment Service: http://localhost:5010
  - Delivery Management: http://localhost:5008

## 🛠️ Development

### Project Structure
```
FoodieFly/
├── frontend/                 # React frontend application
├── user_authentication_service/    # User authentication microservice
├── restaurant_management_service/  # Restaurant management microservice
├── order_management_service/       # Order management microservice
├── delivery_management_service/    # Delivery management microservice
├── payment_service/               # Payment processing microservice
├── docker-compose.yml            # Docker Compose configuration
└── README.md                     # Project documentation
```

### Environment Variables

Each service requires specific environment variables. Create `.env` files in each service directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/foodiefly

# JWT Secret
JWT_SECRET=your_jwt_secret

# Service Ports
PORT=5001  # Adjust port number for each service
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Janitha Gamage - Initial work - [CJ7](https://github.com/JordanCJ7)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)
- [Express.js](https://expressjs.com/)

## 📞 Support

For support, email your.email@example.com or create an issue in the repository.
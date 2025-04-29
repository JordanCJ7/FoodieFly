import { BrowserRouter, Route,Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import SignUp from "./pages/auth/signup/SignUp";
import Login from "./pages/auth/login/Login";
import RestaurantSignUp from "./pages/auth/signup/RestaurantSignUp";
import RestaurantHome from "./pages/RestaurantAdmin/home/Home";
import CustomerHome from "./pages/customer/home/Home";
import AdminHome from "./pages/systemAdmin/home/Home";
import DeliveryHome from "./pages/deliveryPersonnel/home/Home";
import MenuItemAdd from "./pages/RestaurantAdmin/menuItem/MenuItemAdd";
import VerifyRestaurant from "./pages/systemAdmin/verifyRestaurant/VerifyRestaurant";
import MenuItemList from "./pages/RestaurantAdmin/menuItem/MenuItemList";
import MenuItemEdit from "./pages/RestaurantAdmin/menuItem/MenuItemEdit";
import ManageUsers from "./pages/systemAdmin/manageUsers/ManageUsers";
import Cart from "./pages/customer/cart/Cart";//Piumi
import MyOrders from "./pages/customer/cart/MyOrders";
import OrderHistory from "./pages/customer/cart/OrderHistory";
import PaymentDetails from "./pages/customer/payment/PaymentDetails";//Thamindu
import Profile from "./pages/customer/profile/Profile";
import PaymentForm from "./pages/customer/payment/PaymentForm";
import DeliveryDetails from "./pages/deliveryPersonnel/delivery/DeliveryDetails";
import IncomingOrderRequest from "./pages/deliveryPersonnel/orders/IncomingOrderRequest";
import OrderRequestDriverStatus from "./pages/deliveryPersonnel/orders/OrderRequestDriverStatus";
import DeliveryStatus from "./pages/deliveryPersonnel/status/DeliveryStatus";
import DeliveryRequestStatus from "./pages/RestaurantAdmin/status/DeliveryRequestStatus";
import FoodDetail from "./pages/customer/food/FoodDetail";
import Notifications from "./pages/customer/notifications/Notifications";
import RestaurantList from "./pages/customer/restaurant/RestaurantList";
import RestaurantDetail from "./pages/customer/restaurant/RestaurantDetail";
import PayPalCheckout from "./pages/customer/payment/PayPalCheckout";
import RestaurantOrderHistory from './pages/RestaurantAdmin/orderHistory/OrderHistory';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/restaurant-register" element={<RestaurantSignUp />} />
      <Route path="/restaurant-home" element={<RestaurantHome />} />
      <Route path="/" element={<CustomerHome />} />
      <Route path="/admin-home" element={<AdminHome />} />
      <Route path="/delivery-home" element={<DeliveryHome />} />
      <Route path="/addMenuItem" element={<MenuItemAdd />} />
      <Route path="/verifyRestaurant" element={<VerifyRestaurant />} />
      <Route path="/menu-item-list" element={<MenuItemList />} />
      <Route path="/edit-menu-item/:id" element={<MenuItemEdit />} />
      <Route path="/manage-users" element={<ManageUsers />} />
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/payment" element={<PaymentForm/>}/>
      <Route path="/payment-details" element={<PaymentDetails/>}/>
      <Route path="/profile" element={<Profile />} />
      <Route path="/food/:id" element={<FoodDetail />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/restaurants" element={<RestaurantList />} />
      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      <Route path="/payment/paypal" element={<PayPalCheckout />} />

    {/* delivery related routes */}
    <Route path="/deliveries/deliveryDetails" element={<DeliveryDetails/>}/>
    <Route path="/delivery-home/incoming_order" element={<IncomingOrderRequest/>}/>
    <Route path="/delivery-home/order_status" element={<OrderRequestDriverStatus/>}/>
    <Route path="/delivery-home/delivery_status" element={<DeliveryStatus/>}/>
    <Route path="/restuarant-home/delivery_status" element={<DeliveryRequestStatus/>}/>

    {/* Restaurant Admin Routes */}
    <Route path="/restaurant-admin/home" element={<RestaurantHome />} />
    <Route path="/restaurant-admin/order-history" element={<RestaurantOrderHistory />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
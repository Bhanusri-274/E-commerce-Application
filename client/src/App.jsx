import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider }     from "./context/AuthContext";
import { CartProvider }     from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./routes/Guards";

import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout  from "./components/layout/AdminLayout";

import Home           from "./pages/Home/Home";
import Products       from "./pages/Products/Products";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Cart           from "./pages/Cart/Cart";
import Wishlist       from "./pages/Wishlist/Wishlist";
import Checkout       from "./pages/Checkout/Checkout";
import Orders         from "./pages/Orders/Orders";
import OrderDetails   from "./pages/Orders/OrderDetails";
import Profile        from "./pages/Profile/Profile";
import Login          from "./pages/Auth/Login";
import Register       from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword  from "./pages/Auth/ResetPassword";
import AdminLogin     from "./pages/Auth/AdminLogin";
import NotFound       from "./pages/NotFound";

import AdminDashboard  from "./pages/admin/Dashboard";
import AdminProducts   from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders     from "./pages/admin/AdminOrders";
import AdminUsers      from "./pages/admin/AdminUsers";
import AdminCoupons    from "./pages/admin/AdminCoupons";
import AdminBanners    from "./pages/admin/AdminBanners";
import AdminReviews    from "./pages/admin/AdminReviews";
import AdminSettings   from "./pages/admin/AdminSettings";
import AdminAnalytics  from "./pages/admin/AdminAnalytics";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style:   { borderRadius: "12px", fontSize: "14px", fontFamily: "'Inter', sans-serif" },
                success: { iconTheme: { primary: "#22C55E", secondary: "#fff" } },
                error:   { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
              }}
            />
            <Routes>
              
              {/* 1. PLAIN GUEST-ONLY ROUTES (No Storefront Navbar/Footer Layout) */}
              <Route element={<GuestRoute />}>
                <Route path="/login"                    element={<Login />} />
                <Route path="/register"                 element={<Register />} />
                <Route path="/forgot-password"            element={<ForgotPassword />} />
                <Route path="/reset-password/:token"      element={<ResetPassword />} />
                <Route path="/admin/login"              element={<AdminLogin />} />
              </Route>

              {/* 2. PUBLIC STOREFRONT ROUTES (With Storefront Layout) */}
              <Route element={<PublicLayout />}>
                <Route path="/"                     element={<Home />} />
                <Route path="/products"             element={<Products />} />
                <Route path="/products/:identifier" element={<ProductDetails />} />
                <Route path="/cart"                 element={<Cart />} />

                {/* Auth-Required Storefront Pages */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/wishlist"          element={<Wishlist />} />
                  <Route path="/checkout"          element={<Checkout />} />
                  <Route path="/orders"            element={<Orders />} />
                  <Route path="/orders/:id"        element={<OrderDetails />} />
                  <Route path="/profile"           element={<Profile />} />
                </Route>
              </Route>

              {/* 3. ADMIN PANEL ROUTES */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index                    element={<AdminDashboard />} />
                  <Route path="products"          element={<AdminProducts />} />
                  <Route path="categories"        element={<AdminCategories />} />
                  <Route path="banners"           element={<AdminBanners />} />
                  <Route path="orders"            element={<AdminOrders />} />
                  <Route path="users"             element={<AdminUsers />} />
                  <Route path="coupons"           element={<AdminCoupons />} />
                  <Route path="reviews"           element={<AdminReviews />} />
                  <Route path="analytics"         element={<AdminAnalytics />} />
                  <Route path="settings"          element={<AdminSettings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
# ShopEZ — Full-Stack MERN E-Commerce Platform

A premium, production-quality e-commerce platform built with the MERN stack.

---Phase Wise Templates--https://drive.google.com/drive/folders/1zKu_hujAAhpQ_WUUdwraUe5UsimNSDvT

## Quick Start

### 1. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

Copy and fill in the env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**server/.env** (minimum required):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopez
JWT_SECRET=any_long_random_string_here
CLIENT_URL=http://localhost:5173
```

**Image Uploads:**
- Without Cloudinary → images are stored in `server/uploads/` automatically. No config needed.
- With Cloudinary → add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to server/.env

**client/.env:**
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Demo Data

```bash
cd server && npm run seed
```

Creates:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopez.com | admin123 |
| Customer | customer@shopez.com | customer123 |

Also seeds: 16 products, 7 categories, 3 coupons, 3 hero banners

### 4. Run Development Servers

```bash
# Terminal 1 – Backend
cd server && npm run dev    # http://localhost:5000

# Terminal 2 – Frontend  
cd client && npm run dev    # http://localhost:5173
```

---

## Pages & Features

### Customer Storefront
| Page | URL |
|------|-----|
| Home (hero, flash deals, trending) | `/` |
| Product Listing + Filters | `/products` |
| Product Detail + Reviews + Price History | `/products/:slug` |
| Shopping Cart + Coupon | `/cart` |
| Wishlist | `/wishlist` |
| Multi-step Checkout | `/checkout` |
| My Orders + Tracking | `/orders` |
| Order Detail + Cancel | `/orders/:id` |
| Profile + Addresses + Password | `/profile` |
| Login / Register / Forgot Password | `/login` etc |

### Admin Panel (`/admin`)
| Page | URL |
|------|-----|
| Dashboard – KPI, Charts, Top Products | `/admin` |
| Products CRUD + Image Upload | `/admin/products` |
| Categories CRUD | `/admin/categories` |
| Banner Management | `/admin/banners` |
| Order Management + Status | `/admin/orders` |
| User Management + Block/Unblock | `/admin/users` |
| Coupon Management | `/admin/coupons` |
| Review Moderation | `/admin/reviews` |
| Analytics – Revenue, Orders, Trends | `/admin/analytics` |
| Settings – Profile, Password, Site | `/admin/settings` |

---

## Tech Stack

**Frontend:** React 18 (Vite) · Tailwind CSS v4 · Framer Motion · React Router v6 · React Hook Form · Chart.js · Lucide React · React Hot Toast

**Backend:** Node.js · Express.js · MongoDB · Mongoose · JWT · bcryptjs · Multer · Cloudinary (optional) · Helmet · Morgan

---

## Design System

| Token | Value |
|-------|-------|
| Primary Blue | `#2563EB` |
| Secondary Indigo | `#4F46E5` |
| Accent Orange | `#F97316` |
| Success | `#22C55E` |
| Danger | `#EF4444` |
| Background | `#F8FAFC` |
| Font | Poppins (headings) + Inter (body) |
| Border Radius | 16px cards |

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/products?keyword=&category=&brand=&sort=&page=
GET    /api/products/:id
POST   /api/products          (admin)
GET    /api/categories
GET    /api/cart              (auth)
POST   /api/cart              (auth)
DELETE /api/cart/:itemId      (auth)
POST   /api/cart/apply-coupon (auth)
GET    /api/wishlist          (auth)
POST   /api/wishlist          (auth)
POST   /api/orders            (auth)
GET    /api/orders/my         (auth)
GET    /api/admin/dashboard   (admin)
GET    /api/admin/orders      (admin)
GET    /api/admin/users       (admin)
GET    /api/admin/analytics   (admin)
POST   /api/upload            (admin)
```

---

## Coupons (pre-seeded)

| Code | Discount | Min Order |
|------|----------|-----------|
| WELCOME10 | 10% off (max ₹200) | ₹500 |
| FLAT200 | ₹200 flat | ₹2000 |
| ELEC15 | 15% off (max ₹1500) | ₹5000 |

---

© 2025 ShopEZ

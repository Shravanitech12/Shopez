# SHOPEZ — Full-Stack Production E-Commerce Application

SHOPEZ is a complete, production-grade, responsive e-commerce web platform built on the **MERN** stack (MongoDB, Express.js, React.js with Vite, Node.js, and Tailwind CSS).

---

## 🎥 Project Demo Video

Watch the complete feature walkthrough, customer shopping workflow, and administrative dashboard live in action:

🎬 **[Watch SHOPEZ Demo Video on Google Drive](https://drive.google.com/drive/folders/1CmNXkss9PsQVs_FUBce3sEH6uBG75u39?usp=drive_link)**

---

## 📚 Complete Project Documentation

All design artifacts, research templates, SRS, architecture diagrams, and formal project reports are included in the repository under [`/docs`](./docs) and [`/Documentation`](./Documentation):

1. **Phase 1: Brainstorming & Ideation**
   - Idea Generation & Prioritization Template
   - Define Problem Statements Template
   - Empathy Map Canvas
2. **Phase 2: Requirement Analysis**
   - Solution Requirements & Specifications
   - Data Flow Diagram & User Stories
   - Technology Stack (Architecture & Stack)
3. **Phase 3: Project Design**
   - Solution Architecture Document
   - Problem - Solution Fit Template
   - Proposed Solution Template
4. **Phase 4: Project Planning**
   - Project Planning Schedule & Milestone Template
5. **Phase 5: Project Development & Testing**
   - User Acceptance Testing (UAT) & Functional Specification Document (FSD)
6. **Phase 6: Project Report**
   - Comprehensive 21-Page Project Report (`Shopez_Project_Report_21_Pages.docx`)

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Secure Authentication:** JWT-based authentication using HTTP-only cookies and bcryptjs password hashing.
- **Product Exploration:** Dynamic product catalog with real-time text search, category filtering, price sliders, discount filters, size selectors, gender filters, and sorting.
- **Product Details:** High-resolution image galleries with thumbnail switcher, accurate pricing & discount calculations, size selection, live inventory indicators, and related product suggestions.
- **Interactive Cart & State:** Persistent MongoDB carts for authenticated shoppers, guest cart synchronization upon login, quantity adjustments, and promotional discount coupon application (`SHOPEZ10`, `SAVE20`).
- **Streamlined Checkout:** Multiple saved shipping addresses, Cash on Delivery, and simulated Online Card Payment.
- **Order Tracking & History:** Real-time visual fulfillment timeline (Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered), carrier tracking numbers, and cancellation/return requests.
- **Customer Wishlist:** Save favorite products with 1-click move to cart.
- **Profile & Address Manager:** Edit profile information, manage multiple delivery destinations, and change passwords securely.

### 🛡️ Administrator Operations
- **Protected Admin Console:** Accessible only to verified administrator roles (`/admin`).
- **Interactive Analytics:** Real-time Recharts visualizations showing monthly sales revenue trends, fulfillment status doughnut charts, and top-performing categories.
- **Product Catalog Management:** Full CRUD operations with local Multer image uploads or direct CDN links, stock level control, discounts, and sizes.
- **Category Management:** Create and edit store departments with safe-delete checks that prevent deletion of categories with active products.
- **Promotional Banners:** Control active homepage hero banners, promotional badges, and target destinations.
- **Order Management:** Inspect order lines, update order statuses, assign tracking numbers, and manage cancellations.
- **Customer Account Management:** Search customer records, view order frequency, and toggle active/deactivated account status.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts, React Router DOM v6, Axios |
| **Backend** | Node.js, Express.js, REST API architecture |
| **Database** | MongoDB & Mongoose ODM (Supports local MongoDB, MongoDB Atlas, and zero-config embedded MongoDB) |
| **Security & Auth** | HTTP-Only Cookies, JWT, bcryptjs, Helmet, CORS, Express Rate Limit |
| **File Uploads** | Multer image processing with file type validation |

---

## 📁 Project Architecture

```
shopez/
├── client/                     # Vite + React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, LoadingSpinner, Modals, Pagination
│   │   │   ├── layout/         # MainLayout, AdminLayout
│   │   │   ├── products/       # ProductCard, ProductFilters, PriceDisplay
│   │   │   └── orders/         # OrderStatusBadge, OrderTimeline
│   │   ├── context/            # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── pages/              # Home, Products, ProductDetails, Cart, Checkout, etc.
│   │   │   └── admin/          # AdminDashboard, AdminProducts, AdminOrders, etc.
│   │   ├── services/           # Axios instance (/api proxy)
│   │   ├── App.jsx             # React Router hierarchy & Route Guards
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind custom utility classes
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js + Express REST API Backend
│   ├── config/
│   │   └── db.js               # Auto-reconnecting MongoDB connection manager
│   ├── controllers/            # Auth, Product, Category, Banner, Cart, Order, Admin
│   ├── middleware/             # protect, adminOnly, errorMiddleware, uploadMiddleware
│   ├── models/                 # User, Product, Category, Banner, Cart, Order, Wishlist
│   ├── routes/                 # Express routers (/api/*)
│   ├── services/               # Pricing & inventory calculations, order fulfillment
│   ├── utils/                  # Token generator, order number formatter
│   ├── scripts/
│   │   ├── seed.js             # Initial database sample data population
│   │   └── testWorkflow.js     # 12-point automated integration test suite
│   ├── uploads/                # Static uploaded media files
│   ├── app.js                  # Express application setup
│   ├── server.js               # Server entry point
│   ├── .env                    # Environment configuration
│   └── package.json
│
├── package.json                # Workspace orchestration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+) & npm

### 2. Installation
Dependencies are already installed. If needed, run:
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 3. Database Seeding
To populate initial categories, products, banners, customer accounts, and administrator credentials:
```bash
cd server
npm run seed
```

### 4. Running the Application
Launch both backend and frontend servers:

```bash
# Terminal 1 - Start Backend API (Port 5000)
cd server
npm run dev

# Terminal 2 - Start Frontend Client (Port 5173)
cd client
npm run dev
```

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Login Credentials

The seed script initializes two pre-configured accounts:

| Role | Email / Identifier | Password |
|---|---|---|
| **Administrator** | `admin@shopez.com` (or `admin`) | `Admin@12345` |
| **Customer** | `customer@shopez.com` (or `johndoe`) | `Customer@12345` |

*(Tip: The Login page includes quick one-click "Fill Customer" and "Fill Admin" buttons for rapid evaluation!)*

---

## 🔒 Security & Data Integrity

1. **Strict Pricing Rule:**
   All product discounts and line totals are strictly calculated on the backend:
   $$\text{finalPrice} = \text{round}\left(\text{price} - \frac{\text{price} \times \text{discount}}{100}\right)$$
   Frontend prices are never blindly trusted during order placement.
2. **Inventory Stock Protection:**
   Stock availability is validated before an order can be confirmed. Products with zero stock cannot be purchased. When an eligible order is cancelled, stock is restored automatically.
3. **Role-Based Access Control:**
   Public user registration strictly forces `userType: 'customer'`. Administrative operations are guarded by `adminOnly` middleware that verifies cryptographic JWT claims and database record status.
4. **Credential Safety:**
   Password hashes are salted using `bcryptjs` (cost 10) and omitted (`select: false` / `toJSON` deletion) in all responses.

---

## 🧪 Verification & Testing

An automated end-to-end test suite (`server/scripts/testWorkflow.js`) verifies all 12 operational checkpoints:
```bash
cd server
node scripts/testWorkflow.js
```

All 12 checkpoints pass with 100% verification across authentication, inventory management, price calculations, order fulfillment, and administrative status synchronization.

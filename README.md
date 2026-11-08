# CustomWear BD — Full-Stack E-Commerce Platform

> **"Your Design, Your Style"**  
> Premium Black & White Apparel Studio • AK Khan, Chattogram, Bangladesh

A complete, modern, responsive, full-stack e-commerce web application for **CustomWear BD**, a specialized custom and streetwear apparel brand based in AK Khan, Chattogram, delivering across all 64 districts in Bangladesh.

---

## 1. Key Features & Highlights

### 🎨 Design & Theme
- **Color Palette:** Pure Black (`#000000`), Pure White (`#FFFFFF`), and Crisp Neutral Gray (`#F5F5F5`).
- **Typography & Layout:** Minimalist Swiss/streetwear typography, high-contrast badges, smooth hover animations, and responsive layouts for mobile, tablet, and desktop.
- **Header & Navigation:**
  - Editable business logo (supports admin-configured logo image URL with typographical fallback).
  - Real-time search bar with autocomplete suggestions.
  - Social media icons for **Facebook, Instagram, YouTube, and TikTok** with admin-editable URLs.
  - Slide-out cart drawer with live badge count and free shipping progress tracker.
  - Links: Home, Shop, Categories, About Us, Contact.
- **Hero Carousel:** Full-width hero banner with auto-rotation (5.5s), pause on hover, manual next/previous navigation, and complete admin CRUD controls.
- **Image-based Categories:** Visual cards for Men's T-Shirt, Women's T-Shirt, Oversized T-Shirt, Hoodie, Polo Shirt, Kids' T-Shirt, and Accessories.
- **Footer:** Monochromatic black footer with editable business metadata, helpline, policy links (Privacy Policy, Terms & Conditions, Return & Refund Policy), MFS payment badges, and copyright.

---

### 👕 Advanced Product Variations System
- Supports multi-dimensional variations (e.g. Size, Color, Custom Attributes).
- **Per-variation attributes:**
  - Unique SKU per variation (e.g. `CW-OVS-BLK-M`, `CW-OVS-BLK-L`, `CW-OVS-WHT-M`).
  - Independent regular price and sale price for every variation.
  - Dedicated image per variation (switches automatically on size/color selection).
  - Individual stock quantity tracking with auto-updating *In Stock* / *Out of Stock* badges.
  - Prevents customers from selecting or purchasing out-of-stock variations.
- **Product Customization:** Allows customers to type custom embroidery/print instructions and upload vector/PNG artwork files with client-side file size and MIME-type validation.

---

### 💳 Bangladesh Payment Methods & Checkout
- **Cash on Delivery (COD):** Pay upon delivery anywhere in Bangladesh.
- **Manual bKash Payment:** Displays admin-configured bKash number, Send Money instructions, and collects Transaction ID (TrxID) and sender mobile number.
- **Manual Nagad Payment:** Displays admin-configured Nagad number and collects TrxID and sender mobile number.
- **Manual Rocket Payment:** Displays admin-configured Rocket number and collects TrxID and sender mobile number.
- **Pending Verification Safeguard:**
  - Manual mobile payments immediately enter `Pending Verification` status.
  - **Zero False Confirmations:** The order confirmation page clearly indicates that payments remain pending until verified against official statements.
  - **Security Compliant:** CustomWear BD never asks for, collects, or stores MFS PINs or OTPs.
- **Dynamic Delivery Charge:**
  - Inside Chattogram: ৳60 (24–48h delivery).
  - Outside Chattogram (Dhaka & All 64 Districts): ৳120 (48–72h delivery).
  - Free delivery threshold automatically applied (orders over ৳1,000).

---

### 🛡️ Administrative Portal (`/admin`)
Access the administrative portal at `/admin`.

1. **Dashboard Overview (`/admin`):**
   - Real-time KPIs: Total Orders, Verified Revenue, Pending Orders, Completed Orders, Total Customers, Active Products, Low-Stock Alerts (≤ 5 units), and Out-of-Stock Units (0 units).
   - Sales summary breakdown by payment method (COD, bKash, Nagad, Rocket).
   - Recent orders table with direct fulfillment shortcuts.
2. **Order Management (`/admin/orders`):**
   - Search by order number, customer name, or phone.
   - Filter by date, payment method, payment status, and fulfillment status.
   - Update statuses: `Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, and `Returned`.
   - Single-click verification for manual bKash, Nagad, and Rocket payments.
   - Courier partner and tracking number assignment.
   - Internal admin notes with timestamps.
   - **Print Tax Invoices & Warehouse Packing Slips:** Printable A4 format with business header, itemized specs, barcodes, and totals.
   - **Order Status History:** Complete chronological audit trail of all status transitions.
3. **Stock & Inventory Control (`/admin/stock`):**
   - Granular inventory tracking for every individual variation.
   - Real-time stock status flags: *In Stock*, *Low Stock (≤ 5)*, *Out of Stock (0)*.
   - **Manual Stock Adjustments:** Admins can adjust stock quantities while specifying reasons (e.g., *"New batch production"*, *"Defect discarded"*, *"Physical inventory audit reconciliation"*).
   - Full history log tracking before/after counts, delta change, reason, and admin username.
   - **Automatic Stock Lifecycle:** Stock is automatically deducted when orders are placed and automatically restored when orders are cancelled or returned.
4. **Customer Accounts & Abuse Prevention (`/admin/customers`):**
   - View and search registered customers and order histories.
   - Reliability analytics: tracks placed orders, repeated cancellations, and failed deliveries.
   - Flags suspicious ordering patterns for manual review.
   - One-click account suspension and restriction (e.g., block abusive COD ordering).
   - Comprehensive administrative audit log.
   - Complies with fair review policy: accounts are not automatically banned solely on shared addresses or phone numbers.
5. **Product & Variation Management (`/admin/products`):**
   - Create, edit, duplicate, publish, unpublish, and delete products.
   - Multiple image uploads and category assignments.
   - Manage variation matrix: Size, Color, SKU, regular/sale price, variation image, and stock.
   - Badges: *Featured Collection*, *Best Seller*, *Customizable*.
6. **Category Management (`/admin/categories`):**
   - Full CRUD for product categories with custom images, slugs, and sort orders.
7. **Hero Carousel Manager (`/admin/banners`):**
   - Add, edit, delete, reorder (move up/down), and activate/deactivate homepage hero slides.
8. **Store Settings (`/admin/settings`):**
   - Editable business name, tagline, phone, support email, studio address (AK Khan, Pahartali, Chattogram).
   - Store logo URL and favicon URL.
   - Social media links (Facebook, Instagram, YouTube, TikTok).
   - Payment method toggles, account numbers, and customer instructions.
   - Delivery fees and free shipping thresholds.

---

## 2. Tech Stack & Architecture

- **Frontend & Server Framework:** Next.js 14 (App Router), React 18, TypeScript.
- **Styling:** Tailwind CSS (monochromatic high-contrast palette).
- **Icons:** Lucide React.
- **Database & Persistence:**
  - **Local Development / Standalone:** High-performance, zero-dependency SQLite database powered by Node.js built-in `node:sqlite` (`data/customwear.db`) with WAL mode.
  - **Production PostgreSQL / Supabase:** Complete SQL migration file included at `supabase/migrations/001_initial_schema.sql` with full table schemas, Row-Level Security (RLS) policies, triggers, and seed data.
- **Authentication & Security:**
  - Secure password hashing using Node `scrypt` with cryptographic salts (no plain text passwords).
  - HMAC SHA-256 session tokens stored in HTTP-only cookies.
  - Role-based route protection (`admin` vs `customer`).
  - Server-side validation of stock availability, prices, discounts, and order totals.

---

## 3. Getting Started & Local Setup

### Prerequisites
- Node.js version 20+ or 22+ (tested on Node v26).
- `npm` package manager.

### Step 1: Install Dependencies
```bash
cd customwear-next
npm install
```

### Step 2: Configure Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

### Step 3: Run the Application
For development mode:
```bash
npm run dev
```
For production build and start:
```bash
npm run build
npm run start
```
The website will be available at [http://localhost:3000](http://localhost:3000).

---

## 4. Default Credentials & Creating Admin Accounts

The database seeds automatically on first launch with sample products, categories, hero slides, and administrative credentials:

### 👑 Default Administrator Account:
- **Email:** `admin@customwearbd.com`
- **Password:** `Admin@customwearbd2026`
- **Role:** Administrator (Full access to `/admin`)

### 👤 Sample Customer Account:
- **Email:** `customer@gmail.com`
- **Password:** `Customer123!`
- **Role:** Customer

### How to Create Additional Administrators Securely:
1. Register a new user via the storefront registration modal.
2. In the SQLite database or via the admin API, update the user's role to `'admin'`.
3. Alternatively, update `src/lib/db.ts` to add additional administrator seeds before initial deployment.

---

## 5. Local Testing Checklist

- [x] **Storefront:** Browse home carousel, featured drops, and category cards.
- [x] **Shop Catalog:** Search by keyword, filter by size, color, category, stock availability, and sort by popularity / price.
- [x] **Product Detail:** Select size (M/L) and color (Black/White) to observe dynamic price, image, and SKU switching.
- [x] **Cart & Checkout:** Add items to cart, test inside vs outside Chattogram shipping rates, and select bKash / Nagad / Rocket / Cash on Delivery.
- [x] **Order Placement:** Place order with manual mobile payment; observe pending verification notice.
- [x] **Stock Automation:** Verify inventory decrements automatically upon order placement and restores upon order cancellation.
- [x] **Admin Orders:** Update status to Confirmed, Processing, Shipped, Delivered, Cancelled, or Returned; approve TrxIDs.
- [x] **Invoices & Slips:** Open printable tax invoice and warehouse packing slip.
- [x] **Stock Management:** Adjust variation stock with audit reason logging.
- [x] **Customer Management:** Review customer cancellation rates, flag for review, and suspend abusive accounts.
- [x] **Settings:** Change bKash/Nagad/Rocket numbers, social links, or logo URL and verify updates on the storefront.

---

## 6. Business Information
- **Brand:** CustomWear BD
- **Tagline:** Your Design, Your Style
- **Location:** AK Khan Gate, Pahartali, Chattogram, Bangladesh
- **Currency:** Bangladeshi Taka (৳ BDT)
- **Design Theme:** Premium Black and White

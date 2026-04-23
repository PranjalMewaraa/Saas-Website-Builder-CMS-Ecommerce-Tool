# 🚀 SaaS Website Builder + Headless Commerce Platform

A multi-tenant, production-grade **Website Builder + E-commerce SaaS** platform built from scratch using modern web architecture.

This project enables users to:

- Create websites visually (like Webflow / Shopify)
- Manage themes, pages, assets, SEO, menus
- Build full e-commerce stores
- Publish to subdomains instantly
- Scale to multiple industries (fashion, electronics, services, etc.)

---

## 🧠 Vision

To build a **fully customizable SaaS platform** that combines:

- Visual website building  
- Modular block-based rendering  
- Enterprise-grade multi-tenant backend  
- Flexible product system with attributes & variants  
- Real-world ecommerce workflows  
- Future AI-powered website generation

---

## ✨ Key Features (MVP Completed)

### 🏗 Website Builder
- Visual block-based page editor
- Reusable sections & templates
- Theme token system
- Style presets
- Menu builder
- Forms builder
- Snapshot-based publishing system

### 🖼 Asset Management
- S3 based upload system
- Image optimization
- Tags, folders, alt text
- Hard & soft deletion

### 🧭 SEO System
- Page-level SEO editor
- OpenGraph
- JSON-LD schemas
- Dynamic metadata generation
- Sitemap & robots support (in progress)

### 🏢 Multi-Tenant Architecture
- Tenants
- Users & roles
- Sites per tenant
- Subdomain routing

### 🛍 E-commerce Core
- Brands
- Categories
- Products
- Variants
- Store publishing
- MySQL relational store
- Attribute system (custom per industry)

### 🔐 Auth & Permissions
- NextAuth credentials login
- Tenant based access
- Module gating (catalog, builder, forms, etc.)

---

## 🧩 Project Structure (Monorepo)

apps/
admin/ # Admin dashboard (website builder + store management)
content/
components/
api/
onboarding/
store-setup/

storefront/ # Public website renderer

packages/
renderer/ # Rendering engine for pages & blocks
blocks/ # All UI blocks (Hero, Header, ProductGrid, etc.)
schemas/ # Zod schemas for blocks & APIs
auth/ # Authentication + session + module gate
core/ # Module system & feature toggles
db-mongo/ # Website builder data layer (sites, pages, themes, assets)
db-mysql/ # Ecommerce data layer (products, brands, categories, orders)


---

## 🧱 Blocks System

Current blocks:

- Header
- Hero
- Footer
- Product Grid
- Forms
- Spacer
- Divider
- RichText

Marketing blocks (Phase 0):

- FAQ Accordion
- Category Chips
- Brand Chips
- Best Sellers
- Banner Sections
- Featured Products
- Testimonials
- CTA sections

---

## 🧪 Publishing Architecture

Admin publishes → snapshot created → site becomes live

Admin Panel
|
|-- Create Snapshot
|
MongoDB (snapshots)
|
|-- published_snapshot_id
|
Storefront resolves by subdomain


### Domain Mapping

| URL | Purpose |
|------|--------|
| admin.domain.com | Admin dashboard |
| handle.domain.com | Published website |

---

## 🔄 User Flow

### Website Owner

1. Signup
2. Auto login
3. Create site
4. Build pages visually
5. Setup theme, menus, SEO
6. Publish
7. Website live on subdomain

### Store Owner

1. Create store
2. Choose store type (brand / distributor)
3. Setup brands & categories
4. Configure attributes
5. Create products + variants
6. Publish products
7. Customers can browse & order

---

## 🏗 Architecture Overview

Frontend:

Next.js (Admin + Storefront)

Backend:

MongoDB → website builder data

MySQL → ecommerce system

Storage:

S3 compatible object storage

Auth:

NextAuth (JWT)

Rendering:

Custom renderer engine

Hosting:

Subdomain based routing

Wildcard storefront domains


---

## 📌 What Is Already Built

✅ Multi-tenant system  
✅ Website builder  
✅ Page editor  
✅ Asset manager  
✅ SEO editor  
✅ Publishing system  
✅ Store backend schema  
✅ Attribute system design  
✅ Product wizard base  
✅ Subdomain resolution  
✅ Snapshot rendering  
✅ Admin UI shell  

---

## 🗺 Planned Roadmap

### Phase 0 – Marketing Blocks (current)
- High quality block library
- Product showcases
- Landing page sections

### Phase 1 – Storefront Ecommerce
- Product listing pages
- Product detail pages
- Cart
- Checkout
- Inventory
- Orders

### Phase 2 – Admin Ecommerce
- Order management
- Refunds
- Stock control
- Promotions
- Coupons
- Analytics

### Phase 3 – Performance & SEO
- Core Web Vitals tracking
- SEO audits
- AI keyword suggestions
- OpenGraph generator

### Phase 4 – AI Website Builder
- Prompt based website creation
- Auto layout generation
- AI SEO optimization
- AI product descriptions

### Phase 5 – Plugins System
- Payment gateways
- Shipping providers
- Tax systems
- CRM integrations

---

## 🧠 Design Philosophy

- Strong separation between **builder data** and **commerce data**
- Modular feature system
- Snapshot based publishing
- API first
- Multi-tenant by default
- Industry-agnostic product system

---

## ⚙ Tech Stack

- Next.js (App Router)
- React
- TypeScript
- MongoDB
- MySQL
- NextAuth
- AWS S3 compatible storage
- Tailwind CSS
- Zod schemas

---

## 🧪 Status

This project is actively being developed as a long-term SaaS platform.

MVP foundation is complete.



---

## 🤝 Contributing

Currently private project – contributions may open later. ( making it public for recruiters )

---

## 🧑‍💻 Author

Built by a solo developer ( ME - Pranjal Kachhawaha ) as a deep-tech SaaS engineering challenge.

---

> This project is designed to test full-stack system design, scalability, product architecture, and real-world SaaS workflows.

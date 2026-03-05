# FoodHub API

A robust RESTful API built for a food delivery platform, facilitating interactions between Customers, Food Providers (Restaurants), and Administrators.

## 🚀 Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Authentication:** [Better Auth](https://better-auth.com/)

---

## 📊 Database ER Diagram

![ER Diagram](./er-diagram.png)

---

## ✨ Features

### Authentication & Authorization

- Secure JWT-based authentication using Better Auth
- Role-based access control (`CUSTOMER`, `PROVIDER`, `ADMIN`)
- Registration and Login workflows
- Session & Profile management

### Users & Roles

- **Customers:** Browse meals, manage cart, place orders, and leave reviews.
- **Providers:** Manage restaurant profiles, create and update meal menus, and process incoming orders.
- **Admins:** Global dashboard to manage users (suspend/activate), food categories, and oversee all platform orders.

### Platform Capabilities

- **Categories:** Dynamic food category and cuisine management.
- **Meals:** Comprehensive meal CRUD operations with filtering capabilities (cuisine, dietary preference, price).
- **Cart & Checkout:** Add/remove items from the cart and seamless checkout processing.
- **Order Tracking:** Real-time order status updates (`PLACED` ➔ `PREPARING` ➔ `READY` ➔ `DELIVERED` / `CANCELLED`).
- **Reviews:** Customers can leave ratings and reviews for meals.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites

Make sure you have installed on your local machine:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy the example `.env` file and configure your database and authentication secrets.

   ```bash
   cp .env.example .env
   ```

   _Make sure to update `DATABASE_URL` and `BETTER_AUTH_SECRET` inside the `.env` file._

3. **Database Setup:**
   Generate the Prisma client and push the schema to your database.

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The API will typically be accessible at `http://localhost:3000` (or as configured in your `.env`).

---

## 🔐 Default Admin Credentials

To quickly test administrative features, the project includes a seed script to generate a default admin user.

Run the seed script **while the development server is running**:

```bash
npm run seed:admin
```

**Admin Login Details:**

- **Email:** `admin@foodhub.com`
- **Password:** `admin1234`

---

## 📖 API Documentation Structure

_Detailed endpoint documentation can be found in `api/docs/features.md`, but general route patterns include:_

- **`/api/auth/*`** — Authentication routes (login, register, me)
- **`/api/meals/*`** — Public meal listings and filters
- **`/api/providers/*`** — Public provider profiles and menus
- **`/api/orders/*`** — Customer order management
- **`/api/provider/*`** — Private routes for providers to manage their menus and orders
- **`/api/admin/*`** — Private routes for global portal administration

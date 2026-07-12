# Asset Management Project

This project is a decoupled Full-Stack Node.js web application designed to help a company track corporate assets assigned to employees.

It consists of two separate, independent sub-systems:
1. **`backend/`**: A REST API backend server powered by Express, PostgreSQL, and Sequelize ORM.
2. **`frontend/`**: An Express server rendering Pug (Jade) web layouts, using Bootstrap 5, FontAwesome, jQuery, and client-side DataTables.net to communicate asynchronously with the backend.

---

## Architecture Overview

* **Database Decoupling**: Database logic is encapsulated entirely within the backend REST API. The frontend never queries PostgreSQL directly.
* **Asynchronous Client-Side AJAX**: The Pug templates are served statically. Interactivity (like loading data tables, status filters, operations checkout, and timeline queries) is driven by asynchronous client-side API requests via a centralized `apiClient.js` service module.
* **Auto-Schema Management**: The backend is configured to automatically connect to PostgreSQL and run database schema synchronizations (`sequelize.sync({ alter: true })`) on startup. It automatically creates the necessary tables, columns, indexes, and primary/foreign key relationships.

---

## Prerequisites

Before running the application, make sure you have:
1. **Node.js** (v16.0 or higher recommended) installed.
2. **PostgreSQL** installed and running on your local machine.

---

## Step-by-Step Setup Instructions

### 1. Database Setup

Create a blank PostgreSQL database named `asset_mgt`:
* You can do this via pgAdmin, or by running the following SQL in your PostgreSQL terminal:
  ```sql
  CREATE DATABASE asset_mgt;
  ```

---

### 2. Backend Setup & Startup

1. Open your terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Open the `backend/.env` file and verify or update the PostgreSQL credentials if your local database configurations differ:
   ```env
   PORT=5000
   DB_NAME=asset_mgt
   DB_USER=postgres
   DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
   DB_HOST=localhost
   DB_PORT=5432
   ```
4. Start the backend API server:
   ```bash
   npm start
   ```
   *The console will log connection success and database model synchronization success.*

---

### 3. Frontend Setup & Startup

1. Open a new terminal tab/window and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Verify the `frontend/.env` variables:
   ```env
   PORT=3000
   BACKEND_API_URL=http://localhost:5000/api
   ```
4. Start the frontend web server:
   ```bash
   npm start
   ```

---

## Navigating the Application

Open your browser and navigate to **`http://localhost:3000`** to view the app!

### Features Built:
1. **Stock View (Dashboard)**: Bird's-eye view statistics of in-stock items, branch-wise totals, value footer aggregates, and available stock details.
2. **Employee Master**: Add and Edit employees, query active or inactive users, and search staff.
3. **Category Master**: Create hardware classes (Laptop, Mobile Phone, Screw Driver, Drill Machine, etc.).
4. **Asset Master**: Add assets (which automatically creates a "Purchase" transaction history log), edit them, and search items.
5. **Issue Asset**: Assign available stock to active employees, which updates their status and logs history.
6. **Return Asset**: Check assets back into stock, capturing physical return reasons (upgrade, repair, resignation).
7. **Scrap Asset**: Mark assets as obsolete, which immediately pulls them from active inventory lists and restricts editing, while preserving history.
8. **Asset History Timeline**: Enter/select any asset to render a chronological vertical timeline of all transactions.

# Competency V2

A centralized system for managing and analyzing **Competency**, **SFIAV9**, and **TPQI Frameworks**.

The system is designed as **two integrated subsystems**:

1. **Admin Management System**  
   Used for managing competency data, frameworks, users, and system configurations.

2. **Career & Competency Exploration System**  
   Used for searching careers and competencies, viewing skill requirements,
   and comparing competencies across frameworks.

The project consists of a **Backend API**, **Frontend Web Application**, and
**Multiple MySQL Databases**, orchestrated using **Docker Compose**.

---

## Architecture Overview

This system follows a client–server architecture where the frontend communicates
with the backend via REST APIs, and the backend manages multiple domain-specific databases.

### High-Level Architecture Diagram

```text

        ┌────────────────────┐
        │    Web Browser     │
        │ (React + Vite UI)  │
        │  http://localhost  │
        └─────────▲──────────┘
                  │
                  │ REST API / OAuth
                  │
        ┌─────────┴──────────┐
        │   Backend Server   │
        │  Node.js + Express │
        │     Prisma ORM     │
        │   http://:3000     │
        └──┬──────┬──────┬───┘
           │      │      │
           │      │      │
┌───────▼───┐ ┌─────▼─────┐ ┌─────▼──────┐
│ Competency│ │   SFIA    │ │    TPQI    │
│  Database │ │ Database  │ │  Database  │
│  (MySQL)  │ │  (MySQL)  │ │  (MySQL)   │
└───────────┘ └───────────┘ └────────────┘
```

### Prerequisites

Before running this project, ensure the following tools are installed on your machine:

Docker Desktop
Docker must be installed and running
Git

### Installation Guide

Follow the steps below carefully to ensure the system runs correctly.

### Step 1: Database Preparation

The backend requires three separate MySQL databases.
These databases must be created before starting the application.

Run the following SQL commands on your MySQL server:

```

CREATE DATABASE competency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE sfiav9 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE tpqi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

```

---

## Missing Competency Data (Seed Assets)

In some cases, the **Competency data may be empty or incomplete**, for example:

- First-time system setup
- Database was recreated
- Data migration or reset was performed
- Competency-related pages show no data

When this happens, you must manually seed the required **static competency assets**
into the database.

The project provides a dedicated script for seeding competency assets:

### Seed Script

```

npm run seed-assets

```

---

### Step 2: Environment Configuration

The project is divided into two environments:

- Server (Backend) \*
- Client (Frontend) \*

Each part requires its own .env configuration file.

## 2.1 Server Environment (server/.env)

This file configures database connections, authentication, and server behavior.

Steps

Create a file named .env inside the server/ directory

Add the following configuration and adjust values as needed

```

# ==========================

# Database URLs (Prisma)

# ==========================

DATABASE_URL_COMPETENCY="mysql://root:password@localhost:3306/competency"
DATABASE_URL_SFIA="mysql://root:password@localhost:3306/sfiav9"
DATABASE_URL_TPQI="mysql://root:password@localhost:3306/tpqi"

# ==========================

# Generic DB Connection Info

# ==========================

DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_PORT=3306

DATABASES_TO_BACKUP=competency,sfiav9,tpqi

# ==========================

# Google OAuth

# ==========================

GOOGLE_CLIENT_ID=your_google_client_id_here

# ==========================

# JWT Configuration

# ==========================

JWT_ACCESS_SECRET_KEY=your_access_secret
JWT_REFRESH_SECRET_KEY=your_refresh_secret
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# ==========================

# Application Settings

# ==========================

ONLINE_THRESHOLD_SEC=900
DEFAULT_USER_ROLE=USER
PORT=3000
CORS_ORIGINS=http://localhost:5173

```

⚠️ The backend will fail to start if this file is missing or misconfigured.

## 2.2 Client Environment (client/.env)

This file configures how the frontend connects to the backend API
and Google OAuth service.

Steps

Create a file named .env inside the client/ directory

Add the following configuration

```

VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

```

VITE_API_BASE_URL: Base URL of the Backend API
VITE_GOOGLE_CLIENT_ID: Google OAuth Client ID

⚠️ The frontend will not function correctly if this file is missing.

---

### Step 3: Run the Application

From the root directory of the project, run:

```

docker compose up -d --build

```

Command Explanation

up : Start containers
-d : Run containers in background
--build : Rebuild images using the latest source code

### Application Access

Frontend UI: http://localhost:5173
Backend API: http://localhost:3000

---

## CI/CD Deployment (GitHub Actions)

This project supports **automatic deployment** to the server using **GitHub Actions**
whenever code is pushed to the `main` branch.

---

## Deployment Workflow Overview

- Trigger: `git push` to `main` branch
- CI/CD Tool: GitHub Actions
- Deployment Method: SSH into server and run Docker Compose
- Target Directory on Server: `~/CompetencyV2.1`

---

### GitHub Actions Workflow File

Make sure the following workflow file exists in your repository:

**Path**
.github/workflows/deploy.yml

# Required GitHub Secrets

You must configure the following secrets in your GitHub repository:

Repository → Settings → Secrets and variables → Actions

- SSH_KEY : Private SSH key used to access the server

- SERVER_USER : SSH username on the server

- SERVER_HOST : Server IP address or hostname

# Important Notes

- Do NOT commit private SSH keys to the repository

- Use a dedicated deploy key instead of your personal SSH key

- Make sure .env files already exist on the server

- Production .env files should never be stored in GitHub

# When Deployment Is Successful

- Frontend UI is updated automatically

- Backend API runs with the latest code

- No manual server login is required

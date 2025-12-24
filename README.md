# Competency Management System

A centralized system for managing **Competency**, **SFIA**, and **TPQI Frameworks**.

This project consists of a **Backend API**, **Frontend Web Application**, and **Multiple MySQL Databases**, orchestrated using **Docker Compose**.

---

## 🏗 Architecture Overview

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
└───────┬─────┬──────┘
        │     │
        │     │
┌───────▼───┐ ┌─────▼─────┐ ┌────────────┐
│ Competency│ │   SFIA    │ │    TPQI    │
│  Database │ │ Database  │ │  Database  │
│  (MySQL)  │ │  (MySQL)  │ │  (MySQL)   │
└───────────┘ └───────────┘ └────────────┘
📋 Prerequisites
Make sure the following tools are installed on your machine:

Docker Desktop

Docker must be running

Git

🛠 Installation Guide
Follow the steps carefully to ensure the system works correctly.

Step 1: Database Preparation
Create empty MySQL databases before starting the application.

sql
คัดลอกโค้ด
CREATE DATABASE competency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE sfiav9 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE tpqi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
Step 2: Environment Configuration
The project is divided into two environments:

Server (Backend)

Client (Frontend)

2.1 Server Environment (server/.env)
Create a .env file inside the server/ directory.

env
คัดลอกโค้ด
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
2.2 Client Environment (client/.env)
Create a .env file inside the client/ directory.

env
คัดลอกโค้ด
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
Step 3: Run the Application
From the root directory, run:

bash
คัดลอกโค้ด
docker compose up -d --build
Command Explanation
up : Start containers

-d : Run in background

--build : Rebuild images with latest code

🔍 Container Management
Check running containers

bash
คัดลอกโค้ด
docker compose ps
View logs

bash
คัดลอกโค้ด
docker compose logs -f
Stop all services

bash
คัดลอกโค้ด
docker compose down
🌐 Application Access
Service	URL
Frontend UI	http://localhost:5173
Backend API	http://localhost:3000

👤 Default Account / Seed Data
After the initial startup, the system automatically seeds a default administrator account.

text
คัดลอกโค้ด
Email: admin@system.local
Password: Admin@1234
Role: ADMIN
⚠️ Important:
Change the default password immediately after the first login.

🧑‍💻 Developer vs Production Environment
Development Mode
Local MySQL

Local Docker Compose

Debug logs enabled

Hot reload (Frontend)

bash
คัดลอกโค้ด
docker compose up -d --build
Production Mode (Recommended Setup)
Use managed MySQL (RDS / Cloud SQL)

Use HTTPS + Reverse Proxy (Nginx)

Disable debug logs

Use secure secrets

Example production .env changes:

env
คัดลอกโค้ด
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com
🔐 Security Notes
Never commit .env files to Git

Rotate JWT secrets regularly

Restrict CORS origins in production

Use HTTPS in production environments

📦 Tech Stack
Frontend: React + Vite

Backend: Node.js + Express

ORM: Prisma

Database: MySQL

Auth: JWT + Google OAuth

Container: Docker & Docker Compose
```

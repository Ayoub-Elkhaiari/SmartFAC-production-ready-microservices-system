# 🎓 Smart Faculty Platform

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Microservices-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Nginx](https://img.shields.io/badge/Nginx-API%20Gateway-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Per%20Service%20DB-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Caching%20%26%20Notifications-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI%20Assistant-FF6B6B?logoColor=white)](https://openrouter.ai/)
[![Load Balancing](https://img.shields.io/badge/Nginx-Load%20Balancing-009639?logo=nginx&logoColor=white)](https://nginx.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Complete-brightgreen)]()

A production-ready microservices-based faculty management system built with:

- **Frontend:** React
- **Backend:** FastAPI (microservices architecture)
- **API Gateway / Reverse Proxy:** Nginx
- **Databases:** PostgreSQL (per service)
- **Caching / Background tasks:** Redis
- **AI Assistant:** OpenRouter (via chat-service)
- **Containerization:** Docker & Docker Compose

---

## 🏗 Architecture Overview

The platform follows a fully containerized microservices architecture:

- Each domain has its own FastAPI service
- Each core service has its own PostgreSQL database
- Nginx acts as:
  - Reverse proxy
  - Load balancer 
  - Static file server
- Shared Docker volumes for uploads
- Redis used for notifications and caching

All services communicate internally through Docker network DNS.

---

## 🚀 Getting Started

### 1️⃣ Create `.env` file in the project root

Add the required environment variables:

```env
# Database
DB_USER=your_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis
REDIS_URL=redis://redis:6379

# Uploads
UPLOAD_DIR=/var/uploads

# SMTP
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
EMAIL_FROM=your_email

# OpenRouter (AI Chat)
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=google/gemma-3-27b-it:free
OPENROUTER_SITE_URL=http://localhost
OPENROUTER_SITE_NAME=Smart Faculty
```

### 2️⃣ Build and Start the Platform

```bash
docker compose up --build
```

> Docker Compose automatically merges:
> - `docker-compose.yml` (base config)
> - `docker-compose.override.yml` (development config with hot reload)

### 3️⃣ Access the Application

Open: [http://localhost](http://localhost)

Nginx is the single entry point for all services.

---

## 🧩 Services

| Service | Port | Description |
|---|---|---|
| auth-service | 8001 | Authentication, JWT issuance, refresh tokens |
| user-service (x2) | 8002 | User profiles, uploads, replicated & load balanced |
| course-service | 8003 | Course management |
| meeting-service | 8004 | Meetings & scheduling |
| news-service | 8005 | Faculty announcements |
| notification-service | 8006 | Email + async notifications (Redis) |
| chat-service | 8007 | AI assistant via OpenRouter |

---

## 🔄 Load Balancing

- `user-service` runs as:
  - `user-service-1`
  - `user-service-2`
- Nginx performs **round-robin** load balancing.
- Both containers expose port `8002` internally.

---

## 📂 File Uploads

- Stored in Docker volume: `uploads`
- Mounted in services that require it
- Served via Nginx at:

```
/uploads/*
```

---

## 🔐 Authentication

- **Access tokens** → Bearer JWT (`Authorization` header)
- **Refresh token** → HttpOnly secure cookie
- JWT validation shared across services via `JWT_SECRET`

---

## 🤖 AI Assistant

- Available to authenticated users
- Powered by OpenRouter via `chat-service`
- Model configurable through environment variables

Default model:

```
google/gemma-3-27b-it:free
```

---

## 🐳 Docker Architecture

The project uses:

- **Named volumes:**
  - `uploads`
  - `pgdata-*`
  - `redisdata`
  - `proxy_cache`
- **Development hot reload** via `docker-compose.override.yml`
- **Production-safe base config** in `docker-compose.yml`

---

## 📦 Production Notes

For production deployment:

- Disable hot reload
- Use secure `.env` secrets
- Enable HTTPS (recommended via reverse proxy / VPS)
- Add resource limits in Docker Compose
- Consider adding healthchecks

---

## 🧠 Key Features

- Fully isolated service databases
- Horizontal scaling ready
- Centralized gateway (Nginx)
- Redis-backed notifications
- Shared file storage
- AI-powered assistant
- Clean monorepo structure

---

## 📁 Project Structure (Simplified)

```
frontend/
services/
  auth-service/
  user-service/
  course-service/
  meeting-service/
  news-service/
  notification-service/
  chat-service/
nginx/
docker-compose.yml
docker-compose.override.yml
```

---

## 📸 Screenshots

### The main entry: 
![Admin User Management](https://github.com/user-attachments/assets/54c09fd9-aa6b-4238-b93f-7262f4797fb0)


### 👨‍🎓 Student Account

![Student Dashboard](https://github.com/user-attachments/assets/d052c072-e997-4120-be48-6c1f1d8759f4)
![Student Courses](https://github.com/user-attachments/assets/b886ab5f-4152-4d3a-b27f-51f955131c79)
![Student Schedule](https://github.com/user-attachments/assets/9c6b03a8-6555-47c1-9de5-ba70b0335e2e)
![Student Meetings](https://github.com/user-attachments/assets/3d2ba63f-77cb-4310-9971-03f9c7edfee4)
![Student News](https://github.com/user-attachments/assets/7923608e-46f2-4682-a0e2-74448e36d2ce)
![Student AI Chat](https://github.com/user-attachments/assets/587a3ea9-5141-4c3c-a862-b6f83054cebb)
![Student Profile](https://github.com/user-attachments/assets/10d3a19d-dca9-480e-9909-9f45a2047f1f)

---

### 👨‍🏫 Professor Account

![Professor Dashboard](https://github.com/user-attachments/assets/c798afbf-aed2-41ac-b24f-c1d04cd8d46d)
![Professor Courses](https://github.com/user-attachments/assets/12d7ea28-5c85-4157-8ec3-a0b6b8787a1d)
![Professor Course Detail](https://github.com/user-attachments/assets/835d7104-9517-464d-a7ed-811fc49931a5)
![Professor Meetings](https://github.com/user-attachments/assets/067bfd00-1967-48a4-bbb5-e3d4f4ebe2da)
![Professor Schedule](https://github.com/user-attachments/assets/39cccbfe-cea4-42fd-a348-71fcd5fdbe44)
![Professor News](https://github.com/user-attachments/assets/efb175e5-e790-4f32-a4bb-3e6025adffb6)
![Professor AI Chat](https://github.com/user-attachments/assets/ea936dd1-6537-4e6d-ab7c-3fbeb2e1db17)

---

### 🛡️ Admin Account

![Admin Overview](https://github.com/user-attachments/assets/2ba2b6cd-6b3f-482a-b915-dd2248ac8b1b)
![Admin Users](https://github.com/user-attachments/assets/3cc8463e-7345-433a-9580-af4809e4501f)
![Admin Courses](https://github.com/user-attachments/assets/162e7357-0a9e-4b4c-9d3e-c79f37c16652)
![Admin Meetings](https://github.com/user-attachments/assets/b326dd00-8cc3-4681-9a7f-7ba76e90c05f)
![Admin News](https://github.com/user-attachments/assets/43919ba4-0c48-4d01-ad62-f1e0f104d84b)
![Admin Notifications](https://github.com/user-attachments/assets/b5a40ed5-9e60-47f3-9c41-5b390f1ec692)
![Admin Settings](https://github.com/user-attachments/assets/9aadbe53-4ca8-43e4-9731-c73b75b2b601)

---

## 📌 Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

> No local Python or Node installation required.
> Invoke-RestMethod -Method Post -Uri http://localhost/api/auth/register -ContentType "application/json" -Body '{"email":"your email","full_name":"Student One","role":"student/professor/admin","password":"choose a password"}'


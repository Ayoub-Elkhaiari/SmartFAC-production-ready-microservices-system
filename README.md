# 🎓 Smart Faculty (SmartFAC) Platform

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

## 📌 Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

> No local Python or Node installation required.

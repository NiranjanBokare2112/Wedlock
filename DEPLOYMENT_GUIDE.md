# Deployment Guide

## Local containers
```powershell
docker compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:8000
MongoDB: mongodb://localhost:27017

## Production requirements
- Terminate TLS.
- Restrict network access to MongoDB and Redis.
- Configure real environment variables.
- Use a managed media bucket.
- Run database migrations/backups.
- Deploy frontend and backend as separate services.

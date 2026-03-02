# Technical Architecture

## Internship Management System

---

## 1. Technology Stack

### 1.1 Backend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Django | 5.0+ |
| GraphQL | Graphene-Django | 3.1+ |
| Database | PostgreSQL | 15+ |
| ORM | Django ORM | Built-in |
| Authentication | JWT (djangorestframework-simplejwt) | 5.3+ |
| Password Hashing | Bcrypt | 4.1+ |

### 1.2 Mobile App

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native | 0.74+ |
| Language | TypeScript | 5.0+ |
| State Management | Redux Toolkit | 2.0+ |
| GraphQL Client | Apollo Client | 3.8+ |
| Navigation | React Navigation | 6.0+ |
| Location | react-native-geolocation-service | 5.3+ |
| Camera | react-native-image-picker | 7.0+ |
| UI Components | React Native Paper | 5.0+ |

### 1.3 DevOps & Infrastructure

| Component | Technology |
|-----------|------------|
| Containerization | Docker |
| Orchestration | Docker Compose |
| Cloud Provider | AWS / GCP (configurable) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry |
| Logging | ELK Stack |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│                      │                      │                               │
│   React Native       │   Admin Web App      │   Teacher Web Dashboard       │
│   (Mobile)           │   (Optional)         │   (Optional)                  │
│                      │                      │                               │
└──────────┬───────────┴──────────┬───────────┴───────────────┬───────────────┘
           │                      │                             │
           │                      │                             │
           └──────────────────────┼─────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOAD BALANCER                                  │
│                          (Nginx / AWS ALB)                                  │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                    │
│                          (GraphQL Endpoint)                                 │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DJANGO BACKEND                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  GraphQL   │  │   Auth     │  │  Signals   │  │  Tasks     │     │   │
│  │  │   API      │  │  (JWT)     │  │            │  │ (Celery)   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │                    DJANGO MODELS                           │  │   │
│  │  │  User, School, InternshipPlace, BreakConfig, Placement,   │  │   │
│  │  │  AttendanceSession, AttendanceLog, BreakLog, ActivityLog, │  │   │
│  │  │  Report                                                   │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                   │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │               DATA ACCESS LAYER (Managers)                 │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            POSTGRESQL DATABASE                              │
│                         (Primary Data Store)                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

### 3.1 Django Backend Structure

```
internship_management/
├── config/                    # Project configuration
│   ├── settings.py           # Django settings
│   ├── urls.py               # URL routing
│   ├── asgi.py               # ASGI config
│   └── wsgi.py               # WSGI config
│
├── core/                      # Core application
│   ├── models.py             # Abstract base models
│   ├── managers.py           # Custom query managers
│   ├── permissions.py        # Custom permissions
│   └── validators.py         # Custom validators
│
├── users/                     # User management app
│   ├── models.py             # User model
│   ├── mutations.py         # GraphQL mutations
│   ├── queries.py            # GraphQL queries
│   ├── types.py              # GraphQL types
│   └── serializers.py       # DRF serializers
│
├── schools/                   # School management
│   ├── models.py
│   ├── mutations.py
│   ├── queries.py
│   └── types.py
│
├── places/                    # Internship places
│   ├── models.py
│   ├── mutations.py
│   ├── queries.py
│   └── types.py
│
├── placements/                # Student placements
│   ├── models.py
│   ├── mutations.py
│   ├── queries.py
│   └── types.py
│
├── attendance/                # Attendance system
│   ├── models.py
│   ├── mutations.py
│   ├── queries.py
│   ├── types.py
│   └── signals.py           # Auto-calculate hours
│
├── activities/                # Activity logs
│   ├── models.py
│   ├── mutations.py
│   ├── queries.py
│   └── types.py
│
├── reports/                   # Reports system
│   ├── models.py
│   ├── mutations.py
│   ├── queries.py
│   └── types.py
│
├── analytics/                 # Analytics & reporting
│   ├── queries.py
│   └── types.py
│
├── templates/                 # Email templates
│
├── static/                   # Static files
│
├── media/                    # User-uploaded files
│
├── .env.example              # Environment variables template
├── requirements.txt          # Python dependencies
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose config
└── manage.py                 # Django management script
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Client                      API                      Database             │
│     │                         │                         │                    │
│     │  1. Login (email/pwd)  │                         │                    │
│     │────────────────────────>│                         │                    │
│     │                         │  2. Validate Creds     │                    │
│     │                         │────────────────────────>│                    │
│     │                         │<────────────────────────│                    │
│     │                         │                         │                    │
│     │  3. Return JWT Token   │                         │                    │
│     │<────────────────────────│                         │                    │
│     │                         │                         │                    │
│     │  4. Store Token        │                         │                    │
│     │  (Secure Storage)      │                         │                    │
│     │                         │                         │                    │
│     │  5. Auth Request       │                         │                    │
│     │  (Bearer Token)        │                         │                    │
│     │────────────────────────>│                         │                    │
│     │                         │  6. Verify Token       │                    │
│     │                         │────────────────────────>│                    │
│     │                         │<────────────────────────│                    │
│     │                         │                         │                    │
│     │  7. Return Data        │                         │                    │
│     │<────────────────────────│                         │                    │
│     │                         │                         │                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Security Measures

| Security Layer | Implementation |
|----------------|----------------|
| Transport | HTTPS only, TLS 1.3 |
| Authentication | JWT with access/refresh tokens |
| Password Storage | Bcrypt (cost factor 12) |
| Authorization | Role-based access control (RBAC) |
| SQL Injection | Django ORM (parameterized queries) |
| XSS Protection | Django template escaping |
| CSRF Protection | CSRF tokens |
| Rate Limiting | Django-ratelimit on auth endpoints |
| Input Validation | Django forms + GraphQL validation |
| File Upload | Size limit 10MB, allowed types only |

### 4.3 JWT Configuration

```python
# Token settings
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
JWT_ALGORITHM = 'HS256'
JWT_ACCESS_TOKEN_LIFETIME = timedelta(hours=1)
JWT_REFRESH_TOKEN_LIFETIME = timedelta(days=7)
JWT_ROTATE_REFRESH_TOKENS = True
```

---

## 5. Deployment Architecture

### 5.1 Production Environment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION DEPLOYMENT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          ┌─────────────┐                                    │
│                          │     AWS     │                                    │
│                          │   Route53   │                                    │
│                          └──────┬──────┘                                    │
│                                 │                                           │
│                          ┌──────▼──────┐                                    │
│                          │ AWS Cloud   │                                    │
│                          │   Front     │                                    │
│                          └──────┬──────┘                                    │
│                                 │                                           │
│                    ┌────────────┴────────────┐                              │
│                    │                         │                              │
│             ┌──────▼──────┐          ┌───────▼──────┐                      │
│             │  ECS/Fargate│          │   RDS        │                      │
│             │  (Django)   │          │ PostgreSQL   │                      │
│             │  Container  │          │   Primary    │                      │
│             └─────────────┘          └──────────────┘                      │
│                    │                         │                              │
│             ┌──────▼──────┐          ┌───────▼──────┐                      │
│             │  ECS/Fargate│          │   RDS        │                      │
│             │  (Celery)   │          │ PostgreSQL    │                      │
│             │  Worker     │          │   Replica     │                      │
│             └─────────────┘          └──────────────┘                      │
│                    │                                                │
│             ┌──────▼──────┐                                         │
│             │    S3 /    │                                         │
│             │   Media    │                                         │
│             │   Storage  │                                         │
│             └────────────┘                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "config.asgi:application", "-w", "4", "-k", "uvicorn.workers.UvicornWorker"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: internship_mgmt
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build: .
    command: gunicorn config.asgi:application -w 4 -k uvicorn.workers.UvicornWorker
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgres://postgres:${DB_PASSWORD}@db:5432/internship_mgmt
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  celery:
    build: .
    command: celery -A config worker -l info
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgres://postgres:${DB_PASSWORD}@db:5432/internship_mgmt
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

---

## 6. API Design Patterns

### 6.1 Multi-Tenancy

```python
class SchoolFilterMixin:
    def get_queryset(self):
        return super().get_queryset().filter(
            school_id=self.request.user.school_id
        )
```

### 6.2 Permission Classes

```python
class IsSuperadmin(BasePermission):
    def has_permission(self, request, info):
        return request.user.role == 'superadmin'

class IsSchoolAdmin(BasePermission):
    def has_permission(self, request, info):
        return request.user.role in ['superadmin', 'school_admin']

class IsTeacher(BasePermission):
    def has_permission(self, request, info):
        return request.user.role in ['superadmin', 'school_admin', 'teacher']

class IsStudentOrReadOnly(BasePermission):
    def has_permission(self, request, info):
        if request.method == 'GET':
            return request.user.role in ['superadmin', 'school_admin', 'teacher']
        return request.user.role == 'student'
```

---

## 7. Performance Optimization

### 7.1 Database Optimization

| Optimization | Implementation |
|--------------|----------------|
| Indexing | Add indexes on foreign keys and frequently queried fields |
| Query Optimization | Use select_related() and prefetch_related() |
| Pagination | Cursor-based pagination for large lists |
| Connection Pooling | PostgreSQL connection pooling with pgbouncer |

### 7.2 Caching Strategy

| Cache Layer | Implementation |
|--------------|----------------|
| Query Caching | Django cache framework with Redis |
| Session Cache | Redis-backed sessions |
| Static Data | Cache school configs, break configs |
| API Response | GraphQL response caching |

```python
# Caching example
@cache_page(60 * 15)  # 15 minutes
def school_analytics(request, school_id):
    # Return cached analytics
```

---

## 8. Monitoring & Logging

### 8.1 Application Monitoring

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking, performance monitoring |
| Prometheus | Metrics collection |
| Grafana | Metrics visualization |

### 8.2 Logging Structure

```python
import logging

logger = logging.getLogger(__name__)

# Structured logging
logger.info(
    "Clock in recorded",
    extra={
        "user_id": user.id,
        "placement_id": placement.id,
        "location": {"lat": lat, "lng": lng},
        "timestamp": timezone.now()
    }
)
```

---

## 9. Environment Variables

```bash
# .env

# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com

# Database
DATABASE_URL=postgres://user:password@localhost:5432/internship_mgmt

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256

# AWS (for S3 media storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=

# Sentry
SENTRY_DSN=
```

---

## 10. Development Workflow

### 10.1 Local Development

```bash
# Setup
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run Celery worker
celery -A config worker -l info

# Run tests
pytest
```

### 10.2 Running Tests

```bash
# Unit tests
pytest apps/users/tests.py

# Coverage
pytest --cov=. --cov-report=html

# GraphQL tests
pytest apps/attendance/tests_graphql.py
```

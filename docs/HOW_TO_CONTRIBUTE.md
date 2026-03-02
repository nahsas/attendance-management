# How to Contribute

## Welcome to the Internship Management System

This guide will help you set up and start developing the application.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.12+ | Backend runtime |
| PostgreSQL | 15+ | Database |
| Redis | 7+ | Caching (optional for dev) |
| Git | Latest | Version control |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nahsas/attendance-management.git
cd attendance-management
```

### 2. Set Up Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example environment file and update values:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=postgres://develop:develop@localhost:5432/internship_mgmt
REDIS_URL=redis://localhost:6379/0

JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
```

### 4. Set Up Database

```bash
# Create database (PostgreSQL)
psql -U develop -c "CREATE DATABASE internship_mgmt;"

# Run migrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at:
- GraphQL: http://localhost:8000/graphql/
- Admin Panel: http://localhost:8000/admin/

---

## Development Workflow

### Branch Naming Convention

Use the following format:

| Type | Example | Description |
|------|---------|-------------|
| Feature | `feature/user-auth` | New feature |
| Bug Fix | `fix/attendance-bug` | Bug fix |
| Update | `update-1` | General updates |
| Docs | `docs/readme` | Documentation |
| Hotfix | `hotfix/security-patch` | Urgent production fix |

### Workflow Steps

```
1. Pull latest changes
   └─> git checkout main
   └─> git pull origin main

2. Create new branch
   └─> git checkout -b feature/your-feature

3. Make changes and commit
   └─> git add .
   └─> git commit -m "Add feature description"

4. Push and create PR
   └─> git push -u origin feature/your-feature
   └─> Create PR via GitHub UI
```

### Commit Message Format

```
<type>: <short description>

Examples:
- feat: Add user registration
- fix: Fix attendance calculation
- docs: Update API documentation
- refactor: Simplify attendance logic
```

---

## Project Structure

```
attendance-management/
├── config/              # Django project settings
│   ├── settings.py     # Main configuration
│   ├── urls.py         # URL routing
│   └── schema.py       # GraphQL schema
├── users/              # User management app
│   ├── models.py       # User model
│   ├── types.py        # GraphQL types
│   └── queries.py      # GraphQL queries
├── schools/            # School management
├── places/             # Internship places
├── placements/         # Student placements
├── attendance/         # Attendance system
├── activities/         # Activity logs
├── reports/            # Reports system
├── docs/               # Documentation
├── progress/           # Project progress tracking
└── manage.py           # Django management script
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 6.0 |
| API | GraphQL (Graphene-Django) |
| Database | PostgreSQL |
| Auth | JWT (djangorestframework-simplejwt) |
| Cache | Redis |
| Mobile | React Native (planned) |

---

## Running Tests

```bash
# Run all tests
pytest

# Run specific app tests
pytest users/

# Run with coverage
pytest --cov=. --cov-report=html
```

---

## Creating Migrations

When you modify models:

```bash
# Create migration
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

---

## GraphQL Playground

When running in development mode, access the GraphQL playground:

```
http://localhost:8000/graphql/
```

### Sample Queries

```graphql
# Get all schools
query {
  schools {
    id
    name
    email
  }
}

# Get current user
query {
  me {
    id
    email
    firstName
    role
  }
}
```

---

## Common Issues

### Database Connection Error

```
psql: error: connection to server failed
```

**Solution:** Ensure PostgreSQL is running and credentials are correct in `.env`

### Migration Error

```
relation already exists
```

**Solution:** Delete existing database and recreate:

```bash
dropdb internship_mgmt
psql -U develop -c "CREATE DATABASE internship_mgmt;"
python manage.py migrate
```

### Import Errors

```
ModuleNotFoundError: No module named 'graphene_django'
```

**Solution:** Activate virtual environment:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Code Style

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add docstrings for complex functions
- Keep functions focused and small
- Use Django best practices

---

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Graphene-Django Documentation](https://docs.graphene-python.org/django/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Questions?

If you have questions, please reach out to the team lead or create an issue on GitHub.

Happy coding!
